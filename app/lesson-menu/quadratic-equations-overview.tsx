import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../constants/colors';
import { QUADRATIC_EQUATIONS_DATA } from '../../data/lessons/module1_quadratic';
import { getSpacing, scaleFont, scaleSize } from '../../utils/responsive';

const Theme = {
  primary: '#FF6600',
  primaryDark: '#E55A00',
  white: '#FFFFFF',
  background: '#FFF8F5',
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  border: '#FFE5D9',
  accent: '#0EA5E9',
  cardGradientStart: '#FFFFFF',
  cardGradientEnd: '#FFFBF9',
};

const ANIM_DURATION = 420;
const ANIM_STAGGER = 100;

function FadeSlideIn({
  delay,
  children,
  style,
}: {
  delay: number;
  children: React.ReactNode;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export default function QuadraticEquationsOverviewScreen() {
  const router = useRouter();
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleEnter = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
    router.push('/lesson-menu/quadratic-equations' as any);
  };

  const onPressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ImageBackground
        source={require('../../assets/images/geometry.png')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <FadeSlideIn delay={0}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>📐 Module 1</Text>
              </View>
            </FadeSlideIn>
            <FadeSlideIn delay={ANIM_STAGGER}>
              <View style={styles.header}>
                <Text style={styles.title}>{QUADRATIC_EQUATIONS_DATA.title}</Text>
                <Text style={styles.tagline}>Solve any ax² + bx + c = 0 like a pro</Text>
                <Text style={styles.description}>{QUADRATIC_EQUATIONS_DATA.description}</Text>
              </View>
            </FadeSlideIn>

            <FadeSlideIn delay={ANIM_STAGGER * 2}>
              <View style={styles.highlights}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>4</Text>
                  <Text style={styles.highlightLabel}>Methods</Text>
                </View>
                <View style={styles.highlightDivider} />
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>✓</Text>
                  <Text style={styles.highlightLabel}>Step-by-step</Text>
                </View>
                <View style={styles.highlightDivider} />
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightIcon}>🎯</Text>
                  <Text style={styles.highlightLabel}>Practice</Text>
                </View>
              </View>
            </FadeSlideIn>

            <FadeSlideIn delay={ANIM_STAGGER * 3}>
              <TouchableOpacity
                onPress={handleEnter}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                activeOpacity={1}
                style={styles.enterButtonWrap}
              >
                <Animated.View style={[styles.enterButton, { transform: [{ scale: buttonScale }] }]}>
                  <Text style={styles.enterButtonText}>Start learning</Text>
                  <Text style={styles.enterButtonArrow}>→</Text>
                </Animated.View>
              </TouchableOpacity>
            </FadeSlideIn>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 245, 0.92)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getSpacing(Spacing.xxl),
  },
  content: {
    padding: getSpacing(Spacing.xl),
    paddingTop: getSpacing(Spacing.xxl) + getSpacing(Spacing.md),
  },
  heroBadge: {
    alignSelf: 'center',
    backgroundColor: Theme.primary + '18',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: scaleSize(BorderRadius.full),
    marginBottom: getSpacing(Spacing.lg),
  },
  heroBadgeText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: Theme.primary,
  },
  header: {
    marginBottom: getSpacing(Spacing.xl),
  },
  title: {
    fontSize: scaleFont(30),
    fontWeight: '800',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: Theme.primary,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.sm),
  },
  description: {
    fontSize: scaleFont(15),
    color: Theme.textSecondary,
    lineHeight: scaleFont(23),
    textAlign: 'center',
    paddingHorizontal: getSpacing(Spacing.sm),
  },
  highlights: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.lg),
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.xl),
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: scaleSize(8),
    elevation: 3,
  },
  highlightItem: {
    alignItems: 'center',
    flex: 1,
  },
  highlightIcon: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: Theme.primary,
    marginBottom: scaleSize(2),
  },
  highlightLabel: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    color: Theme.textSecondary,
  },
  highlightDivider: {
    width: 1,
    height: scaleSize(28),
    backgroundColor: Theme.border,
  },
  enterButtonWrap: {
    alignSelf: 'stretch',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.primary,
    paddingVertical: getSpacing(Spacing.lg),
    paddingHorizontal: getSpacing(Spacing.xl),
    borderRadius: scaleSize(BorderRadius.lg),
    minHeight: scaleSize(56),
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: scaleSize(10),
    elevation: 6,
    gap: getSpacing(Spacing.sm),
  },
  enterButtonText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: Theme.white,
  },
  enterButtonArrow: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: Theme.white,
  },
});
