import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    ImageSourcePropType,
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
import { FractionText } from '../../components/FractionText';
import { BorderRadius, Spacing } from '../../constants/colors';
import { MODULE_3_TRIANGLE_SIMILARITY_SECTIONS } from '../../data/lessons/module3_triangle_similarity';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { getSpacing, isWeb, scaleFont, scaleSize } from '../../utils/responsive';
import { useAccordionReadingProgress } from '../../utils/useAccordionReadingProgress';
import { LessonVideo } from '../../components/LessonVideo';

const TRIANGLE_SIMILARITY_SECTION_KEYS = ['I', 'II', 'III', 'IV', 'V'];

const TRIANGLE_MEASURES_TOPIC_ID = 3;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  muted: '#D1FAE5',
};

const SECTION_V_IMAGES: Record<string, ImageSourcePropType> = {
  'sas-ex1': require('../../assets/images/sas-ex1.png'),
  'sas-ex2': require('../../assets/images/sas-ex2.png'),
  'asa-ex1': require('../../assets/images/asa-ex1.png'),
  'asa-ex2': require('../../assets/images/asa-ex2.png'),
  'sss-ex1': require('../../assets/images/sss-ex1.png'),
  'sss-ex2': require('../../assets/images/sss-ex2.png'),
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


/** Wrapper that accepts key for map() - React's key is valid but not in RN View/Fragment types */
function Keyed(props: React.PropsWithChildren<{ key?: React.Key }>) {
  return <>{props.children}</>;
}

function SectionFadeIn({ index, children }: { index: number; children?: React.ReactNode }) {
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

export default function TriangleSimilarityLessonScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>('I');
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [openedSections, setOpenedSections] = useState<Set<string>>(() => new Set(['I']));
  const { ReadingProgressIndicator } = useAccordionReadingProgress(
    TRIANGLE_MEASURES_TOPIC_ID,
    TRIANGLE_SIMILARITY_SECTION_KEYS.length,
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
  const toggleMethod = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMethod((prev) => (prev === key ? null : key));
  };

  const sec = MODULE_3_TRIANGLE_SIMILARITY_SECTIONS;
  const objectives = sec.learning_objectives || [];
  const whatAre = sec.what_are_similar_triangles || { conditions: [], notes: [] };
  const keyWordTerms = sec.key_words_and_concepts || [];
  const correspondingParts = sec.corresponding_parts || { definition: '', rules: [] };
  const waysToKnow = sec.ways_to_know_if_triangles_are_similar || { methods: {} };
  const methods = waysToKnow.methods || {};
  const methodKeys = Object.keys(methods);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>Triangle Similarity</Text>
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
                    <Keyed key={idx}>
                      <View style={styles.objectiveRow}>
                        <View style={styles.objectiveBullet} />
                        <Text style={styles.objectiveItem}>{item}</Text>
                      </View>
                    </Keyed>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </SectionFadeIn>

        {/* II. What Are Similar Triangles? */}
        <SectionFadeIn index={1}>
          <AccordionHeader
            title="II. What Are Similar Triangles?"
            isOpen={expandedSection === 'II'}
            onPress={() => toggle('II')}
            icon={isWeb() ? '🔺' : undefined}
          />
          {expandedSection === 'II' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <Text style={styles.paragraph}>Two triangles are similar if:</Text>
              <View style={styles.bulletList}>
                {(whatAre.conditions || []).map((c: string, idx: number) => (
                  <Keyed key={idx}>
                    <View style={styles.bulletRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText}>{c}</Text>
                    </View>
                  </Keyed>
                ))}
              </View>
              {(whatAre.notes || []).map((note: string, idx: number) => (
                <Keyed key={idx}>
                  <Text style={styles.paragraph}>{note}</Text>
                </Keyed>
              ))}
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
                {keyWordTerms.map((item: { term?: string; definition?: string }, idx: number) => (
                  <Keyed key={idx}>
                    <View style={[styles.keyWordItem, idx === keyWordTerms.length - 1 && styles.keyWordItemLast]}>
                      <View style={styles.keyWordTermRow}>
                        <Text style={styles.keyWordBullet}>•</Text>
                        <Text style={styles.keyWordTerm}>{item.term}</Text>
                      </View>
                      <Text style={styles.keyWordDefinition}>{item.definition}</Text>
                    </View>
                  </Keyed>
                ))}
              </View>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* IV. Corresponding Parts */}
        <SectionFadeIn index={3}>
          <AccordionHeader
            title="IV. Corresponding Parts"
            isOpen={expandedSection === 'IV'}
            onPress={() => toggle('IV')}
            icon={isWeb() ? '📐' : undefined}
          />
          {expandedSection === 'IV' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <Text style={styles.paragraph}>{correspondingParts.definition}</Text>

              <View style={styles.correspondingSubsection}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletTextBold}>angle matches angle</Text>
                </View>
                <View style={styles.diagramWrap}>
                  <Image
                    source={require('../../assets/images/corresponding-angles.png')}
                    style={styles.diagramImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.diagramCaption}>
                    Triangle PQR and Triangle XYZ — corresponding angles marked with arcs (P↔X, Q↔Y, R↔Z).
                  </Text>
                </View>
              </View>

              <View style={styles.correspondingDivider} />

              <View style={styles.correspondingSubsection}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletTextBold}>side matches side</Text>
                </View>
                <View style={styles.diagramWrap}>
                  <Image
                    source={require('../../assets/images/corresponding-sides.png')}
                    style={styles.diagramImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.diagramCaption}>
                    Triangle PQR and Triangle XYZ — corresponding sides marked with hash marks (PQ↔XY, QR↔YZ, PR↔XZ).
                  </Text>
                </View>
              </View>

              <Text style={styles.paragraph}>
                If one side of a triangle is longer, the matching side in the other triangle is also longer in the same ratio.
              </Text>
              <Text style={styles.paragraph}>
                Correct matching of parts is important when checking triangle similarity.
              </Text>
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* V. Ways to Know If Triangles Are Similar */}
        <SectionFadeIn index={4}>
          <AccordionHeader
            title="V. Ways to Know If Triangles Are Similar"
            isOpen={expandedSection === 'V'}
            onPress={() => toggle('V')}
            icon={isWeb() ? '💡' : undefined}
          />
          {expandedSection === 'V' && (
            <AccordionRevealBody contentStyle={[styles.accordionBody, isWeb() && styles.accordionBodyWeb]}>
              <Text style={styles.paragraph}>There are three methods used to determine triangle similarity.</Text>
              {methodKeys.map((key: string, methodIndex: number) => {
                const method = methods[key];
                if (!method) return null;
                const isOpen = expandedMethod === key;
                const examples = method.examples || [];
                const hasStructuredExamples = Array.isArray(examples) && examples.length > 0 && typeof examples[0] === 'object';
                return (
                  <Keyed key={key}>
                  <View style={styles.methodBlock}>
                    <TouchableOpacity
                      style={styles.methodHeader}
                      onPress={() => toggleMethod(key)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.methodName}>{methodIndex + 1}. {method.name}</Text>
                      <Text style={styles.accordionChevron}>{isOpen ? '▼' : '▶'}</Text>
                    </TouchableOpacity>
                    {isOpen && (
                      <View style={styles.methodBody}>
                        <Text style={styles.methodCriteriaTitle}>Triangles are similar if:</Text>
                        <View style={styles.bulletList}>
                          {(method.criteria || []).map((c: string, idx: number) => (
                            <Keyed key={idx}>
                              <View style={styles.bulletRow}>
                                <Text style={styles.bulletDot}>•</Text>
                                <Text style={styles.bulletText}>{c}</Text>
                              </View>
                            </Keyed>
                          ))}
                        </View>
                        {method.note ? (
                          <Text style={styles.methodNote}>{method.note}</Text>
                        ) : null}
                        {hasStructuredExamples ? (
                          (examples as Array<{ title?: string; given?: string[]; solution?: string[]; conclusion?: string; image?: string }>).map((ex, exIdx) => (
                            <Keyed key={exIdx}>
                            <View style={styles.similarityExampleBlock}>
                              <Text style={styles.similarityExampleTitle}>{ex.title || `Example ${exIdx + 1}:`}</Text>
                              {ex.image && SECTION_V_IMAGES[ex.image] ? (
                                <View style={styles.diagramWrap}>
                                  <Image
                                    source={SECTION_V_IMAGES[ex.image]}
                                    style={styles.diagramImage}
                                    resizeMode="contain"
                                  />
                                </View>
                              ) : null}
                              {(ex.given || []).length > 0 && (
                                <>
                                  <Text style={styles.similarityLabel}>Given:</Text>
                                  {(ex.given || []).map((line: string, i: number) => (
                                    <Keyed key={i}>
                                      {/ over /.test(line) ? (
                                        <FractionText text={line} style={styles.similarityGivenLine} />
                                      ) : (
                                        <Text style={styles.similarityGivenLine}>{line}</Text>
                                      )}
                                    </Keyed>
                                  ))}
                                </>
                              )}
                              {(ex.solution || []).length > 0 && (
                                <>
                                  <Text style={[styles.similarityLabel, styles.similarityLabelSolution]}>Solution:</Text>
                                  {(ex.solution || []).map((line: string, i: number) => (
                                    <Keyed key={i}>
                                      {/ over /.test(line) ? (
                                        <FractionText text={line} style={styles.similaritySolutionLine} />
                                      ) : (
                                        <Text style={styles.similaritySolutionLine}>{line}</Text>
                                      )}
                                    </Keyed>
                                  ))}
                                </>
                              )}
                              {ex.conclusion ? (
                                <>
                                  <Text style={[styles.similarityLabel, styles.similarityLabelConclusion]}>Conclusion:</Text>
                                  <Text style={styles.similarityConclusionText}>{ex.conclusion}</Text>
                                </>
                              ) : null}
                            </View>
                            </Keyed>
                          ))
                        ) : (
                          (method.examples_text || []).map((ex: string, idx: number) => (
                            <Keyed key={idx}>
                              <Text style={styles.exampleText}>{ex}</Text>
                            </Keyed>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                  </Keyed>
                );
              })}
            </AccordionRevealBody>
          )}
        </SectionFadeIn>

        {/* Video: Triangle Similarities */}
        <SectionFadeIn index={5}>
          <View style={styles.topicVideoWrap}>
            <Text style={styles.topicVideoLabel}>Video</Text>
            <View style={styles.topicVideoContainer}>
              <View style={styles.topicVideoInner}>
                <LessonVideo
                  videoId="M3ATriangleSimilarities"
                  thumbnailLabel="Triangle Similarities"
                  style={[styles.topicVideo, Platform.OS === 'web' && styles.topicVideoWeb]}
                  contentFit={Platform.OS === 'web' ? 'contain' : 'cover'}
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
  scrollContentWeb: { alignItems: 'center' },
  scrollInner: { width: '100%' },
  scrollInnerWeb: { maxWidth: 1200, alignSelf: 'center' },
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
  topicVideoWeb: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  videoStyleWebContain: {
    objectFit: 'contain' as const,
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
  accordionIcon: { fontSize: scaleFont(22), marginRight: getSpacing(Spacing.sm) },
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
  accordionBodyWeb: { borderLeftWidth: 4, borderLeftColor: Theme.primary, backgroundColor: '#FFFCFA' },
  paragraph: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.text,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
    marginBottom: getSpacing(Spacing.sm),
  },
  bulletList: {
    marginBottom: getSpacing(Spacing.sm),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getSpacing(Spacing.xs),
  },
  bulletDot: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.primary,
    marginRight: getSpacing(Spacing.sm),
  },
  bulletText: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 14),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 26 : 22),
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
  correspondingSubsection: {
    marginBottom: getSpacing(Spacing.md),
  },
  bulletTextBold: {
    flex: 1,
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '700',
    color: Theme.text,
  },
  diagramWrap: {
    marginTop: getSpacing(Spacing.sm),
    marginLeft: scaleSize(24),
    alignItems: 'center',
    backgroundColor: Theme.white,
    padding: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.sm),
    borderWidth: 1,
    borderColor: Theme.border,
  },
  diagramImage: {
    width: '100%',
    maxWidth: scaleSize(280),
    height: scaleSize(140),
  },
  diagramCaption: {
    fontSize: scaleFont(isWeb() ? 15 : 12),
    color: Theme.textSecondary,
    marginTop: getSpacing(Spacing.xs),
    textAlign: 'center',
    fontStyle: 'italic',
  },
  correspondingDivider: {
    height: 1,
    backgroundColor: Theme.border,
    marginVertical: getSpacing(Spacing.md),
  },
  methodBlock: {
    marginBottom: getSpacing(Spacing.md),
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: scaleSize(BorderRadius.md),
    overflow: 'hidden',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getSpacing(Spacing.md),
    backgroundColor: Theme.muted,
  },
  methodName: {
    fontSize: scaleFont(isWeb() ? 18 : 15),
    fontWeight: '700',
    color: Theme.text,
    flex: 1,
  },
  methodBody: {
    padding: getSpacing(Spacing.md),
    backgroundColor: Theme.white,
  },
  methodCriteriaTitle: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '600',
    color: Theme.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  methodNote: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    fontStyle: 'italic',
    marginBottom: getSpacing(Spacing.md),
    lineHeight: scaleFont(isWeb() ? 25 : 20),
  },
  similarityExampleBlock: {
    marginTop: getSpacing(Spacing.md),
    paddingTop: getSpacing(Spacing.sm),
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  similarityExampleTitle: {
    fontSize: scaleFont(isWeb() ? 17 : 14),
    fontWeight: '700',
    color: Theme.primary,
    marginBottom: getSpacing(Spacing.sm),
  },
  similarityLabel: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    fontWeight: '600',
    color: Theme.text,
    marginTop: getSpacing(Spacing.xs),
    marginBottom: getSpacing(Spacing.xs),
  },
  similarityLabelSolution: {
    marginTop: getSpacing(Spacing.sm),
  },
  similarityLabelConclusion: {
    marginTop: getSpacing(Spacing.sm),
  },
  similarityGivenLine: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 25 : 20),
    marginLeft: getSpacing(Spacing.sm),
  },
  similaritySolutionLine: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 25 : 20),
    marginLeft: getSpacing(Spacing.sm),
  },
  similarityConclusionText: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    fontWeight: '600',
    color: Theme.text,
    marginLeft: getSpacing(Spacing.sm),
    lineHeight: scaleFont(isWeb() ? 25 : 20),
  },
  exampleText: {
    fontSize: scaleFont(isWeb() ? 16 : 13),
    color: Theme.textSecondary,
    lineHeight: scaleFont(isWeb() ? 25 : 20),
    marginTop: getSpacing(Spacing.sm),
    fontStyle: 'italic',
  },
});
