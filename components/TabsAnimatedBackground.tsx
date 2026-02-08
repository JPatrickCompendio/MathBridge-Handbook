/**
 * Shared animated background for all tab screens (web: elegant floating math symbols + gradient).
 * Renders behind content; use inside a wrapper with position relative so content stays on top.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { isWeb } from '../utils/responsive';

const PRIMARY = '#FF6600';

const BG_SYMBOLS = ['+', '−', '×', '÷', 'π', '√', 'Σ', '∫', '∞', 'θ', 'α', '='];

function FloatingSymbol({
  symbol,
  left,
  top,
  size,
  opacity,
  delay,
  duration,
}: {
  symbol: string;
  left: number;
  top: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const driftY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    const driftX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 1,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration * 0.7,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    const spin = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: duration * 2,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: duration * 0.4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: duration * 0.4,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    const t = setTimeout(() => {
      driftY.start();
      driftX.start();
      spin.start();
      breathe.start();
    }, delay);
    return () => {
      clearTimeout(t);
      driftY.stop();
      driftX.stop();
      spin.stop();
      breathe.stop();
    };
  }, [delay, duration, rotate, scale, translateX, translateY]);

  const moveY = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const moveX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });
  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.symbolWrap,
        {
          left: `${left}%`,
          top: `${top}%`,
          transform: [
            { translateX: moveX },
            { translateY: moveY },
            { rotate: rotation },
            { scale },
          ],
        },
      ]}
    >
      <Text style={[styles.symbolText, { fontSize: size, opacity }]}>{symbol}</Text>
    </Animated.View>
  );
}

export default function TabsAnimatedBackground() {
  if (!isWeb()) return null;

  const speedFactor = 0.35;
  const symbols = [
    { symbol: BG_SYMBOLS[0], left: 5, top: 10, size: 42, opacity: 0.28, delay: 0, duration: 20000 },
    { symbol: BG_SYMBOLS[1], left: 88, top: 14, size: 32, opacity: 0.24, delay: 600, duration: 24000 },
    { symbol: BG_SYMBOLS[2], left: 12, top: 52, size: 48, opacity: 0.26, delay: 300, duration: 22000 },
    { symbol: BG_SYMBOLS[3], left: 82, top: 44, size: 36, opacity: 0.25, delay: 900, duration: 26000 },
    { symbol: BG_SYMBOLS[4], left: 75, top: 75, size: 44, opacity: 0.27, delay: 450, duration: 21000 },
    { symbol: BG_SYMBOLS[5], left: 4, top: 82, size: 38, opacity: 0.24, delay: 750, duration: 23000 },
    { symbol: BG_SYMBOLS[6], left: 92, top: 32, size: 34, opacity: 0.23, delay: 150, duration: 28000 },
    { symbol: BG_SYMBOLS[7], left: 45, top: 6, size: 36, opacity: 0.25, delay: 1100, duration: 25000 },
    { symbol: BG_SYMBOLS[8], left: 52, top: 68, size: 40, opacity: 0.26, delay: 200, duration: 27000 },
    { symbol: BG_SYMBOLS[9], left: 25, top: 88, size: 30, opacity: 0.24, delay: 400, duration: 22000 },
    { symbol: BG_SYMBOLS[10], left: 68, top: 22, size: 28, opacity: 0.22, delay: 550, duration: 24000 },
    { symbol: BG_SYMBOLS[11], left: 32, top: 38, size: 34, opacity: 0.25, delay: 800, duration: 26000 },
  ];

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.gradient} />
      <LinearGradient
        colors={[`${PRIMARY}08`, `${PRIMARY}02`, 'transparent', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      {symbols.map((s, i) => (
        <FloatingSymbol
          key={i}
          symbol={s.symbol}
          left={s.left}
          top={s.top}
          size={s.size}
          opacity={s.opacity}
          delay={s.delay}
          duration={Math.round(s.duration * speedFactor)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAFAFA',
    opacity: 1,
  },
  symbolWrap: {
    position: 'absolute',
  },
  symbolText: {
    color: PRIMARY,
    fontWeight: '600',
  },
});
