import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../../constants/colors';
import { QUADRATIC_EQUATIONS_DATA } from '../../data/lessons/module1_quadratic';
import { getSpacing, scaleFont, scaleSize } from '../../utils/responsive';

const Theme = {
  primary: '#10B981',
  white: '#FFFFFF',
  background: '#F0FDF4',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  border: '#D1FAE5',
  accent: '#0EA5E9',
  success: '#10B981',
  methodColors: {
    factoring: { header: '#F59E0B', tip: '#FEF3C7', step: '#F59E0B' },
    extractingSquareRoots: { header: '#3B82F6', tip: '#DBEAFE', step: '#3B82F6' },
    completingSquare: { header: '#10B981', tip: '#D1FAE5', step: '#10B981' },
    quadraticFormula: { header: '#EC4899', tip: '#FCE7F3', step: '#EC4899' },
  },
};

export default function MethodDetailScreen() {
  const { methodId } = useLocalSearchParams<{ methodId: string }>();

  const getMethod = () => {
    switch (methodId) {
      case 'factoring':
        return QUADRATIC_EQUATIONS_DATA.methods.factoring;
      case 'extractingSquareRoots':
        return QUADRATIC_EQUATIONS_DATA.methods.extractingSquareRoots;
      case 'completingSquare':
        return QUADRATIC_EQUATIONS_DATA.methods.completingSquare;
      case 'quadraticFormula':
        return QUADRATIC_EQUATIONS_DATA.methods.quadraticFormula;
      default:
        return QUADRATIC_EQUATIONS_DATA.methods.factoring;
    }
  };

  const method = getMethod();
  const key = (methodId as keyof typeof Theme.methodColors) || 'factoring';
  const colors = Theme.methodColors[key] || Theme.methodColors.factoring;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Method header with accent */}
        <View style={[styles.header, { backgroundColor: colors.header }]}>
          <Text style={styles.headerTitle}>{method.name}</Text>
          <Text style={styles.headerSubtitle}>Step-by-step guide</Text>
        </View>

        {/* When to use - tip style */}
        <View style={styles.section}>
          <View style={[styles.tipCard, { backgroundColor: colors.tip, borderColor: colors.header + '40' }]}>
            <Text style={styles.tipLabel}>💡 When to use this method</Text>
            <Text style={styles.tipText}>{method.whenToUse}</Text>
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Steps</Text>
          {method.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={[styles.stepNumber, { backgroundColor: colors.step }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worked examples</Text>
          {method.examples.map((example, index) => (
            <View key={index} style={styles.exampleCard}>
              <View style={styles.exampleHeader}>
                <View style={[styles.exampleBadge, { backgroundColor: colors.step + '30' }]}>
                  <Text style={[styles.exampleBadgeText, { color: colors.step }]}>Example {index + 1}</Text>
                </View>
              </View>
              <View style={styles.exampleBlock}>
                <Text style={styles.exampleBlockLabel}>Problem</Text>
                <Text style={styles.exampleBlockContent}>{example.problem}</Text>
              </View>
              <View style={[styles.exampleBlock, styles.exampleSolutionBlock]}>
                <Text style={[styles.exampleBlockLabel, { color: Theme.success }]}>Solution</Text>
                <Text style={styles.exampleBlockContent}>{example.solution}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getSpacing(Spacing.xxl),
  },
  header: {
    paddingVertical: getSpacing(Spacing.xl),
    paddingHorizontal: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.lg),
  },
  headerTitle: {
    fontSize: scaleFont(26),
    fontWeight: '800',
    color: Theme.white,
    marginBottom: getSpacing(Spacing.xs),
  },
  headerSubtitle: {
    fontSize: scaleFont(14),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.lg),
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.md),
  },
  tipCard: {
    padding: getSpacing(Spacing.lg),
    borderRadius: scaleSize(BorderRadius.lg),
    borderLeftWidth: scaleSize(4),
  },
  tipLabel: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  tipText: {
    fontSize: scaleFont(15),
    color: Theme.textSecondary,
    lineHeight: scaleFont(23),
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.card,
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    marginBottom: getSpacing(Spacing.sm),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  stepNumber: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.md),
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: Theme.white,
  },
  stepText: {
    flex: 1,
    fontSize: scaleFont(15),
    color: Theme.textSecondary,
    lineHeight: scaleFont(23),
    marginTop: scaleSize(6),
  },
  exampleCard: {
    backgroundColor: Theme.card,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: scaleSize(6),
    elevation: 3,
  },
  exampleHeader: {
    marginBottom: getSpacing(Spacing.sm),
  },
  exampleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    borderRadius: scaleSize(BorderRadius.full),
  },
  exampleBadgeText: {
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  exampleBlock: {
    marginTop: getSpacing(Spacing.sm),
    padding: getSpacing(Spacing.md),
    backgroundColor: Theme.background,
    borderRadius: scaleSize(BorderRadius.md),
  },
  exampleSolutionBlock: {
    backgroundColor: Theme.success + '08',
    borderLeftWidth: 3,
    borderLeftColor: Theme.success,
  },
  exampleBlockLabel: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleBlockContent: {
    fontSize: scaleFont(15),
    color: Theme.textSecondary,
    lineHeight: scaleFont(23),
  },
});
