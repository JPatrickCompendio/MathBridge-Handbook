import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../constants/colors';
import { getSpacing, isSmallDevice, isTablet, scaleFont, scaleSize } from '../utils/responsive';

const ProfessionalColors = {
  primary: '#10B981',
  primaryDark: '#047857',
  white: '#FFFFFF',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  error: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#DC2626',
};

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    questionCount?: string;
    difficulty?: string;
    topicId?: string;
    topicName?: string;
    timeLimit?: string;
  }>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading practice data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleStartPractice = () => {
    // Navigate directly to quiz screen with all parameters
    router.push({
      pathname: '/quiz',
      params: {
        mode: params.mode,
        questionCount: params.questionCount,
        difficulty: params.difficulty,
        topicId: params.topicId,
        topicName: params.topicName,
        timeLimit: params.timeLimit,
      },
    } as any);
  };

  const getModeDescription = () => {
    switch (params.mode) {
      case 'random':
        return `Practice with ${params.questionCount} random questions from all topics`;
      case 'topic':
        return `Practice ${params.topicName || 'topic'} with mixed difficulty questions`;
      case 'topic-quiz':
        return `${params.difficulty?.toUpperCase() || 'Mixed'} difficulty quiz for ${params.topicName || 'topic'}`;
      case 'time-attack':
        return `Solve ${params.questionCount} questions in ${parseInt(params.timeLimit || '300') / 60} minutes`;
      case 'survival':
        return 'Keep answering correctly until you get one wrong!';
      case 'marathon':
        return `Complete ${params.questionCount} questions across all topics`;
      case 'blind':
        return `Type your answers without multiple choice options`;
      default:
        return 'Practice mode';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ProfessionalColors.primary} />
          <Text style={styles.loadingText}>Loading practice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Mode</Text>
        </View>

        {/* Practice Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.modeTitle}>
            {params.mode === 'time-attack' && '⏱️ Time Attack'}
            {params.mode === 'survival' && '🔥 Survival Mode'}
            {params.mode === 'marathon' && '🏃 Marathon'}
            {params.mode === 'blind' && '👁️ Blind Mode'}
            {params.mode === 'random' && '🎯 Random Practice'}
            {params.mode === 'topic' && `📚 ${params.topicName || 'Topic'} Practice`}
            {params.mode === 'topic-quiz' && `📝 ${params.topicName || 'Topic'} Quiz`}
            {!params.mode && 'Practice'}
          </Text>

          <Text style={styles.modeDescription}>{getModeDescription()}</Text>

          {/* Details */}
          <View style={styles.detailsContainer}>
            {params.questionCount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Questions:</Text>
                <Text style={styles.detailValue}>
                  {params.questionCount === 'unlimited' ? 'Unlimited' : params.questionCount}
                </Text>
              </View>
            )}

            {params.difficulty && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Difficulty:</Text>
                <Text style={styles.detailValue}>
                  {params.difficulty.charAt(0).toUpperCase() + params.difficulty.slice(1)}
                </Text>
              </View>
            )}

            {params.timeLimit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time Limit:</Text>
                <Text style={styles.detailValue}>
                  {parseInt(params.timeLimit) / 60} minutes
                </Text>
              </View>
            )}

            {params.topicName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Topic:</Text>
                <Text style={styles.detailValue}>{params.topicName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            {params.mode === 'time-attack' &&
              '• Answer as many questions as you can within the time limit\n• Each correct answer gives you points\n• Try to beat your best score!'}
            {params.mode === 'survival' &&
              '• Answer questions correctly to keep going\n• One wrong answer ends the session\n• See how long you can survive!'}
            {params.mode === 'marathon' &&
              '• Complete all questions at your own pace\n• Questions cover all topics\n• Track your overall performance'}
            {params.mode === 'blind' &&
              '• Type your answers without multiple choice\n• More challenging but better for learning\n• Check your answers after submission'}
            {params.mode === 'random' &&
              `• ${params.questionCount} random questions from all topics\n• Mixed difficulty levels\n• Great for general practice`}
            {params.mode === 'topic' &&
              `• Practice questions from ${params.topicName}\n• Mixed difficulty levels\n• Focus on your weakest area`}
            {params.mode === 'topic-quiz' &&
              `• ${params.difficulty?.toUpperCase()} difficulty quiz\n• Questions from ${params.topicName}\n• Test your knowledge`}
            {!params.mode && '• Follow the on-screen instructions\n• Answer questions to the best of your ability\n• Review your results at the end'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartPractice}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: getSpacing(Spacing.md),
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    color: ProfessionalColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl) + 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xl),
    gap: getSpacing(Spacing.md),
  },
  backButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  backIcon: {
    fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
    color: ProfessionalColors.text,
  },
  headerTitle: {
    fontSize: scaleFont(isTablet() ? 32 : isSmallDevice() ? 24 : 28),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    flex: 1,
    minWidth: 0,
  },
  infoCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.xl),
    marginBottom: getSpacing(Spacing.lg),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  modeTitle: {
    fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  modeDescription: {
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.lg),
    lineHeight: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
  },
  detailsContainer: {
    gap: getSpacing(Spacing.md),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
    flexWrap: 'nowrap',
    gap: getSpacing(Spacing.sm),
  },
  detailLabel: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.textSecondary,
    fontWeight: '500',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.text,
    fontWeight: '600',
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  instructionsCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.xl),
    marginBottom: getSpacing(Spacing.xl),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: scaleFont(isTablet() ? 20 : isSmallDevice() ? 16 : 18),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
  },
  instructionsText: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleFont(isTablet() ? 26 : isSmallDevice() ? 18 : 22),
  },
  actionsContainer: {
    gap: getSpacing(Spacing.md),
  },
  startButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    alignItems: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 6,
    minHeight: scaleSize(50),
    justifyContent: 'center',
  },
  startButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(isTablet() ? 20 : isSmallDevice() ? 16 : 18),
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: ProfessionalColors.background,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    minHeight: scaleSize(50),
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: ProfessionalColors.text,
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    fontWeight: '600',
  },
});

