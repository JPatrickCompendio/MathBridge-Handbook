/**
 * Accordion body with a cool "reveal" effect when opened:
 * slight scale pop, fade-in, and a quick orange shine sweep across.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleProp, StyleSheet, ViewStyle } from 'react-native';

const SHINE_WIDTH = 120;
const SHINE_DURATION_MS = 420;
const SCALE_DURATION_MS = 320;

type AccordionRevealBodyProps = {
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function AccordionRevealBody({ children, contentStyle }: AccordionRevealBodyProps) {
  const screenWidth = Dimensions.get('window').width;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const shineX = useRef(new Animated.Value(-SHINE_WIDTH - screenWidth)).current;
  const shineOpacity = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: SCALE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: SCALE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.02,
          friction: 8,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 10,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(shineX, {
          toValue: screenWidth + SHINE_WIDTH,
          duration: SHINE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shineOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [opacity, scale, translateY, shineX, shineOpacity, screenWidth]);

  return (
    <Animated.View
      style={[
        contentStyle,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          overflow: 'hidden',
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shineWrap,
          {
            width: SHINE_WIDTH,
            opacity: shineOpacity,
            transform: [{ translateX: shineX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            `rgba(255,102,0,0.12)`,
            `rgba(255,102,0,0.45)`,
            `rgba(255,102,0,0.12)`,
            'transparent',
          ]}
          locations={[0, 0.3, 0.5, 0.7, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shineWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
});
