import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { FractionText } from '../../components/FractionText';
import { BorderRadius, Spacing } from '../../constants/colors';
import { saveTopicContentProgress } from '../../utils/progressStorage';
import { getSafeAreaTopPadding, getSpacing } from '../../utils/responsive';

const ProfessionalColors = {
  primary: '#10B981',
  primaryDark: '#047857',
  white: '#FFFFFF',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  error: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
};

// Animated Icon Component
function AnimatedIcon({ icon, delay = 0, size = 32 }: { icon: string; delay?: number; size?: number }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay: delay,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { rotate }],
        opacity: opacityAnim,
      }}
    >
      <Text style={{ fontSize: size }}>{icon}</Text>
    </Animated.View>
  );
}

// Animated Concept Item Component
function AnimatedConceptItem({ concept, index, delay = 0 }: { concept: string; index: number; delay?: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: delay,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: delay,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const conceptIcons = ['✨', '🎯', '🔑', '⭐', '💎', '🌟', '⚡', '🔥'];
  const icon = conceptIcons[index % conceptIcons.length];

  return (
    <Animated.View
      style={[
        styles.conceptItem,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Text style={styles.conceptIcon}>{icon}</Text>
      </Animated.View>
      <Text style={styles.conceptText}>{concept}</Text>
    </Animated.View>
  );
}

// Animated Example Card Component
function AnimatedExampleCard({ example, index, delay = 0 }: { example: { question: string; solution: string }; index: number; delay?: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: delay,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay: delay,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const exampleIcons = ['📌', '📋', '📄', '📊'];
  const icon = exampleIcons[index % exampleIcons.length];

  return (
    <Animated.View
      style={[
        styles.exampleCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.exampleHeader}>
        <AnimatedIcon icon={icon} delay={delay + 100} size={24} />
        <Text style={styles.exampleNumber}>Example {index + 1}</Text>
      </View>
      <Text style={styles.exampleQuestion}>{example.question}</Text>
      <View style={styles.solutionContainer}>
        <Text style={styles.solutionLabel}>💭 Solution:</Text>
        <Text style={styles.exampleSolution}>{example.solution}</Text>
      </View>
    </Animated.View>
  );
}

type Lesson = {
  id: number;
  title: string;
  content: string;
  concepts: string[];
  examples: { question: string; solution: string }[];
  quiz: Quiz;
  completed: boolean;
  quizPassed: boolean;
};

type Quiz = {
  id: number;
  questions: Question[];
  passingScore: number;
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const TOPIC_INFO: { [key: string]: { name: string; icon: string; description: string } } = {
  '1': {
    name: 'Quadratic Equations',
    icon: '🧮',
    description: 'Learn to identify and apply steps in solving quadratic equations',
  },
  '2': {
    name: 'Triangle Triples',
    icon: '🎯',
    description: 'Identifying triangle triples',
  },
  '3': {
    name: 'Triangle Measures',
    icon: '△',
    description: 'Similar triangles & oblique',
  },
  '4': {
    name: 'Area of Triangles',
    icon: '📐',
    description: 'Area formula and problems',
  },
  '5': {
    name: 'Variation',
    icon: '📊',
    description: 'Direct, inverse, joint, and combined variation',
  },
};

// Topic content is in lesson-menu screens; no inline lessons here
const getLessonsForTopic = (_topicId: string): Lesson[] => [];

// Route to the lesson menu for each topic (used when opening from this screen)
const getLessonMenuRoute = (topicId: string): string => {
  switch (topicId) {
    case '1': return '/lesson-menu/quadratic-equations';
    case '2': return '/lesson-menu/pythagorean-triples';
    case '3': return '/lesson-menu/triangle-measures';
    case '4': return '/lesson-menu/area-of-triangle';
    case '5': return '/lesson-menu/variation';
    default: return '/lesson-menu/quadratic-equations';
  }
};

export default function TopicScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topicId = id || '1';
  const [lessons, setLessons] = useState<Lesson[]>(getLessonsForTopic(topicId));
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const topicInfo = TOPIC_INFO[topicId] || TOPIC_INFO['1'];
  const currentLesson = lessons[currentLessonIndex];
  const hasLessons = lessons.length > 0;

  // Reload lessons when topic ID changes
  useEffect(() => {
    const newLessons = getLessonsForTopic(topicId);
    setLessons(newLessons);
    setCurrentLessonIndex(0);
    setScrollProgress(0);
  }, [topicId]);

  // Initialize progress when lessons change
  useEffect(() => {
    if (lessons.length === 0) return;
    const completedCount = lessons.filter((l) => l.completed && l.quizPassed).length;
    const baseProgress = (completedCount / lessons.length) * 100;
    setScrollProgress(baseProgress);
  }, [lessons]);

  const handleStartQuiz = (lesson: Lesson) => {
    setCurrentQuiz(lesson.quiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizModalVisible(true);
  };

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
  };

  const handleSubmitQuiz = () => {
    if (!currentQuiz) return;

    let score = 0;
    currentQuiz.questions.forEach((question) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    // Check if passed
    if (score >= currentQuiz.passingScore) {
      // Update lesson as completed and quiz passed
      const updatedLessons = lessons.map((lesson) => {
        if (lesson.id === currentLesson.id) {
          return { ...lesson, completed: true, quizPassed: true };
        }
        return lesson;
      });
      setLessons(updatedLessons);
      
      // Update progress immediately when quiz is passed
      const completedCount = updatedLessons.filter((l) => l.completed && l.quizPassed).length;
      const newProgress = (completedCount / updatedLessons.length) * 100;
      setScrollProgress(newProgress);
      
      // Save content progress to storage (combined with activities in progressStorage)
      if (id) {
        saveTopicContentProgress(parseInt(id, 10), newProgress);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const canAccessLesson = (lessonIndex: number) => {
    if (lessonIndex === 0) return true;
    // Can access next lesson only if previous lesson is completed and quiz passed
    return lessons[lessonIndex - 1].completed && lessons[lessonIndex - 1].quizPassed;
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (event: any) => {
      const scrollPosition = event.nativeEvent.contentOffset.y;
      const contentHeight = event.nativeEvent.contentSize.height;
      const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
      
      if (contentHeight > scrollViewHeight) {
        const maxScroll = contentHeight - scrollViewHeight;
        const scrollPercentage = maxScroll > 0 
          ? Math.min((scrollPosition / maxScroll) * 100, 100)
          : 0;
        
        // Calculate progress: completed lessons + current lesson scroll progress
        const lessonWeight = 100 / lessons.length; // Each lesson is worth this percentage
        const lessonProgress = scrollPercentage / 100; // 0 to 1 for current lesson
        
        // Count completed lessons (excluding current lesson if we're scrolling through it)
        const completedLessons = lessons.filter((l, idx) => 
          idx < currentLessonIndex && l.completed && l.quizPassed
        ).length;
        
        // Progress from completed lessons (full credit for each)
        const completedProgress = (completedLessons / lessons.length) * 100;
        
        // Progress from current lesson
        // If current lesson is completed, give full credit, otherwise use scroll progress
        const currentLessonCompleted = currentLesson.completed && currentLesson.quizPassed;
        const currentLessonProgress = currentLessonCompleted 
          ? lessonWeight  // Full credit if completed
          : Math.min(lessonProgress * lessonWeight, lessonWeight * 0.9); // Partial credit based on scroll, max 90% until quiz passed
        
        // Overall progress
        const overallProgress = Math.min(
          completedProgress + currentLessonProgress,
          100
        );
        
        setScrollProgress(overallProgress);
        
        // Save content progress (combined with activities in progressStorage)
        if (id) {
          saveTopicContentProgress(parseInt(id, 10), overallProgress);
        }
      }
    },
  });

  // No inline lessons: content lives in lesson-menu screens
  if (!hasLessons) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>{topicInfo.icon}</Text>
            <Text style={styles.headerTitle}>{topicInfo.name}</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>{topicInfo.icon}</Text>
          <Text style={styles.emptyStateTitle}>{topicInfo.name}</Text>
          <Text style={styles.emptyStateDescription}>{topicInfo.description}</Text>
          <TouchableOpacity
            style={styles.openLessonsButton}
            onPress={() => router.push(getLessonMenuRoute(topicId) as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.openLessonsButtonText}>Open lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{topicInfo.icon}</Text>
          <Text style={styles.headerTitle}>{topicInfo.name}</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{Math.round(scrollProgress)}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${Math.round(scrollProgress)}%` }]} />
        </View>
      </View>

      {/* Lesson Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Header */}
        <View style={styles.lessonHeader}>
          <View style={styles.lessonHeaderTop}>
            <View style={styles.lessonNumberContainer}>
              <AnimatedIcon icon="📖" delay={0} size={28} />
              <Text style={styles.lessonNumber}>Lesson {currentLesson.id}</Text>
            </View>
            {currentLesson.completed && currentLesson.quizPassed && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✅ Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
        </View>

        {/* Lesson Content */}
        <View style={styles.contentCard}>
          <View style={styles.contentHeader}>
            <AnimatedIcon 
              icon="📚" 
              delay={0}
              size={40}
            />
            <Text style={styles.contentTitle}>Lesson Content</Text>
          </View>
          <Text style={styles.contentText}>{currentLesson.content}</Text>
        </View>

        {/* Key Concepts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AnimatedIcon 
              icon="💡" 
              delay={100}
              size={32}
            />
            <Text style={styles.sectionTitle}>Key Concepts</Text>
          </View>
          {currentLesson.concepts.map((concept, index) => (
            <AnimatedConceptItem 
              key={index} 
              concept={concept} 
              index={index}
              delay={200 + (index * 50)}
            />
          ))}
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AnimatedIcon 
              icon="📝" 
              delay={100}
              size={32}
            />
            <Text style={styles.sectionTitle}>Examples</Text>
          </View>
          {currentLesson.examples.map((example, index) => (
            <AnimatedExampleCard 
              key={index} 
              example={example} 
              index={index}
              delay={200 + (index * 100)}
            />
          ))}
        </View>

        {/* Quiz Button */}
        <TouchableOpacity
          style={[
            styles.quizButton,
            currentLesson.quizPassed && styles.quizButtonPassed,
          ]}
          onPress={() => handleStartQuiz(currentLesson)}
          activeOpacity={0.8}
        >
          <Text style={styles.quizButtonText}>
            {currentLesson.quizPassed ? '✅ Quiz Passed - Retake Quiz' : '📝 Take Quiz'}
          </Text>
        </TouchableOpacity>

        {/* Lesson Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentLessonIndex === 0 && styles.navButtonDisabled,
              currentLessonIndex > 0 && { backgroundColor: ProfessionalColors.background },
            ]}
            onPress={handlePreviousLesson}
            disabled={currentLessonIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.navButtonText,
              currentLessonIndex === 0 
                ? { color: ProfessionalColors.textSecondary }
                : { color: ProfessionalColors.text }
            ]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              (!canAccessLesson(currentLessonIndex + 1) ||
                currentLessonIndex === lessons.length - 1) && styles.navButtonDisabled,
            ]}
            onPress={handleNextLesson}
            disabled={
              !canAccessLesson(currentLessonIndex + 1) || currentLessonIndex === lessons.length - 1
            }
            activeOpacity={0.7}
          >
            <Text style={[
              styles.navButtonText,
              (!canAccessLesson(currentLessonIndex + 1) || currentLessonIndex === lessons.length - 1) &&
                { color: ProfessionalColors.textSecondary }
            ]} numberOfLines={2}>
              {currentLessonIndex === lessons.length - 1
                ? 'Complete'
                : canAccessLesson(currentLessonIndex + 1)
                ? 'Next →'
                : 'Complete Quiz First'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Quiz Modal */}
      <Modal
        visible={quizModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuizModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quiz: {currentLesson.title}</Text>
              <TouchableOpacity
                onPress={() => setQuizModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {currentQuiz && (
              <ScrollView style={styles.quizContent}>
                {currentQuiz.questions.map((question, qIndex) => {
                  const selectedAnswer = quizAnswers[question.id];
                  const isCorrect = selectedAnswer === question.correctAnswer;
                  const showResult = quizSubmitted;

                  return (
                    <View key={question.id} style={styles.questionCard}>
                      <View style={styles.questionTextWrap}>
                        <Text style={styles.questionText}>{qIndex + 1}. </Text>
                        {(/ over /.test(question.question) || / \/ /.test(question.question)) ? (
                          <FractionText text={question.question} style={styles.questionText} containerStyle={{ flex: 1 }} />
                        ) : (
                          <Text style={styles.questionText}>{question.question}</Text>
                        )}
                      </View>
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selectedAnswer === optionIndex;
                        const isCorrectOption = optionIndex === question.correctAnswer;

                        return (
                          <TouchableOpacity
                            key={optionIndex}
                            style={[
                              styles.optionButton,
                              isSelected && styles.optionButtonSelected,
                              showResult && isCorrectOption && styles.optionButtonCorrect,
                              showResult && isSelected && !isCorrect && styles.optionButtonIncorrect,
                            ]}
                            onPress={() => handleAnswerSelect(question.id, optionIndex)}
                            disabled={quizSubmitted}
                            activeOpacity={0.7}
                          >
                            {(/ over /.test(option) || / \/ /.test(option)) ? (
                              <FractionText
                                text={option}
                                style={[
                                  styles.optionText,
                                  isSelected && styles.optionTextSelected,
                                  showResult && isCorrectOption && styles.optionTextCorrect,
                                ].filter(Boolean)}
                                containerStyle={{ flex: 1 }}
                              />
                            ) : (
                              <Text
                                style={[
                                  styles.optionText,
                                  isSelected && styles.optionTextSelected,
                                  showResult && isCorrectOption && styles.optionTextCorrect,
                                ]}
                              >
                                {option}
                              </Text>
                            )}
                            {showResult && isCorrectOption && (
                              <Text style={styles.correctIcon}>✓</Text>
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <Text style={styles.incorrectIcon}>✕</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                      {showResult && (
                        (/ over /.test(question.explanation || '') || / \/ /.test(question.explanation || '')) ? (
                          <FractionText text={question.explanation || ''} style={styles.explanationText} />
                        ) : (
                          <Text style={styles.explanationText}>{question.explanation}</Text>
                        )
                      )}
                    </View>
                  );
                })}

                {quizSubmitted && (
                  <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Quiz Results</Text>
                    <Text style={styles.resultScore}>
                      Score: {quizScore}/{currentQuiz.questions.length}
                    </Text>
                    <Text style={styles.resultMessage}>
                      {quizScore >= currentQuiz.passingScore
                        ? '🎉 Congratulations! You passed the quiz!'
                        : '❌ You need to score at least ' +
                          currentQuiz.passingScore +
                          ' to pass. Please try again.'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              {!quizSubmitted ? (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    Object.keys(quizAnswers).length !== currentQuiz?.questions.length &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length !== currentQuiz?.questions.length}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Submit Quiz</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    setQuizModalVisible(false);
                    if (quizScore >= currentQuiz!.passingScore && canAccessLesson(currentLessonIndex + 1)) {
                      // Auto-advance to next lesson if available
                      setTimeout(() => {
                        if (currentLessonIndex < lessons.length - 1) {
                          handleNextLesson();
                        }
                      }, 500);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Close</Text>
                </TouchableOpacity>
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getSpacing(Spacing.lg),
    paddingTop: getSafeAreaTopPadding() + getSpacing(Spacing.lg),
    backgroundColor: ProfessionalColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: ProfessionalColors.text,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
  },
  progressBadge: {
    backgroundColor: ProfessionalColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    color: ProfessionalColors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.xl),
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: getSpacing(Spacing.md),
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.xl),
  },
  openLessonsButton: {
    backgroundColor: ProfessionalColors.primary,
    paddingHorizontal: getSpacing(Spacing.xl),
    paddingVertical: getSpacing(Spacing.md),
    borderRadius: BorderRadius.lg,
  },
  openLessonsButtonText: {
    color: ProfessionalColors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: ProfessionalColors.border,
  },
  progressBarBackground: {
    height: '100%',
    backgroundColor: ProfessionalColors.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl),
  },
  lessonHeader: {
    marginBottom: Spacing.xl,
    backgroundColor: ProfessionalColors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
  },
  lessonHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  lessonNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ProfessionalColors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  lessonNumber: {
    fontSize: 14,
    color: ProfessionalColors.primary,
    fontWeight: 'bold',
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  completedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ProfessionalColors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  completedText: {
    color: ProfessionalColors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  contentCard: {
    backgroundColor: ProfessionalColors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: ProfessionalColors.primary + '20',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginLeft: Spacing.sm,
  },
  contentText: {
    fontSize: 16,
    color: ProfessionalColors.text,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: ProfessionalColors.primary + '30',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginLeft: Spacing.sm,
  },
  conceptItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
    backgroundColor: ProfessionalColors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: ProfessionalColors.primary,
  },
  conceptIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  conceptText: {
    flex: 1,
    fontSize: 16,
    color: ProfessionalColors.text,
    lineHeight: 24,
    fontWeight: '500',
  },
  exampleCard: {
    backgroundColor: ProfessionalColors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 5,
    borderLeftColor: ProfessionalColors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
  },
  exampleNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginLeft: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleQuestion: {
    fontSize: 17,
    fontWeight: '700',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  solutionContainer: {
    backgroundColor: ProfessionalColors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  solutionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: Spacing.xs,
  },
  exampleSolution: {
    fontSize: 15,
    color: ProfessionalColors.text,
    lineHeight: 22,
    fontWeight: '400',
  },
  quizButton: {
    backgroundColor: ProfessionalColors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quizButtonPassed: {
    backgroundColor: ProfessionalColors.success,
  },
  quizButtonText: {
    color: ProfessionalColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  navButton: {
    flex: 1,
    minHeight: 50,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: ProfessionalColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
  },
  navButtonPrimary: {
    backgroundColor: ProfessionalColors.primary,
    borderColor: ProfessionalColors.primary,
  },
  navButtonDisabled: {
    opacity: 0.6,
    backgroundColor: ProfessionalColors.border,
    borderColor: ProfessionalColors.border,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ProfessionalColors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: ProfessionalColors.textSecondary,
  },
  quizContent: {
    maxHeight: 500,
  },
  questionCard: {
    marginBottom: Spacing.lg,
  },
  questionTextWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
  },
  optionButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: ProfessionalColors.background,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: ProfessionalColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: ProfessionalColors.primary,
    backgroundColor: `${ProfessionalColors.primary}20`,
  },
  optionButtonCorrect: {
    borderColor: ProfessionalColors.success,
    backgroundColor: `${ProfessionalColors.success}20`,
  },
  optionButtonIncorrect: {
    borderColor: ProfessionalColors.error,
    backgroundColor: `${ProfessionalColors.error}20`,
  },
  optionText: {
    fontSize: 16,
    color: ProfessionalColors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: ProfessionalColors.primary,
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: ProfessionalColors.success,
    fontWeight: '600',
  },
  correctIcon: {
    fontSize: 20,
    color: ProfessionalColors.success,
    fontWeight: 'bold',
  },
  incorrectIcon: {
    fontSize: 20,
    color: ProfessionalColors.error,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: ProfessionalColors.background,
    borderRadius: BorderRadius.sm,
  },
  resultCard: {
    backgroundColor: ProfessionalColors.background,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.sm,
  },
  resultScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: Spacing.sm,
  },
  resultMessage: {
    fontSize: 16,
    color: ProfessionalColors.text,
    textAlign: 'center',
  },
  modalActions: {
    marginTop: Spacing.lg,
  },
  submitButton: {
    backgroundColor: ProfessionalColors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: ProfessionalColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

