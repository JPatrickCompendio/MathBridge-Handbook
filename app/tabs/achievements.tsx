import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabsAnimatedBackground from '../../components/TabsAnimatedBackground';
import { BorderRadius, Spacing } from '../../constants/colors';
import { getTopicProgress } from '../../utils/progressStorage';
import { getCardWidth, getSpacing, isSmallDevice, isTablet, scaleFont, scaleSize, wp } from '../../utils/responsive';

const ProfessionalColors = {
  primary: '#FF6600',
  primaryDark: '#CC5200',
  white: '#FFFFFF',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  error: '#DC2626',
  success: '#61E35D',
  warning: '#F59E0B',
};

const RarityColors = {
  common: '#666666',
  rare: '#4ECDC4',
  epic: '#AB47BC',
  legendary: '#FFA726',
};

/** White–orange gradient with a soft breathing glow (achievements tab). */
function AchievementsBackground() {
  const breath = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const overlayOpacity = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.2],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#FFFFFF', '#FFF5F0', '#FFE8DC', '#FFF5F0', '#FFFFFF']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]} pointerEvents="none">
        <LinearGradient
          colors={['#FF6600', '#FF8533', '#FF6600']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

type Achievement = {
  id: string;
  title: string;
  description: string;
  type: 'badge' | 'certificate' | 'medal' | 'trophy';
  category: 'topic_mastery' | 'streak' | 'level' | 'speed' | 'consistency' | 'special';
  icon: string;
  color: string;
  earned: boolean;
  progress?: number;
  dateEarned?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string[];
  points: number;
};

type TopicProgressMap = { [topicId: number]: number };

type UnlockRule =
  | { type: 'topic_100'; topicId: number }
  | { type: 'any_topic_min'; minProgress: number }
  | { type: 'all_topics_min'; minProgress: number }
  | { type: 'topic_count_at_least'; count: number; minProgress: number }
  | { type: 'streak'; days: number };

function checkUnlock(rule: UnlockRule, progress: TopicProgressMap): { earned: boolean; progress: number } {
  const topicIds = [1, 2, 3, 4, 5];
  const values = topicIds.map((id) => progress[id] ?? 0);
  const maxP = Math.max(0, ...values);
  const minP = values.length ? Math.min(...values) : 0;
  const countAtLeast = (min: number) => values.filter((p) => p >= min).length;

  switch (rule.type) {
    case 'topic_100': {
      const p = progress[rule.topicId] ?? 0;
      return { earned: p >= 100, progress: p };
    }
    case 'any_topic_min': {
      const p = maxP;
      return { earned: p >= rule.minProgress, progress: p };
    }
    case 'all_topics_min': {
      const p = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
      return { earned: minP >= rule.minProgress, progress: p };
    }
    case 'topic_count_at_least': {
      const n = countAtLeast(rule.minProgress);
      const p = topicIds.length ? Math.round((n / topicIds.length) * 100) : 0;
      return { earned: n >= rule.count, progress: p };
    }
    case 'streak':
      return { earned: false, progress: 0 };
    default:
      return { earned: false, progress: 0 };
  }
}

type UserStats = {
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
  nextMilestone: string;
  rank: 'Beginner' | 'Explorer' | 'Scholar' | 'Master' | 'Grandmaster';
  totalPoints: number;
};

type AchievementDefinition = Omit<Achievement, 'earned' | 'progress'> & { unlockRule: UnlockRule };

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'topic_1_master',
    title: 'Quadratic Equations Master',
    description: 'Complete all Quadratic Equations content and activities (100%)',
    type: 'badge',
    category: 'topic_mastery',
    icon: '🧮',
    color: '#4ECDC4',
    earned: false,
    rarity: 'rare',
    requirements: ['Read all Quadratic Equations content', 'Complete Take Activities for this topic'],
    points: 50,
    unlockRule: { type: 'topic_100', topicId: 1 },
  },
  {
    id: 'topic_2_master',
    title: 'Triangle Triples Master',
    description: 'Complete all Triangle Triples content and activities (100%)',
    type: 'badge',
    category: 'topic_mastery',
    icon: '🎯',
    color: '#45B7D1',
    earned: false,
    rarity: 'rare',
    requirements: ['Read all Triangle Triples content', 'Complete Take Activities for this topic'],
    points: 50,
    unlockRule: { type: 'topic_100', topicId: 2 },
  },
  {
    id: 'topic_3_master',
    title: 'Triangle Measures Master',
    description: 'Complete all Triangle Measures content and activities (100%)',
    type: 'certificate',
    category: 'topic_mastery',
    icon: '△',
    color: '#9B59B6',
    earned: false,
    rarity: 'epic',
    requirements: ['Read all Triangle Measures content', 'Complete Take Activities for this topic'],
    points: 75,
    unlockRule: { type: 'topic_100', topicId: 3 },
  },
  {
    id: 'topic_4_master',
    title: 'Area of Triangles Master',
    description: 'Complete all Area of Triangles content and activities (100%)',
    type: 'certificate',
    category: 'topic_mastery',
    icon: '📐',
    color: '#4ECDC4',
    earned: false,
    rarity: 'rare',
    requirements: ['Read all Area of Triangles content', 'Complete Take Activities for this topic'],
    points: 50,
    unlockRule: { type: 'topic_100', topicId: 4 },
  },
  {
    id: 'topic_5_master',
    title: 'Variation Master',
    description: 'Complete all Variation content and activities (100%)',
    type: 'certificate',
    category: 'topic_mastery',
    icon: '📊',
    color: '#FF6600',
    earned: false,
    rarity: 'rare',
    requirements: ['Read all Variation content', 'Complete Take Activities for this topic'],
    points: 50,
    unlockRule: { type: 'topic_100', topicId: 5 },
  },
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Reach at least 25% progress on any topic',
    type: 'badge',
    category: 'special',
    icon: '🌟',
    color: '#61E35D',
    earned: false,
    rarity: 'common',
    requirements: ['Get 25% or more on any topic'],
    points: 25,
    unlockRule: { type: 'any_topic_min', minProgress: 25 },
  },
  {
    id: 'half_way',
    title: 'Half Way',
    description: 'Reach at least 50% progress on any topic',
    type: 'medal',
    category: 'special',
    icon: '📖',
    color: '#FFA726',
    earned: false,
    rarity: 'common',
    requirements: ['Get 50% or more on any topic'],
    points: 30,
    unlockRule: { type: 'any_topic_min', minProgress: 50 },
  },
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Reach at least 50% progress on 3 or more topics',
    type: 'medal',
    category: 'consistency',
    icon: '👑',
    color: '#AB47BC',
    earned: false,
    rarity: 'rare',
    requirements: ['Get 50% or more on at least 3 topics'],
    points: 60,
    unlockRule: { type: 'topic_count_at_least', count: 3, minProgress: 50 },
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Reach at least 50% progress on all 5 topics',
    type: 'trophy',
    category: 'consistency',
    icon: '📚',
    color: '#5D4E75',
    earned: false,
    rarity: 'epic',
    requirements: ['Get 50% or more on all topics'],
    points: 80,
    unlockRule: { type: 'all_topics_min', minProgress: 50 },
  },
  {
    id: 'perfect_five',
    title: 'Perfect Five',
    description: 'Complete all 5 topics to 100%',
    type: 'trophy',
    category: 'topic_mastery',
    icon: '💯',
    color: '#FFD700',
    earned: false,
    rarity: 'legendary',
    requirements: ['Reach 100% on every topic'],
    points: 150,
    unlockRule: { type: 'all_topics_min', minProgress: 100 },
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day learning streak',
    type: 'medal',
    category: 'streak',
    icon: '🔥',
    color: '#FF6B6B',
    earned: false,
    rarity: 'common',
    requirements: ['Study for 7 consecutive days (coming soon)'],
    points: 25,
    unlockRule: { type: 'streak', days: 7 },
  },
  {
    id: 'monthly_champion',
    title: 'Monthly Champion',
    description: 'Maintain a 30-day learning streak',
    type: 'trophy',
    category: 'streak',
    icon: '🏆',
    color: '#FFD700',
    earned: false,
    rarity: 'legendary',
    requirements: ['Study for 30 consecutive days (coming soon)'],
    points: 150,
    unlockRule: { type: 'streak', days: 30 },
  },
];

