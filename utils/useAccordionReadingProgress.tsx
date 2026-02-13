/**
 * Reading progress based on accordion sections opened (not scroll).
 * Progress = (sections opened / total sections) * 100 so the topic card stays accurate.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { getSpacing, scaleFont, scaleSize } from './responsive';

const INDICATOR_COLORS = { bg: 'rgba(16, 185, 129, 0.9)', text: '#FFFFFF' };

export function useAccordionReadingProgress(
  topicId: number,
  totalSections: number,
  openedSectionIds: ReadonlySet<string> | readonly string[],
  saveContentProgress: (topicId: number, percent: number) => void | Promise<void>
) {
  const openedCount = Array.isArray(openedSectionIds)
    ? openedSectionIds.length
    : (openedSectionIds as ReadonlySet<string>).size;
  const percent = totalSections > 0 ? Math.min(100, Math.round((openedCount / totalSections) * 100)) : 0;
  const lastSaved = useRef(0);
  const indicatorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (totalSections <= 0 || percent === 0 || percent <= lastSaved.current) return;
    lastSaved.current = percent;
    saveContentProgress(topicId, percent);
  }, [topicId, totalSections, percent, saveContentProgress]);

  const ReadingProgressIndicator = useCallback(
    () =>
      percent > 0 ? (
        <Animated.View style={[styles.indicator, { opacity: indicatorOpacity }]}>
          <Text style={styles.indicatorText}>Reading: {percent}% ({openedCount}/{totalSections} sections)</Text>
          <View style={styles.indicatorBarBg}>
            <View style={[styles.indicatorBarFill, { width: `${percent}%` }]} />
          </View>
        </Animated.View>
      ) : null,
    [percent, openedCount, totalSections, indicatorOpacity]
  );

  useEffect(() => {
    Animated.timing(indicatorOpacity, { toValue: percent > 0 ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [percent, indicatorOpacity]);

  return { readingPercent: percent, ReadingProgressIndicator };
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    bottom: getSpacing(16),
    left: getSpacing(16),
    right: getSpacing(16),
    backgroundColor: INDICATOR_COLORS.bg,
    borderRadius: scaleSize(12),
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(12),
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  indicatorText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: INDICATOR_COLORS.text,
    marginBottom: getSpacing(4),
  },
  indicatorBarBg: {
    height: scaleSize(4),
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorBarFill: {
    height: '100%',
    backgroundColor: INDICATOR_COLORS.text,
    borderRadius: 2,
  },
});
