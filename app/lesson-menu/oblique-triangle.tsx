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
import { MODULE_3B_OBLIQUE_TRIANGLE_SECTIONS } from '../../data/lessons/module3b_oblique_triangle';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { useAccordionReadingProgress } from '../../utils/useAccordionReadingProgress';
import { getSpacing, isWeb, scaleFont, scaleSize } from '../../utils/responsive';

const OBLIQUE_SECTION_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const TRIANGLE_MEASURES_TOPIC_ID = 3;

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

function AnimatedAccordionBody({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(isWeb() ? 12 : 8)).current;
  useEffect(() => {
    const duration = isWeb() ? 400 : 280;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.accordionBody, isWeb() && styles.accordionBodyWeb, { opacity, transform: [{ translateY }] }]}>
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

const OBLIQUE_IMAGES: Record<string, ReturnType<typeof require>> = {
  'oblique-acute': require('../../assets/images/oblique-acute.png'),
  'oblique-obtuse': require('../../assets/images/oblique-obtuse.png'),
  'law-sines-ex1': require('../../assets/images/law-sines-ex1.png'),
  'law-sines-ex2': require('../../assets/images/law-sines-ex2.png'),
  'law-sines-ex3': require('../../assets/images/law-sines-ex3.png'),
  'law-cosines-ex1': require('../../assets/images/law-cosines-ex1.png'),
  'law-cosines-ex2': require('../../assets/images/law-cosines-ex2.png'),
  'law-cosines-ex3': require('../../assets/images/law-cosines-ex3.png'),
};

export default function ObliqueTriangleLessonScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('II');
  const [openedSections, setOpenedSections] = useState<Set<string>>(() => new Set(['I', 'II'])); // I visible, II starts expanded
  const { ReadingProgressIndicator } = useAccordionReadingProgress(
    TRIANGLE_MEASURES_TOPIC_ID,
    OBLIQUE_SECTION_KEYS.length,
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

  const sec = MODULE_3B_OBLIQUE_TRIANGLE_SECTIONS;
  const objectives = sec.learning_objectives || [];
  const whatAre = sec.what_are_oblique_triangles || {};
  const keyWordTerms = sec.key_words_and_concepts || [];
  const lawOfSines = sec.law_of_sines || {};
  const acute = whatAre.acute || {};
  const obtuse = whatAre.obtuse || {};
  const acuteImages = (acute as { images?: string[] }).images || [];
  const obtuseImages = (obtuse as { images?: string[] }).images || [];
  const whenUsed = (lawOfSines as { when_used?: string[] }).when_used || [];
  const steps = (lawOfSines as { steps?: string[] }).steps || [];
  const examples = (lawOfSines as { examples?: Array<{ title?: string; given?: string[]; solution?: string[]; answer?: string; image?: string; solution_display?: object }> }).examples || [];
  const lawOfCosines = sec.law_of_cosines || {};
  const cosinesWhenUsed = (lawOfCosines as { when_used?: string[] }).when_used || [];
  const cosinesExamples = (lawOfCosines as { examples?: Array<{ title?: string; given?: string[]; solution_display?: object; answer?: string; image?: string }> }).examples || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Oblique Triangle</Text>
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
                <Text style={[styles.purposeBlockHeading, styles.blockHeadingFirst]}>Purpose of the Module</Text>
                <Text style={styles.bodyTextCentered}>{sec.purpose || ''}</Text>
              </View>
              <View style={styles.purposeCard}>
                <Text style={styles.purposeBlockHeading}>Learning Objectives</Text>
                <Text style={styles.bodyTextCentered}>
                  At the end of this lesson, the learners should be able to:
                </Text>
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

        {/* II. What Are Oblique Triangles? */}
        <SectionFadeIn index={1}>
          <AccordionHeader
            title="II. What Are Oblique Triangles?"
            isOpen={expandedSection === 'II'}
            onPress={() => toggle('II')}
            icon={isWeb() ? '🔺' : undefined}
          />
          {expandedSection === 'II' && (
            <AnimatedAccordionBody>
              <Text style={styles.paragraph}>{whatAre.definition || ''}</Text>
              <Text style={styles.paragraph}>{whatAre.general_note || ''}</Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{whatAre.general_bullet || 'The sum of the interior angles is 180°'}</Text>
                </View>
              </View>
              <Text style={[styles.paragraph, styles.typesIntro]}>{whatAre.types_intro || 'There are two types of oblique triangles:'}</Text>

              <View style={styles.typeBlock}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletTextBold}>{(acute as { label?: string }).label || 'Acute Triangle'}</Text>
                </View>
                <Text style={styles.typeDefinition}>– {(acute as { definition?: string }).definition || 'all angles are less than 90°'}</Text>
                <View style={styles.diagramRow}>
                  {acuteImages.map((key: string, i: number) =>
                    OBLIQUE_IMAGES[key] ? (
                      <View key={i} style={styles.diagramWrap}>
                        <Image source={OBLIQUE_IMAGES[key]} style={styles.diagramImage} resizeMode="contain" />
                      </View>
                    ) : null
                  )}
                </View>
              </View>

              <View style={styles.typeBlock}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletTextBold}>{(obtuse as { label?: string }).label || 'Obtuse Triangle'}</Text>
                </View>
                <Text style={styles.typeDefinition}>– {(obtuse as { definition?: string }).definition || 'one angle is greater than 90°'}</Text>
                <View style={styles.diagramRow}>
                  {obtuseImages.map((key: string, i: number) =>
                    OBLIQUE_IMAGES[key] ? (
                      <View key={i} style={styles.diagramWrap}>
                        <Image source={OBLIQUE_IMAGES[key]} style={styles.diagramImage} resizeMode="contain" />
                      </View>
                    ) : null
                  )}
                </View>
              </View>

              <Text style={[styles.paragraph, styles.conclusionText]}>{whatAre.conclusion || ''}</Text>
            </AnimatedAccordionBody>
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
            <AnimatedAccordionBody>
              <View style={styles.keyWordsList}>
                {keyWordTerms.map((item: { term?: string; definition?: string }, idx: number) => (
                  <View key={idx} style={[styles.keyWordItem, idx === keyWordTerms.length - 1 && styles.keyWordItemLast]}>
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

        {/* IV. Law of Sines */}
        <SectionFadeIn index={3}>
          <AccordionHeader
            title="IV. Law of Sines"
            isOpen={expandedSection === 'IV'}
            onPress={() => toggle('IV')}
            icon={isWeb() ? '📐' : undefined}
          />
          {expandedSection === 'IV' && (
            <AnimatedAccordionBody>
              <Text style={styles.paragraph}>{(lawOfSines as { when_used_intro?: string }).when_used_intro || 'The Law of Sines is used when:'}</Text>
              <View style={styles.bulletList}>
                {whenUsed.map((line: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.formulaLabel}>Formula:</Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{(lawOfSines as { formula?: string }).formula || 'a / sin A = b / sin B = c / sin C'}</Text>
              </View>
              <Text style={styles.formulaNote}>{(lawOfSines as { formula_note?: string }).formula_note || 'Each side must be paired with its opposite angle.'}</Text>
              <Text style={styles.stepsTitle}>{(lawOfSines as { steps_title?: string }).steps_title || 'A. Using the Law of Sines'}</Text>
              <View style={styles.bulletList}>
                {steps.map((step: string, i: number) => (
                  <Text key={i} style={styles.stepLine}>{step}</Text>
                ))}
              </View>
              {examples.map((ex, exIdx) => (
                <View key={exIdx} style={styles.exampleBlock}>
                  <Text style={styles.exampleTitle}>{ex.title || `Example ${exIdx + 1}`}</Text>
                  {ex.image && OBLIQUE_IMAGES[ex.image] ? (
                    <View style={styles.diagramWrap}>
                      <Image source={OBLIQUE_IMAGES[ex.image]} style={styles.diagramImage} resizeMode="contain" />
                    </View>
                  ) : null}
                  {(ex.given || []).length > 0 && (
                    <>
                      <Text style={styles.exampleLabel}>Given:</Text>
                      {(ex.given || []).map((line: string, i: number) => (
                        <Text key={i} style={styles.exampleGivenLine}>{line}</Text>
                      ))}
                    </>
                  )}
                  {((ex as { solution_display?: object }).solution_display || (ex.solution || []).length > 0) && (
                    <>
                      <Text style={styles.solutionHeading}>Solution:</Text>
                      {(() => {
                        const sd = (ex as { solution_display?: { formula_intro?: string; formula?: string; substitute_label?: string; substitute_equation?: string; cross_note?: string; steps?: string[]; show_divider?: boolean } }).solution_display;
                        if (sd) {
                          return (
                            <>
                              {sd.formula_intro ? <Text style={styles.solutionFormulaIntro}>{sd.formula_intro}</Text> : null}
                              {sd.formula ? (
                                <View style={styles.solutionFormulaBox}>
                                  <Text style={styles.solutionFormulaText}>{sd.formula}</Text>
                                </View>
                              ) : null}
                              {sd.show_divider ? <View style={styles.solutionDivider} /> : null}
                              {sd.substitute_label ? <Text style={styles.solutionSubstituteLabel}>{sd.substitute_label}</Text> : null}
                              {sd.substitute_equation ? (
                                <View style={styles.solutionEquationRow}>
                                  <Text style={styles.solutionEquationText}>{sd.substitute_equation}</Text>
                                  {sd.cross_note ? <Text style={styles.solutionCrossNote}>{sd.cross_note}</Text> : null}
                                </View>
                              ) : null}
                              {!sd.substitute_equation && sd.cross_note ? <Text style={styles.solutionCrossNote}>{sd.cross_note}</Text> : null}
                              {(sd.steps || []).length > 0 ? (
                                <View style={styles.solutionStepsWrap}>
                                  <Text style={styles.solutionStepsText}>{(sd.steps || []).join('  →  ')}</Text>
                                </View>
                              ) : null}
                            </>
                          );
                        }
                        return (ex.solution || []).map((line: string, i: number) => (
                          <Text key={i} style={styles.exampleSolutionLine}>{line}</Text>
                        ));
                      })()}
                  {ex.answer ? (
                    <View style={styles.solutionAnswerWrap}>
                      <Text style={styles.solutionAnswerText}>{ex.answer}</Text>
                    </View>
                  ) : null}
                    </>
                  )}
                </View>
              ))}
            </AnimatedAccordionBody>
          )}
        </SectionFadeIn>

        {/* V. Law of Cosines */}
        <SectionFadeIn index={4}>
          <AccordionHeader
            title="V. Law of Cosines"
            isOpen={expandedSection === 'V'}
            onPress={() => toggle('V')}
            icon={isWeb() ? '📐' : undefined}
          />
          {expandedSection === 'V' && (
            <AnimatedAccordionBody>
              <Text style={styles.paragraph}>{(lawOfCosines as { when_used_intro?: string }).when_used_intro || 'The Law of Cosines is used when:'}</Text>
              <View style={styles.bulletList}>
                {cosinesWhenUsed.map((line: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.formulaLabel}>Formula:</Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaText}>{(lawOfCosines as { formula?: string }).formula || 'c² = a² + b² - 2ab cos C'}</Text>
              </View>
              <Text style={styles.formulaNote}>{(lawOfCosines as { formula_note?: string }).formula_note || 'This formula is useful when no opposite angle is known.'}</Text>
              {cosinesExamples.map((ex, exIdx) => (
                <View key={exIdx} style={styles.exampleBlock}>
                  <Text style={styles.exampleTitle}>{ex.title || `Example ${exIdx + 1}`}</Text>
                  {ex.image && OBLIQUE_IMAGES[ex.image] ? (
                    <View style={styles.diagramWrap}>
                      <Image source={OBLIQUE_IMAGES[ex.image]} style={styles.diagramImage} resizeMode="contain" />
                    </View>
                  ) : null}
                  {(ex.given || []).length > 0 && (
                    <>
                      <Text style={styles.exampleLabel}>Given:</Text>
                      {(ex.given || []).map((line: string, i: number) => (
                        <Text key={i} style={styles.exampleGivenLine}>{line}</Text>
                      ))}
                    </>
                  )}
                  {(ex as { solution_display?: object }).solution_display && (
                    <>
                      <Text style={styles.solutionHeading}>Solution:</Text>
                      {(() => {
                        const sd = (ex as { solution_display?: { formula?: string; substitute_equation?: string; steps?: string[] } }).solution_display;
                        if (!sd) return null;
                        return (
                          <>
                            {sd.formula ? (
                              <Text style={styles.solutionStepLine}>{sd.formula}</Text>
                            ) : null}
                            {sd.substitute_equation ? (
                              <Text style={styles.solutionStepLine}>{sd.substitute_equation}</Text>
                            ) : null}
                            {(sd.steps || []).map((step: string, i: number) => (
                              <Text key={i} style={styles.solutionStepLine}>{step}</Text>
                            ))}
                          </>
                        );
                      })()}
                      {ex.answer ? (
                        <>
                          <Text style={styles.solutionFinalAnswerLabel}>Final Answer:</Text>
                          <Text style={styles.solutionAnswerText}>{ex.answer}</Text>
                        </>
                      ) : null}
                    </>
                  )}
                </View>
              ))}
            </AnimatedAccordionBody>
          )}
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
  purposeBlockHeading: { fontSize: scaleFont(15), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.sm), textAlign: 'center' },
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
  bulletList: { marginBottom: getSpacing(Spacing.sm) },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: getSpacing(Spacing.xs) },
  bulletDot: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.primary, marginRight: getSpacing(Spacing.sm) },
  bulletText: { flex: 1, fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22) },
  bulletTextBold: { flex: 1, fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.text },
  typesIntro: { marginTop: getSpacing(Spacing.sm) },
  typeBlock: { marginBottom: getSpacing(Spacing.md) },
  typeDefinition: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22), marginLeft: scaleSize(24), marginBottom: getSpacing(Spacing.sm) },
  conclusionText: { marginTop: getSpacing(Spacing.sm), fontStyle: 'italic', fontSize: scaleFont(isWeb() ? 17 : 14) },
  diagramRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: getSpacing(Spacing.sm), gap: getSpacing(Spacing.sm), justifyContent: 'center' },
  diagramWrap: {
    alignItems: 'center',
    backgroundColor: Theme.white,
    padding: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.sm),
    borderWidth: 1,
    borderColor: Theme.border,
    width: '100%',
    maxWidth: scaleSize(320),
  },
  diagramImage: { width: '100%', maxWidth: scaleSize(280), height: scaleSize(160) },
  keyWordsList: { marginBottom: getSpacing(Spacing.sm) },
  keyWordItem: { marginBottom: getSpacing(Spacing.md), paddingBottom: getSpacing(Spacing.sm), borderBottomWidth: 1, borderBottomColor: Theme.border },
  keyWordItemLast: { borderBottomWidth: 0 },
  keyWordTermRow: { flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing(Spacing.xs) },
  keyWordBullet: { fontSize: scaleFont(16), color: Theme.primary, marginRight: getSpacing(Spacing.sm) },
  keyWordTerm: { flex: 1, fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '700', color: Theme.text },
  keyWordDefinition: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22), marginLeft: scaleSize(24), marginBottom: getSpacing(Spacing.xs) },
  formulaLabel: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.text, marginTop: getSpacing(Spacing.sm), marginBottom: getSpacing(Spacing.xs) },
  formulaBox: { backgroundColor: Theme.muted, padding: getSpacing(Spacing.md), borderRadius: scaleSize(BorderRadius.sm), marginBottom: getSpacing(Spacing.xs) },
  formulaText: { fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '600', color: Theme.text, textAlign: 'center' },
  formulaNote: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, fontStyle: 'italic', marginBottom: getSpacing(Spacing.sm) },
  stepsTitle: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.primary, marginTop: getSpacing(Spacing.sm), marginBottom: getSpacing(Spacing.xs) },
  stepLine: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 25 : 20), marginBottom: getSpacing(Spacing.xs), marginLeft: getSpacing(Spacing.sm) },
  exampleBlock: { marginTop: getSpacing(Spacing.md), paddingTop: getSpacing(Spacing.sm), borderTopWidth: 1, borderTopColor: Theme.border },
  exampleTitle: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.primary, marginBottom: getSpacing(Spacing.sm) },
  exampleLabel: { fontSize: scaleFont(isWeb() ? 16 : 13), fontWeight: '600', color: Theme.text, marginTop: getSpacing(Spacing.xs), marginBottom: getSpacing(Spacing.xs) },
  exampleLabelSolution: { marginTop: getSpacing(Spacing.sm) },
  exampleLabelAnswer: { marginTop: getSpacing(Spacing.sm) },
  exampleGivenLine: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 25 : 20), marginLeft: getSpacing(Spacing.sm) },
  exampleSolutionLine: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 25 : 20), marginLeft: getSpacing(Spacing.sm) },
  exampleAnswerText: { fontSize: scaleFont(isWeb() ? 16 : 13), fontWeight: '600', color: Theme.text, marginLeft: getSpacing(Spacing.sm), lineHeight: scaleFont(isWeb() ? 25 : 20) },
  solutionHeading: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.text, marginTop: getSpacing(Spacing.sm), marginBottom: getSpacing(Spacing.xs) },
  solutionFormulaIntro: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, marginBottom: getSpacing(Spacing.xs) },
  solutionFormulaBox: { backgroundColor: Theme.muted, paddingVertical: getSpacing(Spacing.sm), paddingHorizontal: getSpacing(Spacing.md), borderRadius: scaleSize(BorderRadius.sm), marginBottom: getSpacing(Spacing.sm), alignItems: 'center' },
  solutionFormulaText: { fontSize: scaleFont(isWeb() ? 18 : 15), fontWeight: '600', color: Theme.text },
  solutionDivider: { height: 1, backgroundColor: Theme.border, marginVertical: getSpacing(Spacing.sm) },
  solutionSubstituteLabel: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, marginBottom: getSpacing(Spacing.xs) },
  solutionEquationRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: getSpacing(Spacing.xs), gap: getSpacing(Spacing.sm) },
  solutionEquationText: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.text, flex: 1 },
  solutionCrossNote: { fontSize: scaleFont(isWeb() ? 14 : 12), color: Theme.accent, fontStyle: 'italic' },
  solutionStepsWrap: { marginTop: getSpacing(Spacing.sm) },
  solutionStepsText: { fontSize: scaleFont(isWeb() ? 16 : 13), color: Theme.textSecondary, lineHeight: scaleFont(isWeb() ? 26 : 22) },
  solutionStepLine: { fontSize: scaleFont(isWeb() ? 17 : 14), color: Theme.text, lineHeight: scaleFont(isWeb() ? 26 : 22), marginBottom: getSpacing(Spacing.xs) },
  solutionFinalAnswerLabel: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.text, marginTop: getSpacing(Spacing.sm), marginBottom: getSpacing(Spacing.xs) },
  solutionAnswerWrap: { marginTop: getSpacing(Spacing.sm) },
  solutionAnswerText: { fontSize: scaleFont(isWeb() ? 17 : 14), fontWeight: '700', color: Theme.text },
});
