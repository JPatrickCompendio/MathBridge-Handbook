import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../constants/colors';
import { getSpacing, isSmallDevice, isTablet, scaleFont, scaleSize, wp } from '../../utils/responsive';

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
  easy: '#61E35D',
  medium: '#FF6600',
  hard: '#DC2626',
};

// Example data - matches topics from homepage
const EXAMPLE_TOPICS = [
  {
    id: 1,
    name: 'Quadratic Equations',
    icon: '📐',
    mastery: 0,
    difficulties: {
      easy: { score: '0/10', completed: false, perfect: false },
      medium: { score: '0/10', completed: false, perfect: false },
      hard: { score: '0/10', completed: false, perfect: false },
    },
  },
  {
    id: 2,
    name: 'Pythagorean Triples',
    icon: '🔺',
    mastery: 0,
    difficulties: {
      easy: { score: '0/10', completed: false, perfect: false },
      medium: { score: '0/10', completed: false, perfect: false },
      hard: { score: '0/10', completed: false, perfect: false },
    },
  },
  {
    id: 3,
    name: 'Triangle Measures',
    icon: '△',
    mastery: 0,
    difficulties: {
      easy: { score: '0/10', completed: false, perfect: false },
      medium: { score: '0/10', completed: false, perfect: false },
      hard: { score: '0/10', completed: false, perfect: false },
    },
  },
  {
    id: 4,
    name: 'Area of Triangles',
    icon: '📏',
    mastery: 0,
    difficulties: {
      easy: { score: '0/10', completed: false, perfect: false },
      medium: { score: '0/10', completed: false, perfect: false },
      hard: { score: '0/10', completed: false, perfect: false },
    },
  },
  {
    id: 5,
    name: 'Variation',
    icon: '📊',
    mastery: 0,
    difficulties: {
      easy: { score: '0/10', completed: false, perfect: false },
      medium: { score: '0/10', completed: false, perfect: false },
      hard: { score: '0/10', completed: false, perfect: false },
    },
  },
];

const PRACTICE_MODES = [
  {
    id: 1,
    title: 'Time Attack',
    description: 'Solve 10 questions in 5 minutes',
    icon: '⏱️',
    color: ProfessionalColors.primary,
  },
  {
    id: 2,
    title: 'Survival Mode',
    description: 'Keep going until you get one wrong',
    icon: '🔥',
    color: ProfessionalColors.error,
  },
  {
    id: 3,
    title: 'Marathon',
    description: '20 questions across all topics',
    icon: '🏃',
    color: ProfessionalColors.success,
  },
  {
    id: 4,
    title: 'Blind Mode',
    description: 'Type answers without multiple choice',
    icon: '👁️',
    color: ProfessionalColors.warning,
  },
];

