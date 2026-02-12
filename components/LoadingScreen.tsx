import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Spacing } from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRIMARY_COLOR = '#10B981';
const PRIMARY_DARK = '#047857';
const WHITE = '#FFFFFF';

interface LoadingScreenProps {
  onFinish?: () => void;
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  // Logo animations
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  
  // Title animations
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(50)).current;
  
  // Tagline animation
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Loading dots animation
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  
  // Background particles
  const particle1Anim = useRef(new Animated.Value(0)).current;
  const particle2Anim = useRef(new Animated.Value(0)).current;
  const particle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation with rotation and float
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Title slide and fade
    Animated.parallel([
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline fade
    Animated.timing(taglineFadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Loading dots animation
    const createDotAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dot1Anim, 0).start();
    createDotAnimation(dot2Anim, 200).start();
    createDotAnimation(dot3Anim, 400).start();

    // Background particles animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(particle1Anim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(particle2Anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(particle3Anim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Auto transition after 2.5 seconds
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  const logoFloatY = logoFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const dot1Scale = dot1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const dot2Scale = dot2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const dot3Scale = dot3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const particle1TranslateY = particle1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_HEIGHT],
  });

  const particle2TranslateY = particle2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_HEIGHT * 1.2],
  });

  const particle3TranslateY = particle3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_HEIGHT * 0.8],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[PRIMARY_COLOR, PRIMARY_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated background particles */}
      <Animated.View
        style={[
          styles.particle,
          styles.particle1,
          {
            transform: [{ translateY: particle1TranslateY }],
            opacity: particle1Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.6, 0.3],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            transform: [{ translateY: particle2TranslateY }],
            opacity: particle2Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 0.5, 0.2],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle3,
          {
            transform: [{ translateY: particle3TranslateY }],
            opacity: particle3Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.25, 0.55, 0.25],
            }),
          },
        ]}
      />

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo with animations */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoFadeAnim,
              transform: [
                { scale: logoScaleAnim },
                { rotate: logoRotation },
                { translateY: logoFloatY },
              ],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title with slide animation */}
        <Animated.View
          style={{
            opacity: titleFadeAnim,
            transform: [{ translateY: titleSlideAnim }],
          }}
        >
          <Text style={styles.title}>Math Bridge Handbook</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: taglineFadeAnim,
          }}
        >
          <Text style={styles.tagline}>Bridging Gaps, Building Skills</Text>
        </Animated.View>

        {/* Loading dots */}
        <Animated.View style={[styles.loadingDots, { opacity: taglineFadeAnim }]}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: dot1Scale }],
                opacity: dot1Anim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: dot2Scale }],
                opacity: dot2Anim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [{ scale: dot3Scale }],
                opacity: dot3Anim,
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: WHITE,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: WHITE,
    opacity: 0.95,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: Spacing.lg,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: WHITE,
    marginHorizontal: 6,
    opacity: 0.8,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: WHITE,
  },
  particle1: {
    width: 100,
    height: 100,
    left: SCREEN_WIDTH * 0.2,
    top: SCREEN_HEIGHT + 50,
    opacity: 0.15,
  },
  particle2: {
    width: 150,
    height: 150,
    right: SCREEN_WIDTH * 0.15,
    top: SCREEN_HEIGHT + 100,
    opacity: 0.1,
  },
  particle3: {
    width: 80,
    height: 80,
    left: SCREEN_WIDTH * 0.6,
    top: SCREEN_HEIGHT + 30,
    opacity: 0.12,
  },
});