function buildAchievements(progress: TopicProgressMap): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const { earned, progress: prog } = checkUnlock(def.unlockRule, progress);
    const { unlockRule: _, ...rest } = def;
    return {
      ...rest,
      earned,
      progress: prog,
      dateEarned: earned ? new Date().toISOString().slice(0, 10) : undefined,
    };
  });
}

function computeUserStats(achievements: Achievement[]): UserStats {
  const unlocked = achievements.filter((a) => a.earned).length;
  const total = achievements.length;
  const totalPoints = achievements.filter((a) => a.earned).reduce((s, a) => s + a.points, 0);
  const pct = total ? Math.round((unlocked / total) * 100) : 0;
  const milestones = [3, 6, 10, 15, 20];
  const next = milestones.find((m) => unlocked < m);
  const rankIndex = [0, 3, 6, 10, 15].findIndex((m) => unlocked < m);
  const ranks: UserStats['rank'][] = ['Beginner', 'Explorer', 'Scholar', 'Master', 'Grandmaster'];
  return {
    totalAchievements: total,
    unlockedCount: unlocked,
    completionPercentage: pct,
    nextMilestone: next != null ? `${ranks[Math.min(rankIndex + 1, 4)]} (${next} achievements)` : 'Grandmaster',
    rank: ranks[rankIndex >= 0 ? rankIndex : 4],
    totalPoints,
  };
}

const DEFAULT_USER_STATS: UserStats = {
  totalAchievements: 0,
  unlockedCount: 0,
  completionPercentage: 0,
  nextMilestone: '—',
  rank: 'Beginner',
  totalPoints: 0,
};

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏆' },
  { id: 'topic_mastery', label: 'Mastery', icon: '📚' },
  { id: 'streak', label: 'Streaks', icon: '🔥' },
  { id: 'speed', label: 'Speed', icon: '⚡' },
  { id: 'consistency', label: 'Consistency', icon: '👑' },
  { id: 'special', label: 'Special', icon: '⭐' },
  { id: 'locked', label: 'Locked', icon: '🔒' },
];