export default function ActivitiesScreen() {
  const router = useRouter();
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getWeakestTopic = () => {
    return EXAMPLE_TOPICS.reduce((weakest, topic) =>
      topic.mastery < weakest.mastery ? topic : weakest
    );
  };

  // Handle Quick Practice
  const handleStartPractice = (type: string) => {
    switch (type) {
      case '5-random':
        // Navigate to practice screen with 5 random questions
        router.push({
          pathname: '/practice',
          params: {
            mode: 'random',
            questionCount: '5',
            difficulty: 'mixed',
          },
        } as any);
        break;
      case '10-random':
        // Navigate to practice screen with 10 random questions
        router.push({
          pathname: '/practice',
          params: {
            mode: 'random',
            questionCount: '10',
            difficulty: 'mixed',
          },
        } as any);
        break;
      case 'weakest':
        // Navigate to weakest topic practice
        const weakest = getWeakestTopic();
        router.push({
          pathname: '/practice',
          params: {
            mode: 'topic',
            topicId: weakest.id.toString(),
            difficulty: 'mixed',
            topicName: weakest.name,
          },
        } as any);
        break;
      default:
        // Navigate to practice screen for any other type
        router.push({
          pathname: '/practice',
          params: {
            mode: type,
            questionCount: '10',
            difficulty: 'mixed',
          },
        } as any);
    }
  };

  // Handle Practice Modes
  const handleStartMode = (modeId: number) => {
    const mode = PRACTICE_MODES.find((m) => m.id === modeId);
    if (!mode) return;

    switch (modeId) {
      case 1: // Time Attack
        router.push({
          pathname: '/practice',
          params: {
            mode: 'time-attack',
            questionCount: '10',
            timeLimit: '300', // 5 minutes in seconds
          },
        } as any);
        break;
      case 2: // Survival Mode
        router.push({
          pathname: '/practice',
          params: {
            mode: 'survival',
            questionCount: 'unlimited',
          },
        } as any);
        break;
      case 3: // Marathon
        router.push({
          pathname: '/practice',
          params: {
            mode: 'marathon',
            questionCount: '20',
            difficulty: 'mixed',
          },
        } as any);
        break;
      case 4: // Blind Mode
        router.push({
          pathname: '/practice',
          params: {
            mode: 'blind',
            questionCount: '10',
            difficulty: 'mixed',
          },
        } as any);
        break;
      default:
        // Navigate to practice screen for any other mode
        router.push({
          pathname: '/practice',
          params: {
            mode: mode.title.toLowerCase().replace(' ', '-'),
            questionCount: '10',
            difficulty: 'mixed',
          },
        } as any);
    }
  };

  // Handle Topic-specific Difficulty Quizzes
  const handleStartDifficulty = (topicId: number, difficulty: string) => {
    const topic = EXAMPLE_TOPICS.find((t) => t.id === topicId);
    if (!topic) {
      Alert.alert('Error', 'Topic not found');
      return;
    }

    // Navigate directly to quiz screen with topic and difficulty
    router.push({
      pathname: '/quiz',
      params: {
        mode: 'topic-quiz',
        topicId: topicId.toString(),
        difficulty: difficulty,
        topicName: topic.name,
        questionCount: '10',
      },
    } as any);
  };

  const weakestTopic = getWeakestTopic();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Practice & Activities</Text>
          <Text style={styles.headerSubtitle}>
            Improve your math skills with various practice modes
          </Text>
        </View>

        {/* Quick Practice Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Practice</Text>
          <View style={styles.quickPracticeGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => handleStartPractice('5-random')}
              activeOpacity={0.8}
            >
              <View style={styles.quickCardHeader}>
                <Text style={styles.quickCardIcon}>🎯</Text>
                <Text style={styles.quickCardTitle}>5 Random Questions</Text>
              </View>
              <Text style={styles.quickCardDescription}>
                Mixed difficulty from all topics
              </Text>
              <View style={styles.topicIconsRow}>
                <Text style={styles.topicIcon}>🧮</Text>
                <Text style={styles.topicIcon}>📐</Text>
                <Text style={styles.topicIcon}>📊</Text>
                <Text style={styles.topicIcon}>📏</Text>
              </View>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: ProfessionalColors.primary }]}
                onPress={() => handleStartPractice('5-random')}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => handleStartPractice('10-random')}
              activeOpacity={0.8}
            >
              <View style={styles.quickCardHeader}>
                <Text style={styles.quickCardIcon}>📚</Text>
                <Text style={styles.quickCardTitle}>10 Random Questions</Text>
              </View>
              <Text style={styles.quickCardDescription}>
                Longer practice session
              </Text>
              <View style={styles.topicIconsRow}>
                <Text style={styles.topicIcon}>🧮</Text>
                <Text style={styles.topicIcon}>📐</Text>
                <Text style={styles.topicIcon}>📊</Text>
                <Text style={styles.topicIcon}>📏</Text>
                <Text style={styles.topicIcon}>⚖️</Text>
              </View>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: ProfessionalColors.success }]}
                onPress={() => handleStartPractice('10-random')}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => handleStartPractice('weakest')}
              activeOpacity={0.8}
            >
              <View style={styles.quickCardHeader}>
                <Text style={styles.quickCardIcon}>{weakestTopic.icon}</Text>
                <Text style={styles.quickCardTitle}>Weakest Topic Practice</Text>
              </View>
              <Text style={styles.quickCardDescription}>
                Focus on {weakestTopic.name} ({Math.round(weakestTopic.mastery)}% mastery)
              </Text>
              <View style={styles.topicIconsRow}>
                <Text style={styles.topicIcon}>{weakestTopic.icon}</Text>
              </View>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: ProfessionalColors.warning }]}
                onPress={() => handleStartPractice('weakest')}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Practice Modes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Modes</Text>
          {PRACTICE_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleStartMode(mode.id)}
              activeOpacity={0.8}
            >
              <View style={styles.modeCardContent}>
                <View style={[styles.modeIconContainer, { backgroundColor: `${mode.color}20` }]}>
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                </View>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.modeStartButton, { backgroundColor: mode.color }]}
                  onPress={() => handleStartMode(mode.id)}
                >
                  <Text style={styles.modeStartButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topics Practice Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topics Practice</Text>
          {EXAMPLE_TOPICS.map((topic) => {
            const isExpanded = expandedTopics.includes(topic.id);
            return (
              <View key={topic.id} style={styles.topicSection}>
                <TouchableOpacity
                  style={styles.topicHeader}
                  onPress={() => toggleTopic(topic.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.topicHeaderLeft}>
                    <Text style={styles.topicSectionIcon}>{topic.icon}</Text>
                    <View style={styles.topicHeaderInfo}>
                      <Text style={styles.topicSectionName}>{topic.name}</Text>
                      <Text style={styles.topicSectionMastery}>
                        {Math.round(topic.mastery)}% Mastery
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.difficultyContainer}>
                    {/* Easy */}
                    <View style={styles.difficultyCard}>
                      <View style={styles.difficultyHeader}>
                        <View style={styles.difficultyLeft}>
                          <Text style={styles.difficultyIndicator}>🟢</Text>
                          <Text style={styles.difficultyLabel}>Easy Quiz</Text>
                        </View>
                        {topic.difficulties.easy.completed && (
                          <View style={styles.completionBadge}>
                            {topic.difficulties.easy.perfect ? (
                              <Text style={styles.completionIcon}>⭐</Text>
                            ) : (
                              <Text style={styles.completionIcon}>✅</Text>
                            )}
                          </View>
                        )}
                      </View>
                      <Text style={styles.difficultyScore}>
                        Best: {topic.difficulties.easy.score}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.difficultyButton,
                          { backgroundColor: ProfessionalColors.easy },
                        ]}
                        onPress={() => handleStartDifficulty(topic.id, 'easy')}
                      >
                        <Text style={styles.difficultyButtonText}>Start</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Medium */}
                    <View style={styles.difficultyCard}>
                      <View style={styles.difficultyHeader}>
                        <View style={styles.difficultyLeft}>
                          <Text style={styles.difficultyIndicator}>🟡</Text>
                          <Text style={styles.difficultyLabel}>Medium Quiz</Text>
                        </View>
                        {topic.difficulties.medium.completed && (
                          <View style={styles.completionBadge}>
                            {topic.difficulties.medium.perfect ? (
                              <Text style={styles.completionIcon}>⭐</Text>
                            ) : (
                              <Text style={styles.completionIcon}>✅</Text>
                            )}
                          </View>
                        )}
                      </View>
                      <Text style={styles.difficultyScore}>
                        Best: {topic.difficulties.medium.score}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.difficultyButton,
                          { backgroundColor: ProfessionalColors.medium },
                        ]}
                        onPress={() => handleStartDifficulty(topic.id, 'medium')}
                      >
                        <Text style={styles.difficultyButtonText}>Start</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Hard */}
                    <View style={styles.difficultyCard}>
                      <View style={styles.difficultyHeader}>
                        <View style={styles.difficultyLeft}>
                          <Text style={styles.difficultyIndicator}>🔴</Text>
                          <Text style={styles.difficultyLabel}>Hard Quiz</Text>
                        </View>
                        {topic.difficulties.hard.completed && (
                          <View style={styles.completionBadge}>
                            {topic.difficulties.hard.perfect ? (
                              <Text style={styles.completionIcon}>⭐</Text>
                            ) : (
                              <Text style={styles.completionIcon}>✅</Text>
                            )}
                          </View>
                        )}
                      </View>
                      <Text style={styles.difficultyScore}>
                        Best: {topic.difficulties.hard.score}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.difficultyButton,
                          { backgroundColor: ProfessionalColors.hard },
                        ]}
                        onPress={() => handleStartDifficulty(topic.id, 'hard')}
                      >
                        <Text style={styles.difficultyButtonText}>Start</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CONTENT_MAX_WIDTH = 720;

