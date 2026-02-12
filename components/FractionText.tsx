/**
 * Renders text and replaces " numerator over denominator " with the fraction symbol:
 * numerator on top, horizontal bar, denominator on bottom (no slash, no word "over").
 * Use this anywhere lesson/quiz/practice text is shown so fractions display clearly.
 */
import React from 'react';
import { StyleSheet, Text, TextProps, View, ViewStyle } from 'react-native';
import { scaleFont, scaleSize } from '../utils/responsive';

// Match "(num) over (den)", "(num) over den", "num over (den)", or "num over den"
const OVER_FRAC_BOTH_PAREN = /\(([^)]+)\)\s+over\s+\(([^)]+)\)/g;
const OVER_FRAC_NUM_PAREN = /\(([^)]+)\)\s+over\s+(\S+)/g;
const OVER_FRAC_DEN_PAREN = /(\S+)\s+over\s+\(([^)]+)\)/g;
const OVER_FRAC_SIMPLE = /(\S+)\s+over\s+(\S+)/g;
const SLASH_FRAC_SIMPLE = /(\S+)\s+\/\s+(\S+)/g;

const defaultTextColor = '#1A1A2E';

const FRAC_DELIM_OVER = ' over ';
const FRAC_DELIM_SLASH = ' / ';

/** Find next fraction delimiter ( " over " or " / " ) */
function indexOfFracDelim(text: string, from: number): { idx: number; len: number } {
  const o = text.indexOf(FRAC_DELIM_OVER, from);
  const s = text.indexOf(FRAC_DELIM_SLASH, from);
  if (o === -1 && s === -1) return { idx: -1, len: 0 };
  if (o === -1) return { idx: s, len: FRAC_DELIM_SLASH.length };
  if (s === -1) return { idx: o, len: FRAC_DELIM_OVER.length };
  return o < s ? { idx: o, len: FRAC_DELIM_OVER.length } : { idx: s, len: FRAC_DELIM_SLASH.length };
}

/** Find fractions where numerator or denominator has nested parentheses (e.g. (-3 ± √(9+16)) / 4) */
function findNestedOverFrac(text: string): Array<{ index: number; end: number; num: string; den: string }> {
  const results: Array<{ index: number; end: number; num: string; den: string }> = [];
  let searchStart = 0;
  while (true) {
    const { idx: overIdx, len: delimLen } = indexOfFracDelim(text, searchStart);
    if (overIdx === -1) break;
    if (overIdx > 0 && text[overIdx - 1] !== ')') {
      searchStart = overIdx + 1;
      continue;
    }
    const closeNumIdx = overIdx - 1;
    const afterOver = text.slice(overIdx + delimLen);
    let depth = 1;
    let openNumIdx = -1;
    for (let i = closeNumIdx - 1; i >= 0; i--) {
      if (text[i] === ')') depth++;
      else if (text[i] === '(') {
        depth--;
        if (depth === 0) {
          openNumIdx = i;
          break;
        }
      }
    }
    if (openNumIdx === -1) {
      searchStart = overIdx + 1;
      continue;
    }
    const num = text.slice(openNumIdx + 1, closeNumIdx).trim();
    const openDenIdx = afterOver.indexOf('(');
    if (openDenIdx === -1) {
      const simpleDen = afterOver.match(/\s*(\S+)/);
      if (simpleDen) {
        const den = simpleDen[1];
        const end = overIdx + delimLen + simpleDen[0].length;
        results.push({ index: openNumIdx, end, num, den });
        searchStart = end;
        continue;
      }
      searchStart = overIdx + 1;
      continue;
    }
    depth = 1;
    let closeDenIdx = -1;
    for (let i = openDenIdx + 1; i < afterOver.length; i++) {
      if (afterOver[i] === '(') depth++;
      else if (afterOver[i] === ')') {
        depth--;
        if (depth === 0) {
          closeDenIdx = i;
          break;
        }
      }
    }
    if (closeDenIdx === -1) {
      searchStart = overIdx + 1;
      continue;
    }
    const den = afterOver.slice(openDenIdx + 1, closeDenIdx).trim();
    const end = overIdx + delimLen + closeDenIdx + 1;
    results.push({ index: openNumIdx, end, num, den });
    searchStart = end;
  }
  return results;
}

function findSimpleFracInSlice(
  text: string,
  offset: number
): Array<{ index: number; end: number; num: string; den: string }> {
  const results: Array<{ index: number; end: number; num: string; den: string }> = [];
  let m: RegExpExecArray | null;
  OVER_FRAC_BOTH_PAREN.lastIndex = 0;
  while ((m = OVER_FRAC_BOTH_PAREN.exec(text)) !== null) {
    results.push({ index: offset + m.index, end: offset + m.index + m[0].length, num: m[1].trim(), den: m[2].trim() });
  }
  OVER_FRAC_SIMPLE.lastIndex = 0;
  while ((m = OVER_FRAC_SIMPLE.exec(text)) !== null) {
    const start = offset + m.index;
    const end = offset + m.index + m[0].length;
    if (!results.some((r) => start < r.end && end > r.index)) {
      results.push({ index: start, end, num: m[1], den: m[2] });
    }
  }
  SLASH_FRAC_SIMPLE.lastIndex = 0;
  while ((m = SLASH_FRAC_SIMPLE.exec(text)) !== null) {
    const start = offset + m.index;
    const end = offset + m.index + m[0].length;
    if (!results.some((r) => start < r.end && end > r.index)) {
      results.push({ index: start, end, num: m[1], den: m[2] });
    }
  }
  return results;
}

