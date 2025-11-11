import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/colors';
import { getTopicProgress } from '../../utils/progressStorage';

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
  gradientStart: '#FF6600',
  gradientEnd: '#FF8C42',
};

// Example data
const EXAMPLE_USER = {
  name: 'John Doe',
  averageProgress: 67,
  streak: 5,
  level: 12,
};

const EXAMPLE_TOPICS = [
  { id: 1, name: 'Geometry', progress: 67, icon: '📐', subtitle: 'Shapes & Angles' },
  { id: 2, name: 'Algebra', progress: 45, icon: '🧮', subtitle: 'Equations & Functions' },
  { id: 3, name: 'Statistics', progress: 80, icon: '📊', subtitle: 'Data Analysis' },
  { id: 4, name: 'Trigonometry', progress: 55, icon: '📏', subtitle: 'Triangles & Waves' },
  { id: 5, name: 'Calculus', progress: 30, icon: '⚖️', subtitle: 'Rates & Changes' },
  { id: 6, name: 'Probability', progress: 25, icon: '🎯', subtitle: 'Chance & Predictions' },
];

// Predefined colors for topics with better contrast
const TOPIC_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA726', '#AB47BC'
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState(EXAMPLE_TOPICS);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: EXAMPLE_USER.averageProgress,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  // Load progress when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const savedProgress = await getTopicProgress();
          if (savedProgress && typeof savedProgress === 'object') {
            setTopics((prevTopics) =>
              prevTopics.map((topic) => ({
                ...topic,
                progress: savedProgress[topic.id] || topic.progress,
              }))
            );
          }
        } catch (error) {
          console.log('Error loading progress:', error);
        }
      };
      loadProgress();
    }, [])
  );

  const handleTopicPress = (topicId: number) => {
    // Navigate to topic detail page
    router.push(`/topic/${topicId}` as any);
  };

  // Filter topics based on search query
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return 'Excellent! 🎉';
    if (progress >= 70) return 'Great job! 💪';
    if (progress >= 50) return 'Good progress! 📚';
    if (progress >= 30) return 'Keep going! 🔥';
    return 'Start learning! 🌟';
  };

  const AnimatedProgressBar = ({ progress, style }: { progress: number; style?: any }) => {
    const progressWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(progressWidth, {
        toValue: progress,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, [progress, progressWidth]);

    return (
      <View style={[styles.topicProgressBarBackground, style]}>
        <Animated.View
          style={[
            styles.topicProgressBarFill,
            {
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Profile Header with Animations */}
        <Animated.View 
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Row: Avatar, Name, and Stats */}
          <View style={styles.profileTopRow}>
            <View style={styles.avatarContainer}>
              <Animated.View 
                style={[
                  styles.avatar,
                  {
                    transform: [{
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    }],
                  },
                ]}
              >
                <Text style={styles.avatarText}>
                  {EXAMPLE_USER.name.charAt(0).toUpperCase()}
                </Text>
              </Animated.View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lvl {EXAMPLE_USER.level}</Text>
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{EXAMPLE_USER.name}</Text>
              <View style={styles.streakContainer}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText}>{EXAMPLE_USER.streak} day streak</Text>
              </View>
            </View>

            <View style={styles.progressCircle}>
              <Animated.Text style={styles.progressPercentage}>
                {progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                })}
              </Animated.Text>
              <Text style={styles.progressLabel}>Overall</Text>
            </View>
          </View>

          {/* Progress Section with Animated Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Learning Progress</Text>
              <Text style={styles.progressSubtitle}>
                {getProgressLabel(EXAMPLE_USER.averageProgress)}
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressMin}>0%</Text>
                <Text style={styles.progressMax}>100%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <View style={styles.progressMarker}>
                <Text style={styles.progressMarkerText}>
                  {EXAMPLE_USER.averageProgress}% Complete
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Animated Search Bar */}
        <Animated.View 
          style={[
            styles.searchSection,
            {
              opacity: fadeAnim,
              transform: [{
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.searchBarContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search topics..."
              placeholderTextColor={ProfessionalColors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Animated Section Header */}
        <Animated.View 
          style={[
            styles.sectionHeader,
            {
              opacity: fadeAnim,
              transform: [{
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredTopics.length} topics available
          </Text>
        </Animated.View>

        {/* Animated Topics List */}
        <View style={styles.topicsList}>
          {filteredTopics.map((topic, index) => {
            const clampedProgress = Math.max(0, Math.min(100, topic.progress));
            
            return (
              <Animated.View
                key={topic.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.topicCard,
                    { 
                      backgroundColor: TOPIC_COLORS[index % TOPIC_COLORS.length],
                      borderLeftWidth: 6,
                      borderLeftColor: ProfessionalColors.white,
                      shadowColor: TOPIC_COLORS[index % TOPIC_COLORS.length],
                    },
                  ]}
                  onPress={() => handleTopicPress(topic.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.topicHeader}>
                    <View style={styles.topicIconContainer}>
                      <Text style={styles.topicIcon}>{topic.icon}</Text>
                    </View>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicName}>{topic.name}</Text>
                      <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
                    </View>
                    <View style={styles.topicPercentage}>
                      <Text style={styles.percentageText}>{Math.round(clampedProgress)}%</Text>
                    </View>
                  </View>

                  {/* Animated Progress Bar */}
                  <View style={styles.topicProgressContainer}>
                    <View style={styles.progressLabels}>
                      <Text style={styles.topicProgressLabel}>Progress</Text>
                      <Text style={styles.topicProgressValue}>{Math.round(clampedProgress)}%</Text>
                    </View>
                    <AnimatedProgressBar 
                      progress={clampedProgress} 
                      style={styles.topicProgressBarBackground}
                    />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Animated Quick Stats */}
        <Animated.View 
          style={[
            styles.quickStats,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{topics.length}</Text>
            <Text style={styles.statLabel}>Total Topics</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {topics.filter(t => t.progress >= 100).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(EXAMPLE_USER.averageProgress)}%
            </Text>
            <Text style={styles.statLabel}>Avg. Progress</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: Spacing.xl,
  },
  // Enhanced Profile Header
  profileHeader: {
    backgroundColor: ProfessionalColors.white,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ProfessionalColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: ProfessionalColors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  streakIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    color: ProfessionalColors.text,
    fontWeight: '600',
  },
  progressCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    padding: Spacing.md,
    borderRadius: 20,
    minWidth: 70,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
  },
  progressLabel: {
    fontSize: 10,
    color: ProfessionalColors.textSecondary,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: Spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ProfessionalColors.text,
  },
  progressSubtitle: {
    fontSize: 14,
    color: ProfessionalColors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: Spacing.sm,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  progressMin: {
    fontSize: 12,
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  progressMax: {
    fontSize: 12,
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.primary,
    borderRadius: BorderRadius.full,
  },
  progressMarker: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  progressMarkerText: {
    fontSize: 12,
    color: ProfessionalColors.primary,
    fontWeight: '700',
  },
  // Search Section
  searchSection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  searchIcon: {
    fontSize: 18,
    color: ProfessionalColors.textSecondary,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: ProfessionalColors.text,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: 18,
    color: ProfessionalColors.textSecondary,
    fontWeight: 'bold',
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  // Topics List
  topicsList: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  topicCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  topicIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topicIcon: {
    fontSize: 22,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topicSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  topicPercentage: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  topicProgressContainer: {
    marginTop: Spacing.sm,
  },
  topicProgressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  topicProgressValue: {
    fontSize: 12,
    color: ProfessionalColors.white,
    fontWeight: '700',
  },
  topicProgressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  topicProgressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.full,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: ProfessionalColors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: ProfessionalColors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});