const NUM_COLUMNS_FALLBACK = isTablet() ? 3 : 2;
const CARD_WIDTH_FALLBACK = getCardWidth(NUM_COLUMNS_FALLBACK, getSpacing(Spacing.lg));
const GRID_MAX_WIDTH = 1400;
const GRID_GAP = getSpacing(Spacing.md);

// Animated Header Background Component
function AnimatedHeaderBackground() {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(0.2)).current,
    scale: useRef(new Animated.Value(0.5)).current,
    rotate: useRef(new Animated.Value(0)).current,
    delay: i * 600,
  }));

  useEffect(() => {
    particles.forEach((particle) => {
      const translateXAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateX, {
            toValue: 1,
            duration: 5000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: 0,
            duration: 5000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const translateYAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateY, {
            toValue: 1,
            duration: 6000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: 0,
            duration: 6000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const opacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.5,
            duration: 3000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.2,
            duration: 3000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const scaleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 4000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 0.5,
            duration: 4000 + particle.delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const rotateAnim = Animated.loop(
        Animated.timing(particle.rotate, {
          toValue: 1,
          duration: 10000 + particle.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );

      Animated.parallel([translateXAnim, translateYAnim, opacityAnim, scaleAnim, rotateAnim]).start();
    });
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {particles.map((particle, index) => {
        const translateX = particle.translateX.interpolate({
          inputRange: [0, 1],
          outputRange: [-40, 40],
        });

        const translateY = particle.translateY.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, 30],
        });

        const rotate = particle.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        const size = (index % 3 === 0 ? 10 : index % 3 === 1 ? 14 : 8) * scaleSize(1);
        const positions = [
          { left: '15%', top: '25%' },
          { left: '85%', top: '20%' },
          { left: '25%', top: '65%' },
          { left: '80%', top: '75%' },
          { left: '10%', top: '85%' },
          { left: '90%', top: '55%' },
        ];

        return (
          <Animated.View
            key={index}
            style={[
              {
                position: 'absolute' as const,
                ...positions[index],
                width: size,
                height: size,
                backgroundColor: ProfessionalColors.primary,
                borderRadius: size / 2,
              } as any,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: particle.scale },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

// Animated Category Tab Component
function AnimatedCategoryTab({
  category,
  isActive,
  onPress,
  index,
}: {
  category: typeof CATEGORIES[0];
  isActive: boolean;
  onPress: () => void;
  index: number;
}) {
  const tabScale = useRef(new Animated.Value(0)).current;
  const tabOpacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(tabScale, {
        toValue: 1,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(tabOpacity, {
        toValue: 1,
        delay: index * 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const combinedScale = Animated.multiply(tabScale, pressScale);

  return (
    <Animated.View
      style={{
        opacity: tabOpacity,
        transform: [{ scale: combinedScale }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.categoryTab,
          isActive && styles.categoryTabActive,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.categoryTabIcon}>{category.icon}</Text>
        <Text
          style={[
            styles.categoryTabText,
            isActive && styles.categoryTabTextActive,
          ]}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Achievement Card Component (separate component to use hooks properly)
function AchievementCard({
  item,
  index,
  onPress,
  cardWidth,
}: {
  item: Achievement;
  index: number;
  onPress: (item: Achievement) => void;
  cardWidth?: number;
}) {
  const rarityColor = RarityColors[item.rarity];
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardSlideY = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideY, {
        toValue: 0,
        duration: 500,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        delay: index * 60 + 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous animations for earned achievements
    if (item.earned) {
      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Shining animation - sweeps across the card
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Icon rotation animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconRotate, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(iconRotate, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Progress bar animation
    if (item.progress !== undefined && !item.earned) {
      Animated.timing(progressWidth, {
        toValue: item.progress,
        duration: 1000,
        delay: index * 60 + 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [index, item.earned, item.progress]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const shineTranslateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const shineOpacity = shineAnim.interpolate({
    inputRange: [0, 0.3, 0.5, 0.7, 1],
    outputRange: [0, 0.8, 1, 0.8, 0],
  });

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Animated.View
      style={[
        {
          opacity: cardOpacity,
          transform: [
            { scale: Animated.multiply(cardScale, pressScale) },
            { translateY: cardSlideY },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.achievementCard,
          cardWidth != null && { width: cardWidth },
          {
            borderColor: item.earned ? rarityColor : ProfessionalColors.border,
            borderWidth: item.earned ? 2 : 1,
            opacity: item.earned ? 1 : 0.7,
          },
        ]}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Rarity Glow Effect - Animated */}
        {item.earned && (
          <Animated.View
            style={[
              styles.rarityGlow,
              {
                backgroundColor: rarityColor,
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Shining Effect - Animated */}
        {item.earned && (
          <Animated.View
            style={[
              styles.shineEffect,
              {
                transform: [{ translateX: shineTranslateX }, { rotate: '45deg' }],
                opacity: shineOpacity,
              },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        )}

        {/* Icon Container - Animated */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.earned ? `${item.color}20` : ProfessionalColors.background,
              transform: [
                { scale: iconScale },
                { rotate: item.earned ? rotate : '0deg' },
              ],
            },
          ]}
        >
          <Text style={styles.achievementIcon}>{item.icon}</Text>
          {item.earned && (
            <Animated.View
              style={[
                styles.earnedBadge,
                {
                  transform: [{ scale: iconScale }],
                },
              ]}
            >
              <Text style={styles.earnedBadgeText}>✓</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Achievement Info */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderContent}>
            <Text style={styles.achievementTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.achievementDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          {/* Progress Bar - Animated */}
          <View style={styles.progressBarContainer}>
            {!item.earned && item.progress !== undefined ? (
              <>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressWidth.interpolate({
                          inputRange: [0, 100],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: rarityColor,
                      },
                    ]}
                  />
                </View>
                <Animated.Text
                  style={[
                    styles.progressText,
                    {
                      opacity: progressWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 1],
                      }),
                    },
                  ]}
                >
                  {Math.round(item.progress ?? 0)}%
                </Animated.Text>
              </>
            ) : null}
          </View>

          {/* Points and Rarity */}
          <View style={styles.cardFooter}>
            <View
              style={[
                styles.rarityBadge,
                {
                  backgroundColor: `${rarityColor}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.rarityText,
                  {
                    color: rarityColor,
                  },
                ]}
              >
                {item.rarity.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.pointsText}>+{item.points} pts</Text>
          </View>
        </View>

        {/* Locked Overlay */}
        {!item.earned && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockedIcon}>🔒</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AchievementsScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const [achievements, setAchievements] = useState<Achievement[]>(() => buildAchievements({}));
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      getTopicProgress().then((saved) => {
        const progress: TopicProgressMap = (saved && typeof saved === 'object' ? saved : {}) as TopicProgressMap;
        const next = buildAchievements(progress);
        setAchievements(next);
        setUserStats(computeUserStats(next));
      });
    }, [])
  );

  const horizontalPadding = getSpacing(Spacing.lg);
  const contentWidth = Math.min(
    Math.max(windowWidth - 2 * horizontalPadding, 320),
    GRID_MAX_WIDTH
  );
  const numColumns = contentWidth >= 900 ? 4 : contentWidth >= 600 ? 3 : 2;
  const cardWidth = (contentWidth - (numColumns + 1) * GRID_GAP) / numColumns;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rankScale = useRef(new Animated.Value(1)).current;
  const pointsScale = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
        easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: userStats.completionPercentage,
        duration: 1200,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(rankScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(pointsScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: userStats.completionPercentage,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [userStats.completionPercentage]);

  // Modal animations
  useEffect(() => {
    if (modalVisible) {
      modalScale.setValue(0.8);
      modalOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const getFilteredAchievements = () => {
    let filtered = achievements;

    // Filter by category only
    if (selectedCategory === 'locked') {
      filtered = filtered.filter((a) => !a.earned);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    return filtered;
  };

  const filteredAchievements = getFilteredAchievements();

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedAchievement(null);
    });
  };

  const renderHeader = () => (
    <Animated.View 
      style={{ 
        width: '100%',
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Header Stats Section with Gradient */}
      <View style={styles.headerStats}>
        <LinearGradient
          colors={[ProfessionalColors.primary + '20', ProfessionalColors.primary + '10', ProfessionalColors.white, ProfessionalColors.white]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Animated background particles */}
        <AnimatedHeaderBackground />
        <View style={styles.headerStatsContent}>
        <View style={styles.statsRow}>
          {/* Rank Badge - Animated */}
          <Animated.View 
            style={[
              styles.rankBadge,
              {
                transform: [{ scale: rankScale }],
              },
            ]}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rankScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-10deg', '0deg'],
                    }),
                  },
                ],
              }}
            >
            <Text style={styles.rankIcon}>🏅</Text>
            </Animated.View>
            <Text style={styles.rankText}>{userStats.rank}</Text>
          </Animated.View>

          {/* Progress Circle - Animated */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleWrapper}>
              <Animated.View
                style={[
                  styles.progressCircle,
                  {
                    borderColor: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: [ProfessionalColors.border, ProfessionalColors.primary],
                    }),
                  },
                ]}
              >
                <View style={styles.progressCircleInner}>
                  <Text style={styles.progressPercentage}>
                    {Math.round(userStats.completionPercentage)}%
                  </Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </Animated.View>
              {/* Progress Ring Background */}
              <View style={styles.progressRingBackground} />
            </View>
          </View>

          {/* Points - Animated */}
          <Animated.View 
            style={[
              styles.pointsContainer,
              {
                transform: [{ scale: pointsScale }],
              },
            ]}
          >
            <Animated.Text 
              style={[
                styles.pointsValue,
                {
                  opacity: pointsScale,
                },
              ]}
            >
              {userStats.totalPoints}
            </Animated.Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </Animated.View>
        </View>

        {/* Achievement Count and Next Milestone */}
        <View style={styles.statsFooter}>
          <View style={styles.achievementCount}>
            <Text style={styles.countText}>
              {userStats.unlockedCount}/{userStats.totalAchievements} Unlocked
            </Text>
          </View>
          <View style={styles.milestoneContainer}>
            <Text style={styles.milestoneLabel}>Next:</Text>
            <Text style={styles.milestoneText}>{userStats.nextMilestone}</Text>
          </View>
          </View>
        </View>
      </View>

      {/* Category Filter Tabs - Animated */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {CATEGORIES.map((category, index) => (
          <AnimatedCategoryTab
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <AchievementsBackground />
      <TabsAnimatedBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <FlatList
        data={filteredAchievements}
        renderItem={({ item, index }) => (
          <AchievementCard
            item={item}
            index={index}
            onPress={handleAchievementPress}
            cardWidth={cardWidth}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[
          styles.achievementGrid,
          {
            width: contentWidth,
            maxWidth: contentWidth,
            alignSelf: 'center',
            paddingHorizontal: GRID_GAP,
          },
        ]}
        columnWrapperStyle={[
          styles.achievementRow,
          { paddingHorizontal: 0, gap: GRID_GAP },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No achievements found</Text>
          </View>
        }
      />

      {/* Achievement Detail Modal - Animated */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            {
              opacity: modalOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              },
            ]}
          >
            {selectedAchievement && (
              <AnimatedModalContent 
                achievement={selectedAchievement}
                onClose={handleCloseModal}
              />
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
    </View>
  );
}

// Animated Modal Content Component
function AnimatedModalContent({ 
  achievement,
  onClose,
}: { 
  achievement: Achievement;
  onClose: () => void;
}) {
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const rarityColor = RarityColors[achievement.rarity];

  useEffect(() => {
    // Reset values - start icon visible immediately
    iconScale.setValue(1); // Start at 1 so icon is visible
    iconRotate.setValue(0);
    contentFade.setValue(0);
    progressWidth.setValue(0);

    // Start animations immediately
    // Icon animation with bounce effect
    Animated.parallel([
      Animated.sequence([
        Animated.spring(iconScale, {
          toValue: 1.2,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 500,
        delay: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous icon rotation for earned achievements
    if (achievement.earned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconRotate, {
            toValue: 2,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(iconRotate, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Progress bar animation
    if (achievement.progress !== undefined && !achievement.earned) {
      Animated.timing(progressWidth, {
        toValue: achievement.progress,
        duration: 1000,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [achievement]);

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '360deg', '360deg'],
  });

  return (
    <View style={{ width: '100%' }}>
      <Animated.View
        style={[
          styles.modalIconContainer,
          {
            backgroundColor: `${achievement.color}20`,
            transform: [
              { scale: iconScale },
              { rotate: achievement.earned ? rotate : '0deg' },
            ],
          },
        ]}
      >
        <Text style={styles.modalIcon}>{achievement.icon}</Text>
      </Animated.View>

      <View style={{ width: '100%', opacity: 1 }}>
        <Text style={styles.modalTitle}>{achievement.title}</Text>
        <Text style={styles.modalDescription}>{achievement.description}</Text>

        {/* Rarity and Points */}
        <View style={styles.modalBadges}>
          <View
            style={[
              styles.modalRarityBadge,
              {
                backgroundColor: `${rarityColor}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.modalRarityText,
                {
                  color: rarityColor,
                },
              ]}
            >
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
          <View style={styles.modalPointsBadge}>
            <Text style={styles.modalPointsText}>
              +{achievement.points} Points
            </Text>
          </View>
        </View>

        {/* Progress */}
        {!achievement.earned && achievement.progress !== undefined && (
          <View style={styles.modalProgress}>
            <Text style={styles.modalProgressLabel}>Progress</Text>
            <View style={styles.modalProgressBar}>
              <Animated.View
                style={[
                  styles.modalProgressFill,
                  {
                    width: progressWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: rarityColor,
                  },
                ]}
              />
            </View>
            <Animated.Text
              style={[
                styles.modalProgressText,
                {
                  opacity: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              {Math.round(achievement.progress ?? 0)}%
            </Animated.Text>
          </View>
        )}

        {/* Date Earned */}
        {achievement.earned && achievement.dateEarned && (
          <View style={styles.modalDateContainer}>
            <Text style={styles.modalDateLabel}>Earned on:</Text>
            <Text style={styles.modalDate}>
              {new Date(achievement.dateEarned).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Requirements */}
        <View style={styles.modalRequirements}>
          <Text style={styles.modalRequirementsTitle}>Requirements:</Text>
          {achievement.requirements.map((req, index) => (
            <View key={index} style={styles.modalRequirementItem}>
              <Text style={styles.modalRequirementBullet}>•</Text>
              <Text style={styles.modalRequirementText}>{req}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.modalActions}>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Compute responsive values before StyleSheet
const responsiveValues = {
  paddingH: isTablet() ? wp(5) : wp(4),
  rankIconFont: isTablet() ? 40 : isSmallDevice() ? 28 : 32,
  rankTextFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  progressCircleWrapperSize: isTablet() ? 100 : isSmallDevice() ? 70 : 80,
  progressCircleSize: isTablet() ? 85 : isSmallDevice() ? 60 : 70,
  progressCircleRadius: isTablet() ? 42.5 : isSmallDevice() ? 30 : 35,
  progressRingSize: isTablet() ? 100 : isSmallDevice() ? 70 : 80,
  progressRingRadius: isTablet() ? 50 : isSmallDevice() ? 35 : 40,
  progressPercentageFont: isTablet() ? 22 : isSmallDevice() ? 14 : 18,
  progressLabelFont: isTablet() ? 12 : isSmallDevice() ? 8 : 10,
  pointsValueFont: isTablet() ? 30 : isSmallDevice() ? 20 : 24,
  pointsLabelFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  countTextFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  milestoneLabelFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  milestoneTextFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  searchInputFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  searchIconFont: isTablet() ? 20 : isSmallDevice() ? 16 : 18,
  categoryTabIconFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  categoryTabTextFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  cardHeight: isTablet() ? 268 : isSmallDevice() ? 200 : 228,
  iconContainerSize: isTablet() ? 82 : isSmallDevice() ? 56 : 68,
  iconContainerRadius: isTablet() ? 41 : isSmallDevice() ? 28 : 34,
  achievementIconFont: isTablet() ? 44 : isSmallDevice() ? 30 : 36,
  earnedBadgeSize: isTablet() ? 26 : isSmallDevice() ? 20 : 22,
  earnedBadgeRadius: isTablet() ? 13 : isSmallDevice() ? 10 : 11,
  earnedBadgeTextFont: isTablet() ? 13 : isSmallDevice() ? 9 : 11,
  achievementTitleFont: isTablet() ? 17 : isSmallDevice() ? 13 : 15,
  achievementTitleMinHeight: isTablet() ? 48 : isSmallDevice() ? 36 : 40,
  achievementDescFont: isTablet() ? 14 : isSmallDevice() ? 11 : 12,
  achievementDescMinHeight: isTablet() ? 42 : isSmallDevice() ? 32 : 36,
  progressBarHeight: isTablet() ? 6 : isSmallDevice() ? 4 : 5,
  progressTextFont: isTablet() ? 13 : isSmallDevice() ? 9 : 11,
  rarityTextFont: isTablet() ? 11 : isSmallDevice() ? 8 : 9,
  pointsTextFont: isTablet() ? 13 : isSmallDevice() ? 9 : 11,
  lockedIconFont: isTablet() ? 32 : isSmallDevice() ? 22 : 26,
  emptyIconFont: isTablet() ? 60 : isSmallDevice() ? 40 : 48,
  emptyTextFont: isTablet() ? 20 : isSmallDevice() ? 14 : 16,
  modalMaxWidth: isTablet() ? 500 : 400,
  modalIconContainerSize: isTablet() ? 100 : isSmallDevice() ? 70 : 80,
  modalIconContainerRadius: isTablet() ? 50 : isSmallDevice() ? 35 : 40,
  modalIconFont: isTablet() ? 60 : isSmallDevice() ? 40 : 48,
  modalTitleFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  modalDescFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  modalRarityTextFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  modalPointsTextFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  modalProgressLabelFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  modalProgressBarHeight: isTablet() ? 10 : isSmallDevice() ? 6 : 8,
  modalProgressTextFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  modalDateLabelFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  modalDateFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  modalRequirementsTitleFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  modalRequirementBulletFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  modalRequirementTextFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  modalButtonTextFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  cardMaxWidth: isTablet() ? 1200 : undefined,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.white,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  // Header Stats
  headerStats: {
    backgroundColor: ProfessionalColors.white,
    marginBottom: getSpacing(Spacing.md),
    marginTop: getSpacing(Spacing.md),
    marginHorizontal: responsiveValues.paddingH,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 8,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
    borderRadius: scaleSize(BorderRadius.lg),
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    overflow: 'hidden',
  },
  headerStatsContent: {
    padding: getSpacing(Spacing.lg),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.md),
    gap: getSpacing(Spacing.md),
  },
  rankBadge: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  rankIcon: {
    fontSize: scaleFont(responsiveValues.rankIconFont),
    marginBottom: getSpacing(Spacing.xs),
  },
  rankText: {
    fontSize: scaleFont(responsiveValues.rankTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  progressCircleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  progressCircleWrapper: {
    width: scaleSize(responsiveValues.progressCircleWrapperSize),
    height: scaleSize(responsiveValues.progressCircleWrapperSize),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  progressCircle: {
    width: scaleSize(responsiveValues.progressCircleSize),
    height: scaleSize(responsiveValues.progressCircleSize),
    borderRadius: scaleSize(responsiveValues.progressCircleRadius),
    backgroundColor: ProfessionalColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scaleSize(4),
    borderColor: ProfessionalColors.primary,
    zIndex: 2,
  },
  progressRingBackground: {
    position: 'absolute',
    width: scaleSize(responsiveValues.progressRingSize),
    height: scaleSize(responsiveValues.progressRingSize),
    borderRadius: scaleSize(responsiveValues.progressRingRadius),
    borderWidth: scaleSize(6),
    borderColor: ProfessionalColors.border,
    zIndex: 1,
  },
  progressCircleInner: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: scaleFont(responsiveValues.progressPercentageFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
  },
  progressLabel: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: ProfessionalColors.textSecondary,
  },
  pointsContainer: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  pointsValue: {
    fontSize: scaleFont(responsiveValues.pointsValueFont),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  pointsLabel: {
    fontSize: scaleFont(responsiveValues.pointsLabelFont),
    color: ProfessionalColors.textSecondary,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: getSpacing(Spacing.md),
    borderTopWidth: 1,
    borderTopColor: ProfessionalColors.border,
    gap: getSpacing(Spacing.md),
  },
  achievementCount: {
    flex: 1,
    minWidth: 0,
  },
  countText: {
    fontSize: scaleFont(responsiveValues.countTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    flexShrink: 0,
    gap: getSpacing(Spacing.xs),
  },
  milestoneLabel: {
    fontSize: scaleFont(responsiveValues.milestoneLabelFont),
    color: ProfessionalColors.textSecondary,
  },
  milestoneText: {
    fontSize: scaleFont(responsiveValues.milestoneTextFont),
    fontWeight: '600',
    color: ProfessionalColors.primary,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.md),
    paddingHorizontal: getSpacing(Spacing.md),
    marginHorizontal: responsiveValues.paddingH,
    marginBottom: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(1) },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
    marginTop: getSpacing(Spacing.sm),
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    paddingVertical: getSpacing(Spacing.sm),
    fontSize: scaleFont(responsiveValues.searchInputFont),
    color: ProfessionalColors.text,
  },
  searchIcon: {
    fontSize: scaleFont(responsiveValues.searchIconFont),
    color: ProfessionalColors.textSecondary,
  },
  // Category Tabs
  categoryTabs: {
    maxHeight: isTablet() ? 70 : isSmallDevice() ? 50 : 60,
    marginBottom: getSpacing(Spacing.md),
  },
  categoryTabsContent: {
    paddingHorizontal: responsiveValues.paddingH,
    gap: getSpacing(Spacing.sm),
    paddingVertical: getSpacing(Spacing.xs),
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderRadius: BorderRadius.full,
    backgroundColor: ProfessionalColors.white,
    marginRight: getSpacing(Spacing.sm),
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(1) },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(2),
    elevation: 2,
  },
  categoryTabActive: {
    backgroundColor: ProfessionalColors.primary,
    borderColor: ProfessionalColors.primary,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(4),
    elevation: 4,
  },
  categoryTabIcon: {
    fontSize: scaleFont(responsiveValues.categoryTabIconFont),
    marginRight: getSpacing(Spacing.xs),
  },
  categoryTabText: {
    fontSize: scaleFont(responsiveValues.categoryTabTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  categoryTabTextActive: {
    color: ProfessionalColors.white,
  },
  // Achievement Grid
  achievementGrid: {
    padding: getSpacing(Spacing.lg),
    paddingTop: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.xxl) + 80,
    paddingHorizontal: responsiveValues.paddingH,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: getSpacing(Spacing.lg),
  },
  achievementCard: {
    width: CARD_WIDTH_FALLBACK,
    height: scaleSize(responsiveValues.cardHeight),
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.xl),
    padding: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.sm),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.14,
    shadowRadius: scaleSize(14),
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    borderLeftWidth: scaleSize(4),
    borderLeftColor: ProfessionalColors.primary,
  },
  rarityGlow: {
    position: 'absolute',
    top: scaleSize(-30),
    right: scaleSize(-30),
    width: scaleSize(100),
    height: scaleSize(100),
    borderRadius: scaleSize(50),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: scaleSize(20),
    elevation: 10,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '150%',
    height: '200%',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  iconContainer: {
    width: scaleSize(responsiveValues.iconContainerSize),
    height: scaleSize(responsiveValues.iconContainerSize),
    borderRadius: scaleSize(responsiveValues.iconContainerRadius),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: getSpacing(Spacing.xs),
    position: 'relative',
  },
  achievementIcon: {
    fontSize: scaleFont(responsiveValues.achievementIconFont),
  },
  earnedBadge: {
    position: 'absolute',
    top: scaleSize(-4),
    right: scaleSize(-4),
    width: scaleSize(responsiveValues.earnedBadgeSize),
    height: scaleSize(responsiveValues.earnedBadgeSize),
    borderRadius: scaleSize(responsiveValues.earnedBadgeRadius),
    backgroundColor: ProfessionalColors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scaleSize(2),
    borderColor: ProfessionalColors.white,
  },
  earnedBadgeText: {
    fontSize: scaleFont(responsiveValues.earnedBadgeTextFont),
    color: ProfessionalColors.white,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 0,
  },
  cardHeaderContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  achievementTitle: {
    fontSize: scaleFont(responsiveValues.achievementTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
    textAlign: 'center',
    minHeight: scaleSize(responsiveValues.achievementTitleMinHeight),
  },
  achievementDescription: {
    fontSize: scaleFont(responsiveValues.achievementDescFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.sm),
    lineHeight: scaleSize(19),
    minHeight: scaleSize(responsiveValues.achievementDescMinHeight),
  },
  progressBarContainer: {
    minHeight: scaleSize(24),
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: scaleSize(responsiveValues.progressBarHeight),
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: getSpacing(Spacing.xs),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: scaleFont(responsiveValues.progressTextFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: getSpacing(Spacing.xs),
  },
  rarityBadge: {
    paddingHorizontal: getSpacing(Spacing.xs),
    paddingVertical: scaleSize(2),
    borderRadius: scaleSize(BorderRadius.sm),
  },
  rarityText: {
    fontSize: scaleFont(responsiveValues.rarityTextFont),
    fontWeight: '700',
  },
  pointsText: {
    fontSize: scaleFont(responsiveValues.pointsTextFont),
    fontWeight: '600',
    color: ProfessionalColors.primary,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaleSize(BorderRadius.lg),
  },
  lockedIcon: {
    fontSize: scaleFont(responsiveValues.lockedIconFont),
    opacity: 0.5,
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(Spacing.xxl),
  },
  emptyIcon: {
    fontSize: scaleFont(responsiveValues.emptyIconFont),
    marginBottom: getSpacing(Spacing.md),
  },
  emptyText: {
    fontSize: scaleFont(responsiveValues.emptyTextFont),
    color: ProfessionalColors.textSecondary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.lg),
  },
  modalContent: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.xl),
    padding: getSpacing(Spacing.xl),
    width: '100%',
    maxWidth: scaleSize(responsiveValues.modalMaxWidth),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(10) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(20),
    elevation: 20,
    borderWidth: 2,
    borderColor: ProfessionalColors.primary + '30',
  },
  modalIconContainer: {
    width: scaleSize(responsiveValues.modalIconContainerSize),
    height: scaleSize(responsiveValues.modalIconContainerSize),
    borderRadius: scaleSize(responsiveValues.modalIconContainerRadius),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.md),
  },
  modalIcon: {
    fontSize: scaleFont(responsiveValues.modalIconFont),
  },
  modalTitle: {
    fontSize: scaleFont(responsiveValues.modalTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: scaleFont(responsiveValues.modalDescFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.lg),
    lineHeight: scaleSize(20),
  },
  modalBadges: {
    flexDirection: 'row',
    gap: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.lg),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalRarityBadge: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: BorderRadius.full,
  },
  modalRarityText: {
    fontSize: scaleFont(responsiveValues.modalRarityTextFont),
    fontWeight: '700',
  },
  modalPointsBadge: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: BorderRadius.full,
    backgroundColor: `${ProfessionalColors.primary}20`,
  },
  modalPointsText: {
    fontSize: scaleFont(responsiveValues.modalPointsTextFont),
    fontWeight: '700',
    color: ProfessionalColors.primary,
  },
  modalProgress: {
    width: '100%',
    marginBottom: getSpacing(Spacing.lg),
  },
  modalProgressLabel: {
    fontSize: scaleFont(responsiveValues.modalProgressLabelFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  modalProgressBar: {
    height: scaleSize(responsiveValues.modalProgressBarHeight),
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: getSpacing(Spacing.xs),
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  modalProgressText: {
    fontSize: scaleFont(responsiveValues.modalProgressTextFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'right',
  },
  modalDateContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.lg),
    padding: getSpacing(Spacing.md),
    backgroundColor: ProfessionalColors.background,
    borderRadius: scaleSize(BorderRadius.md),
  },
  modalDateLabel: {
    fontSize: scaleFont(responsiveValues.modalDateLabelFont),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.xs),
  },
  modalDate: {
    fontSize: scaleFont(responsiveValues.modalDateFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  modalRequirements: {
    width: '100%',
    marginBottom: getSpacing(Spacing.lg),
  },
  modalRequirementsTitle: {
    fontSize: scaleFont(responsiveValues.modalRequirementsTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  modalRequirementItem: {
    flexDirection: 'row',
    marginBottom: getSpacing(Spacing.xs),
    alignItems: 'flex-start',
  },
  modalRequirementBullet: {
    fontSize: scaleFont(responsiveValues.modalRequirementBulletFont),
    color: ProfessionalColors.primary,
    marginRight: getSpacing(Spacing.sm),
    marginTop: scaleSize(2),
  },
  modalRequirementText: {
    flex: 1,
    fontSize: scaleFont(responsiveValues.modalRequirementTextFont),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleSize(20),
  },
  modalActions: {
    flexDirection: 'row',
    gap: getSpacing(Spacing.md),
    width: '100%',
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  modalCloseButtonText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
});

