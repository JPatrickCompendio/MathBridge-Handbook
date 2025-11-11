import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/colors';

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
    name: 'Geometry',
    icon: '📐',
    mastery: 67,
    difficulties: {
      easy: { score: '9/10', completed: true, perfect: false },
      medium: { score: '7/10', completed: true, perfect: false },
      hard: { score: '5/10', completed: true, perfect: false },
    },
  },
  {
    id: 2,
    name: 'Algebra',
    icon: '🧮',
    mastery: 45,
    difficulties: {
      easy: { score: '8/10', completed: true, perfect: false },
      medium: { score: '6/10', completed: true, perfect: false },
      hard: { score: '3/10', completed: false, perfect: false },
    },
  },
  {
    id: 3,
    name: 'Statistics',
    icon: '📊',
    mastery: 80,
    difficulties: {
      easy: { score: '10/10', completed: true, perfect: true },
      medium: { score: '9/10', completed: true, perfect: false },
      hard: { score: '7/10', completed: true, perfect: false },
    },
  },
  {
    id: 4,
    name: 'Trigonometry',
    icon: '📏',
    mastery: 55,
    difficulties: {
      easy: { score: '8/10', completed: true, perfect: false },
      medium: { score: '6/10', completed: true, perfect: false },
      hard: { score: '2/10', completed: false, perfect: false },
    },
  },
  {
    id: 5,
    name: 'Calculus',
    icon: '⚖️',
    mastery: 30,
    difficulties: {
      easy: { score: '5/10', completed: false, perfect: false },
      medium: { score: '3/10', completed: false, perfect: false },
      hard: { score: '0/10', completed: false, perfect: false },
    },
  },
  {
    id: 6,
    name: 'Probability',
    icon: '🎯',
    mastery: 25,
    difficulties: {
      easy: { score: '4/10', completed: false, perfect: false },
      medium: { score: '2/10', completed: false, perfect: false },
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
    <SafeAreaView style={styles.container}>
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
                Focus on {weakestTopic.name} ({weakestTopic.mastery}% mastery)
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
                    <View>
                      <Text style={styles.topicSectionName}>{topic.name}</Text>
                      <Text style={styles.topicSectionMastery}>
                        {topic.mastery}% Mastery
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
  },
  // Quick Practice Cards
  quickPracticeGrid: {
    gap: Spacing.md,
  },
  quickCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.md,
  },
  quickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickCardIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  quickCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
  },
  quickCardDescription: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    marginBottom: Spacing.md,
  },
  topicIconsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  topicIcon: {
    fontSize: 20,
  },
  startButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  startButtonText: {
    color: ProfessionalColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Practice Modes
  modeCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  modeIcon: {
    fontSize: 24,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  modeDescription: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
  },
  modeStartButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  modeStartButtonText: {
    color: ProfessionalColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Topics Practice
  topicSection: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicSectionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  topicSectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  topicSectionMastery: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
  },
  expandIcon: {
    fontSize: 16,
    color: ProfessionalColors.textSecondary,
  },
  difficultyContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  difficultyCard: {
    backgroundColor: ProfessionalColors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  difficultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyIndicator: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  completionBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionIcon: {
    fontSize: 18,
  },
  difficultyScore: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  difficultyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  difficultyButtonText: {
    color: ProfessionalColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
