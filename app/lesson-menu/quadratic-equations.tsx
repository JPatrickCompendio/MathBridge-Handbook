import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../constants/colors';
import { MODULE_1_SECTIONS } from '../../data/lessons/module1_quadratic';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { useAccordionReadingProgress } from '../../utils/useAccordionReadingProgress';
import { getSpacing, isWeb, scaleFont, scaleSize } from '../../utils/responsive';

const QUADRATIC_SECTION_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const QUADRATIC_TOPIC_ID = 1;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Theme = {
  primary: '#FF6600',
  white: '#FFFFFF',
  background: '#FFF8F5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  border: '#FFE5D9',
  accent: '#0EA5E9',
  success: '#10B981',
  muted: '#E8E4E0',
};

function AccordionHeader({
  title,
  isOpen,
  onPress,
  icon,
}: {
  title: string;
  isOpen: boolean;
  onPress: () => void;
  icon?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () => Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[styles.accordionHeader, { transform: [{ scale }] }]}>
        {icon ? <Text style={styles.accordionIcon}>{icon}</Text> : null}
        <Text style={styles.accordionTitle} numberOfLines={2}>{title}</Text>
        <Animated.Text style={[styles.accordionChevron, isOpen && styles.accordionChevronOpen]}>
          {isOpen ? '▼' : '▶'}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function SubAccordionHeader({
  title,
  isOpen,
  onPress,
}: {
  title: string;
  isOpen: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () => Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[styles.subAccordionHeader, { transform: [{ scale }] }]}>
        <Text style={styles.subAccordionTitle}>{title}</Text>
        <Text style={styles.accordionChevron}>{isOpen ? '▼' : '▶'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function AnimatedAccordionBody({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(isWeb() ? 12 : 8)).current;
  useEffect(() => {
    const duration = isWeb() ? 400 : 280;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.accordionBody, isWeb() && styles.accordionBodyWeb, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function ContentCard({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <View style={styles.contentCard}>
      {label ? <Text style={styles.contentCardLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

function BlockParagraph({ text, first }: { text: string; first?: boolean }) {
  return (
    <Text style={[styles.accordionParagraph, first && styles.accordionParagraphFirst]}>{text}</Text>
  );
}

/** Key terms to render in bold in Section II "What is a Quadratic Equation" */
const SECTION_II_BOLD_PHRASES = [
  'Parts of a Quadratic Equation',
  'Identifying Quadratic Equations',
  'Easy trick to remember',
  'standard form',
  'quadratic equation',
  'Quadratic term',
  'Linear term',
  'Constant term',
  'quadratic term',
  'linear term',
  'constant term',
  'ax² + bx + c = 0',
  'a ≠ 0',
  'coefficient',
  'Example A:',
  'Example B:',
  'Solutions:',
  'Quadratic',
  'Linear',
  'Constant',
];

/** Renders text with bold key phrases for Section II (and supports **bold** if present) */
function RichParagraph({
  text,
  style,
  first,
  boldPhrases = SECTION_II_BOLD_PHRASES,
}: {
  text: string;
  style?: object;
  first?: boolean;
  boldPhrases?: string[];
}) {
  const baseStyle = [styles.accordionParagraph, first && styles.accordionParagraphFirst, style];

  // Split by **bold** first so we can mix explicit bold with phrase bolding
  const withStars: Array<{ bold: boolean; text: string }> = [];
  let rest = text;
  let m: RegExpExecArray | null;
  const starRe = /\*\*([^*]+)\*\*/g;
  let last = 0;
  while ((m = starRe.exec(text)) !== null) {
    if (m.index > last) withStars.push({ bold: false, text: text.slice(last, m.index) });
    withStars.push({ bold: true, text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) withStars.push({ bold: false, text: text.slice(last) });
  if (withStars.length === 0) withStars.push({ bold: false, text: text });

  function boldPhrasesInString(s: string): React.ReactNode[] {
    const phrases = [...boldPhrases].sort((a, b) => b.length - a.length);
    const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp(`(${escaped.join('|')})`, 'gi');
    const tokens = s.split(re);
    return tokens.map((t, i) =>
      phrases.some((p) => t.toLowerCase() === p.toLowerCase()) ? (
        <Text key={i} style={[baseStyle, { fontWeight: '700', color: Theme.text }]}>{t}</Text>
      ) : (
        <Text key={i} style={baseStyle}>{t}</Text>
      )
    );
  }

  const children = withStars.flatMap((seg, i) =>
    seg.bold ? (
      <Text key={i} style={[baseStyle, { fontWeight: '700', color: Theme.text }]}>{seg.text}</Text>
    ) : (
      boldPhrasesInString(seg.text).map((node, j) =>
        React.isValidElement(node) ? React.cloneElement(node, { key: `${i}-${j}` }) : node
      )
    )
  );

  return <Text style={baseStyle}>{children}</Text>;
}

/** Renders a single Section II block: bullet list, numbered list, or rich paragraph */
function SectionIIBlock({ text, first }: { text: string; first?: boolean }) {
  const lines = text.split(/\n/).map((l) => l.trim());
  const bulletLines = lines.filter((l) => /^[•·]\s*/.test(l) || /^\-\s+/.test(l));
  const numberedMatch = text.match(/\n(\d+)\.\s+/);
  const hasNumbered = /^\d+\.\s/m.test(text) || (numberedMatch && numberedMatch.length > 0);

  // Bullet block: intro line(s) + bullet list with enhanced design
  if (bulletLines.length >= 2 || (bulletLines.length === 1 && lines.length <= 3)) {
    const introLines: string[] = [];
    const bullets: string[] = [];
    lines.forEach((line) => {
      const bulletMatch = line.match(/^[•·\-]\s*(.+)$/);
      if (bulletMatch) {
        bullets.push(bulletMatch[1].trim());
      } else if (line && !bullets.length) {
        introLines.push(line);
      } else if (line && bullets.length) {
        bullets[bullets.length - 1] += '\n' + line;
      }
    });
    if (bullets.length > 0) {
      return (
        <View style={[styles.sectionIIBlock, first && styles.sectionIIBlockFirst]}>
          {introLines.map((line, i) => (
            <RichParagraph key={i} text={line} first={i === 0 && first} />
          ))}
          <View style={styles.sectionIIBulletList}>
            {bullets.map((item, idx) => (
              <View key={idx} style={styles.sectionIIBulletItem}>
                <View style={styles.sectionIIBulletDot} />
                <Text style={styles.sectionIIBulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
  }

  // Numbered list (e.g. "1. Quadratic term ... 2. Linear term ...")
  if (hasNumbered && text.match(/\n\d+\.\s+/)) {
    const numberedParts = text.split(/(?=\n\d+\.\s+)/).filter(Boolean);
    const items: Array<{ num: string; body: string }> = [];
    numberedParts.forEach((part) => {
      const m = part.trim().match(/^(\d+)\.\s+([\s\S]*)$/);
      if (m) items.push({ num: m[1], body: m[2].trim() });
    });
    if (items.length > 0) {
      return (
        <View style={[styles.sectionIIBlock, first && styles.sectionIIBlockFirst]}>
          <View style={styles.sectionIINumberedList}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.sectionIINumberedItem}>
                <View style={styles.sectionIINumberedNum}>
                  <Text style={styles.sectionIINumberedNumText}>{item.num}</Text>
                </View>
                <View style={styles.sectionIINumberedBodyWrap}>
                  <RichParagraph text={item.body} />
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }
  }

  // Standalone subheading (short line ending with : or title-like)
  if (lines.length === 1 && (lines[0].endsWith(':') || lines[0].length < 50)) {
    return (
      <Text style={[styles.sectionIISubheading, first && styles.sectionIIBlockFirst]}>
        {text}
      </Text>
    );
  }

  return (
    <View style={first ? undefined : styles.sectionIIParagraphWrap}>
      <RichParagraph text={text} first={first} />
    </View>
  );
}

/** Parses "equation    step description" lines and returns rows for two-column layout */
function parseExampleStepsLines(text: string): Array<{ left: string; right: string }> {
  const rows: Array<{ left: string; right: string }> = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^(.+?)\s{3,}(.+)$/);
    if (match) {
      rows.push({ left: match[1].trim(), right: match[2].trim() });
    } else {
      rows.push({ left: line, right: '' });
    }
  }
  return rows;
}

type FactoringBlock = { exampleNum: string; solveLine: string; rows: Array<{ left: string; right: string }> };

/** Splits Factoring method content into Example 1, Example 2, ... blocks with Solve line and rows */
function parseFactoringBlocks(rest: string[]): FactoringBlock[] {
  const full = rest.join('\n');
  const blocks: FactoringBlock[] = [];
  const re = /🔹\s*Example\s*(\d+)\s*Steps:\s*\n(Solve:[^\n]+)\n\n([\s\S]*?)(?=🔹\s*Example\s*\d+\s*Steps:|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(full)) !== null) {
    const exampleNum = m[1];
    const solveLine = m[2].trim();
    const body = m[3].trim();
    const rows = parseExampleStepsLines(body);
    blocks.push({ exampleNum, solveLine, rows });
  }
  if (blocks.length === 0) {
    const allRows: Array<{ left: string; right: string }> = [];
    rest.forEach((para) => allRows.push(...parseExampleStepsLines(para)));
    if (allRows.length > 0) {
      blocks.push({ exampleNum: '1', solveLine: '', rows: allRows });
    }
  }
  return blocks;
}

/** Key terms to bold in Methods of Solving (all methods A–D) for clarity */
const METHOD_BOLD_PHRASES = [
  'standard form',
  'solution set',
  'Check the solutions',
  'Substitute',
  'quadratic formula',
  'Factor the quadratic expression',
  'Set each factor equal to zero',
  'Solve the first equation',
  'Solve the second equation',
  'Addition Property of Equality',
  'Subtraction Property of Equality',
  'Simplify',
  'State the solution set',
  'Given equation',
  'Zero Property',
  'Isolate the term',
  'Take the square root of both sides',
  'Simplify the square root',
  'Move the constant term to the right side',
  'Factor the left side as a perfect square',
  'Solve for x',
  'Identify the values of a, b, and c',
  'Substitute into the quadratic formula',
  'Simplify the expression inside the square root',
  'Evaluate the square root',
  'Find the two values of x',
  'both sides',
  'constant term',
  'perfect square',
  'square root',
  'factored into two binomials',
  'form x² = k',
  'cannot be factored easily',
  'any quadratic equation',
  'solutions are',
  'Check the solutions by substitution',
];

/** Renders method step text with **bold** and key phrases bolded for clarity */
function MethodStepText({ text, style }: { text: string; style: object }) {
  const baseStyle = [styles.methodTwoColRightText, style];
  return (
    <RichParagraph
      text={text}
      first={false}
      boldPhrases={METHOD_BOLD_PHRASES}
      style={styles.methodTwoColRightText}
    />
  );
}

/** Renders method content for B, C, D: intro + Step 1, Step 2, ... with bold terms and clear layout */
function MethodStepsContent({ content }: { content: string[] }) {
  if (!content.length) return null;
  const intro = content[0] || '';
  const rest = content.slice(1);

  const elements: React.ReactNode[] = [];
  elements.push(
    <View key="intro" style={styles.methodIntroBlock}>
      <RichParagraph text={intro} first boldPhrases={METHOD_BOLD_PHRASES} style={styles.methodIntroText} />
    </View>
  );

  rest.forEach((paragraph, idx) => {
    const key = `p-${idx}`;
    const trimmed = paragraph.trim();

    // 🔹 Example N \n Solve: ...
    const exampleMatch = trimmed.match(/^🔹\s*Example\s*(\d+)\s*\n?(.*)/s);
    if (exampleMatch) {
      const body = exampleMatch[2].trim();
      const solveMatch = body.match(/^Solve:\s*(.+?)(?:\n|$)/);
      elements.push(
        <View key={key} style={styles.methodExampleHeaderBlock}>
          <View style={styles.methodExampleHeaderRow}>
            <View style={styles.methodExampleHeaderBullet} />
            <Text style={styles.methodExampleHeaderText}>Example {exampleMatch[1]}</Text>
          </View>
          {solveMatch ? (
            <Text style={styles.methodSolveLineStandalone}>{`Solve: ${solveMatch[1].trim()}`}</Text>
          ) : body ? (
            <Text style={styles.methodStepBodyText}>{body}</Text>
          ) : null}
        </View>
      );
      return;
    }

    // Step N: description \n optional equation lines
    const stepMatch = trimmed.match(/^Step\s*(\d+):\s*([\s\S]*)/i);
    if (stepMatch) {
      const stepNum = stepMatch[1];
      const body = stepMatch[2].trim();
      const firstNewline = body.indexOf('\n');
      const firstLine = firstNewline === -1 ? body : body.slice(0, firstNewline);
      const restBody = firstNewline === -1 ? '' : body.slice(firstNewline + 1).trim();
      elements.push(
        <View key={key} style={styles.methodStepCard}>
          <View style={styles.methodStepCardRow}>
            <View style={styles.methodStepCircle}>
              <Text style={styles.methodStepCircleText}>{stepNum}</Text>
            </View>
            <View style={styles.methodStepCardBody}>
              <Text style={styles.methodStepCardLabel}>Step {stepNum}: </Text>
              <RichParagraph
                text={firstLine}
                first={false}
                boldPhrases={METHOD_BOLD_PHRASES}
                style={styles.methodStepBodyText}
              />
              {restBody ? (
                <View style={styles.methodStepEquationBlock}>
                  <Text style={styles.methodStepEquationText}>{restBody}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      );
      return;
    }

    // Formula: ... (e.g. quadratic formula)
    if (trimmed.toLowerCase().startsWith('formula:')) {
      elements.push(
        <View key={key} style={styles.methodFormulaBlock}>
          <Text style={styles.methodFormulaLabel}>Formula:</Text>
          <Text style={styles.methodStepEquationText}>{trimmed.replace(/^formula:\s*/i, '').trim()}</Text>
        </View>
      );
      return;
    }

    // Plain paragraph (equations or mixed) – render with bold terms
    elements.push(
      <View key={key} style={styles.methodParagraphBlock}>
        <RichParagraph text={paragraph} first={false} boldPhrases={METHOD_BOLD_PHRASES} />
      </View>
    );
  });

  return <>{elements}</>;
}

/** Renders method content with two-column (Example | Steps) when applicable */
function MethodContentBlock({ methodTitle, content }: { methodTitle: string; content: string[] }) {
  const isFactoring = methodTitle.includes('Factoring');
  const intro = content[0] || '';
  const rest = content.slice(1);

  if (!isFactoring) {
    return <MethodStepsContent content={content} />;
  }
  if (rest.length === 0) {
    return (
      <>
        <View style={styles.methodIntroBlock}>
          <RichParagraph text={intro} first boldPhrases={METHOD_BOLD_PHRASES} style={styles.methodIntroText} />
        </View>
        {content.slice(1).map((paragraph, idx) => (
          <View key={idx} style={styles.methodParagraphBlock}>
            <RichParagraph text={paragraph} first={idx === 0} boldPhrases={METHOD_BOLD_PHRASES} />
          </View>
        ))}
      </>
    );
  }

  const blocks = parseFactoringBlocks(rest);
  if (blocks.length === 0) {
    return (
      <>
        <View style={styles.methodIntroBlock}>
          <Text style={styles.methodIntroText}>{intro}</Text>
        </View>
        {content.slice(1).map((paragraph, idx) => (
          <View key={idx} style={styles.methodParagraphBlock}>
            <BlockParagraph text={paragraph} first={idx === 0} />
          </View>
        ))}
      </>
    );
  }

  return (
    <>
      <View style={styles.methodIntroBlock}>
        <RichParagraph text={intro} first boldPhrases={METHOD_BOLD_PHRASES} style={styles.methodIntroText} />
      </View>
      {blocks.map((block, blockIdx) => (
        <View key={blockIdx} style={styles.methodTwoColumnCard}>
          <View style={styles.methodTwoColHeader}>
            <View style={styles.methodExampleHeaderLeft}>
              <View style={styles.methodExampleBullet} />
              <Text style={styles.methodTwoColHeaderLeft}>Example {block.exampleNum}</Text>
            </View>
            <Text style={styles.methodTwoColHeaderRight}>Steps:</Text>
          </View>
          {block.solveLine ? (
            <View style={styles.methodTwoColRow}>
              <View style={styles.methodTwoColLeft}>
                <Text style={styles.methodSolveLine}>{block.solveLine}</Text>
              </View>
              <View style={styles.methodTwoColRight} />
            </View>
          ) : null}
          {block.rows.map((row, idx) => {
            const isSubstituteBlock = /^Substitute\s+x\s*=/.test(row.left.trim());
            return (
              <View key={idx}>
                {isSubstituteBlock ? <View style={styles.methodBlockSpacer} /> : null}
                <View style={styles.methodTwoColRow}>
                  <View style={styles.methodTwoColLeft}>
                    <Text style={styles.methodTwoColLeftText}>{row.left}</Text>
                  </View>
                  <View style={styles.methodTwoColRight}>
                    {row.right ? (
                      <MethodStepText text={row.right} style={styles.methodTwoColRightText} />
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
}

/** Renders text that contains "Step 1: ... Step 2: ..." as clear numbered steps */
function StepByStepBlock({ text }: { text: string }) {
  const stepRegex = /Step\s*(\d+):\s*([\s\S]*?)(?=\s*Step\s*\d+:\s*|$)/gi;
  const parts: Array<{ num: string; body: string }> = [];
  let match;
  while ((match = stepRegex.exec(text)) !== null) {
    parts.push({ num: match[1], body: match[2].trim() });
  }
  if (parts.length === 0) {
    return <Text style={styles.accordionParagraph}>{text}</Text>;
  }
  return (
    <View style={styles.stepByStepList}>
      {parts.map((step, idx) => (
        <View key={idx} style={styles.stepByStepRow}>
          <View style={styles.stepByStepNum}>
            <Text style={styles.stepByStepNumText}>{step.num}</Text>
          </View>
          <Text style={styles.stepByStepText}>
            <Text style={styles.stepByStepLabel}>Step {step.num}: </Text>
            {step.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Step-by-step + table for "Writing Quadratic Equations in Standard Form" (Section II)
const STANDARD_FORM_EXAMPLES: Array<{
  example: string;
  steps: Array<{ equation: string; note: string }>;
  equation: string;
  quadraticTerm: string;
  linearTerm: string;
  constantTerm: string;
  abc: string;
}> = [
  {
    example: '1',
    steps: [
      { equation: '9x+28=9x²', note: 'Given equation' },
      { equation: '9x+28-9x=9x²-9x', note: 'Subtraction Property of Equality' },
      { equation: '28=9x²-9x', note: 'Simplify like terms' },
      { equation: '28-28=9x²-9x-28', note: 'Subtraction Property of Equality' },
      { equation: '0=9x²-9x-28', note: 'Simplify' },
      { equation: '9x²-9x-28=0', note: 'Rewrite in standard form ax²+bx+c=0' },
    ],
    equation: '9x² - 9x - 28 = 0',
    quadraticTerm: '9x²',
    linearTerm: '-9x',
    constantTerm: '-28',
    abc: 'a = 9, b = -9, c = -28',
  },
  {
    example: '2',
    steps: [
      { equation: '7x² - 20 = 6x', note: 'Given equation' },
      { equation: '7x² - 20 - 6x = 6x - 6x', note: 'Subtraction Property of Equality' },
      { equation: '7x² - 20 - 6x = 0', note: 'Simplify and make one side equal to zero' },
      { equation: '7x² - 6x - 20 = 0', note: 'Write in standard form ax²+bx+c=0' },
    ],
    equation: '7x² - 6x - 20 = 0',
    quadraticTerm: '7x²',
    linearTerm: '-6x',
    constantTerm: '-20',
    abc: 'a = 7, b = -6, c = -20',
  },
  {
    example: '3',
    steps: [
      { equation: 'x² - 4(2 + x) = 13', note: 'Given equation' },
      { equation: 'x² - 8 - 4x = 13', note: 'Apply the Distributive Property' },
      { equation: 'x² - 8 - 4x - 13 = 13 - 13', note: 'Subtraction Property of Equality' },
      { equation: 'x² - 8 - 4x - 13 = 0', note: 'Simplify' },
      { equation: 'x² - 4x - 21 = 0', note: 'Combine like terms and write in standard form' },
    ],
    equation: 'x² - 4x - 21 = 0',
    quadraticTerm: 'x²',
    linearTerm: '-4x',
    constantTerm: '-21',
    abc: 'a = 1, b = -4, c = -21',
  },
];

function FadeInBlock({ delay, children }: { delay: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

/** Staggered fade + slide up for section when screen mounts */
function SectionFadeIn({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, index * 70);
    return () => clearTimeout(timer);
  }, [index]);
  return (
    <Animated.View style={[styles.section, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function StandardFormExample({ data, index }: { data: (typeof STANDARD_FORM_EXAMPLES)[0]; index: number }) {
  return (
    <FadeInBlock delay={index * 80}>
    <View style={styles.exampleBlock}>
      <Text style={styles.exampleBlockTitle}>Example {data.example}</Text>
      <View style={styles.stepsCard}>
        <View style={styles.stepTableHeader}>
          <Text style={styles.stepColLabelLeft}>Equation</Text>
          <Text style={styles.stepColLabelRight}>Description</Text>
        </View>
        {data.steps.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <View style={styles.stepColEquation}>
              <Text style={styles.stepEquation}>{step.equation}</Text>
            </View>
            <View style={styles.stepColDescription}>
              <Text style={styles.stepNote}>{step.note}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.tableWrapper}>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableCell, styles.tableHeader, styles.tableCol1]}>Quadratic term (ax²)</Text>
            <Text style={[styles.tableCell, styles.tableHeader, styles.tableCol2]}>Linear term (bx)</Text>
            <Text style={[styles.tableCell, styles.tableHeader, styles.tableCol3]}>Constant term (c)</Text>
            <Text style={[styles.tableCell, styles.tableHeader, styles.tableCol4]}>Values of a, b, and c</Text>
          </View>
          <View style={styles.tableDataRow}>
            <Text style={[styles.tableCell, styles.tableCol1]}>{data.quadraticTerm}</Text>
            <Text style={[styles.tableCell, styles.tableCol2]}>{data.linearTerm}</Text>
            <Text style={[styles.tableCell, styles.tableCol3]}>{data.constantTerm}</Text>
            <Text style={[styles.tableCell, styles.tableCol4, styles.tableAbc]}>{data.abc}</Text>
          </View>
        </View>
      </View>
    </View>
    </FadeInBlock>
  );
}

export default function LessonMenuScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [openedSections, setOpenedSections] = useState<Set<string>>(() => new Set(['I'])); // I is always visible

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((prev) => {
      const next = prev === key ? null : key;
      if (next) setOpenedSections((s) => new Set(s).add(next));
      return next;
    });
    if (key !== 'V') setExpandedMethod(null);
  };

  const toggleMethod = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMethod((prev) => (prev === key ? null : key));
  };

  const s = MODULE_1_SECTIONS;
  const secI = s.I_Purpose_and_Learning_Objectives;
  const secII = s.II_What_Is_a_Quadratic_Equation;
  const secIII = s.III_Key_Words_and_Concepts;
  const secIV = s.IV_General_Procedure;
  const secV = s.V_Methods_of_Solving_Quadratic_Equations;

  const methodKeys = secV?.methods ? Object.keys(secV.methods) : [];
  const { width: windowWidth } = useWindowDimensions();
  const { ReadingProgressIndicator } = useAccordionReadingProgress(
    QUADRATIC_TOPIC_ID,
    QUADRATIC_SECTION_KEYS.length,
    openedSections,
    saveTopicContentProgress
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Quadratic Equations</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb() && styles.scrollContentWeb,
            isWeb() && { maxWidth: windowWidth, alignSelf: 'stretch', width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.scrollInner, isWeb() && styles.scrollInnerWeb, isWeb() && { maxWidth: windowWidth }]}>
        {/* I. Purpose and Learning Objectives — always visible, no accordion */}
        <SectionFadeIn index={0}>
          <View style={styles.purposeSectionWrap}>
            <Text style={styles.staticSectionTitle}>I. Purpose and Learning Objectives</Text>
            {secI && (
              <View style={styles.staticSectionContent}>
                <View style={styles.purposeCard}>
                  <Text style={[styles.purposeBlockHeading, styles.blockHeadingFirst]}>Purpose</Text>
                  <Text style={styles.bodyTextCentered}>
                    {secI.purpose_block.replace(/^Purpose of the Module\n/i, '').trim()}
                  </Text>
                </View>
                <View style={styles.purposeCard}>
                  <Text style={styles.purposeBlockHeading}>Learning objectives</Text>
                  <Text style={styles.bodyTextCentered}>
                    {secI.learning_objectives_intro.replace(/^Learning Objectives\n/i, '').trim()}
                  </Text>
                  <View style={styles.objectiveList}>
                    {(secI.learning_objectives_list || []).map((item, idx) => (
                      <View key={idx} style={styles.objectiveRow}>
                        <View style={styles.objectiveBullet} />
                        <Text style={styles.objectiveItem}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </SectionFadeIn>

        {/* II. What Is a Quadratic Equation */}
        <SectionFadeIn index={1}>
          <AccordionHeader
            title="II. What Is a Quadratic Equation"
            isOpen={expandedSection === 'II'}
            onPress={() => toggle('II')}
            icon={isWeb() ? '📐' : undefined}
          />
          {expandedSection === 'II' && Array.isArray(secII) && (
            <AnimatedAccordionBody>
              <ContentCard label="Definition, form & parts">
                {secII.map((paragraph, idx) => (
                  <SectionIIBlock key={idx} text={paragraph} first={idx === 0} />
                ))}
              </ContentCard>
              <View style={styles.subsectionBlock}>
                <Text style={styles.tableSectionHeading}>
                  Writing Quadratic Equations in Standard Form and Identifying the Values of a, b, and c
                </Text>
                <Text style={styles.tableSectionInstruction}>
                  Write the following in standard form ax² + bx + c = 0. Identify the quadratic, linear and the constant term of each equation. Then, identify the value of a, b and c.
                </Text>
                {STANDARD_FORM_EXAMPLES.map((exampleData, idx) => (
                  <StandardFormExample key={idx} data={exampleData} index={idx} />
                ))}
              </View>
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* III. Key Words and Concepts */}
        <SectionFadeIn index={2}>
          <AccordionHeader
            title="III. Key Words and Concepts"
            isOpen={expandedSection === 'III'}
            onPress={() => toggle('III')}
            icon={isWeb() ? '📝' : undefined}
          />
          {expandedSection === 'III' && secIII && (
            <AnimatedAccordionBody>
              <View style={[styles.conceptsGridWrap, { maxWidth: windowWidth }]}>
                <View style={styles.conceptsGrid}>
                  {secIII
                    .split(/\n/)
                    .map((line) => line.replace(/^[•·]\s*/, '').trim())
                    .filter(Boolean)
                    .map((item, idx) => (
                      <FadeInBlock key={idx} delay={idx * 50}>
                        <View style={styles.conceptChipWrapper}>
                          <View style={styles.conceptChip}>
                            <Text style={[styles.conceptChipText, isWeb() && styles.conceptChipTextWeb]}>{item}</Text>
                          </View>
                        </View>
                      </FadeInBlock>
                    ))}
                </View>
              </View>
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* IV. General Procedure in Solving Quadratic Equations */}
        <SectionFadeIn index={3}>
          <AccordionHeader
            title="IV. General Procedure in Solving Quadratic Equations"
            isOpen={expandedSection === 'IV'}
            onPress={() => toggle('IV')}
            icon={isWeb() ? '📋' : undefined}
          />
          {expandedSection === 'IV' && Array.isArray(secIV) && (
            <AnimatedAccordionBody>
              <Text style={styles.procedureIntro}>{secIV[0]}</Text>
              {secIV[1] ? <StepByStepBlock text={secIV[1]} /> : null}
              {secIV[2] ? <Text style={[styles.accordionParagraph, styles.procedureOutro]}>{secIV[2]}</Text> : null}
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* V. Methods of Solving Quadratic Equations — A, B, C, D */}
        <SectionFadeIn index={4}>
          <AccordionHeader
            title="V. Methods of Solving Quadratic Equations"
            isOpen={expandedSection === 'V'}
            onPress={() => toggle('V')}
            icon={isWeb() ? '💡' : undefined}
          />
          {expandedSection === 'V' && secV && (
            <AnimatedAccordionBody>
              <ContentCard>
                {(secV.intro_paragraphs || []).map((p, idx) => (
                  <BlockParagraph key={idx} text={p} first={idx === 0} />
                ))}
              </ContentCard>
              <Text style={styles.methodsSubtitle}>Choose a method to expand:</Text>
              {methodKeys.map((methodTitle) => {
                const isMethodOpen = expandedMethod === methodTitle;
                const content = secV.methods[methodTitle];
                const isArray = Array.isArray(content);
                return (
                  <View key={methodTitle} style={styles.subAccordion}>
                    <SubAccordionHeader
                      title={methodTitle}
                      isOpen={isMethodOpen}
                      onPress={() => toggleMethod(methodTitle)}
                    />
                    {isMethodOpen && isArray && (
                      <FadeInBlock delay={0}>
                        <View style={styles.subAccordionBody}>
                          <MethodContentBlock methodTitle={methodTitle} content={content} />
                        </View>
                      </FadeInBlock>
                    )}
                  </View>
                );
              })}
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>
        </View>
        </ScrollView>
        <ReadingProgressIndicator />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.card,
  },
  backButton: {
    marginRight: getSpacing(Spacing.sm),
  },
  backButtonText: {
    fontSize: scaleFont(16),
    color: Theme.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: Theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getSpacing(Spacing.xxl),
  },
  scrollContentWeb: { alignItems: 'center' },
  scrollInner: { width: '100%' },
  scrollInnerWeb: { maxWidth: 1200, alignSelf: 'center' },
  section: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
  },
  purposeSectionWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  staticSectionTitle: {
    fontSize: scaleFont(isWeb() ? 22 : 18),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    textAlign: 'center',
  },
  staticSectionContent: {
    marginBottom: getSpacing(Spacing.sm),
    width: '100%',
    maxWidth: scaleSize(isWeb() ? 1100 : 520),
    alignItems: 'center',
  },
  purposeCard: {
    width: '100%',
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.md),
    borderWidth: 1,
    borderColor: Theme.border,
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: scaleSize(6),
    elevation: 2,
  },
  bodyTextCentered: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 28 : 24),
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.card,
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.lg),
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  accordionTitle: {
    fontSize: scaleFont(isWeb() ? 19 : 17),
    fontWeight: '700',
    color: Theme.text,
    flex: 1,
  },
  accordionIcon: { fontSize: scaleFont(22), marginRight: getSpacing(Spacing.sm) },
  accordionChevron: {
    fontSize: scaleFont(12),
    color: Theme.primary,
    fontWeight: 'bold',
    marginLeft: getSpacing(Spacing.sm),
  },
  accordionChevronOpen: {
    opacity: 0.9,
  },
  accordionBody: {
    backgroundColor: Theme.card,
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: getSpacing(isWeb() ? Spacing.xl : Spacing.md),
    paddingVertical: getSpacing(isWeb() ? Spacing.md : Spacing.sm),
    paddingBottom: getSpacing(Spacing.md),
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Theme.border,
    borderBottomLeftRadius: scaleSize(BorderRadius.lg),
    borderBottomRightRadius: scaleSize(BorderRadius.lg),
    marginBottom: getSpacing(Spacing.sm),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  accordionBodyWeb: { borderLeftWidth: 4, borderLeftColor: Theme.primary, backgroundColor: '#FFFCFA' },
  accordionParagraph: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginBottom: getSpacing(Spacing.sm),
  },
  accordionParagraphFirst: {
    marginTop: 0,
  },
  contentCard: {
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.md),
    padding: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.md),
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
  },
  blockHeading: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '700',
    color: Theme.primary,
    marginTop: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.xs),
  },
  purposeBlockHeading: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.primary,
    marginTop: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  blockHeadingFirst: {
    marginTop: 0,
  },
  contentCardLabel: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.sm),
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionIIBlock: {
    marginBottom: getSpacing(Spacing.md),
  },
  sectionIIBlockFirst: {
    marginTop: 0,
  },
  sectionIIParagraphWrap: {
    marginBottom: getSpacing(Spacing.xs),
  },
  sectionIISubheading: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.text,
    marginTop: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.xs),
  },
  sectionIIBulletList: {
    marginTop: getSpacing(Spacing.xs),
    marginBottom: getSpacing(Spacing.sm),
    borderLeftWidth: scaleSize(3),
    borderLeftColor: Theme.primary,
    paddingLeft: getSpacing(Spacing.sm),
  },
  sectionIIBulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.xs),
  },
  sectionIIBulletDot: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: scaleSize(3),
    backgroundColor: Theme.primary,
    marginTop: scaleFont(22) * 0.4,
    marginRight: getSpacing(Spacing.sm),
  },
  sectionIIBulletText: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
  },
  sectionIINumberedList: {
    marginTop: getSpacing(Spacing.xs),
    marginBottom: getSpacing(Spacing.sm),
  },
  sectionIINumberedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.md),
  },
  sectionIINumberedNum: {
    width: scaleSize(26),
    height: scaleSize(26),
    borderRadius: scaleSize(13),
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  sectionIINumberedNumText: {
    fontSize: scaleFont(13),
    fontWeight: '700',
    color: Theme.white,
  },
  sectionIINumberedBody: {
    flex: 1,
    fontSize: scaleFont(14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(22),
  },
  sectionIINumberedBodyWrap: {
    flex: 1,
  },
  bodyText: {
    fontSize: scaleFont(14),
    color: Theme.text,
    lineHeight: scaleFont(22),
    marginBottom: getSpacing(Spacing.sm),
  },
  objectiveList: {
    marginTop: getSpacing(Spacing.sm),
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.sm),
  },
  objectiveBullet: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: Theme.primary,
    marginTop: scaleSize(8),
    marginRight: getSpacing(Spacing.sm),
    flexShrink: 0,
  },
  objectiveItem: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 15),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 24),
  },
  subsectionBlock: {
    marginTop: getSpacing(Spacing.sm),
  },
  conceptsGridWrap: {
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  conceptsGrid: {
    flexDirection: 'column',
    width: '100%',
    minWidth: 0,
    gap: getSpacing(Spacing.sm),
  },
  conceptChipWrapper: {
    width: '100%',
    minWidth: 0,
  },
  conceptChip: {
    backgroundColor: Theme.primary + '14',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.full),
    borderWidth: 1,
    borderColor: Theme.primary + '30',
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
  },
  conceptChipText: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.text,
    fontWeight: '500',
  },
  conceptChipTextWeb: {
    wordBreak: 'break-word' as const,
    overflowWrap: 'break-word' as const,
  },
  methodsSubtitle: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: Theme.textSecondary,
    marginBottom: getSpacing(Spacing.sm),
  },
  methodParagraphBlock: {
    marginBottom: getSpacing(Spacing.xs),
  },
  methodIntroBlock: {
    marginBottom: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.sm),
  },
  methodIntroText: {
    fontSize: scaleFont(14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(21),
    fontStyle: 'italic',
  },
  methodExampleHeaderBlock: {
    marginTop: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.sm),
  },
  methodExampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xs),
  },
  methodExampleHeaderBullet: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: Theme.primary,
    marginRight: getSpacing(Spacing.xs),
  },
  methodExampleHeaderText: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: Theme.text,
  },
  methodSolveLineStandalone: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: Theme.text,
    lineHeight: scaleFont(22),
    marginBottom: getSpacing(Spacing.xs),
  },
  methodStepCard: {
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.sm),
    padding: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.sm),
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.primary,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  methodStepCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  methodStepCircle: {
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
  },
  methodStepCircleText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: Theme.white,
  },
  methodStepCardBody: {
    flex: 1,
  },
  methodStepCardLabel: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  methodStepBodyText: {
    fontSize: scaleFont(14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(22),
    marginBottom: getSpacing(Spacing.xs),
  },
  methodStepEquationBlock: {
    backgroundColor: Theme.background,
    borderRadius: scaleSize(BorderRadius.sm),
    padding: getSpacing(Spacing.sm),
    marginTop: getSpacing(Spacing.xs),
    borderLeftWidth: 2,
    borderLeftColor: Theme.border,
  },
  methodStepEquationText: {
    fontSize: scaleFont(13),
    color: Theme.text,
    lineHeight: scaleFont(20),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  methodFormulaBlock: {
    backgroundColor: Theme.background,
    borderRadius: scaleSize(BorderRadius.sm),
    padding: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.sm),
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
  },
  methodFormulaLabel: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.xs),
    textTransform: 'uppercase',
  },
  methodTwoColumnCard: {
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.sm),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.sm),
    borderWidth: 1,
    borderColor: Theme.border,
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.primary,
  },
  methodTwoColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
    paddingBottom: getSpacing(Spacing.xs),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  methodExampleHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodExampleBullet: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: Theme.primary,
    marginRight: getSpacing(Spacing.xs),
  },
  methodTwoColHeaderLeft: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: Theme.text,
  },
  methodTwoColHeaderRight: {
    flex: 1,
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: Theme.text,
    textAlign: 'left',
  },
  methodSolveLine: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: Theme.text,
    lineHeight: scaleFont(22),
  },
  methodBlockSpacer: {
    height: getSpacing(Spacing.md),
  },
  methodTwoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.xs),
    minHeight: scaleSize(28),
  },
  methodTwoColLeft: {
    flex: 1,
    paddingRight: getSpacing(Spacing.md),
  },
  methodTwoColRight: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  methodTwoColLeftText: {
    fontSize: scaleFont(13),
    color: Theme.text,
    lineHeight: scaleFont(20),
  },
  methodTwoColRightText: {
    fontSize: scaleFont(12),
    color: Theme.textSecondary,
    lineHeight: scaleFont(18),
    textAlign: 'left',
  },
  subAccordion: {
    marginTop: getSpacing(Spacing.md),
  },
  subAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.background,
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.primary,
  },
  subAccordionTitle: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    color: Theme.text,
    flex: 1,
  },
  subAccordionBody: {
    marginTop: getSpacing(Spacing.xs),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
  },
  tableSectionHeading: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.text,
    marginTop: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.xs),
  },
  tableSectionInstruction: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 25 : 20),
    marginBottom: getSpacing(Spacing.md),
  },
  exampleBlock: {
    marginBottom: getSpacing(Spacing.lg),
  },
  exampleBlockTitle: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  stepsCard: {
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.sm),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.sm),
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  stepTableHeader: {
    flexDirection: 'row',
    marginBottom: getSpacing(Spacing.sm),
    paddingBottom: getSpacing(Spacing.xs),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  stepColLabelLeft: {
    flex: 1,
    fontSize: scaleFont(10),
    fontWeight: '700',
    color: Theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  stepColLabelRight: {
    width: '42%',
    fontSize: scaleFont(10),
    fontWeight: '700',
    color: Theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    textAlign: 'right',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
    gap: getSpacing(Spacing.md),
  },
  stepColEquation: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  stepColDescription: {
    width: '42%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stepEquation: {
    fontSize: scaleFont(12),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Theme.text,
    lineHeight: scaleFont(18),
  },
  stepNote: {
    fontSize: scaleFont(11),
    color: Theme.textSecondary,
    lineHeight: scaleFont(16),
    textAlign: 'right',
  },
  tableWrapper: {
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: scaleSize(BorderRadius.sm),
    overflow: 'hidden',
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  procedureIntro: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginBottom: getSpacing(Spacing.md),
    fontWeight: '500',
  },
  procedureOutro: {
    marginTop: getSpacing(Spacing.sm),
  },
  stepByStepList: {
    marginBottom: getSpacing(Spacing.sm),
  },
  stepByStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.md),
  },
  stepByStepNum: {
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    backgroundColor: Theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.sm),
    flexShrink: 0,
  },
  stepByStepNumText: {
    fontSize: scaleFont(14),
    fontWeight: '800',
    color: Theme.white,
  },
  stepByStepText: {
    flex: 1,
    fontSize: scaleFont(14),
    color: Theme.text,
    lineHeight: scaleFont(22),
  },
  stepByStepLabel: {
    fontWeight: '700',
    color: Theme.primary,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Theme.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  tableDataRow: {
    flexDirection: 'row',
    backgroundColor: Theme.card,
  },
  tableCell: {
    fontSize: scaleFont(12),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.xs),
    color: Theme.textSecondary,
  },
  tableHeader: {
    fontWeight: '700',
    color: Theme.text,
    fontSize: scaleFont(11),
  },
  tableCol1: { flex: 1.2, minWidth: 0 },
  tableCol2: { flex: 0.9, minWidth: 0 },
  tableCol3: { flex: 0.9, minWidth: 0 },
  tableCol4: { flex: 1.4, minWidth: 0 },
  tableAbc: {
    fontWeight: '700',
    color: Theme.text,
  },
});
