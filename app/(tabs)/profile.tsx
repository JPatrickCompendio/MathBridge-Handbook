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
  name: 'John Doe',
  email: 'john.doe@example.com',
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
            router.replace('/(auth)/login');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  // Profile Header
  profileHeader: {
    backgroundColor: ProfessionalColors.white,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
  },
  editButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ProfessionalColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 20,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ProfessionalColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  memberSince: {
    fontSize: 12,
    color: ProfessionalColors.textSecondary,
  },
  // Section
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
  },
  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Progress Section
  progressContainer: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressItem: {
    marginBottom: Spacing.lg,
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: ProfessionalColors.text,
    flex: 1,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: Spacing.xs,
  },
  progressBarBackground: {
    height: 8,
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
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: ProfessionalColors.text,
  },
  actionArrow: {
    fontSize: 24,
    color: ProfessionalColors.textSecondary,
  },
  actionDivider: {
    height: 1,
    backgroundColor: ProfessionalColors.border,
    marginLeft: Spacing.xl + Spacing.md,
  },
  // Logout Button
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    backgroundColor: ProfessionalColors.error,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: ProfessionalColors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
  },
  modalMessage: {
    fontSize: 16,
    color: ProfessionalColors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: ProfessionalColors.background,
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  modalButtonConfirm: {
    backgroundColor: ProfessionalColors.error,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProfessionalColors.white,
  },
});
