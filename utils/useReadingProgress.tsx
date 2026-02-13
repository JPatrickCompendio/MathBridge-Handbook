/**
 * Accurate reading progress: based on max scroll position reached (not just current scroll).
 * 70% of topic progress comes from reading. Shows an indicator while scrolling.
 */
import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { getSpacing, scaleFont, scaleSize } from './responsive';

const SAVE_THRESHOLD_PERCENT = 3;
const INDICATOR_COLORS = { bg: 'rgba(16, 185, 129, 0.9)', text: '#FFFFFF' };

export function useReadingProgress(
  topicId: number,
  saveContentProgress: (topicId: number, percent: number) => void | Promise<void>
) {
  const maxScrollYReached = useRef(0);
  const lastSavedPercent = useRef(0);
  const contentHeightRef = useRef(0);
  const viewHeightRef = useRef(0);
  const [readingPercent, setReadingPercent] = useState(0);
  const indicatorOpacity = useRef(new Animated.Value(0)).current;

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const contentHeight = contentSize.height;
      const viewHeight = layoutMeasurement.height;
      contentHeightRef.current = contentHeight;
      viewHeightRef.current = viewHeight;

      const maxScroll = contentHeight - viewHeight;
      if (maxScroll <= 0) return;

      const y = Math.max(0, contentOffset.y);
      maxScrollYReached.current = Math.max(maxScrollYReached.current, y);
      const percent = Math.min(100, Math.round((maxScrollYReached.current / maxScroll) * 100));

      setReadingPercent(percent);

      const shouldSave =
        percent >= 100 ||
        percent - lastSavedPercent.current >= SAVE_THRESHOLD_PERCENT ||
        (percent > 0 && lastSavedPercent.current === 0);
      if (shouldSave) {
        lastSavedPercent.current = percent;
        saveContentProgress(topicId, percent);
      }

      Animated.timing(indicatorOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    },
    [topicId, saveContentProgress, indicatorOpacity]
  );

  const ReadingProgressIndicator = useCallback(
    () =>
      readingPercent > 0 ? (
        <Animated.View style={[styles.indicator, { opacity: indicatorOpacity }]}>
          <Text style={styles.indicatorText}>Reading: {readingPercent}%</Text>
          <View style={styles.indicatorBarBg}>
            <View style={[styles.indicatorBarFill, { width: `${readingPercent}%` }]} />
          </View>
        </Animated.View>
      ) : null,
    [readingPercent, indicatorOpacity]
  );

  return { handleScroll, readingPercent, ReadingProgressIndicator };
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
