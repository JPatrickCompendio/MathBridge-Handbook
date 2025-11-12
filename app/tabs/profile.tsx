import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/colors';
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
};

// Example user data
const EXAMPLE_USER = {
  name: 'John Patrick',
  email: 'john.Patrick@example.com',
  memberSince: '2024-01-01',
  avatar: 'JD',
};

// Statistics data
const USER_STATS = {
  topicsMastered: 3,
  totalTopics: 8,
  averageScore: 72,
  quizzesCompleted: 45,
  currentStreak: 7,
  learningTime: 24.5,
  achievementPoints: 450,
};

// Topics with progress
const TOPICS = [
  { id: 1, name: 'Algebra', progress: 85, icon: '🧮' },
  { id: 2, name: 'Geometry', progress: 67, icon: '📐' },
  { id: 3, name: 'Statistics', progress: 80, icon: '📊' },
  { id: 4, name: 'Trigonometry', progress: 55, icon: '📏' },
  { id: 5, name: 'Calculus', progress: 30, icon: '⚖️' },
  { id: 6, name: 'Probability', progress: 25, icon: '🎯' },
  { id: 7, name: 'Measurement', progress: 45, icon: '📏' },
  { id: 8, name: 'Number Theory', progress: 20, icon: '🔢' },
];

const getProgressColor = (progress: number) => {
  if (progress >= 71) return ProfessionalColors.success;
  if (progress >= 41) return ProfessionalColors.warning;
  return ProfessionalColors.error;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const handleEditProfile = () => {
    console.log('Edit profile');
    // TODO: Navigate to edit profile screen
  };

  const handleTopicPress = (topicId: number) => {
    console.log('Navigate to topic:', topicId);
    // TODO: Navigate to topic detail screen
  };

  const handleResetProgress = () => {
    setResetModalVisible(true);
  };

  const confirmResetProgress = () => {
    setResetModalVisible(false);
    console.log('Reset progress');
    // TODO: Implement reset progress logic
    Alert.alert('Success', 'Your progress has been reset.');
  };

  const handleAppSettings = () => {
    console.log('App settings');
    // TODO: Navigate to settings screen
  };

  const handleHelpSupport = () => {
    console.log('Help & Support');
    // TODO: Navigate to help screen
  };

  const handleAboutApp = () => {
    console.log('About app');
    // TODO: Navigate to about screen
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logout');
            router.replace('/auth/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{EXAMPLE_USER.avatar}</Text>
            </View>
          </View>

          <Text style={styles.userName}>{EXAMPLE_USER.name}</Text>
          <Text style={styles.userEmail}>{EXAMPLE_USER.email}</Text>
          <Text style={styles.memberSince}>
            Member since {formatDate(EXAMPLE_USER.memberSince)}
          </Text>
        </View>

        {/* Statistics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📚</Text>
              <Text style={styles.statValue}>
                {USER_STATS.topicsMastered}/{USER_STATS.totalTopics}
              </Text>
              <Text style={styles.statLabel}>Topics Mastered</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>{USER_STATS.averageScore}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statValue}>{USER_STATS.quizzesCompleted}</Text>
              <Text style={styles.statLabel}>Quizzes Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{USER_STATS.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>{USER_STATS.learningTime}h</Text>
              <Text style={styles.statLabel}>Learning Time</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{USER_STATS.achievementPoints}</Text>
              <Text style={styles.statLabel}>Achievement Points</Text>
            </View>
          </View>
        </View>

        {/* Detailed Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressContainer}>
            {TOPICS.map((topic) => {
              const progressColor = getProgressColor(topic.progress);
              const clampedProgress = Math.max(0, Math.min(100, topic.progress));

              return (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.progressItem}
                  onPress={() => handleTopicPress(topic.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.progressItemHeader}>
                    <View style={styles.progressItemLeft}>
                      <Text style={styles.topicIcon}>{topic.icon}</Text>
                      <Text style={styles.topicName}>{topic.name}</Text>
                    </View>
                    <Text style={[styles.progressPercentage, { color: progressColor }]}>
                      {clampedProgress}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${clampedProgress}%`,
                            backgroundColor: progressColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Settings & Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings & Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleResetProgress}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>🔄</Text>
                <Text style={[styles.actionText, { color: ProfessionalColors.error }]}>
                  Reset Progress
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleAppSettings}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>⚙️</Text>
                <Text style={styles.actionText}>App Settings</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleHelpSupport}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>❓</Text>
                <Text style={styles.actionText}>Help & Support</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleAboutApp}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <Text style={styles.actionIcon}>ℹ️</Text>
                <Text style={styles.actionText}>About App</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reset Progress Confirmation Modal */}
      <Modal
        visible={resetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Progress</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to reset all your progress? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setResetModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmResetProgress}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonConfirmText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Compute responsive values before StyleSheet
const responsiveValues = {
  paddingH: isTablet() ? wp(5) : wp(4),
  editButtonSize: isTablet() ? 48 : isSmallDevice() ? 36 : 40,
  editButtonRadius: isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  editIconFont: isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  avatarSize: isTablet() ? 120 : isSmallDevice() ? 80 : 100,
  avatarRadius: isTablet() ? 60 : isSmallDevice() ? 40 : 50,
  avatarTextFont: isTablet() ? 44 : isSmallDevice() ? 28 : 36,
  userNameFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  userEmailFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  memberSinceFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  sectionTitleFont: isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  statCardWidth: isTablet() ? '31%' : isSmallDevice() ? '100%' : '47%',
  statIconFont: isTablet() ? 40 : isSmallDevice() ? 28 : 32,
  statValueFont: isTablet() ? 30 : isSmallDevice() ? 20 : 24,
  statLabelFont: isTablet() ? 14 : isSmallDevice() ? 10 : 12,
  topicIconFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  topicNameFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  progressPercentageFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  progressBarHeight: isTablet() ? 10 : isSmallDevice() ? 6 : 8,
  actionIconFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  actionTextFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  actionArrowFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  logoutButtonFont: isTablet() ? 20 : isSmallDevice() ? 16 : 18,
  modalMaxWidth: isTablet() ? 500 : 400,
  modalTitleFont: isTablet() ? 28 : isSmallDevice() ? 20 : 24,
  modalMessageFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  modalButtonTextFont: isTablet() ? 18 : isSmallDevice() ? 14 : 16,
  cardMaxWidth: isTablet() ? 800 : undefined,
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
  // Profile Header
  profileHeader: {
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.xl),
    paddingTop: getSpacing(Spacing.xxl),
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
  },
  editButton: {
    position: 'absolute',
    top: getSpacing(Spacing.lg),
    right: getSpacing(Spacing.lg),
    width: scaleSize(responsiveValues.editButtonSize),
    height: scaleSize(responsiveValues.editButtonSize),
    borderRadius: scaleSize(responsiveValues.editButtonRadius),
    backgroundColor: ProfessionalColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: scaleFont(responsiveValues.editIconFont),
  },
  avatarContainer: {
    marginBottom: getSpacing(Spacing.md),
  },
  avatar: {
    width: scaleSize(responsiveValues.avatarSize),
    height: scaleSize(responsiveValues.avatarSize),
    borderRadius: scaleSize(responsiveValues.avatarRadius),
    backgroundColor: ProfessionalColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 6,
  },
  avatarText: {
    fontSize: scaleFont(responsiveValues.avatarTextFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  userName: {
    fontSize: scaleFont(responsiveValues.userNameFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  userEmail: {
    fontSize: scaleFont(responsiveValues.userEmailFont),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.xs),
  },
  memberSince: {
    fontSize: scaleFont(responsiveValues.memberSinceFont),
    color: ProfessionalColors.textSecondary,
  },
  // Section
  section: {
    marginTop: getSpacing(Spacing.lg),
    paddingHorizontal: responsiveValues.paddingH,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: scaleFont(responsiveValues.sectionTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
  },
  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.md),
    justifyContent: isSmallDevice() ? 'center' : 'flex-start',
  },
  statCard: {
    width: responsiveValues.statCardWidth as any,
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.md),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    minWidth: isSmallDevice() ? undefined : scaleSize(140),
  },
  statIcon: {
    fontSize: scaleFont(responsiveValues.statIconFont),
    marginBottom: getSpacing(Spacing.sm),
  },
  statValue: {
    fontSize: scaleFont(responsiveValues.statValueFont),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  statLabel: {
    fontSize: scaleFont(responsiveValues.statLabelFont),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Progress Section
  progressContainer: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  progressItem: {
    marginBottom: getSpacing(Spacing.lg),
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.sm),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
  },
  progressItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: isSmallDevice() ? getSpacing(Spacing.xs) : 0,
  },
  topicIcon: {
    fontSize: scaleFont(responsiveValues.topicIconFont),
    marginRight: getSpacing(Spacing.sm),
  },
  topicName: {
    fontSize: scaleFont(responsiveValues.topicNameFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
    flex: 1,
  },
  progressPercentage: {
    fontSize: scaleFont(responsiveValues.progressPercentageFont),
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: getSpacing(Spacing.xs),
  },
  progressBarBackground: {
    height: scaleSize(responsiveValues.progressBarHeight),
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  // Actions
  actionsContainer: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.lg),
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: scaleFont(responsiveValues.actionIconFont),
    marginRight: getSpacing(Spacing.md),
  },
  actionText: {
    fontSize: scaleFont(responsiveValues.actionTextFont),
    fontWeight: '500',
    color: ProfessionalColors.text,
  },
  actionArrow: {
    fontSize: scaleFont(responsiveValues.actionArrowFont),
    color: ProfessionalColors.textSecondary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: ProfessionalColors.border,
    marginLeft: getSpacing(Spacing.xl) + getSpacing(Spacing.md),
  },
  // Logout Button
  logoutButton: {
    marginHorizontal: responsiveValues.paddingH,
    marginTop: getSpacing(Spacing.xl),
    marginBottom: getSpacing(Spacing.lg),
    backgroundColor: ProfessionalColors.error,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.md),
    alignItems: 'center',
    shadowColor: ProfessionalColors.error,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 6,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  logoutButtonText: {
    fontSize: scaleFont(responsiveValues.logoutButtonFont),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
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
  },
  modalTitle: {
    fontSize: scaleFont(responsiveValues.modalTitleFont),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
  },
  modalMessage: {
    fontSize: scaleFont(responsiveValues.modalMessageFont),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleSize(24),
    marginBottom: getSpacing(Spacing.xl),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: getSpacing(Spacing.md),
    flexWrap: isSmallDevice() ? 'wrap' : 'nowrap',
  },
  modalButton: {
    flex: 1,
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: ProfessionalColors.background,
  },
  modalButtonCancelText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  modalButtonConfirm: {
    backgroundColor: ProfessionalColors.error,
  },
  modalButtonConfirmText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.white,
  },
});