// Compute responsive values before StyleSheet
const responsiveValues = {
  paddingH: getSpacing(Spacing.xl),
  contentMaxWidth: CONTENT_MAX_WIDTH,
  headerTitleFont: isTablet() ? 32 : isSmallDevice() ? 22 : 28,
  headerSubtitleFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  sectionTitleFont: isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  quickCardIconFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  quickCardTitleFont: isTablet() ? 22 : isSmallDevice() ? 16 : 18,
  quickCardDescFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  topicIconFont: isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  startButtonFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  modeIconSize: isTablet() ? 60 : isSmallDevice() ? 45 : 50,
  modeIconRadius: isTablet() ? 30 : isSmallDevice() ? 22 : 25,
  modeIconFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  modeTitleFont: isTablet() ? 22 : isSmallDevice() ? 16 : 18,
  modeDescFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  modeStartButtonFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  topicSectionIconFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  topicSectionNameFont: isTablet() ? 22 : isSmallDevice() ? 16 : 18,
  topicSectionMasteryFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  expandIconFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  difficultyIndicatorFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  difficultyLabelFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  completionBadgeSize: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  completionIconFont: isTablet() ? 20 : isSmallDevice() ? 16 : 18,
  difficultyScoreFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  difficultyButtonFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  cardMaxWidth: CONTENT_MAX_WIDTH,
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
    paddingTop: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl) + 80,
    paddingHorizontal: responsiveValues.paddingH,
    width: '100%',
    maxWidth: responsiveValues.contentMaxWidth,
    alignSelf: 'center',
  },
  header: {
    marginBottom: getSpacing(Spacing.xl),
    paddingHorizontal: getSpacing(Spacing.xs),
  },
  headerTitle: {
    fontSize: scaleFont(responsiveValues.headerTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  headerSubtitle: {
    fontSize: scaleFont(responsiveValues.headerSubtitleFont),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleFont(responsiveValues.headerSubtitleFont) * 1.35,
  },
  section: {
    marginBottom: getSpacing(Spacing.xl),
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'stretch',
    width: '100%',
  },
  sectionTitle: {
    fontSize: scaleFont(responsiveValues.sectionTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.xs),
  },
  // Quick Practice Cards
  quickPracticeGrid: {
    gap: getSpacing(Spacing.md),
  },
  quickCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    marginBottom: getSpacing(Spacing.md),
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  quickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
    flexWrap: 'nowrap',
    gap: getSpacing(Spacing.sm),
  },
  quickCardIcon: {
    fontSize: scaleFont(responsiveValues.quickCardIconFont),
    flexShrink: 0,
  },
  quickCardTitle: {
    fontSize: scaleFont(responsiveValues.quickCardTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    flex: 1,
    minWidth: 0,
  },
  quickCardDescription: {
    fontSize: scaleFont(responsiveValues.quickCardDescFont),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.md),
  },
  topicIconsRow: {
    flexDirection: 'row',
    marginBottom: getSpacing(Spacing.md),
    gap: getSpacing(Spacing.sm),
    flexWrap: 'wrap',
  },
  topicIcon: {
    fontSize: scaleFont(responsiveValues.topicIconFont),
  },
  startButton: {
    alignSelf: 'center',
    marginTop: getSpacing(Spacing.xs),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.xl),
    minWidth: scaleSize(120),
    maxWidth: scaleSize(200),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(responsiveValues.startButtonFont),
    fontWeight: '600',
  },
  // Practice Modes
  modeCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(Spacing.md),
  },
  modeIconContainer: {
    width: scaleSize(responsiveValues.modeIconSize),
    height: scaleSize(responsiveValues.modeIconSize),
    borderRadius: scaleSize(responsiveValues.modeIconRadius),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  modeIcon: {
    fontSize: scaleFont(responsiveValues.modeIconFont),
  },
  modeInfo: {
    flex: 1,
    minWidth: 0,
  },
  modeTitle: {
    fontSize: scaleFont(responsiveValues.modeTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  modeDescription: {
    fontSize: scaleFont(responsiveValues.modeDescFont),
    color: ProfessionalColors.textSecondary,
  },
  modeStartButton: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.lg),
    minWidth: scaleSize(88),
    maxWidth: scaleSize(140),
    borderRadius: scaleSize(BorderRadius.md),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeStartButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(responsiveValues.modeStartButtonFont),
    fontWeight: '600',
  },
  // Topics Practice
  topicSection: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    marginBottom: getSpacing(Spacing.md),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing(Spacing.lg),
    flexWrap: 'nowrap',
    gap: getSpacing(Spacing.md),
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: getSpacing(Spacing.md),
  },
  topicSectionIcon: {
    fontSize: scaleFont(responsiveValues.topicSectionIconFont),
    flexShrink: 0,
  },
  topicHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },
  topicSectionName: {
    fontSize: scaleFont(responsiveValues.topicSectionNameFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  topicSectionMastery: {
    fontSize: scaleFont(responsiveValues.topicSectionMasteryFont),
    color: ProfessionalColors.textSecondary,
  },
  expandIcon: {
    fontSize: scaleFont(responsiveValues.expandIconFont),
    color: ProfessionalColors.textSecondary,
    flexShrink: 0,
  },
  difficultyContainer: {
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.lg),
    gap: getSpacing(Spacing.md),
  },
  difficultyCard: {
    backgroundColor: ProfessionalColors.background,
    borderRadius: scaleSize(BorderRadius.md),
    padding: getSpacing(Spacing.md),
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
    flexWrap: 'nowrap',
    gap: getSpacing(Spacing.sm),
  },
  difficultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: getSpacing(Spacing.sm),
  },
  difficultyIndicator: {
    fontSize: scaleFont(responsiveValues.difficultyIndicatorFont),
    flexShrink: 0,
  },
  difficultyLabel: {
    fontSize: scaleFont(responsiveValues.difficultyLabelFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
    flex: 1,
    minWidth: 0,
  },
  completionBadge: {
    width: scaleSize(responsiveValues.completionBadgeSize),
    height: scaleSize(responsiveValues.completionBadgeSize),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  completionIcon: {
    fontSize: scaleFont(responsiveValues.completionIconFont),
  },
  difficultyScore: {
    fontSize: scaleFont(responsiveValues.difficultyScoreFont),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.sm),
  },
  difficultyButton: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
  },
  difficultyButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(responsiveValues.difficultyButtonFont),
    fontWeight: '600',
  },
});
