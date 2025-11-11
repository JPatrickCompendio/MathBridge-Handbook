import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showBackground?: boolean;
}

export default function CircularProgress({
  progress,
  size = 140,
  strokeWidth = 14,
  color = Colors.primary,
  showBackground = true,
}: CircularProgressProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  // Create a smooth progress indicator using conic gradient simulation
  // We'll use multiple overlapping arcs for a smooth circular progress
  const segments = 8; // 8 segments for smoother appearance
  const segmentAngle = 360 / segments;
  const filledSegments = Math.floor((clampedProgress / 100) * segments);
  const partialSegmentProgress = ((clampedProgress / 100) * segments) % 1;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <View
        style={[
          styles.glowRing,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            borderWidth: strokeWidth + 2,
            borderColor: `${color}25`,
          },
        ]}
      />

      {/* Background circle */}
      {showBackground && (
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: `${Colors.border}DD`,
              backgroundColor: Colors.surface,
            },
          ]}
        />
      )}

      {/* Progress segments */}
      <View style={[styles.segmentsContainer, { width: size, height: size }]}>
        {Array.from({ length: segments }).map((_, index) => {
          const segmentProgress = index < filledSegments 
            ? 1 
            : index === filledSegments 
            ? partialSegmentProgress 
            : 0;
          
          if (segmentProgress === 0) return null;

          const startAngle = index * segmentAngle - 90;
          const endAngle = startAngle + segmentAngle * segmentProgress;
          const isFullSegment = segmentProgress === 1;

          return (
            <View
              key={index}
              style={[
                styles.segmentWrapper,
                {
                  width: size,
                  height: size,
                  transform: [{ rotate: `${startAngle}deg` }],
                },
              ]}
            >
              <View
                style={[
                  styles.progressSegment,
                  {
                    width: size / 2,
                    height: size,
                    borderTopWidth: strokeWidth,
                    borderRightWidth: isFullSegment ? strokeWidth : 0,
                    borderTopColor: color,
                    borderRightColor: color,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: size / 2,
                    borderBottomRightRadius: size / 2,
                    opacity: 0.9 + (segmentProgress * 0.1),
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Inner circle with gradient effect */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size - strokeWidth * 2 - 18,
            height: size - strokeWidth * 2 - 18,
            borderRadius: (size - strokeWidth * 2 - 18) / 2,
            backgroundColor: Colors.surface,
            shadowColor: color,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 5,
            borderWidth: 1,
            borderColor: `${color}10`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    opacity: 0.4,
  },
  backgroundCircle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentWrapper: {
    position: 'absolute',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  progressSegment: {
    position: 'absolute',
    left: '50%',
  },
  innerCircle: {
    position: 'absolute',
  },
});
