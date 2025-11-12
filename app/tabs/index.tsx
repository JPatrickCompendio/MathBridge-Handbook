import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
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
import { getSafeAreaTopPadding, getSpacing, isSmallDevice, isTablet, scaleFont, scaleSize, wp } from '../../utils/responsive';

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
  name: 'John Patrick',
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

// Helper function to get image path based on topic name
const getTopicImage = (topicName: string): any => {
  const imageMap: { [key: string]: any } = {
    'Geometry': require('../../assets/images/geometry.png'),
    'Algebra': require('../../assets/images/algebra.png'),
    'Statistics': require('../../assets/images/statistics.png'),
    'Trigonometry': require('../../assets/images/trigonometry.png'),
    'Calculus': require('../../assets/images/calculus.png'),
    'Probability': require('../../assets/images/probality.png'), // Note: filename has typo
  };
  return imageMap[topicName] || require('../../assets/images/geometry.png'); // fallback
};

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
      <View style={style ? [styles.topicProgressBarBackground, style] : styles.topicProgressBarBackground}>
        <Animated.View
          style={[
            styles.topicProgressBarFill as any,
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
            styles.profileHeader as any,
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
                  styles.avatar as any,
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
                    styles.progressBarFill as any,
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
            styles.searchSection as any,
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
            styles.sectionHeader as any,
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
                  onPress={() => handleTopicPress(topic.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.topicCardTouchable,
                    { 
                      shadowColor: TOPIC_COLORS[index % TOPIC_COLORS.length],
                    },
                  ]}
                >
                  {/* Orange left border strip */}
                  <View style={styles.topicCardBorder} />
                  
                  <ImageBackground
                    source={getTopicImage(topic.name)}
                    style={styles.topicCard}
                    imageStyle={styles.topicCardImage}
                    resizeMode="cover"
                  >
                    {/* Overlay for better text readability */}
                    <View style={styles.topicCardOverlay} />
                    
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
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Animated Quick Stats */}
        <Animated.View 
          style={[
            styles.quickStats as any,
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

// Compute responsive values before StyleSheet
const cardWidthValue = isTablet() ? '90%' : '100%';
const topicCardWidthValue = isTablet() ? '95%' : '100%';

const responsiveValues = {
  paddingH: isTablet() ? wp(5) : wp(4),
  cardMaxWidth: isTablet() ? 800 : undefined,
  cardWidth: cardWidthValue,
  topicCardWidth: topicCardWidthValue,
  topicCardMarginH: isTablet() ? wp(2) : 0,
  avatarSize: isTablet() ? 90 : isSmallDevice() ? 60 : 70,
  avatarRadius: isTablet() ? 45 : isSmallDevice() ? 30 : 35,
  avatarFont: isTablet() ? 36 : isSmallDevice() ? 24 : 28,
  titleFont: isTablet() ? 28 : isSmallDevice() ? 18 : 22,
  welcomeFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  progressCircleSize: isTablet() ? 90 : isSmallDevice() ? 60 : 70,
  progressFont: isTablet() ? 22 : isSmallDevice() ? 14 : 18,
  progressLabelFont: isTablet() ? 12 : isSmallDevice() ? 8 : 10,
  sectionTitleFont: isTablet() ? 30 : isSmallDevice() ? 20 : 24,
  sectionSubtitleFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  topicIconSize: isTablet() ? 60 : isSmallDevice() ? 40 : 50,
  topicIconRadius: isTablet() ? 30 : isSmallDevice() ? 20 : 25,
  topicIconFont: isTablet() ? 28 : isSmallDevice() ? 18 : 22,
  topicNameFont: isTablet() ? 22 : isSmallDevice() ? 16 : 18,
  topicSubtitleFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  statCardMaxWidth: isTablet() ? 250 : undefined,
  statNumberFont: isTablet() ? 26 : isSmallDevice() ? 16 : 20,
  statLabelFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  searchFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  searchIconFont: isTablet() ? 20 : isSmallDevice() ? 16 : 18,
  progressTitleFont: isTablet() ? 20 : isSmallDevice() ? 14 : 16,
  progressSubtitleFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  progressBarHeight: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  topicProgressBarHeight: isTablet() ? 10 : isSmallDevice() ? 6 : 8,
  levelFont: isTablet() ? 12 : isSmallDevice() ? 8 : 10,
  streakFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  streakIconFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getSafeAreaTopPadding(),
    paddingBottom: getSpacing(Spacing.xl),
    
  },
  // Enhanced Profile Header
  profileHeader: {
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.xl),
    marginTop: getSpacing(Spacing.md),
    marginHorizontal: responsiveValues.paddingH,
    borderRadius: scaleSize(32),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(10) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(20),
    elevation: 10,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: responsiveValues.cardWidth as any,
  },
  profileTopRow: {
    flexDirection: isSmallDevice() ? 'column' : 'row',
    alignItems: isSmallDevice() ? 'flex-start' : 'center',
    marginBottom: getSpacing(Spacing.xl),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isSmallDevice() ? 0 : getSpacing(Spacing.md),
    marginBottom: isSmallDevice() ? getSpacing(Spacing.md) : 0,
  },
  avatar: {
    width: scaleSize(responsiveValues.avatarSize),
    height: scaleSize(responsiveValues.avatarSize),
    borderRadius: scaleSize(responsiveValues.avatarRadius),
    backgroundColor: ProfessionalColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(8) },
    shadowOpacity: 0.4,
    shadowRadius: scaleSize(12),
    elevation: 8,
  },
  avatarText: {
    fontSize: scaleFont(responsiveValues.avatarFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -scaleSize(5),
    right: -scaleSize(5),
    backgroundColor: ProfessionalColors.warning,
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(4),
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(4),
    elevation: 3,
  },
  levelText: {
    fontSize: scaleFont(responsiveValues.levelFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: scaleFont(responsiveValues.welcomeFont),
    color: ProfessionalColors.textSecondary,
    marginBottom: scaleSize(2),
    fontWeight: '500',
  },
  userName: {
    fontSize: scaleFont(responsiveValues.titleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(12),
    alignSelf: 'flex-start',
  },
  streakIcon: {
    fontSize: scaleFont(responsiveValues.streakIconFont),
    marginRight: scaleSize(4),
  },
  streakText: {
    fontSize: scaleFont(responsiveValues.streakFont),
    color: ProfessionalColors.text,
    fontWeight: '600',
  },
  progressCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 102, 0, 0.1)',
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(20),
    minWidth: scaleSize(responsiveValues.progressCircleSize),
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(8),
    elevation: 4,
    marginTop: isSmallDevice() ? getSpacing(Spacing.md) : 0,
  },
  progressPercentage: {
    fontSize: scaleFont(responsiveValues.progressFont),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
  },
  progressLabel: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: getSpacing(Spacing.md),
  },
  progressHeader: {
    flexDirection: isSmallDevice() ? 'column' : 'row',
    justifyContent: isSmallDevice() ? 'flex-start' : 'space-between',
    alignItems: isSmallDevice() ? 'flex-start' : 'center',
    marginBottom: getSpacing(Spacing.md),
  },
  progressTitle: {
    fontSize: scaleFont(responsiveValues.progressTitleFont),
    fontWeight: '700',
    color: ProfessionalColors.text,
    marginBottom: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  progressSubtitle: {
    fontSize: scaleFont(responsiveValues.progressSubtitleFont),
    color: ProfessionalColors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: getSpacing(Spacing.sm),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(Spacing.xs),
  },
  progressMin: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  progressMax: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: scaleSize(responsiveValues.progressBarHeight),
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
    marginTop: getSpacing(Spacing.xs),
  },
  progressMarkerText: {
    fontSize: scaleFont(responsiveValues.progressLabelFont),
    color: ProfessionalColors.primary,
    fontWeight: '700',
  },
  // Search Section
  searchSection: {
    padding: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.md),
    paddingHorizontal: responsiveValues.paddingH,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingVertical: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 6,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  searchIcon: {
    fontSize: scaleFont(responsiveValues.searchIconFont),
    color: ProfessionalColors.textSecondary,
    marginRight: getSpacing(Spacing.sm),
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFont(responsiveValues.searchFont),
    color: ProfessionalColors.text,
    fontWeight: '500',
  },
  clearIcon: {
    fontSize: scaleFont(responsiveValues.searchIconFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: 'bold',
  },
  // Section Header
  sectionHeader: {
    paddingHorizontal: responsiveValues.paddingH,
    marginBottom: getSpacing(Spacing.md),
  },
  sectionTitle: {
    fontSize: scaleFont(responsiveValues.sectionTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  sectionSubtitle: {
    fontSize: scaleFont(responsiveValues.sectionSubtitleFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
  },
  // Topics List
  topicsList: {
    paddingHorizontal: wp(isTablet() ? 5 : 2),
    gap: getSpacing(Spacing.md),
  },
  topicCardTouchable: {
    marginHorizontal: responsiveValues.topicCardMarginH,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: responsiveValues.topicCardWidth as any,
    borderRadius: BorderRadius.lg - 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(6) },
    shadowOpacity: 0.25,
    shadowRadius: scaleSize(12),
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  topicCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scaleSize(6),
    backgroundColor: ProfessionalColors.primary,
    zIndex: 10,
    borderTopLeftRadius: BorderRadius.lg - 1,
    borderBottomLeftRadius: BorderRadius.lg - 1,
  },
  topicCard: {
    flex: 1,
    padding: getSpacing(Spacing.lg),
    paddingLeft: getSpacing(Spacing.lg) + scaleSize(6),
    overflow: 'hidden',
    minHeight: scaleSize(140),
    borderTopRightRadius: BorderRadius.lg - 1,
    borderBottomRightRadius: BorderRadius.lg - 1,
  },
  topicCardImage: {
    borderTopRightRadius: BorderRadius.lg - 1,
    borderBottomRightRadius: BorderRadius.lg - 1,
    opacity: 0.7,
  },
  topicCardOverlay: {
    position: 'absolute',
    top: 0,
    left: scaleSize(6),
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopRightRadius: BorderRadius.lg - 1,
    borderBottomRightRadius: BorderRadius.lg - 1,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.md),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
    zIndex: 1,
  },
  topicIconContainer: {
    width: scaleSize(responsiveValues.topicIconSize),
    height: scaleSize(responsiveValues.topicIconSize),
    borderRadius: scaleSize(responsiveValues.topicIconRadius),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
    marginBottom: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  topicIcon: {
    fontSize: scaleFont(responsiveValues.topicIconFont),
  },
  topicInfo: {
    flex: 1,
    marginTop: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  topicName: {
    fontSize: scaleFont(responsiveValues.topicNameFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
    marginBottom: scaleSize(2),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topicSubtitle: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  topicPercentage: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(6),
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(4),
    elevation: 2,
    marginTop: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
    alignSelf: isSmallDevice() ? 'flex-start' : 'auto',
  },
  percentageText: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  topicProgressContainer: {
    marginTop: getSpacing(Spacing.sm),
    zIndex: 1,
  },
  topicProgressLabel: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  topicProgressValue: {
    fontSize: scaleFont(responsiveValues.topicSubtitleFont),
    color: ProfessionalColors.white,
    fontWeight: '700',
  },
  topicProgressBarBackground: {
    height: scaleSize(responsiveValues.topicProgressBarHeight),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: getSpacing(Spacing.xs),
  },
  topicProgressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.full,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: responsiveValues.paddingH,
    marginTop: getSpacing(Spacing.lg),
    gap: getSpacing(Spacing.md),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
  },
  statCard: {
    flex: isSmallDevice() ? 0 : 1,
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.lg),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(10),
    elevation: 6,
    minWidth: isSmallDevice() ? '45%' : undefined,
    maxWidth: responsiveValues.statCardMaxWidth,
  },
  statNumber: {
    fontSize: scaleFont(responsiveValues.statNumberFont),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: scaleSize(4),
  },
  statLabel: {
    fontSize: scaleFont(responsiveValues.statLabelFont),
    color: ProfessionalColors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});