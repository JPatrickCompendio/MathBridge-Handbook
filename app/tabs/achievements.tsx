import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BorderRadius, Spacing } from '../../constants/colors';
import { getCardWidth, getSafeAreaTopPadding, getSpacing, isSmallDevice, isTablet, scaleFont, scaleSize, wp } from '../../utils/responsive';

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

type UserStats = {
  totalAchievements: number;
  unlockedCount: number;
  completionPercentage: number;
  nextMilestone: string;
  rank: 'Beginner' | 'Explorer' | 'Scholar' | 'Master' | 'Grandmaster';
  totalPoints: number;
};

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'geometry_master',
    title: 'Geometry Master',
    description: 'Complete all Geometry topics with 100% mastery',
    type: 'badge',
    category: 'topic_mastery',
    icon: '📐',
    color: '#4ECDC4',
    earned: true,
    dateEarned: '2024-01-15',
    rarity: 'rare',
    requirements: ['Complete 5 geometry lessons', 'Score 90%+ on geometry quiz'],
    points: 50,
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day learning streak',
    type: 'medal',
    category: 'streak',
    icon: '🔥',
    color: '#FF6B6B',
    earned: false,
    progress: 85,
    rarity: 'common',
    requirements: ['Study for 7 consecutive days'],
    points: 25,
  },
  {
    id: 'algebra_expert',
    title: 'Algebra Expert',
    description: 'Solve 100 algebra problems',
    type: 'certificate',
    category: 'topic_mastery',
    icon: '🧮',
    color: '#45B7D1',
    earned: true,
    dateEarned: '2024-01-10',
    rarity: 'epic',
    requirements: ['Solve 100 algebra problems', 'Maintain 80% accuracy'],
    points: 75,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete exercises with 95% accuracy in under 2 minutes',
    type: 'trophy',
    category: 'speed',
    icon: '⚡',
    color: '#FFA726',
    earned: false,
    progress: 40,
    rarity: 'legendary',
    requirements: ['Complete 10 exercises under 2 minutes', 'Maintain 95% accuracy'],
    points: 100,
  },
  {
    id: 'streak_30',
    title: 'Monthly Champion',
    description: 'Maintain a 30-day learning streak',
    type: 'trophy',
    category: 'streak',
    icon: '🏆',
    color: '#FFD700',
    earned: false,
    progress: 16,
    rarity: 'legendary',
    requirements: ['Study for 30 consecutive days'],
    points: 150,
  },
  {
    id: 'level_10',
    title: 'Level Up',
    description: 'Reach level 10',
    type: 'badge',
    category: 'level',
    icon: '⭐',
    color: '#FF6600',
    earned: true,
    dateEarned: '2024-01-08',
    rarity: 'common',
    requirements: ['Reach level 10'],
    points: 30,
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    type: 'medal',
    category: 'special',
    icon: '💯',
    color: '#61E35D',
    earned: true,
    dateEarned: '2024-01-12',
    rarity: 'rare',
    requirements: ['Score 100% on any quiz'],
    points: 40,
  },
  {
    id: 'statistics_master',
    title: 'Statistics Master',
    description: 'Complete all Statistics topics',
    type: 'certificate',
    category: 'topic_mastery',
    icon: '📊',
    color: '#9B59B6',
    earned: true,
    dateEarned: '2024-01-18',
    rarity: 'epic',
    requirements: ['Complete all statistics lessons', 'Score 85%+ on statistics quiz'],
    points: 75,
  },
  {
    id: 'consistency_king',
    title: 'Consistency King',
    description: 'Study every day for 2 weeks',
    type: 'badge',
    category: 'consistency',
    icon: '👑',
    color: '#AB47BC',
    earned: false,
    progress: 71,
    rarity: 'epic',
    requirements: ['Study every day for 14 days'],
    points: 60,
  },
  {
    id: 'fast_learner',
    title: 'Fast Learner',
    description: 'Complete 5 topics in one day',
    type: 'medal',
    category: 'speed',
    icon: '🚀',
    color: '#FF6600',
    earned: false,
    progress: 60,
    rarity: 'rare',
    requirements: ['Complete 5 topics in a single day'],
    points: 50,
  },
  {
    id: 'trigonometry_expert',
    title: 'Trigonometry Expert',
    description: 'Master all trigonometry concepts',
    type: 'certificate',
    category: 'topic_mastery',
    icon: '📏',
    color: '#4ECDC4',
    earned: false,
    progress: 65,
    rarity: 'rare',
    requirements: ['Complete trigonometry lessons', 'Score 90%+ on trigonometry quiz'],
    points: 60,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete 10 exercises after 10 PM',
    type: 'badge',
    category: 'special',
    icon: '🦉',
    color: '#5D4E75',
    earned: true,
    dateEarned: '2024-01-14',
    rarity: 'common',
    requirements: ['Complete 10 exercises after 10 PM'],
    points: 20,
  },
];

