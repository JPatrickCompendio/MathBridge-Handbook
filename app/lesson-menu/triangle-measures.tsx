import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../constants/colors';
import { getSpacing, scaleFont, scaleSize } from '../../utils/responsive';

const Theme = {
  primary: '#FF6600',
  primaryLight: '#FF8533',
  white: '#FFFFFF',
  background: '#FFFBF7',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#5A5A6E',
  border: '#FFE5D9',
  cardShadow: 'rgba(255, 102, 0, 0.08)',
};

const TOPICS = [
  {
    key: 'similarity',
    letter: 'A',
    title: 'Triangle Similarities',
    desc: 'Similar triangles, corresponding parts, SAS, ASA, SSS',
    route: '/lesson-menu/triangle-similarity' as const,
  },
  {
    key: 'oblique',
    letter: 'B',
    title: 'Oblique Triangle',
    desc: 'Triangles without a right angle, Law of Sines & Cosines',
    route: '/lesson-menu/oblique-triangle' as const,
  },
];

export default function TriangleMeasuresHubScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Triangle Measures</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.heroLabel}>Lessons</Text>
          <Text style={styles.heroTitle}>Choose a topic</Text>
          <Text style={styles.heroSubtitle}>Tap a card below to open the lesson and start learning.</Text>
        </View>

        <View style={styles.cardsWrap}>
          {TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.key}
              style={styles.topicCard}
              onPress={() => router.push(topic.route as any)}
              activeOpacity={0.78}
            >
              <View style={styles.topicCardLeftBar} />
              <View style={styles.topicCardInner}>
                <View style={styles.topicCardBadge}>
                  <Text style={styles.topicCardBadgeText}>{topic.letter}</Text>
                </View>
                <View style={styles.topicCardContent}>
                  <Text style={styles.topicCardTitle}>{topic.title}</Text>
                  <Text style={styles.topicCardDesc}>{topic.desc}</Text>
                </View>
                <View style={styles.topicCardArrowWrap}>
                  <Text style={styles.topicCardArrow}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: Theme.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  android: { elevation: 4 },
  default: {},
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.md),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.card,
  },
  backButton: {
    marginRight: getSpacing(Spacing.sm),
    paddingVertical: getSpacing(Spacing.xs),
  },
  backButtonText: {
    fontSize: scaleFont(16),
    color: Theme.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: scaleFont(19),
    fontWeight: '700',
    color: Theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl) + 24,
  },
  heroBlock: {
    marginBottom: getSpacing(Spacing.xl),
    paddingHorizontal: getSpacing(Spacing.xs),
  },
  heroLabel: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: Theme.primary,
    letterSpacing: 0.8,
    marginBottom: getSpacing(Spacing.xs),
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: scaleFont(24),
    fontWeight: '800',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: scaleFont(15),
    color: Theme.textSecondary,
    lineHeight: scaleFont(22),
    maxWidth: 320,
  },
  cardsWrap: {},
  topicCard: {
    backgroundColor: Theme.card,
    borderRadius: scaleSize(16),
    overflow: 'hidden',
    minHeight: scaleSize(100),
    marginBottom: getSpacing(Spacing.md),
    borderWidth: 1,
    borderColor: Theme.border,
    ...cardShadow,
  },
  topicCardLeftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scaleSize(5),
    backgroundColor: Theme.primary,
  },
  topicCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.md),
    paddingLeft: getSpacing(Spacing.md) + scaleSize(5),
  },
  topicCardBadge: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.md),
  },
  topicCardBadgeText: {
    fontSize: scaleFont(16),
    fontWeight: '800',
    color: Theme.white,
  },
  topicCardContent: {
    flex: 1,
    minWidth: 0,
  },
  topicCardTitle: {
    fontSize: scaleFont(17),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  topicCardDesc: {
    fontSize: scaleFont(13),
    color: Theme.textSecondary,
    lineHeight: scaleFont(20),
  },
  topicCardArrowWrap: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
    backgroundColor: Theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: getSpacing(Spacing.sm),
  },
  topicCardArrow: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: Theme.primary,
  },
});
