import { Video, ResizeMode } from 'expo-av';
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
import { MODULE_2_SECTIONS } from '../../data/lessons/module2_triangle_triples';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { useAccordionReadingProgress } from '../../utils/useAccordionReadingProgress';
import { getSpacing, isWeb, scaleFont, scaleSize } from '../../utils/responsive';
import { getVideoSource } from '../../utils/videoCatalog';

const PYTHAGOREAN_SECTION_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const PYTHAGOREAN_TOPIC_ID = 2;

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
  success: '#10B981',
  muted: '#E8E4E0',
};

function AccordionHeader({
  title,
  isOpen,
  onPress,
  icon,
}: {
  title: string;
  isOpen: boolean;
  onPress: () => void;
  icon?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start();
  const onPressOut = () => Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  return (
    <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
      <Animated.View style={[styles.accordionHeader, { transform: [{ scale }] }]}>
        {icon ? <Text style={styles.accordionIcon}>{icon}</Text> : null}
        <Text style={styles.accordionTitle} numberOfLines={2}>{title}</Text>
        <Text style={[styles.accordionChevron, isOpen && styles.accordionChevronOpen]}>
          {isOpen ? '▼' : '▶'}
        </Text>
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
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
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

export default function PythagoreanTriplesLessonScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('I');
  const [openedSections, setOpenedSections] = useState<Set<string>>(() => new Set(['I']));
  const { ReadingProgressIndicator } = useAccordionReadingProgress(
    PYTHAGOREAN_TOPIC_ID,
    PYTHAGOREAN_SECTION_KEYS.length,
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

  const sec = MODULE_2_SECTIONS;
  const objectives = sec.learning_objectives || [];
  const theorem = sec.theorem || { statement: '', formula: '' };
  const sectionII = sec.section_ii_theorem_and_triples;
  const sectionIII = sec.section_iii_key_words;
  const keyWordTerms = (sectionIII && sectionIII.terms) || [];
  const keywords = sec.keywords || [];
  const sectionIV = sec.section_iv_procedure;
  const procedureSteps = (sectionIV && sectionIV.steps) || sec.procedure_steps || [];
  const procedureIntro = sectionIV && sectionIV.intro;
  const steps = sec.procedure_steps || [];
  const workedExamples = sec.section_v_worked_examples || [];
  const examples = sec.examples || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Triangle Triples</Text>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, isWeb() && styles.scrollContentWeb]}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.scrollInner, isWeb() && styles.scrollInnerWeb]}>
        {/* I. Purpose and Learning Objectives */}
        <SectionFadeIn index={0}>
          <View style={styles.purposeSectionWrap}>
            <Text style={styles.staticSectionTitle}>I. Purpose and Learning Objectives</Text>
            <View style={styles.staticSectionContent}>
              <View style={styles.purposeCard}>
                <Text style={[styles.purposeBlockHeading, styles.blockHeadingFirst]}>Purpose</Text>
                <Text style={styles.bodyTextCentered}>{sec.purpose || ''}</Text>
              </View>
              <View style={styles.purposeCard}>
                <Text style={styles.purposeBlockHeading}>Learning objectives</Text>
                <Text style={styles.bodyTextCentered}>
                  At the end of this lesson, the learners should be able to:
                </Text>
                <View style={styles.objectiveList}>
                  {objectives.map((item: string, idx: number) => (
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

        {/* II. The Pythagorean Theorem and Pythagorean Triples */}
        <SectionFadeIn index={1}>
          <AccordionHeader
            title="II. The Pythagorean Theorem and Pythagorean Triples"
            isOpen={expandedSection === 'II'}
            onPress={() => toggle('II')}
            icon={isWeb() ? '📐' : undefined}
          />
          {expandedSection === 'II' && sectionII && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <View style={styles.theoremCard}>
                <Text style={styles.sectionIIParagraph}>{sectionII.theorem_definition}</Text>
                <View style={styles.formulaBlock}>
                  <Text style={styles.formulaText}>{sectionII.formula}</Text>
                </View>
                <Text style={styles.sectionIIParagraph}>{sectionII.theorem_application}</Text>
              </View>
              <View style={styles.sectionIISubsection}>
                <Text style={styles.sectionIISubheading}>From Theorem to Triples</Text>
                <Text style={styles.sectionIIParagraph}>{sectionII.from_theorem_intro}</Text>
                <View style={styles.exampleTripleBox}>
                  <Text style={styles.exampleTripleLabel}>Example of Pythagorean Triples:</Text>
                  <Text style={styles.exampleTripleSet}>{sectionII.example_triple_set}</Text>
                  <Text style={styles.sectionIIParagraph}>{sectionII.example_triple_explanation}</Text>
                </View>
                <Text style={styles.sectionIIParagraph}>{sectionII.connection}</Text>
                <Text style={styles.sectionIIParagraph}>{sectionII.definition}</Text>
                <View style={styles.formulaBlock}>
                  <Text style={styles.formulaText}>{sectionII.formula_repeat}</Text>
                </View>
                <Text style={styles.sectionIIWhereIntro}>{sectionII.where_intro}</Text>
                <View style={styles.whereBulletList}>
                  {(sectionII.where_bullets || []).map((bullet: string, idx: number) => (
                    <View key={idx} style={styles.whereBulletRow}>
                      <Text style={styles.whereBulletDot}>•</Text>
                      <Text style={styles.whereBulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.sectionIIParagraph, styles.sectionIIConclusion]}>{sectionII.conclusion}</Text>
              </View>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* III. Key Words and Concepts */}
        <SectionFadeIn index={2}>
          <AccordionHeader
            title="III. Key Words and Concepts"
            isOpen={expandedSection === 'III'}
            onPress={() => toggle('III')}
            icon={isWeb() ? '📝' : undefined}
          />
          {expandedSection === 'III' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <View style={styles.keyWordsList}>
                {keyWordTerms.map((item: { term?: string; definition?: string; subterms?: Array<{ term?: string; definition?: string; detail?: string; example?: string }> }, idx: number) => (
                  <View key={idx} style={[styles.keyWordItem, idx === keyWordTerms.length - 1 && styles.keyWordItemLast]}>
                    <View style={styles.keyWordTermRow}>
                      <Text style={styles.keyWordBullet}>•</Text>
                      <Text style={styles.keyWordTerm}>{item.term}</Text>
                    </View>
                    <Text style={styles.keyWordDefinition}>{item.definition}</Text>
                    {(item.subterms || []).map((sub: { term?: string; definition?: string; detail?: string; example?: string }, subIdx: number) => (
                      <View key={subIdx} style={styles.keyWordSubterm}>
                        <View style={styles.keyWordTermRow}>
                          <Text style={styles.keyWordSubBullet}>◦</Text>
                          <Text style={styles.keyWordSubTerm}>{sub.term}</Text>
                        </View>
                        <Text style={styles.keyWordDefinition}>{sub.definition}</Text>
                        {sub.detail ? <Text style={styles.keyWordDetail}>{sub.detail}</Text> : null}
                        {sub.example ? <Text style={styles.keyWordExample}>{sub.example}</Text> : null}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* IV. Procedure: Steps in Identifying a Triangle Triple */}
        <SectionFadeIn index={3}>
          <AccordionHeader
            title="IV. Procedure: Steps in Identifying a Triangle Triple"
            isOpen={expandedSection === 'IV'}
            onPress={() => toggle('IV')}
            icon={isWeb() ? '📋' : undefined}
          />
          {expandedSection === 'IV' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              {procedureIntro ? (
                <Text style={styles.procedureIntroText}>{procedureIntro}</Text>
              ) : null}
              <View style={styles.stepByStepList}>
                {(Array.isArray(procedureSteps) && procedureSteps.length > 0 && typeof procedureSteps[0] === 'object' && procedureSteps[0] !== null && 'title' in procedureSteps[0])
                  ? (procedureSteps as Array<{ title?: string; detail?: string; details?: string[]; formula?: string; expression?: string; conditions?: string[] }>).map((step, idx) => (
                    <View key={idx} style={styles.procedureStepCard}>
                      <View style={styles.stepByStepRow}>
                        <View style={styles.stepByStepNum}>
                          <Text style={styles.stepByStepNumText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepByStepTitle}>{step.title}</Text>
                      </View>
                      {step.detail ? <Text style={styles.procedureStepDetail}>{step.detail}</Text> : null}
                      {(step.details || []).map((line, i) => (
                        <Text key={i} style={styles.procedureStepBullet}>• {line}</Text>
                      ))}
                      {step.formula ? (
                        <View style={styles.procedureFormulaWrap}>
                          <Text style={styles.procedureFormulaText}>{step.formula}</Text>
                        </View>
                      ) : null}
                      {step.expression ? <Text style={styles.procedureExpression}>{step.expression}</Text> : null}
                      {(step.conditions || []).map((cond, i) => (
                        <Text key={i} style={styles.procedureCondition}>{cond}</Text>
                      ))}
                    </View>
                  ))
                  : steps.map((step: string, idx: number) => (
                    <View key={idx} style={styles.stepByStepRow}>
                      <View style={styles.stepByStepNum}>
                        <Text style={styles.stepByStepNumText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepByStepText}>{step}</Text>
                    </View>
                  ))}
              </View>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* V. Worked Examples with Step-by-Step Explanation */}
        <SectionFadeIn index={4}>
          <AccordionHeader
            title="V. Worked Examples with Step-by-Step Explanation"
            isOpen={expandedSection === 'V'}
            onPress={() => toggle('V')}
            icon={isWeb() ? '💡' : undefined}
          />
          {expandedSection === 'V' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              {workedExamples.length > 0 ? (
                <>
                  {workedExamples.map((ex: { exampleNum?: number; problem?: string; steps?: Array<{ label?: string; text?: string; formula?: string; substitution?: string }>; extra?: string; conclusion?: string }, idx: number) => (
                    <View key={idx} style={styles.workedExampleCard}>
                      <Text style={styles.workedExampleTitle}>Example {ex.exampleNum ?? idx + 1}</Text>
                      <Text style={styles.workedExampleProblem}>{ex.problem}</Text>
                      <View style={styles.workedExampleSteps}>
                        {(ex.steps || []).map((step: { label?: string; text?: string; formula?: string; substitution?: string }, stepIdx: number) => (
                          <View key={stepIdx} style={styles.workedExampleStepRow}>
                            <Text style={styles.workedExampleStepLabel}>Step {stepIdx + 1}: {step.label}</Text>
                            {step.text ? <Text style={styles.workedExampleStepText}>{step.text}</Text> : null}
                            {step.formula ? <Text style={styles.workedExampleFormula}>{step.formula}</Text> : null}
                            {step.substitution ? <Text style={styles.workedExampleSubstitution}>{step.substitution}</Text> : null}
                          </View>
                        ))}
                      </View>
                      {ex.extra ? <Text style={styles.workedExampleExtra}>{ex.extra}</Text> : null}
                      <View style={styles.workedExampleConclusionWrap}>
                        <Text style={styles.workedExampleConclusion}>{ex.conclusion}</Text>
                      </View>
                    </View>
                  ))}
                  {examples.length > 0 ? (
                    <>
                      <Text style={styles.workedExamplesTableHeading}>Quick reference</Text>
                      <View style={styles.examplesTable}>
                        <View style={styles.examplesHeaderRow}>
                          <Text style={[styles.examplesCell, styles.examplesHeader, styles.examplesColSet]}>Set</Text>
                          <Text style={[styles.examplesCell, styles.examplesHeader, styles.examplesColResult]}>Result</Text>
                        </View>
                        {examples.map((ex: { set?: string; result?: string }, exIdx: number) => (
                          <View key={exIdx} style={styles.examplesDataRow}>
                            <Text style={[styles.examplesCell, styles.examplesColSet]}>{ex.set ?? ''}</Text>
                            <Text style={[styles.examplesCell, styles.examplesColResult]}>{ex.result ?? ''}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  ) : null}
                </>
              ) : (
                <View style={styles.examplesTable}>
                  <View style={styles.examplesHeaderRow}>
                    <Text style={[styles.examplesCell, styles.examplesHeader, styles.examplesColSet]}>Set</Text>
                    <Text style={[styles.examplesCell, styles.examplesHeader, styles.examplesColResult]}>Result</Text>
                  </View>
                  {examples.map((ex: { set?: string; result?: string }, idx: number) => (
                    <View key={idx} style={styles.examplesDataRow}>
                      <Text style={[styles.examplesCell, styles.examplesColSet]}>{ex.set ?? ''}</Text>
                      <Text style={[styles.examplesCell, styles.examplesColResult]}>{ex.result ?? ''}</Text>
                    </View>
                  ))}
                </View>
              )}
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* Video: Triangle Triples */}
        <SectionFadeIn index={5}>
          <View style={styles.topicVideoWrap}>
            <Text style={styles.topicVideoLabel}>Video: Triangle Triples</Text>
            <View style={styles.topicVideoContainer}>
              <View style={styles.topicVideoInner}>
                <Video
                  source={getVideoSource('M2TriangleTriples')}
                  style={styles.topicVideo}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isLooping={false}
                />
              </View>
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
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    backgroundColor: Theme.card,
  },
  backButton: {
    marginRight: getSpacing(Spacing.sm),
  },
  backButtonText: {
    fontSize: scaleFont(16),
    color: Theme.primary,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: Theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getSpacing(Spacing.xxl),
  },
  scrollContentWeb: {
    alignItems: 'center',
  },
  scrollInner: {
    width: '100%',
  },
  scrollInnerWeb: {
    maxWidth: 1200,
    alignSelf: 'center',
  },
  topicVideoWrap: {
    marginTop: getSpacing(Spacing.lg),
    marginBottom: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    alignItems: 'center',
  },
  topicVideoLabel: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  topicVideoContainer: {
    width: '100%',
    maxWidth: 720,
    aspectRatio: 16 / 9,
    minHeight: scaleSize(200),
    borderRadius: scaleSize(BorderRadius.lg),
    overflow: 'hidden',
    backgroundColor: Theme.muted,
    position: 'relative',
  },
  topicVideoInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  topicVideo: {
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
  },
  purposeSectionWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  staticSectionTitle: {
    fontSize: scaleFont(isWeb() ? 22 : 18),
    fontWeight: '700',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.xs),
    textAlign: 'center',
  },
  staticSectionContent: {
    marginBottom: getSpacing(Spacing.sm),
    width: '100%',
    maxWidth: scaleSize(isWeb() ? 1100 : 520),
    alignItems: 'center',
  },
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
  purposeBlockHeading: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  blockHeadingFirst: {
    marginTop: 0,
  },
  bodyTextCentered: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 28 : 24),
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  objectiveList: {
    width: '100%',
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.xs),
  },
  objectiveBullet: {
    width: scaleSize(6),
    height: scaleSize(6),
    borderRadius: 3,
    backgroundColor: Theme.primary,
    marginTop: scaleFont(10),
    marginRight: getSpacing(Spacing.sm),
    flexShrink: 0,
  },
  objectiveItem: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
  },
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
  accordionTitle: {
    fontSize: scaleFont(isWeb() ? 19 : 17),
    fontWeight: '700',
    color: Theme.text,
    flex: 1,
  },
  accordionChevron: {
    fontSize: scaleFont(12),
    color: Theme.primary,
    fontWeight: 'bold',
    marginLeft: getSpacing(Spacing.sm),
  },
  accordionChevronOpen: {
    opacity: 0.9,
  },
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
  accordionBodyWeb: {
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
    backgroundColor: '#FFFCFA',
  },
  accordionIcon: {
    fontSize: scaleFont(22),
    marginRight: getSpacing(Spacing.sm),
  },
  theoremCard: {
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.md),
    padding: getSpacing(Spacing.lg),
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
    marginBottom: getSpacing(Spacing.sm),
  },
  theoremStatement: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 28 : 24),
    marginBottom: getSpacing(Spacing.md),
  },
  sectionIIParagraph: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginBottom: getSpacing(Spacing.sm),
  },
  sectionIISubsection: {
    marginTop: getSpacing(Spacing.md),
    paddingTop: getSpacing(Spacing.md),
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  sectionIISubheading: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.sm),
  },
  exampleTripleBox: {
    backgroundColor: Theme.muted,
    padding: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.sm),
    marginVertical: getSpacing(Spacing.sm),
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
  },
  exampleTripleLabel: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    fontWeight: '600',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  exampleTripleSet: {
    fontSize: scaleFont(isWeb() ? 19 : 16),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  sectionIIWhereIntro: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '600',
    color: Theme.text,
    marginTop: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.xs),
  },
  whereBulletList: {
    marginBottom: getSpacing(Spacing.sm),
  },
  whereBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.xs),
  },
  whereBulletDot: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.primary,
    marginRight: getSpacing(Spacing.sm),
  },
  whereBulletText: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
  },
  sectionIIConclusion: {
    marginTop: getSpacing(Spacing.sm),
    fontWeight: '600',
  },
  formulaBlock: {
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.sm),
  },
  formulaText: {
    fontSize: scaleFont(isWeb() ? 24 : 20),
    fontWeight: '800',
    color: Theme.primary,
  },
  keywordsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getSpacing(Spacing.sm),
  },
  conceptChip: {
    backgroundColor: Theme.muted,
    paddingHorizontal: getSpacing(Spacing.md),
    paddingVertical: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.full),
    borderWidth: 1,
    borderColor: Theme.border,
  },
  conceptChipText: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.text,
    fontWeight: '500',
  },
  keyWordsList: {
    marginBottom: getSpacing(Spacing.sm),
    width: '100%',
  },
  keyWordItem: {
    marginBottom: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.sm),
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
    width: '100%',
    minWidth: 0,
  },
  keyWordItemLast: {
    borderBottomWidth: 0,
  },
  keyWordTermRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xs),
    flexWrap: 'wrap',
  },
  keyWordBullet: {
    fontSize: scaleFont(16),
    color: Theme.primary,
    marginRight: getSpacing(Spacing.sm),
  },
  keyWordTerm: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.text,
    flex: 1,
    minWidth: 0,
  },
  keyWordDefinition: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginLeft: scaleSize(24),
    marginBottom: getSpacing(Spacing.xs),
  },
  keyWordSubterm: {
    marginLeft: getSpacing(Spacing.md),
    marginTop: getSpacing(Spacing.sm),
    paddingLeft: getSpacing(Spacing.sm),
    borderLeftWidth: 3,
    borderLeftColor: Theme.border,
  },
  keyWordSubBullet: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.primary,
    marginRight: getSpacing(Spacing.sm),
  },
  keyWordSubTerm: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '600',
    color: Theme.text,
    flex: 1,
    minWidth: 0,
  },
  keyWordDetail: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 24 : 20),
    marginLeft: scaleSize(24),
    marginTop: getSpacing(Spacing.xs),
    fontStyle: 'italic',
  },
  keyWordExample: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.primary,
    fontWeight: '600',
    marginLeft: scaleSize(24),
    marginTop: getSpacing(Spacing.xs),
  },
  stepByStepList: {
    marginBottom: getSpacing(Spacing.sm),
  },
  stepByStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.md),
  },
  stepByStepNum: {
    width: scaleSize(isWeb() ? 36 : 28),
    height: scaleSize(isWeb() ? 36 : 28),
    borderRadius: scaleSize(isWeb() ? 18 : 14),
    backgroundColor: Theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.sm),
    flexShrink: 0,
  },
  stepByStepNumText: {
    fontSize: scaleFont(isWeb() ? 18 : 14),
    fontWeight: '800',
    color: Theme.white,
  },
  stepByStepText: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
  },
  stepByStepTitle: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.text,
  },
  procedureIntroText: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginBottom: getSpacing(Spacing.md),
  },
  procedureStepCard: {
    marginBottom: getSpacing(Spacing.md),
  },
  procedureStepDetail: {
    fontSize: scaleFont(isWeb() ? 16 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginLeft: scaleSize(isWeb() ? 44 : 36),
    marginTop: getSpacing(Spacing.xs),
  },
  procedureStepBullet: {
    fontSize: scaleFont(isWeb() ? 16 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginLeft: scaleSize(isWeb() ? 44 : 36),
    marginTop: getSpacing(Spacing.xs),
  },
  procedureFormulaWrap: {
    marginLeft: scaleSize(isWeb() ? 44 : 36),
    marginTop: getSpacing(Spacing.sm),
    paddingVertical: getSpacing(Spacing.xs),
  },
  procedureFormulaText: {
    fontSize: scaleFont(isWeb() ? 22 : 18),
    fontWeight: '800',
    color: Theme.primary,
  },
  procedureExpression: {
    fontSize: scaleFont(isWeb() ? 17 : 15),
    fontWeight: '600',
    color: Theme.text,
    marginLeft: scaleSize(isWeb() ? 44 : 36),
    marginTop: getSpacing(Spacing.xs),
  },
  procedureCondition: {
    fontSize: scaleFont(isWeb() ? 16 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginLeft: scaleSize(isWeb() ? 44 : 36),
    marginTop: getSpacing(Spacing.xs),
  },
  workedExampleCard: {
    backgroundColor: Theme.white,
    borderRadius: scaleSize(BorderRadius.md),
    padding: getSpacing(Spacing.md),
    marginBottom: getSpacing(Spacing.lg),
    borderWidth: 1,
    borderColor: Theme.border,
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
  },
  workedExampleTitle: {
    fontSize: scaleFont(isWeb() ? 19 : 16),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  workedExampleProblem: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '600',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  workedExampleSteps: {
    marginBottom: getSpacing(Spacing.sm),
  },
  workedExampleStepRow: {
    marginBottom: getSpacing(Spacing.sm),
  },
  workedExampleStepLabel: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    fontWeight: '600',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  workedExampleStepText: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 21),
    marginLeft: getSpacing(Spacing.sm),
  },
  workedExampleFormula: {
    fontSize: scaleFont(isWeb() ? 19 : 16),
    fontWeight: '700',
    color: Theme.primary,
    marginLeft: getSpacing(Spacing.sm),
    marginTop: getSpacing(Spacing.xs),
  },
  workedExampleSubstitution: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    marginLeft: getSpacing(Spacing.sm),
    marginTop: getSpacing(Spacing.xs),
  },
  workedExampleExtra: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    fontStyle: 'italic',
    marginBottom: getSpacing(Spacing.sm),
    lineHeight: scaleFont(isWeb() ? 24 : 20),
  },
  workedExampleConclusionWrap: {
    paddingTop: getSpacing(Spacing.sm),
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  workedExampleConclusion: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '600',
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
  },
  workedExamplesTableHeading: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.text,
    marginTop: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.sm),
  },
  examplesTable: {
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: scaleSize(BorderRadius.sm),
    overflow: 'hidden',
  },
  examplesHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Theme.primary,
  },
  examplesDataRow: {
    flexDirection: 'row',
    backgroundColor: Theme.white,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  examplesCell: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.sm),
    color: Theme.textSecondary,
  },
  examplesHeader: {
    fontWeight: '700',
    color: Theme.white,
  },
  examplesColSet: {
    flex: 1,
  },
  examplesColResult: {
    flex: 1.2,
  },
});