const USER_STATS: UserStats = {
  totalAchievements: 24,
  unlockedCount: 8,
  completionPercentage: 33,
  nextMilestone: 'Master (15 achievements)',
  rank: 'Scholar',
  totalPoints: 450,
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

const NUM_COLUMNS = isTablet() ? 3 : 2;
const CARD_WIDTH = getCardWidth(NUM_COLUMNS, getSpacing(Spacing.lg));

// Achievement Card Component (separate component to use hooks properly)
function AchievementCard({
  item,
  index,
  onPress,
}: {
  item: Achievement;
  index: number;
  onPress: (item: Achievement) => void;
}) {
  const rarityColor = RarityColors[item.rarity];
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, cardOpacity, cardScale]);

  return (
    <Animated.View
      style={[
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.achievementCard,
          {
            borderColor: item.earned ? rarityColor : ProfessionalColors.border,
            borderWidth: item.earned ? 2 : 1,
            opacity: item.earned ? 1 : 0.7,
          },
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        {/* Rarity Glow Effect */}
        {item.earned && (
          <View
            style={[
              styles.rarityGlow,
              {
                backgroundColor: `${rarityColor}20`,
              },
            ]}
          />
        )}

        {/* Icon Container */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.earned ? `${item.color}20` : ProfessionalColors.background,
            },
          ]}
        >
          <Text style={styles.achievementIcon}>{item.icon}</Text>
          {item.earned && (
            <View style={styles.earnedBadge}>
              <Text style={styles.earnedBadgeText}>✓</Text>
            </View>
          )}
        </View>

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

          {/* Progress Bar - Always render to maintain consistent spacing */}
          <View style={styles.progressBarContainer}>
            {!item.earned && item.progress !== undefined ? (
              <>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${item.progress}%`,
                        backgroundColor: rarityColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const getFilteredAchievements = () => {
    let filtered = SAMPLE_ACHIEVEMENTS;

    // Filter by category
    if (selectedCategory === 'locked') {
      filtered = filtered.filter((a) => !a.earned);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAchievements = getFilteredAchievements();

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  const handleShare = () => {
    console.log('Share achievement:', selectedAchievement?.title);
    // TODO: Implement share functionality
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Header Stats Section */}
      <View style={styles.headerStats}>
        <View style={styles.statsRow}>
          {/* Rank Badge */}
          <View style={styles.rankBadge}>
            <Text style={styles.rankIcon}>🏅</Text>
            <Text style={styles.rankText}>{USER_STATS.rank}</Text>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleWrapper}>
              <View style={styles.progressCircle}>
                <View style={styles.progressCircleInner}>
                  <Text style={styles.progressPercentage}>
                    {USER_STATS.completionPercentage}%
                  </Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </View>
              {/* Progress Ring Background */}
              <View style={styles.progressRingBackground} />
            </View>
          </View>

          {/* Points */}
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsValue}>{USER_STATS.totalPoints}</Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </View>
        </View>

        {/* Achievement Count and Next Milestone */}
        <View style={styles.statsFooter}>
          <View style={styles.achievementCount}>
            <Text style={styles.countText}>
              {USER_STATS.unlockedCount}/{USER_STATS.totalAchievements} Unlocked
            </Text>
          </View>
          <View style={styles.milestoneContainer}>
            <Text style={styles.milestoneLabel}>Next:</Text>
            <Text style={styles.milestoneText}>{USER_STATS.nextMilestone}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search achievements..."
          placeholderTextColor={ProfessionalColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Category Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryTabIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredAchievements}
        renderItem={({ item, index }) => (
          <AchievementCard item={item} index={index} onPress={handleAchievementPress} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.achievementGrid}
        columnWrapperStyle={styles.achievementRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No achievements found</Text>
          </View>
        }
      />

      {/* Achievement Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <View
                  style={[
                    styles.modalIconContainer,
                    {
                      backgroundColor: `${selectedAchievement.color}20`,
                    },
                  ]}
                >
                  <Text style={styles.modalIcon}>{selectedAchievement.icon}</Text>
                </View>

                <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>

                {/* Rarity and Points */}
                <View style={styles.modalBadges}>
                  <View
                    style={[
                      styles.modalRarityBadge,
                      {
                        backgroundColor: `${RarityColors[selectedAchievement.rarity]}20`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalRarityText,
                        {
                          color: RarityColors[selectedAchievement.rarity],
                        },
                      ]}
                    >
                      {selectedAchievement.rarity.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.modalPointsBadge}>
                    <Text style={styles.modalPointsText}>
                      +{selectedAchievement.points} Points
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                {!selectedAchievement.earned && selectedAchievement.progress !== undefined && (
                  <View style={styles.modalProgress}>
                    <Text style={styles.modalProgressLabel}>Progress</Text>
                    <View style={styles.modalProgressBar}>
                      <View
                        style={[
                          styles.modalProgressFill,
                          {
                            width: `${selectedAchievement.progress}%`,
                            backgroundColor: RarityColors[selectedAchievement.rarity],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.modalProgressText}>
                      {selectedAchievement.progress}%
                    </Text>
                  </View>
                )}

                {/* Date Earned */}
                {selectedAchievement.earned && selectedAchievement.dateEarned && (
                  <View style={styles.modalDateContainer}>
                    <Text style={styles.modalDateLabel}>Earned on:</Text>
                    <Text style={styles.modalDate}>
                      {new Date(selectedAchievement.dateEarned).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {/* Requirements */}
                <View style={styles.modalRequirements}>
                  <Text style={styles.modalRequirementsTitle}>Requirements:</Text>
                  {selectedAchievement.requirements.map((req, index) => (
                    <View key={index} style={styles.modalRequirementItem}>
                      <Text style={styles.modalRequirementBullet}>•</Text>
                      <Text style={styles.modalRequirementText}>{req}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  {selectedAchievement.earned && (
                    <TouchableOpacity
                      style={styles.modalShareButton}
                      onPress={handleShare}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalShareButtonText}>Share</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  cardHeight: isTablet() ? 240 : isSmallDevice() ? 180 : 200,
  iconContainerSize: isTablet() ? 75 : isSmallDevice() ? 50 : 60,
  iconContainerRadius: isTablet() ? 37.5 : isSmallDevice() ? 25 : 30,
  achievementIconFont: isTablet() ? 40 : isSmallDevice() ? 28 : 32,
  earnedBadgeSize: isTablet() ? 24 : isSmallDevice() ? 18 : 20,
  earnedBadgeRadius: isTablet() ? 12 : isSmallDevice() ? 9 : 10,
  earnedBadgeTextFont: isTablet() ? 12 : isSmallDevice() ? 8 : 10,
  achievementTitleFont: isTablet() ? 16 : isSmallDevice() ? 12 : 14,
  achievementTitleMinHeight: isTablet() ? 44 : isSmallDevice() ? 32 : 36,
  achievementDescFont: isTablet() ? 13 : isSmallDevice() ? 10 : 11,
  achievementDescMinHeight: isTablet() ? 38 : isSmallDevice() ? 28 : 32,
  progressBarHeight: isTablet() ? 5 : isSmallDevice() ? 3 : 4,
  progressTextFont: isTablet() ? 12 : isSmallDevice() ? 8 : 10,
  rarityTextFont: isTablet() ? 10 : isSmallDevice() ? 7 : 8,
  pointsTextFont: isTablet() ? 12 : isSmallDevice() ? 8 : 10,
  lockedIconFont: isTablet() ? 30 : isSmallDevice() ? 20 : 24,
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
    backgroundColor: ProfessionalColors.background,
  },
  content: {
    flex: 1,
  },
  // Header Stats
  headerStats: {
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.md),
    marginTop: getSpacing(Spacing.md),
    marginHorizontal: responsiveValues.paddingH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
    borderRadius: scaleSize(BorderRadius.lg),
  },
  statsRow: {
    flexDirection: isSmallDevice() ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.md),
    gap: isSmallDevice() ? getSpacing(Spacing.md) : 0,
  },
  rankBadge: {
    alignItems: 'center',
    flex: 1,
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
  },
  progressCircleWrapper: {
    width: scaleSize(responsiveValues.progressCircleWrapperSize),
    height: scaleSize(responsiveValues.progressCircleWrapperSize),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    flexDirection: isSmallDevice() ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isSmallDevice() ? 'flex-start' : 'center',
    paddingTop: getSpacing(Spacing.md),
    borderTopWidth: 1,
    borderTopColor: ProfessionalColors.border,
    gap: isSmallDevice() ? getSpacing(Spacing.sm) : 0,
  },
  achievementCount: {
    flex: 1,
  },
  countText: {
    fontSize: scaleFont(responsiveValues.countTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  milestoneLabel: {
    fontSize: scaleFont(responsiveValues.milestoneLabelFont),
    color: ProfessionalColors.textSecondary,
    marginRight: getSpacing(Spacing.xs),
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
  },
  categoryTabActive: {
    backgroundColor: ProfessionalColors.primary,
    borderColor: ProfessionalColors.primary,
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
    paddingTop: getSafeAreaTopPadding() + getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.xl),
    paddingHorizontal: responsiveValues.paddingH,
    maxWidth: responsiveValues.cardMaxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  achievementRow: {
    justifyContent: 'space-between',
    marginBottom: getSpacing(Spacing.md),
  },
  achievementCard: {
    width: CARD_WIDTH,
    height: scaleSize(responsiveValues.cardHeight),
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  rarityGlow: {
    position: 'absolute',
    top: scaleSize(-20),
    right: scaleSize(-20),
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),
    opacity: 0.3,
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
    lineHeight: scaleSize(16),
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
  modalShareButton: {
    flex: 1,
    paddingVertical: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.primary,
    alignItems: 'center',
  },
  modalShareButtonText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.white,
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.background,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: scaleFont(responsiveValues.modalButtonTextFont),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
});

