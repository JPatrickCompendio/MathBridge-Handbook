import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccordionRevealBody from '../../components/AccordionRevealBody';
import { BorderRadius, Spacing } from '../../constants/colors';
import { MODULE_5_VARIATION_SECTIONS } from '../../data/lessons/module5_variation';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { useAccordionReadingProgress } from '../../utils/useAccordionReadingProgress';
import { getSpacing, isWeb, scaleFont, scaleSize } from '../../utils/responsive';

const VARIATION_SECTION_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const VARIATION_TOPIC_ID = 5;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Theme = {
  primary: '#FF6600',
  white: '#FFFFFF',
  background: '#FFF8F5',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A6A',
  border: '#FFE5D9',
  accent: '#0EA5E9',
  muted: '#E8E4E0',
};

function AccordionHeader({ title, isOpen, onPress, icon }: { title: string; isOpen: boolean; onPress: () => void; icon?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () => Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[styles.accordionHeader, { transform: [{ scale }] }]}>
        {icon ? <Text style={styles.accordionIcon}>{icon}</Text> : null}
        <Text style={styles.accordionTitle} numberOfLines={2}>{title}</Text>
        <Text style={[styles.accordionChevron, isOpen && styles.accordionChevronOpen]}>{isOpen ? '▼' : '▶'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}


function SectionFadeIn({ index, children }: { index: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, index * 70);
    return () => clearTimeout(timer);
  }, [index]);
  return (
    <Animated.View style={[styles.section, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export default function VariationLessonScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('I');
  const [openedSections, setOpenedSections] = useState<Set<string>>(() => new Set(['I']));
  const { ReadingProgressIndicator } = useAccordionReadingProgress(
    VARIATION_TOPIC_ID,
    VARIATION_SECTION_KEYS.length,
    openedSections,
    saveTopicContentProgress
  );

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((prev) => {
      const next = prev === key ? null : key;
      if (next) setOpenedSections((s) => new Set(s).add(next));
      return next;
    });
  };

  const sec = MODULE_5_VARIATION_SECTIONS;
  const objectives = sec.learning_objectives || [];
  const whatIs = sec.what_is_variation || {};
  const keyWords = sec.key_words || [];
  const procedure = sec.procedure || {};
  const procedureSteps = (procedure as { steps?: string[] }).steps || [];
  const procedureIntro = (procedure as { intro?: string }).intro || '';
  const workedExamples = sec.worked_examples || [];
  const variationTypes = (whatIs as { types?: Array<{ name?: string; description?: string; formula?: string; where?: string; or_more?: string; example?: string }> }).types || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Variation</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isWeb() && styles.scrollContentWeb]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={200}
        >
        <View style={[styles.scrollInner, isWeb() && styles.scrollInnerWeb]}>
        {/* I. Purpose and Learning Objectives */}
        <SectionFadeIn index={0}>
          <View style={styles.purposeSectionWrap}>
            <Text style={styles.staticSectionTitle}>I. Purpose and Learning Objectives</Text>
            <View style={styles.staticSectionContent}>
              <View style={styles.purposeCard}>
                <Text style={[styles.purposeBlockHeading, styles.blockHeadingFirst]}>Purpose of the Module</Text>
                <Text style={styles.bodyTextCentered}>{sec.purpose || ''}</Text>
              </View>
              <View style={styles.purposeCard}>
                <Text style={styles.purposeBlockHeading}>Learning Objectives</Text>
                <Text style={styles.bodyTextCentered}>At the end of this lesson, learners should be able to:</Text>
                <View style={styles.objectiveList}>
                  {objectives.map((item, idx) => (
                    <View key={idx} style={styles.objectiveRow}>
                      <View style={styles.objectiveBullet} />
                      <Text style={styles.objectiveItem}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </SectionFadeIn>

        {/* II. What is Variation? */}
        <SectionFadeIn index={1}>
          <AccordionHeader
            title="II. Discussion: What is Variation?"
            isOpen={expandedSection === 'II'}
            onPress={() => toggle('II')}
            icon={isWeb() ? '📖' : undefined}
          />
          {expandedSection === 'II' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <Text style={styles.paragraph}>{(whatIs as { intro?: string }).intro || ''}</Text>
              {variationTypes.map((t: { name?: string; description?: string; formula?: string; where?: string; or_more?: string; example?: string }, idx: number) => (
                <View key={idx} style={styles.variationTypeCard}>
                  <Text style={styles.variationTypeName}>{t.name}</Text>
                  <Text style={styles.paragraph}>{t.description}</Text>
                  <Text style={styles.paragraph}>General form:</Text>
                  <View style={styles.formulaBox}>
                    <Text style={styles.formulaText}>{t.formula}</Text>
                  </View>
                  {t.where ? <Text style={styles.paragraph}>{t.where}</Text> : null}
                  {t.or_more ? <Text style={styles.paragraph}>{t.or_more}</Text> : null}
                  {t.example ? <Text style={styles.paragraph}>Example: {t.example}</Text> : null}
                </View>
              ))}
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* III. Key Words and Concepts */}
        <SectionFadeIn index={2}>
          <AccordionHeader title="III. Key Words and Concepts" isOpen={expandedSection === 'III'} onPress={() => toggle('III')} icon={isWeb() ? '📝' : undefined} />
          {expandedSection === 'III' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <View style={styles.keyWordsList}>
                {keyWords.map((item: { term?: string; definition?: string }, idx: number) => (
                  <View key={idx} style={[styles.keyWordItem, idx === keyWords.length - 1 && styles.keyWordItemLast]}>
                    <View style={styles.keyWordTermRow}>
                      <Text style={styles.keyWordBullet}>•</Text>
                      <Text style={styles.keyWordTerm}>{item.term}</Text>
                    </View>
                    <Text style={styles.keyWordDefinition}>{item.definition}</Text>
                  </View>
                ))}
              </View>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* IV. Procedure */}
        <SectionFadeIn index={3}>
          <AccordionHeader
            title="IV. Standard Steps in Solving ANY Variation Problem"
            isOpen={expandedSection === 'IV'}
            onPress={() => toggle('IV')}
            icon={isWeb() ? '📐' : undefined}
          />
          {expandedSection === 'IV' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              {procedureIntro ? (
                <View style={styles.procedureIntroBox}>
                  <Text style={styles.procedureIntroText}>{procedureIntro}</Text>
                </View>
              ) : null}
              <View style={styles.stepList}>
                {procedureSteps.map((step: string, idx: number) => (
                  <View key={idx} style={[styles.stepCard, idx === procedureSteps.length - 1 && styles.stepCardLast]}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.stepCardText}>{step}</Text>
                  </View>
                ))}
              </View>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* V. Worked Examples */}
        <SectionFadeIn index={4}>
          <AccordionHeader
            title="V. Worked Examples"
            isOpen={expandedSection === 'V'}
            onPress={() => toggle('V')}
            icon={isWeb() ? '💡' : undefined}
          />
          {expandedSection === 'V' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              {workedExamples.map((ex: { title?: string; problem?: string; solution?: string[] }, idx: number) => (
                <View key={idx} style={styles.exampleBlock}>
                  <Text style={styles.exampleTitle}>{ex.title || `Example ${idx + 1}`}</Text>
                  <Text style={styles.exampleProblem}>{ex.problem}</Text>
                  <View style={styles.solutionWrap}>
                    <Text style={styles.solutionLabel}>Solution:</Text>
                    {(ex.solution || []).map((line: string, i: number) => (
                      <Text key={i} style={styles.solutionLine}>{line}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* Video: Variation */}
        <SectionFadeIn index={5}>
          <View style={styles.topicVideoWrap}>
            <Text style={styles.topicVideoLabel}>Video: Variation</Text>
            <View style={styles.topicVideoContainer}>
              <Video
                source={require('../../assets/images/videos/M5arjay.mp4')}
                style={styles.topicVideo}
                useNativeControls
                resizeMode={Video.RESIZE_MODE_CONTAIN}
                shouldPlay={false}
                isLooping={false}
              />
            </View>
          </View>
        </SectionFadeIn>
        </View>
        </ScrollView>
        <ReadingProgressIndicator />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.card,
  },
  backButton: { marginRight: getSpacing(Spacing.sm) },
  backButtonText: { fontSize: scaleFont(16), color: Theme.primary, fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: scaleFont(18), fontWeight: '700', color: Theme.text },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: getSpacing(Spacing.xxl) },
  scrollContentWeb: { alignItems: 'center' },
  scrollInner: { width: '100%' },
  scrollInnerWeb: { maxWidth: 1200, alignSelf: 'center' },
  topicVideoWrap: {
    marginTop: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
  },
  topicVideoLabel: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  topicVideoContainer: {
    width: '100%',
    borderRadius: scaleSize(BorderRadius.lg),
    overflow: 'hidden',
    backgroundColor: Theme.muted,
  },
  topicVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: scaleSize(200),
  },
  section: { paddingHorizontal: getSpacing(Spacing.md), paddingVertical: getSpacing(Spacing.sm) },
  purposeSectionWrap: { alignSelf: 'stretch', alignItems: 'center' },
  staticSectionTitle: {
    fontSize: scaleFont(isWeb() ? 22 : 18),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    textAlign: 'center',
  },
  staticSectionContent: { marginBottom: getSpacing(Spacing.sm), width: '100%', maxWidth: scaleSize(isWeb() ? 1100 : 520), alignItems: 'center' },
  purposeCard: {
    width: '100%',
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.md),
    borderWidth: 1,
    borderColor: Theme.border,
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: scaleSize(6),
    elevation: 2,
  },
  purposeBlockHeading: { fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.sm), textAlign: 'center' },
  blockHeadingFirst: { marginTop: 0 },
  bodyTextCentered: { fontSize: scaleFont(isWeb() ? 18 : 15), color: Theme.text, lineHeight: scaleFont(isWeb() ? 28 : 24), marginBottom: getSpacing(Spacing.sm), textAlign: 'center' },
  objectiveList: { width: '100%' },
  objectiveRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: getSpacing(Spacing.xs) },
  objectiveBullet: { width: scaleSize(6), height: scaleSize(6), borderRadius: 3, backgroundColor: Theme.primary, marginTop: scaleFont(10), marginRight: getSpacing(Spacing.sm), flexShrink: 0 },
  objectiveItem: { flex: 1, fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22) },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.card,
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.lg),
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  accordionTitle: { fontSize: scaleFont(isWeb() ? 19 : 17), fontWeight: '700', color: Theme.text, flex: 1 },
  accordionIcon: { fontSize: scaleFont(22), marginRight: getSpacing(Spacing.sm) },
  accordionChevron: { fontSize: scaleFont(12), color: Theme.primary, fontWeight: 'bold', marginLeft: getSpacing(Spacing.sm) },
  accordionChevronOpen: { opacity: 0.9 },
  accordionBody: {
    backgroundColor: Theme.card,
    width: '100%',
    minWidth: 0,
    paddingHorizontal: getSpacing(isWeb() ? Spacing.xl : Spacing.md),
    paddingVertical: getSpacing(isWeb() ? Spacing.md : Spacing.sm),
    paddingBottom: getSpacing(Spacing.md),
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Theme.border,
    borderBottomLeftRadius: scaleSize(BorderRadius.lg),
    borderBottomRightRadius: scaleSize(BorderRadius.lg),
    marginBottom: getSpacing(Spacing.sm),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(4),
    elevation: 2,
  },
  accordionBodyWeb: { borderLeftWidth: 4, borderLeftColor: Theme.primary, backgroundColor: '#FFFCFA' },
  paragraph: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.text, lineHeight: scaleFont(isWeb() ? 26 : 22), marginBottom: getSpacing(Spacing.sm) },
  variationTypeCard: {
    backgroundColor: Theme.muted,
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.sm),
    marginBottom: getSpacing(Spacing.md),
  },
  variationTypeName: { fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.xs) },
  formulaBox: { backgroundColor: Theme.card, padding: getSpacing(Spacing.sm), borderRadius: scaleSize(BorderRadius.sm), marginBottom: getSpacing(Spacing.sm), alignItems: 'center' },
  formulaText: { fontSize: scaleFont(isWeb() ? 19 : 16), fontWeight: '600', color: Theme.text },
  keyWordsList: { marginBottom: getSpacing(Spacing.sm), width: '100%' },
  keyWordItem: { marginBottom: getSpacing(Spacing.md), paddingBottom: getSpacing(Spacing.sm), borderBottomWidth: 1, borderBottomColor: Theme.border, width: '100%', minWidth: 0 },
  keyWordItemLast: { borderBottomWidth: 0 },
  keyWordTermRow: { flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing(Spacing.xs), flexWrap: 'wrap' },
  keyWordBullet: { fontSize: scaleFont(isWeb() ? 18 : 16), color: Theme.primary, marginRight: getSpacing(Spacing.sm) },
  keyWordTerm: { flex: 1, minWidth: 0, fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '700', color: Theme.text },
  keyWordDefinition: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22), marginLeft: scaleSize(24), marginBottom: getSpacing(Spacing.xs) },
  procedureIntroBox: {
    backgroundColor: Theme.muted,
    borderRadius: scaleSize(BorderRadius.sm),
    padding: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.md),
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.primary,
  },
  procedureIntroText: { fontSize: scaleFont(isWeb() ? 18 : 15), color: Theme.text, lineHeight: scaleFont(isWeb() ? 28 : 24), fontWeight: '500' },
  stepList: { marginTop: getSpacing(Spacing.xs) },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.sm),
    padding: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.sm),
    borderWidth: 1,
    borderColor: Theme.border,
    borderLeftWidth: scaleSize(4),
    borderLeftColor: Theme.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: scaleSize(3),
    elevation: 1,
  },
  stepCardLast: {
    borderLeftColor: Theme.primary,
    backgroundColor: Theme.background,
  },
  stepNumberBadge: {
    width: scaleSize(28),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(Spacing.sm),
    flexShrink: 0,
  },
  stepNumberText: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.white },
  stepCardText: { flex: 1, fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.text, lineHeight: scaleFont(isWeb() ? 26 : 22), marginTop: scaleFont(2) },
  stepRow: { marginBottom: getSpacing(Spacing.sm) },
  stepText: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22) },
  exampleBlock: { marginBottom: getSpacing(Spacing.md), paddingBottom: getSpacing(Spacing.md), borderBottomWidth: 1, borderBottomColor: Theme.border },
  exampleTitle: { fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.sm) },
  exampleProblem: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.text, marginBottom: getSpacing(Spacing.sm), fontStyle: 'italic' },
  solutionWrap: { marginLeft: getSpacing(Spacing.sm), marginTop: getSpacing(Spacing.xs) },
  solutionLabel: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '600', color: Theme.text, marginBottom: getSpacing(Spacing.xs) },
  solutionLine: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 25 : 20), marginBottom: getSpacing(Spacing.xs) },
});
