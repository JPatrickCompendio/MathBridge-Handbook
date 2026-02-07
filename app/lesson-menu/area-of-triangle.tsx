import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
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
import { BorderRadius, Spacing } from '../../constants/colors';
import { MODULE_4_AREA_OF_TRIANGLE_SECTIONS } from '../../data/lessons/module4_area_of_triangle';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { getSpacing, scaleFont, scaleSize } from '../../utils/responsive';

const AREA_OF_TRIANGLE_TOPIC_ID = 4;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AREA_EXAMPLE_IMAGES: Record<string, number> = {
  'area-ex1': require('../../assets/images/area-ex1.png'),
  'area-ex2': require('../../assets/images/area-ex2.png'),
  'area-ex3': require('../../assets/images/area-ex3.png'),
  'area-ex4': require('../../assets/images/area-ex4.png'),
  'area-ex5': require('../../assets/images/area-ex5.png'),
};

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

function AccordionHeader({ title, isOpen, onPress }: { title: string; isOpen: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () => Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[styles.accordionHeader, { transform: [{ scale }] }]}>
        <Text style={styles.accordionTitle} numberOfLines={2}>{title}</Text>
        <Text style={[styles.accordionChevron, isOpen && styles.accordionChevronOpen]}>{isOpen ? '▼' : '▶'}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function AnimatedAccordionBody({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.accordionBody, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
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

export default function AreaOfTriangleLessonScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('I');

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  const sec = MODULE_4_AREA_OF_TRIANGLE_SECTIONS;
  const objectives = sec.learning_objectives || [];
  const whatIs = sec.what_is_area || {};
  const keyWords = sec.key_words || [];
  const procedure = sec.procedure || {};
  const procedureSteps = (procedure as { steps?: string[] }).steps || [];
  const procedureIntro = (procedure as { intro?: string }).intro || '';
  const workedExamples = sec.worked_examples || [];
  const lastSavedProgress = useRef(0);

  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number }; contentSize: { height: number }; layoutMeasurement: { height: number } } }) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    if (maxScroll <= 0) return;
    const percent = Math.min(100, Math.max(0, (contentOffset.y / maxScroll) * 100));
    if (percent - lastSavedProgress.current >= 5 || percent >= 100) {
      lastSavedProgress.current = percent;
      saveTopicContentProgress(AREA_OF_TRIANGLE_TOPIC_ID, percent);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Area of Triangles</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
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
                <Text style={styles.bodyTextCentered}>At the end of this lesson, the learners should be able to:</Text>
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

        {/* II. What Is the Area of a Triangle? */}
        <SectionFadeIn index={1}>
          <AccordionHeader
            title="II. What Is the Area of a Triangle?"
            isOpen={expandedSection === 'II'}
            onPress={() => toggle('II')}
          />
          {expandedSection === 'II' && (
            <AnimatedAccordionBody>
              <Text style={styles.paragraph}>{(whatIs as { definition?: string }).definition || ''}</Text>
              <Text style={styles.paragraph}>{(whatIs as { formula_intro?: string }).formula_intro || ''}</Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{(whatIs as { formula?: string }).formula || 'A = ½ b h'}</Text>
              </View>
              <Text style={styles.paragraph}>{(whatIs as { where?: string }).where || 'where:'}</Text>
              <View style={styles.bulletList}>
                {((whatIs as { where_bullets?: string[] }).where_bullets || []).map((line: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.paragraph}>{(whatIs as { reminder?: string }).reminder || ''}</Text>
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* III. Key Words and Concepts */}
        <SectionFadeIn index={2}>
          <AccordionHeader title="III. Key Words and Concepts" isOpen={expandedSection === 'III'} onPress={() => toggle('III')} />
          {expandedSection === 'III' && (
            <AnimatedAccordionBody>
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
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* IV. Procedure */}
        <SectionFadeIn index={3}>
          <AccordionHeader
            title="IV. Procedure: Steps in Solving Area of Triangle Problems"
            isOpen={expandedSection === 'IV'}
            onPress={() => toggle('IV')}
          />
          {expandedSection === 'IV' && (
            <AnimatedAccordionBody>
              {procedureIntro ? <Text style={styles.paragraph}>{procedureIntro}</Text> : null}
              <View style={styles.stepList}>
                {procedureSteps.map((step: string, idx: number) => (
                  <View key={idx} style={styles.stepRow}>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* V. Worked Examples */}
        <SectionFadeIn index={4}>
          <AccordionHeader
            title="V. Worked Examples with Step-by-Step Explanation"
            isOpen={expandedSection === 'V'}
            onPress={() => toggle('V')}
          />
          {expandedSection === 'V' && (
            <AnimatedAccordionBody>
              {workedExamples.map((ex: { title?: string; problem?: string; solution?: string[]; image?: string; conclusion?: string }, idx: number) => (
                <View key={idx} style={styles.exampleBlock}>
                  <Text style={styles.exampleTitle}>{ex.title || `Example ${idx + 1}`}</Text>
                  <Text style={styles.exampleProblem}>{ex.problem}</Text>
                  {ex.image && AREA_EXAMPLE_IMAGES[ex.image] != null && (
                    <View style={styles.diagramWrap}>
                      <Image source={AREA_EXAMPLE_IMAGES[ex.image]} style={styles.diagramImage} resizeMode="contain" />
                    </View>
                  )}
                  <View style={styles.solutionWrap}>
                    <Text style={styles.solutionLabel}>Solution:</Text>
                    {(ex.solution || []).map((line: string, i: number) => (
                      <Text key={i} style={styles.solutionLine}>{line}</Text>
                    ))}
                  </View>
                  {ex.conclusion != null && ex.conclusion !== '' && (
                    <Text style={styles.conclusionText}>Conclusion: {ex.conclusion}</Text>
                  )}
                </View>
              ))}
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>
      </ScrollView>
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
  section: { paddingHorizontal: getSpacing(Spacing.md), paddingVertical: getSpacing(Spacing.sm) },
  purposeSectionWrap: { alignSelf: 'stretch', alignItems: 'center' },
  staticSectionTitle: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    textAlign: 'center',
  },
  staticSectionContent: { marginBottom: getSpacing(Spacing.sm), width: '100%', maxWidth: scaleSize(520), alignItems: 'center' },
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
  purposeBlockHeading: { fontSize: scaleFont(15), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.sm), textAlign: 'center' },
  blockHeadingFirst: { marginTop: 0 },
  bodyTextCentered: { fontSize: scaleFont(15), color: Theme.text, lineHeight: scaleFont(24), marginBottom: getSpacing(Spacing.sm), textAlign: 'center' },
  objectiveList: { width: '100%' },
  objectiveRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: getSpacing(Spacing.xs) },
  objectiveBullet: { width: scaleSize(6), height: scaleSize(6), borderRadius: 3, backgroundColor: Theme.primary, marginTop: scaleFont(10), marginRight: getSpacing(Spacing.sm), flexShrink: 0 },
  objectiveItem: { flex: 1, fontSize: scaleFont(14), color: Theme.textSecondary, lineHeight: scaleFont(22) },
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
  accordionTitle: { fontSize: scaleFont(17), fontWeight: '700', color: Theme.text, flex: 1 },
  accordionChevron: { fontSize: scaleFont(12), color: Theme.primary, fontWeight: 'bold', marginLeft: getSpacing(Spacing.sm) },
  accordionChevronOpen: { opacity: 0.9 },
  accordionBody: {
    backgroundColor: Theme.card,
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
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
  paragraph: { fontSize: scaleFont(14), color: Theme.text, lineHeight: scaleFont(22), marginBottom: getSpacing(Spacing.sm) },
  formulaBox: { backgroundColor: Theme.muted, padding: getSpacing(Spacing.md), borderRadius: scaleSize(BorderRadius.sm), marginBottom: getSpacing(Spacing.sm), alignItems: 'center' },
  formulaText: { fontSize: scaleFont(16), fontWeight: '600', color: Theme.text },
  bulletList: { marginBottom: getSpacing(Spacing.sm) },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: getSpacing(Spacing.xs) },
  bulletDot: { fontSize: scaleFont(14), color: Theme.primary, marginRight: getSpacing(Spacing.sm) },
  bulletText: { flex: 1, fontSize: scaleFont(14), color: Theme.textSecondary, lineHeight: scaleFont(22) },
  keyWordsList: { marginBottom: getSpacing(Spacing.sm) },
  keyWordItem: { marginBottom: getSpacing(Spacing.md), paddingBottom: getSpacing(Spacing.sm), borderBottomWidth: 1, borderBottomColor: Theme.border },
  keyWordItemLast: { borderBottomWidth: 0 },
  keyWordTermRow: { flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing(Spacing.xs) },
  keyWordBullet: { fontSize: scaleFont(16), color: Theme.primary, marginRight: getSpacing(Spacing.sm) },
  keyWordTerm: { flex: 1, fontSize: scaleFont(15), fontWeight: '700', color: Theme.text },
  keyWordDefinition: { fontSize: scaleFont(14), color: Theme.textSecondary, lineHeight: scaleFont(22), marginLeft: scaleSize(24), marginBottom: getSpacing(Spacing.xs) },
  stepList: { marginTop: getSpacing(Spacing.xs) },
  stepRow: { marginBottom: getSpacing(Spacing.sm) },
  stepText: { fontSize: scaleFont(14), color: Theme.textSecondary, lineHeight: scaleFont(22) },
  exampleBlock: { marginBottom: getSpacing(Spacing.md), paddingBottom: getSpacing(Spacing.md), borderBottomWidth: 1, borderBottomColor: Theme.border },
  exampleTitle: { fontSize: scaleFont(15), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.sm) },
  exampleProblem: { fontSize: scaleFont(14), color: Theme.text, marginBottom: getSpacing(Spacing.sm), fontStyle: 'italic' },
  diagramWrap: { alignItems: 'center', marginVertical: getSpacing(Spacing.sm), width: '100%' },
  diagramImage: { width: '100%', maxWidth: scaleSize(400), height: scaleSize(220) },
  solutionWrap: { marginLeft: getSpacing(Spacing.sm), marginTop: getSpacing(Spacing.xs) },
  solutionLabel: { fontSize: scaleFont(14), fontWeight: '600', color: Theme.text, marginBottom: getSpacing(Spacing.xs) },
  solutionLine: { fontSize: scaleFont(13), color: Theme.textSecondary, lineHeight: scaleFont(20), marginBottom: getSpacing(Spacing.xs) },
  conclusionText: { fontSize: scaleFont(14), fontWeight: '600', color: Theme.primary, marginTop: getSpacing(Spacing.sm), marginLeft: getSpacing(Spacing.sm) },
});