function findAllMatches(text: string): Array<{ index: number; end: number; num: string; den: string }> {
  const nested = findNestedOverFrac(text);
  if (nested.length > 0) {
    const results: Array<{ index: number; end: number; num: string; den: string }> = [];
    let lastEnd = 0;
    for (const m of nested) {
      if (m.index > lastEnd) {
        results.push(...findSimpleFracInSlice(text.slice(lastEnd, m.index), lastEnd));
      }
      results.push(m);
      lastEnd = m.end;
    }
    if (lastEnd < text.length) {
      results.push(...findSimpleFracInSlice(text.slice(lastEnd), lastEnd));
    }
    results.sort((a, b) => a.index - b.index);
    return results;
  }
  const results: Array<{ index: number; end: number; num: string; den: string }> = [];
  let m: RegExpExecArray | null;
  // Both parens first (e.g. (12 × sin 70°) over (sin 30°))
  OVER_FRAC_BOTH_PAREN.lastIndex = 0;
  while ((m = OVER_FRAC_BOTH_PAREN.exec(text)) !== null) {
    results.push({ index: m.index, end: m.index + m[0].length, num: m[1].trim(), den: m[2].trim() });
  }
  // Den in parens (e.g. a over (sin A))
  OVER_FRAC_DEN_PAREN.lastIndex = 0;
  while ((m = OVER_FRAC_DEN_PAREN.exec(text)) !== null) {
    const start = m.index;
    const end = m.index + m[0].length;
    if (!results.some((r) => start < r.end && end > r.index)) {
      results.push({ index: start, end, num: m[1], den: m[2].trim() });
    }
  }
  // Simple "num over den" before num-in-paren so "12(0.94) over 0.5" keeps parentheses visible
  OVER_FRAC_SIMPLE.lastIndex = 0;
  while ((m = OVER_FRAC_SIMPLE.exec(text)) !== null) {
    const start = m.index;
    const end = m.index + m[0].length;
    if (!results.some((r) => start < r.end && end > r.index)) {
      results.push({ index: start, end, num: m[1], den: m[2] });
    }
  }
  // Num in parens last (e.g. (12 × 0.94) over 0.5) so it doesn't steal "(0.94)" from "12(0.94) over 0.5"
  OVER_FRAC_NUM_PAREN.lastIndex = 0;
  while ((m = OVER_FRAC_NUM_PAREN.exec(text)) !== null) {
    const start = m.index;
    const end = m.index + m[0].length;
    if (!results.some((r) => start < r.end && end > r.index)) {
      results.push({ index: start, end, num: m[1].trim(), den: m[2] });
    }
  }
  // " / " fraction (e.g. 2 / 4 or 1 / 2)
  SLASH_FRAC_SIMPLE.lastIndex = 0;
  while ((m = SLASH_FRAC_SIMPLE.exec(text)) !== null) {
    const start = m.index;
    const end = m.index + m[0].length;
    if (!results.some((r) => start < r.end && end > r.index)) {
      results.push({ index: start, end, num: m[1], den: m[2] });
    }
  }
  results.sort((a, b) => a.index - b.index);
  return results;
}

export function FractionText({
  text,
  style,
  containerStyle,
}: {
  text: string;
  style?: TextProps['style'];
  containerStyle?: ViewStyle;
}) {
  const segments: Array<{ type: 'text'; value: string } | { type: 'frac'; num: string; den: string }> = [];
  const matches = findAllMatches(text);
  let lastEnd = 0;
  for (const match of matches) {
    if (match.index > lastEnd) segments.push({ type: 'text', value: text.slice(lastEnd, match.index) });
    const isRootSolutions =
      (match.num === 'Roots' && match.den === 'Solutions') || (match.num === 'Root' && match.den === 'Solutions');
    if (isRootSolutions) {
      segments.push({ type: 'text', value: 'Root / Solutions' });
    } else {
      segments.push({ type: 'frac', num: match.num, den: match.den });
    }
    lastEnd = match.end;
  }
  if (lastEnd < text.length) segments.push({ type: 'text', value: text.slice(lastEnd) });
  if (segments.length === 0) segments.push({ type: 'text', value: text });

  const flatStyle = StyleSheet.flatten(style ? [styles.text, style] : [styles.text]) as Record<string, unknown>;
  const color = (flatStyle.color as string) ?? defaultTextColor;
  // Omit flex so equation parts stay together (parent may pass flex: 1 for the container)
  const { flex, flexGrow, flexShrink, ...textStyle } = flatStyle;
  const segmentStyle = Object.keys(textStyle).length ? textStyle : style;

  return (
    <View style={[styles.row, containerStyle]}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          // key is valid for list items; React Native's TextProps type omits it
          // @ts-expect-error
          return <Text key={idx} style={[styles.text, segmentStyle]}>{seg.value}</Text>;
        }
        return (
          // key is valid for list items; React Native's ViewProps type omits it
          // @ts-expect-error
          <View key={idx} style={styles.frac}>
            <Text style={[styles.text, styles.num, segmentStyle]}>{seg.num}</Text>
            <View style={[styles.bar, { backgroundColor: color }]} />
            <Text style={[styles.text, styles.den, segmentStyle]}>{seg.den}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  text: {
    fontSize: scaleFont(14),
    color: defaultTextColor,
  },
  frac: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  num: {
    lineHeight: scaleFont(16),
  },
  bar: {
    width: '100%',
    minWidth: scaleSize(16),
    height: 1,
    marginVertical: 1,
  },
  den: {
    lineHeight: scaleFont(16),
  },
});
