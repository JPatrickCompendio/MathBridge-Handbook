import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing } from '../constants/colors';
import { PracticeLevel } from '../data/lessons/module1_quadratic';
import { saveTopicActivitiesProgress } from '../utils/progressStorage';
import { getSpacing, isWeb, scaleFont, scaleSize } from '../utils/responsive';

const PRACTICE_MODAL_WEB_MAX_WIDTH = 420;

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
  overlay: 'rgba(0, 0, 0, 0.7)',
};

interface PracticeActivitiesModalProps {
  visible: boolean;
  onClose: () => void;
  practiceData: PracticeLevel;
  /** Topic id (1–5) so we can save activities progress when user completes the practice */
  topicId?: number;
}

type QuizState = 'level-selection' | 'quiz' | 'summary';

export default function PracticeActivitiesModal({
  visible,
  onClose,
  practiceData,
  topicId,
}: PracticeActivitiesModalProps) {
  const [state, setState] = useState<QuizState>('level-selection');
  const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setState('level-selection');
      setSelectedLevel(null);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setScore(0);
      setAnswers([]);
    }
  }, [visible]);

  // When modal opens (visible becomes true), ensure we start at level-selection
  const didOpenRef = React.useRef(false);
  useEffect(() => {
    if (visible) {
      if (!didOpenRef.current) {
        didOpenRef.current = true;
        setState('level-selection');
        setSelectedLevel(null);
      }
    } else {
      didOpenRef.current = false;
    }
  }, [visible]);

  // Ensure quiz state is set when level is selected (single source of truth)
  useEffect(() => {
    if (selectedLevel && state === 'level-selection') {
      setState('quiz');
    }
  }, [selectedLevel, state]);

  // 30% total for activities = 10% per difficulty (Easy, Medium, Hard). Save 33 / 66 / 100; DB merges with max.
  useEffect(() => {
    if (state === 'summary' && topicId != null && !Number.isNaN(topicId) && selectedLevel) {
      const activitiesPercent = selectedLevel === 'easy' ? 33 : selectedLevel === 'medium' ? 66 : 100;
      saveTopicActivitiesProgress(topicId, activitiesPercent);
    }
  }, [state, topicId, selectedLevel]);

  const handleLevelSelect = (level: 'easy' | 'medium' | 'hard') => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
    setSelectedLevel(level);
    setState('quiz'); // set immediately so we don't rely on useEffect timing
  };

  const handleAnswerSelect = (choice: 'A' | 'B' | 'C' | 'D') => {
    if (showFeedback) return;
    
    setSelectedAnswer(choice);
    const questions = selectedLevel ? practiceData[selectedLevel] : [];
    const currentQuestion = questions[currentQuestionIndex];
    const correct = choice === currentQuestion.correctChoice;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = correct;
    setAnswers(newAnswers);
    
    // Update score correctly
    setScore(prevScore => correct ? prevScore + 1 : prevScore);
  };

  const handleNext = () => {
    const questions = selectedLevel ? practiceData[selectedLevel] : [];
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setState('summary');
    }
  };

  const handleRetry = () => {
    setState('quiz');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
  };

  const handleClose = () => {
    // Reset state when closing
    setState('level-selection');
    setSelectedLevel(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Safely get questions for selected level
  const questions = selectedLevel && practiceData && practiceData[selectedLevel] 
    ? practiceData[selectedLevel] 
    : [];
  const currentQuestion = questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length 
    ? questions[currentQuestionIndex] 
    : null;
  const totalQuestions = questions.length;


  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={state === 'level-selection' ? handleClose : undefined}
            disabled={state !== 'level-selection'}
          />
        </Animated.View>

        <Animated.View
            style={[
            styles.modalContent,
            state === 'level-selection' && styles.modalContentCompact,
            (state === 'quiz' || state === 'summary') && styles.modalContentQuiz,
            isWeb() && styles.modalContentWeb,
            (state === 'quiz' || state === 'summary') && isWeb() && styles.modalContentQuizWeb,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close button - positioned absolutely at top right */}
          {state === 'quiz' && (
            <TouchableOpacity
              style={styles.quizCloseButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.quizCloseIcon}>✕</Text>
            </TouchableOpacity>
          )}
          {state === 'level-selection' && (
            <View style={styles.levelSelectionContainer}>
              <Text style={styles.modalTitle}>Practice Activities</Text>
              <Text style={styles.modalSubtitle}>Choose a difficulty level:</Text>

              <View style={styles.levelsContainer}>
                <TouchableOpacity
                  style={styles.levelCard}
                  onPress={() => handleLevelSelect('easy')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelEmoji}>🟢</Text>
                  <View style={styles.levelCardTextWrap}>
                    <Text style={styles.levelName}>Easy</Text>
                    <Text style={styles.levelCount}>5 items</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.levelCard}
                  onPress={() => handleLevelSelect('medium')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelEmoji}>🟡</Text>
                  <View style={styles.levelCardTextWrap}>
                    <Text style={styles.levelName}>Medium</Text>
                    <Text style={styles.levelCount}>5 items</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.levelCard}
                  onPress={() => handleLevelSelect('hard')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.levelEmoji}>🔴</Text>
                  <View style={styles.levelCardTextWrap}>
                    <Text style={styles.levelName}>Hard</Text>
                    <Text style={styles.levelCount}>5 items</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}

          {state === 'quiz' && selectedLevel && (
            <View style={styles.quizWrapper}>
              <View style={[styles.quizContainer, styles.quizContent]}>
              {questions.length > 0 && currentQuestion ? (
                <>
                  <View style={styles.quizHeader}>
                <View style={styles.progressHeaderRow}>
                  <Text style={styles.progressText}>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>
                      {selectedLevel === 'easy' ? '🟢 Easy' : selectedLevel === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.questionCard}>
                <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
              </View>

              <View style={styles.choicesContainer}>
                {(['A', 'B', 'C', 'D'] as const).map((choice, index) => {
                  const isSelected = selectedAnswer === choice;
                  const isCorrectChoice = choice === currentQuestion.correctChoice;
                  const showCorrect = showFeedback && isCorrectChoice;
                  const showIncorrect = showFeedback && isSelected && !isCorrect;

                  let buttonStyle = [styles.choiceButton];
                  let labelStyle = styles.choiceLabel;
                  let textStyle = styles.choiceText;
                  
                  if (showCorrect) {
                    buttonStyle.push(styles.correctChoice);
                    labelStyle = styles.choiceLabelCorrect;
                  } else if (showIncorrect) {
                    buttonStyle.push(styles.incorrectChoice);
                    labelStyle = styles.choiceLabelIncorrect;
                  } else if (isSelected) {
                    buttonStyle.push(styles.selectedChoice);
                  }

                  return (
                    <TouchableOpacity
                      key={choice}
                      style={buttonStyle}
                      onPress={() => handleAnswerSelect(choice)}
                      disabled={showFeedback}
                      activeOpacity={0.7}
                    >
                      <View style={styles.choiceLabelContainer}>
                        <Text style={labelStyle}>{choice}</Text>
                      </View>
                      <View style={styles.choiceTextWrap}>
                        <Text style={textStyle} numberOfLines={2}>
                          {currentQuestion.choices[choice]}
                        </Text>
                      </View>
                      {showCorrect && <View style={styles.choiceIconWrap}><Text style={styles.checkmark}>✓</Text></View>}
                      {showIncorrect && <View style={styles.choiceIconWrap}><Text style={styles.crossmark}>✗</Text></View>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showFeedback && (
                <View style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
                  <View style={styles.feedbackHeader}>
                    <Text style={[styles.feedbackIcon, isCorrect ? styles.correctIcon : styles.incorrectIcon]}>
                      {isCorrect ? '✓' : '✗'}
                    </Text>
                    <Text style={[styles.feedbackText, isCorrect ? styles.correctText : styles.incorrectText]}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </Text>
                  </View>
                  {!isCorrect && (
                    <View style={styles.correctAnswerBox}>
                      <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
                      <Text style={styles.correctAnswerText}>
                        {currentQuestion.correctChoice}. {currentQuestion.choices[currentQuestion.correctChoice]}
                      </Text>
                    </View>
                  )}
                  {currentQuestion.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationLabel}>💡 Explanation:</Text>
                      <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                    </View>
                  )}
                </View>
              )}

              {showFeedback && (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next →' : 'View Summary'}
                  </Text>
                </TouchableOpacity>
              )}
                </>
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {questions.length === 0 ? 'No questions available' : 'Loading question...'}
                  </Text>
                  <Text style={styles.errorSubtext}>
                    Level: {selectedLevel || 'none'}
                  </Text>
                  <Text style={styles.errorSubtext}>
                    Questions found: {questions.length}
                  </Text>
                  {questions.length > 0 && (
                    <Text style={styles.errorSubtext}>
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </Text>
                  )}
                  <Text style={styles.errorSubtext}>
                    Practice data keys: {practiceData ? Object.keys(practiceData).join(', ') : 'none'}
                  </Text>
                  <Text style={styles.errorSubtext}>
                    State: {state}, SelectedLevel: {selectedLevel || 'null'}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setState('level-selection');
                      setSelectedLevel(null);
                    }}
                  >
                  <Text style={styles.closeButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
              )}
              </View>
            </View>
          )}

          {state === 'summary' && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Activity Complete!</Text>
              <Text style={styles.summaryScore}>
                Score: {score} / {totalQuestions}
              </Text>
              <Text style={styles.summaryPercentage}>
                {Math.round((score / totalQuestions) * 100)}%
              </Text>

              <View style={styles.summaryActions}>
                <TouchableOpacity
                  style={[styles.summaryButton, styles.retryButton]}
                  onPress={handleRetry}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryButtonText}>Retry Level</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.summaryButton, styles.closeSummaryButton]}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeSummaryButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ProfessionalColors.overlay,
  },
  modalContent: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(18),
    padding: getSpacing(Spacing.md),
    height: '88%',
    maxHeight: 640,
    maxWidth: '92%',
    width: '88%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(20),
    elevation: 20,
    position: 'relative',
  },
  modalContentCompact: {
    height: undefined,
    maxHeight: 420,
  },
  modalContentQuiz: {
    height: undefined,
    maxHeight: 560,
  },
  modalContentWeb: {
    maxWidth: PRACTICE_MODAL_WEB_MAX_WIDTH,
    width: '100%',
  },
  modalContentQuizWeb: {
    maxWidth: 640,
  },
  quizWrapper: {
    width: '100%',
  },
  levelSelectionContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.xs),
  },
  modalTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  modalSubtitle: {
    fontSize: scaleFont(14),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.md),
  },
  levelsContainer: {
    width: '100%',
    gap: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.md),
  },
  levelCard: {
    backgroundColor: ProfessionalColors.background,
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.md),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: ProfessionalColors.border,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: getSpacing(Spacing.md),
  },
  levelCardTextWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: getSpacing(Spacing.xs),
  },
  levelEmoji: {
    fontSize: scaleFont(26),
  },
  levelName: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
  },
  levelCount: {
    fontSize: scaleFont(12),
    color: ProfessionalColors.textSecondary,
  },
  closeButton: {
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.lg),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.border,
  },
  closeButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  quizContainer: {
    backgroundColor: ProfessionalColors.white,
    width: '100%',
  },
  quizContent: {
    paddingTop: getSpacing(Spacing.sm),
    paddingBottom: getSpacing(Spacing.sm),
    backgroundColor: ProfessionalColors.white,
  },
  quizCloseButton: {
    position: 'absolute',
    top: getSpacing(Spacing.xs),
    right: getSpacing(Spacing.xs),
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(15),
    backgroundColor: ProfessionalColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 2,
    borderColor: ProfessionalColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(4),
    elevation: 8,
  },
  quizCloseIcon: {
    fontSize: scaleFont(14),
    color: ProfessionalColors.text,
    fontWeight: 'bold',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xs),
  },
  difficultyBadge: {
    backgroundColor: ProfessionalColors.primary + '20',
    paddingHorizontal: getSpacing(Spacing.xs),
    paddingVertical: scaleSize(2),
    borderRadius: scaleSize(8),
  },
  difficultyText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: ProfessionalColors.primary,
  },
  questionCard: {
    backgroundColor: ProfessionalColors.background,
    padding: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.sm),
    marginBottom: getSpacing(Spacing.sm),
    borderLeftWidth: scaleSize(3),
    borderLeftColor: ProfessionalColors.primary,
  },
  questionNumber: {
    fontSize: scaleFont(12),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: scaleSize(2),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quizHeader: {
    marginTop: getSpacing(Spacing.xs),
    marginBottom: getSpacing(Spacing.sm),
    paddingRight: getSpacing(Spacing.lg),
  },
  progressText: {
    fontSize: scaleFont(14),
    color: ProfessionalColors.textSecondary,
    marginBottom: scaleSize(2),
    fontWeight: '500',
  },
  progressBar: {
    height: scaleSize(4),
    backgroundColor: ProfessionalColors.border,
    borderRadius: scaleSize(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(2),
  },
  questionText: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: ProfessionalColors.text,
    lineHeight: scaleFont(28),
  },
  choicesContainer: {
    width: '100%',
    gap: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.sm),
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: scaleSize(52),
    paddingVertical: getSpacing(Spacing.sm),
    paddingHorizontal: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.sm),
    backgroundColor: ProfessionalColors.white,
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(1) },
    shadowOpacity: 0.05,
    shadowRadius: scaleSize(1),
    elevation: 1,
  },
  selectedChoice: {
    borderColor: ProfessionalColors.primary,
    backgroundColor: ProfessionalColors.primary + '10',
    shadowColor: ProfessionalColors.primary,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  correctChoice: {
    borderColor: ProfessionalColors.success,
    backgroundColor: ProfessionalColors.success + '15',
    shadowColor: ProfessionalColors.success,
    shadowOpacity: 0.3,
    elevation: 5,
  },
  incorrectChoice: {
    borderColor: ProfessionalColors.error,
    backgroundColor: ProfessionalColors.error + '15',
    shadowColor: ProfessionalColors.error,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  choiceLabelContainer: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: scaleSize(12),
    backgroundColor: ProfessionalColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.sm),
    flexShrink: 0,
  },
  choiceTextWrap: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  choiceIconWrap: {
    flexShrink: 0,
    marginLeft: getSpacing(Spacing.xs),
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceLabel: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
  },
  choiceLabelCorrect: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: ProfessionalColors.success,
  },
  choiceLabelIncorrect: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    color: ProfessionalColors.error,
  },
  choiceText: {
    fontSize: scaleFont(16),
    color: ProfessionalColors.text,
    lineHeight: scaleFont(22),
  },
  checkmark: {
    fontSize: scaleFont(16),
    color: ProfessionalColors.success,
    fontWeight: 'bold',
  },
  crossmark: {
    fontSize: scaleFont(16),
    color: ProfessionalColors.error,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: getSpacing(Spacing.xs),
    marginBottom: getSpacing(Spacing.sm),
    padding: getSpacing(Spacing.sm),
    borderRadius: scaleSize(BorderRadius.sm),
    borderWidth: 1.5,
  },
  feedbackCorrect: {
    backgroundColor: ProfessionalColors.success + '10',
    borderColor: ProfessionalColors.success,
  },
  feedbackIncorrect: {
    backgroundColor: ProfessionalColors.error + '10',
    borderColor: ProfessionalColors.error,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xs),
  },
  feedbackIcon: {
    fontSize: scaleFont(18),
    marginRight: getSpacing(Spacing.xs),
  },
  correctIcon: {
    color: ProfessionalColors.success,
  },
  incorrectIcon: {
    color: ProfessionalColors.error,
  },
  feedbackText: {
    fontSize: scaleFont(13),
    fontWeight: 'bold',
  },
  correctText: {
    color: ProfessionalColors.success,
  },
  incorrectText: {
    color: ProfessionalColors.error,
  },
  correctAnswerBox: {
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.xs),
    borderRadius: scaleSize(BorderRadius.sm),
    marginBottom: getSpacing(Spacing.xs),
    borderLeftWidth: scaleSize(2),
    borderLeftColor: ProfessionalColors.success,
  },
  correctAnswerLabel: {
    fontSize: scaleFont(9),
    fontWeight: '600',
    color: ProfessionalColors.textSecondary,
    marginBottom: scaleSize(1),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  correctAnswerText: {
    fontSize: scaleFont(11),
    color: ProfessionalColors.text,
    fontWeight: '600',
    lineHeight: scaleFont(15),
  },
  explanationBox: {
    backgroundColor: ProfessionalColors.white,
    padding: getSpacing(Spacing.xs),
    borderRadius: scaleSize(BorderRadius.sm),
    borderLeftWidth: scaleSize(2),
    borderLeftColor: ProfessionalColors.primary,
  },
  explanationLabel: {
    fontSize: scaleFont(9),
    fontWeight: '600',
    color: ProfessionalColors.textSecondary,
    marginBottom: scaleSize(1),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: scaleFont(11),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleFont(14),
  },
  nextButton: {
    backgroundColor: ProfessionalColors.primary,
    paddingVertical: getSpacing(Spacing.lg),
    paddingHorizontal: getSpacing(Spacing.xl),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getSpacing(Spacing.sm),
    minHeight: scaleSize(52),
  },
  nextButtonText: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  summaryContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(Spacing.xl),
  },
  summaryTitle: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.lg),
  },
  summaryScore: {
    fontSize: scaleFont(20),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.sm),
  },
  summaryPercentage: {
    fontSize: scaleFont(36),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: getSpacing(Spacing.xl),
  },
  summaryActions: {
    width: '100%',
    gap: getSpacing(Spacing.md),
    marginTop: getSpacing(Spacing.lg),
  },
  summaryButton: {
    paddingVertical: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.xl),
    borderRadius: scaleSize(BorderRadius.md),
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: ProfessionalColors.primary,
  },
  retryButtonText: {
    fontSize: scaleFont(16),
    fontWeight: 'bold',
    color: ProfessionalColors.white,
  },
  closeSummaryButton: {
    backgroundColor: ProfessionalColors.border,
  },
  closeSummaryButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getSpacing(Spacing.xl),
    minHeight: 400,
  },
  errorText: {
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.sm),
  },
  errorSubtext: {
    fontSize: scaleFont(14),
    color: ProfessionalColors.textSecondary,
  },
});
