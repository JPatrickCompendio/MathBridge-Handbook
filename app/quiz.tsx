import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BorderRadius, Spacing } from '../constants/colors';

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
  easy: '#61E35D',
  medium: '#FF6600',
  hard: '#DC2626',
};

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

// Question Bank for all topics
const QUESTION_BANK: Question[] = [
  // Geometry - Easy
  { id: 1, question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1, explanation: 'The sum of all angles in a triangle always equals 180 degrees.', topic: 'Geometry', difficulty: 'easy' },
  { id: 2, question: 'How many sides does a pentagon have?', options: ['3', '4', '5', '6'], correctAnswer: 2, explanation: 'A pentagon has 5 sides.', topic: 'Geometry', difficulty: 'easy' },
  { id: 3, question: 'What is a right angle?', options: ['45°', '90°', '180°', '360°'], correctAnswer: 1, explanation: 'A right angle measures exactly 90 degrees.', topic: 'Geometry', difficulty: 'easy' },
  { id: 4, question: 'What is the longest side of a right triangle called?', options: ['Base', 'Height', 'Hypotenuse', 'Leg'], correctAnswer: 2, explanation: 'The hypotenuse is the side opposite the right angle.', topic: 'Geometry', difficulty: 'easy' },
  { id: 5, question: 'How many degrees are in a full circle?', options: ['180°', '270°', '360°', '90°'], correctAnswer: 2, explanation: 'A full circle contains 360 degrees.', topic: 'Geometry', difficulty: 'easy' },
  // Geometry - Medium
  { id: 6, question: 'What type of angle measures 120°?', options: ['Right', 'Acute', 'Obtuse', 'Straight'], correctAnswer: 2, explanation: '120° is greater than 90° but less than 180°, so it is an obtuse angle.', topic: 'Geometry', difficulty: 'medium' },
  { id: 7, question: 'What are two angles called if they add up to 90°?', options: ['Supplementary', 'Complementary', 'Adjacent', 'Vertical'], correctAnswer: 1, explanation: 'Complementary angles add up to 90 degrees.', topic: 'Geometry', difficulty: 'medium' },
  { id: 8, question: 'What do all angles in an equilateral triangle measure?', options: ['45°', '60°', '90°', '120°'], correctAnswer: 1, explanation: 'In an equilateral triangle, all angles measure 60 degrees.', topic: 'Geometry', difficulty: 'medium' },
  { id: 9, question: 'What is the area of a triangle with base 10 and height 6?', options: ['30', '60', '16', '26'], correctAnswer: 0, explanation: 'Area = (base × height) / 2 = (10 × 6) / 2 = 30', topic: 'Geometry', difficulty: 'medium' },
  { id: 10, question: 'How many equal sides does an isosceles triangle have?', options: ['0', '2', '3', 'All'], correctAnswer: 1, explanation: 'An isosceles triangle has exactly two equal sides.', topic: 'Geometry', difficulty: 'medium' },
  // Geometry - Hard
  { id: 11, question: 'In a right triangle, if one leg is 3 and the other is 4, what is the hypotenuse?', options: ['5', '7', '12', '25'], correctAnswer: 0, explanation: 'Using Pythagorean theorem: 3² + 4² = 9 + 16 = 25, so hypotenuse = √25 = 5', topic: 'Geometry', difficulty: 'hard' },
  { id: 12, question: 'What is the sum of interior angles in a hexagon?', options: ['540°', '720°', '900°', '1080°'], correctAnswer: 1, explanation: 'Formula: (n-2) × 180° = (6-2) × 180° = 720°', topic: 'Geometry', difficulty: 'hard' },
  
  // Algebra - Easy
  { id: 13, question: 'What is the solution to x + 7 = 12?', options: ['5', '7', '12', '19'], correctAnswer: 0, explanation: 'x + 7 = 12, so x = 12 - 7 = 5', topic: 'Algebra', difficulty: 'easy' },
  { id: 14, question: 'What does a variable represent?', options: ['A fixed value', 'An unknown value', 'A constant', 'An operation'], correctAnswer: 1, explanation: 'A variable represents an unknown or changeable value.', topic: 'Algebra', difficulty: 'easy' },
  { id: 15, question: 'In the equation 3x + 5 = 14, what is the variable?', options: ['3', '5', 'x', '14'], correctAnswer: 2, explanation: 'x is the variable in this equation.', topic: 'Algebra', difficulty: 'easy' },
  { id: 16, question: 'What is 2x when x = 5?', options: ['7', '10', '25', '52'], correctAnswer: 1, explanation: '2x = 2 × 5 = 10', topic: 'Algebra', difficulty: 'easy' },
  { id: 17, question: 'Which are like terms: 3x, 5x, and 2y?', options: ['3x and 2y', '5x and 2y', '3x and 5x', 'All'], correctAnswer: 2, explanation: '3x and 5x are like terms because they have the same variable.', topic: 'Algebra', difficulty: 'easy' },
  // Algebra - Medium
  { id: 18, question: 'What is the solution to 3x - 6 = 9?', options: ['1', '5', '15', '45'], correctAnswer: 1, explanation: '3x - 6 = 9, so 3x = 15, therefore x = 5', topic: 'Algebra', difficulty: 'medium' },
  { id: 19, question: 'Solve: 2x + 3 = 11', options: ['4', '7', '14', '25'], correctAnswer: 0, explanation: '2x + 3 = 11, so 2x = 8, therefore x = 4', topic: 'Algebra', difficulty: 'medium' },
  { id: 20, question: 'What is the inverse operation of addition?', options: ['Multiplication', 'Subtraction', 'Division', 'Exponentiation'], correctAnswer: 1, explanation: 'Subtraction is the inverse of addition.', topic: 'Algebra', difficulty: 'medium' },
  { id: 21, question: 'What operation is used to solve 5x = 20?', options: ['Addition', 'Subtraction', 'Multiplication', 'Division'], correctAnswer: 3, explanation: 'To solve 5x = 20, divide both sides by 5.', topic: 'Algebra', difficulty: 'medium' },
  { id: 22, question: 'Simplify: 3x + 5x', options: ['8x', '15x', '8x²', '15x²'], correctAnswer: 0, explanation: '3x + 5x = (3 + 5)x = 8x', topic: 'Algebra', difficulty: 'medium' },
  // Algebra - Hard
  { id: 23, question: 'What is the degree of a quadratic equation?', options: ['1', '2', '3', '4'], correctAnswer: 1, explanation: 'A quadratic equation has degree 2.', topic: 'Algebra', difficulty: 'hard' },
  { id: 24, question: 'What is the discriminant of x² - 5x + 6 = 0?', options: ['1', '-1', '25', '24'], correctAnswer: 0, explanation: 'Discriminant = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1', topic: 'Algebra', difficulty: 'hard' },
  
  // Statistics - Easy
  { id: 25, question: 'What is the mean of [2, 4, 6, 8, 10]?', options: ['5', '6', '7', '8'], correctAnswer: 1, explanation: 'Mean = (2 + 4 + 6 + 8 + 10) / 5 = 30 / 5 = 6', topic: 'Statistics', difficulty: 'easy' },
  { id: 26, question: 'What is a sample?', options: ['The entire group', 'A subset of the population', 'A type of data', 'A statistic'], correctAnswer: 1, explanation: 'A sample is a subset of the population.', topic: 'Statistics', difficulty: 'easy' },
  { id: 27, question: 'What is the mode of [2, 3, 3, 4, 5, 3, 6]?', options: ['2', '3', '4', '5'], correctAnswer: 1, explanation: 'The mode is 3 because it appears most frequently.', topic: 'Statistics', difficulty: 'easy' },
  { id: 28, question: 'What is the median of [1, 3, 5, 7, 9]?', options: ['3', '5', '7', '9'], correctAnswer: 1, explanation: 'The median is 5, which is the middle value.', topic: 'Statistics', difficulty: 'easy' },
  { id: 29, question: 'What is statistics?', options: ['The study of numbers', 'The science of data', 'A type of math', 'All of the above'], correctAnswer: 3, explanation: 'Statistics is the science of collecting, organizing, analyzing, and interpreting data.', topic: 'Statistics', difficulty: 'easy' },
  // Statistics - Medium
  { id: 30, question: 'What is the median of [1, 3, 5, 7, 9, 11]?', options: ['5', '6', '7', '8'], correctAnswer: 1, explanation: 'With 6 values, the median is (5 + 7) / 2 = 6', topic: 'Statistics', difficulty: 'medium' },
  { id: 31, question: 'Which measure is most affected by outliers?', options: ['Mean', 'Median', 'Mode', 'All equally'], correctAnswer: 0, explanation: 'The mean is most affected by outliers.', topic: 'Statistics', difficulty: 'medium' },
  { id: 32, question: 'Which chart is best for showing trends over time?', options: ['Bar chart', 'Line graph', 'Pie chart', 'Histogram'], correctAnswer: 1, explanation: 'Line graphs are ideal for showing trends over time.', topic: 'Statistics', difficulty: 'medium' },
  { id: 33, question: 'What does a pie chart show?', options: ['Trends', 'Comparisons', 'Proportions', 'Frequencies'], correctAnswer: 2, explanation: 'Pie charts show proportions or percentages of a whole.', topic: 'Statistics', difficulty: 'medium' },
  { id: 34, question: 'Which measure is best for skewed data with outliers?', options: ['Mean', 'Median', 'Mode', 'All are equal'], correctAnswer: 1, explanation: 'The median is best for skewed data with outliers.', topic: 'Statistics', difficulty: 'medium' },
  // Statistics - Hard
  { id: 35, question: 'What is the range of [10, 5, 8, 12, 7]?', options: ['5', '7', '12', '7'], correctAnswer: 1, explanation: 'Range = max - min = 12 - 5 = 7', topic: 'Statistics', difficulty: 'hard' },
  
  // Trigonometry - Easy
  { id: 36, question: 'What is trigonometry?', options: ['Study of triangles', 'Study of angles and triangles', 'Study of circles', 'Study of shapes'], correctAnswer: 1, explanation: 'Trigonometry is the study of relationships between angles and sides of triangles.', topic: 'Trigonometry', difficulty: 'easy' },
  { id: 37, question: 'How many 90° angles does a right triangle have?', options: ['0', '1', '2', '3'], correctAnswer: 1, explanation: 'A right triangle has exactly one 90° angle.', topic: 'Trigonometry', difficulty: 'easy' },
  { id: 38, question: 'What is the longest side of a right triangle called?', options: ['Base', 'Height', 'Hypotenuse', 'Leg'], correctAnswer: 2, explanation: 'The hypotenuse is the side opposite the right angle.', topic: 'Trigonometry', difficulty: 'easy' },
  { id: 39, question: 'What does SOH stand for?', options: ['Sine = Opposite/Hypotenuse', 'Sine = Opposite/Adjacent', 'Sine = Adjacent/Hypotenuse', 'Sine = Hypotenuse/Opposite'], correctAnswer: 0, explanation: 'SOH means Sine = Opposite / Hypotenuse', topic: 'Trigonometry', difficulty: 'easy' },
  { id: 40, question: 'What is the formula for cosine?', options: ['Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Adjacent'], correctAnswer: 1, explanation: 'Cosine = Adjacent / Hypotenuse (CAH)', topic: 'Trigonometry', difficulty: 'easy' },
  // Trigonometry - Medium
  { id: 41, question: 'What is the formula for tangent?', options: ['Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Opposite'], correctAnswer: 2, explanation: 'Tangent = Opposite / Adjacent (TOA)', topic: 'Trigonometry', difficulty: 'medium' },
  { id: 42, question: 'What is the radius of a unit circle?', options: ['0', '1', '2', 'π'], correctAnswer: 1, explanation: 'A unit circle has a radius of exactly 1 unit.', topic: 'Trigonometry', difficulty: 'medium' },
  { id: 43, question: 'How many radians are in a full circle?', options: ['90', '180', '360', '2π'], correctAnswer: 3, explanation: 'A full circle contains 2π radians.', topic: 'Trigonometry', difficulty: 'medium' },
  { id: 44, question: 'Where is the unit circle centered?', options: ['(1, 1)', '(0, 0)', '(0, 1)', '(1, 0)'], correctAnswer: 1, explanation: 'The unit circle is centered at the origin (0, 0).', topic: 'Trigonometry', difficulty: 'medium' },
  // Trigonometry - Hard
  { id: 45, question: 'What is sin(90°)?', options: ['0', '0.5', '1', '√2/2'], correctAnswer: 2, explanation: 'sin(90°) = 1', topic: 'Trigonometry', difficulty: 'hard' },
  
  // Calculus - Easy
  { id: 46, question: 'What does calculus study?', options: ['Discrete numbers', 'Continuous change', 'Shapes', 'Angles'], correctAnswer: 1, explanation: 'Calculus is the mathematical study of continuous change.', topic: 'Calculus', difficulty: 'easy' },
  { id: 47, question: 'How many main branches does calculus have?', options: ['1', '2', '3', '4'], correctAnswer: 1, explanation: 'Calculus has two main branches: differential and integral.', topic: 'Calculus', difficulty: 'easy' },
  { id: 48, question: 'What does differential calculus study?', options: ['Accumulation', 'Rates of change', 'Areas', 'Volumes'], correctAnswer: 1, explanation: 'Differential calculus studies derivatives and rates of change.', topic: 'Calculus', difficulty: 'easy' },
  { id: 49, question: 'What does a limit describe?', options: ['Exact value', 'Approaching behavior', 'Function value', 'Derivative'], correctAnswer: 1, explanation: 'A limit describes the value that a function approaches.', topic: 'Calculus', difficulty: 'easy' },
  { id: 50, question: 'What is the limit of f(x) = x² as x approaches 2?', options: ['2', '4', '8', '16'], correctAnswer: 1, explanation: 'As x approaches 2, x² approaches 4.', topic: 'Calculus', difficulty: 'easy' },
  // Calculus - Medium
  { id: 51, question: 'Can a limit exist even if the function is undefined at that point?', options: ['No', 'Yes', 'Sometimes', 'Never'], correctAnswer: 1, explanation: 'Yes, limits describe approaching behavior, so they can exist even when the function is undefined.', topic: 'Calculus', difficulty: 'medium' },
  { id: 52, question: 'What does a derivative measure?', options: ['Area', 'Volume', 'Rate of change', 'Distance'], correctAnswer: 2, explanation: 'Derivatives measure the instantaneous rate of change.', topic: 'Calculus', difficulty: 'medium' },
  { id: 53, question: 'What is the geometric meaning of a derivative?', options: ['Area under curve', 'Slope of tangent line', 'Length of curve', 'Volume'], correctAnswer: 1, explanation: 'The derivative at a point is the slope of the tangent line.', topic: 'Calculus', difficulty: 'medium' },
  { id: 54, question: 'What is the derivative of f(x) = x²?', options: ['x', '2x', 'x²', '2x²'], correctAnswer: 1, explanation: 'The derivative of x² is 2x using the power rule.', topic: 'Calculus', difficulty: 'medium' },
  // Calculus - Hard
  { id: 55, question: 'What is the derivative of f(x) = 3x³?', options: ['3x²', '9x²', 'x³', '9x'], correctAnswer: 1, explanation: 'Using the power rule: derivative of 3x³ = 3 × 3x² = 9x²', topic: 'Calculus', difficulty: 'hard' },
  
  // Probability - Easy
  { id: 56, question: 'What is the range of probability values?', options: ['0 to 10', '0 to 100', '0 to 1', '-1 to 1'], correctAnswer: 2, explanation: 'Probability values range from 0 (impossible) to 1 (certain).', topic: 'Probability', difficulty: 'easy' },
  { id: 57, question: 'What does a probability of 0 mean?', options: ['Certain', 'Impossible', '50% chance', 'Unknown'], correctAnswer: 1, explanation: 'A probability of 0 means the event is impossible.', topic: 'Probability', difficulty: 'easy' },
  { id: 58, question: 'What is the probability of flipping heads on a fair coin?', options: ['0', '0.5', '1', '2'], correctAnswer: 1, explanation: 'A fair coin has 2 outcomes, so P(heads) = 1/2 = 0.5', topic: 'Probability', difficulty: 'easy' },
  { id: 59, question: 'What is the probability of rolling a 6 on a fair die?', options: ['1/6', '1/2', '1/3', '1'], correctAnswer: 0, explanation: 'A fair die has 6 outcomes, so P(6) = 1/6', topic: 'Probability', difficulty: 'easy' },
  { id: 60, question: 'What is P(not A) if P(A) = 0.7?', options: ['0.3', '0.7', '1.7', '0'], correctAnswer: 0, explanation: 'Using complement rule: P(not A) = 1 - P(A) = 1 - 0.7 = 0.3', topic: 'Probability', difficulty: 'easy' },
  // Probability - Medium
  { id: 61, question: 'If two events are independent, what is P(A and B)?', options: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A) - P(B)', 'P(A) / P(B)'], correctAnswer: 1, explanation: 'For independent events, P(A and B) = P(A) × P(B)', topic: 'Probability', difficulty: 'medium' },
  { id: 62, question: 'What does P(A|B) mean?', options: ['Probability of A and B', 'Probability of A given B', 'Probability of A or B', 'Probability of not A'], correctAnswer: 1, explanation: 'P(A|B) means the probability of A occurring given that B has already occurred.', topic: 'Probability', difficulty: 'medium' },
  { id: 63, question: 'How do you calculate P(A|B)?', options: ['P(A) + P(B)', 'P(A and B) / P(B)', 'P(A) × P(B)', 'P(A) - P(B)'], correctAnswer: 1, explanation: 'Conditional probability: P(A|B) = P(A and B) / P(B)', topic: 'Probability', difficulty: 'medium' },
  { id: 64, question: 'If events A and B are independent, what is P(A|B)?', options: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A)', 'P(B)'], correctAnswer: 2, explanation: 'If events are independent, P(A|B) = P(A) because B does not affect A.', topic: 'Probability', difficulty: 'medium' },
  // Probability - Hard
  { id: 65, question: 'What is the probability of rolling two sixes in a row with a fair die?', options: ['1/6', '1/12', '1/36', '1/3'], correctAnswer: 2, explanation: 'P(two sixes) = P(6) × P(6) = (1/6) × (1/6) = 1/36', topic: 'Probability', difficulty: 'hard' },
];

// Get questions based on filters
const getQuestions = (
  topicId?: string,
  difficulty?: string,
  count: number = 10
): Question[] => {
  let filtered = QUESTION_BANK;

  // Filter by topic
  if (topicId) {
    const topicMap: { [key: string]: string } = {
      '1': 'Geometry',
      '2': 'Algebra',
      '3': 'Statistics',
      '4': 'Trigonometry',
      '5': 'Calculus',
      '6': 'Probability',
    };
    const topicName = topicMap[topicId];
    if (topicName) {
      filtered = filtered.filter((q) => q.topic === topicName);
    }
  }

  // Filter by difficulty
  if (difficulty && difficulty !== 'mixed') {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  // Shuffle and select
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    questionCount?: string;
    difficulty?: string;
    topicId?: string;
    topicName?: string;
    timeLimit?: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [allAvailableQuestions, setAllAvailableQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [typedAnswers, setTypedAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSurvival, setIsSurvival] = useState(false);
  const [survivalEnded, setSurvivalEnded] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Extract stable values from params to avoid infinite loops
  const mode = params.mode || '';
  const topicId = params.topicId || '';
  const difficulty = params.difficulty || '';
  const questionCountStr = params.questionCount || '10';
  const timeLimitStr = params.timeLimit || '300';
  
  const questionCount = questionCountStr === 'unlimited' 
    ? Infinity 
    : parseInt(questionCountStr);
  const isBlindMode = mode === 'blind';
  const isSurvivalMode = mode === 'survival';
  const hasTimeLimit = timeLimitStr && mode === 'time-attack';

  useEffect(() => {
    // Load all available questions
    const loadedQuestions = getQuestions(
      topicId,
      difficulty,
      questionCount === Infinity ? 200 : questionCount
    );
    setAllAvailableQuestions(loadedQuestions);
    
    // For survival mode, start with first question
    // For other modes, set all questions at once
    if (isSurvivalMode) {
      setQuestions(loadedQuestions.length > 0 ? [loadedQuestions[0]] : []);
    } else {
      setQuestions(loadedQuestions.slice(0, questionCount === Infinity ? 20 : questionCount));
    }
    
    setIsSurvival(isSurvivalMode);

    return () => {
      // Cleanup on unmount or when dependencies change
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [topicId, difficulty, questionCount, isSurvivalMode]);

  // Start timer when quiz starts (separate effect to avoid conflicts)
  useEffect(() => {
    if (hasTimeLimit && quizStarted && timeLeft === null) {
      const limit = parseInt(timeLimitStr);
      setTimeLeft(limit);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizStarted, hasTimeLimit, timeLimitStr]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentQuestionIndex]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults || survivalEnded) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const newSelectedAnswers = { ...selectedAnswers, [currentQuestion.id]: answerIndex };
    setSelectedAnswers(newSelectedAnswers);
    
    const newAnsweredIds = new Set([...answeredQuestionIds, currentQuestion.id]);
    setAnsweredQuestionIds(newAnsweredIds);

    // Check if correct for survival mode
    if (isSurvivalMode) {
      if (answerIndex !== currentQuestion.correctAnswer) {
        // Wrong answer - end survival mode
        setSurvivalEnded(true);
        setTimeout(() => {
          setShowResults(true);
        }, 1000);
        return;
      } else {
        // Correct answer - add to score
        setScore((prev) => prev + 1);
        
        // Get next unanswered question
        const unanswered = allAvailableQuestions.filter(
          (q) => !newAnsweredIds.has(q.id)
        );
        
        if (unanswered.length > 0) {
          // Add next question and move to it
          const nextQuestion = unanswered[Math.floor(Math.random() * unanswered.length)];
          setTimeout(() => {
            setQuestions((prev) => [...prev, nextQuestion]);
            setCurrentQuestionIndex((prev) => prev + 1);
            fadeAnim.setValue(0);
          }, 800);
        } else {
          // No more questions - finish quiz (victory!)
          setTimeout(() => {
            setShowResults(true);
          }, 800);
        }
      }
    }
  };

  const handleTypedAnswer = (text: string) => {
    setTypedAnswers({ ...typedAnswers, [questions[currentQuestionIndex].id]: text });
  };

  const handleNextQuestion = () => {
    if (isSurvivalMode) {
      // Survival mode handles navigation automatically
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      fadeAnim.setValue(0);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      fadeAnim.setValue(0);
    }
  };

  const handleSubmitAnswer = () => {
    if (isBlindMode && questions[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex];
      const typed = typedAnswers[currentQuestion.id]?.toLowerCase().trim();
      const correct = currentQuestion.options[currentQuestion.correctAnswer].toLowerCase().trim();
      
      // Check if answer is correct
      const isCorrect = typed === correct || 
        typed === correct.replace(/[^\d.-]/g, '') ||
        (typed && correct.includes(typed)) ||
        (correct.includes(typed));
      
      // Show feedback
      Alert.alert(
        isCorrect ? '✅ Correct!' : '❌ Incorrect',
        isCorrect 
          ? `Well done! ${currentQuestion.explanation}`
          : `The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}\n\n${currentQuestion.explanation}`,
        [
          {
            text: 'Next',
            onPress: () => {
              if (currentQuestionIndex < questions.length - 1) {
                handleNextQuestion();
              } else {
                handleFinishQuiz();
              }
            },
          },
        ]
      );
    }
  };

  const handleFinishQuiz = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isSurvivalMode) {
      // Score is already calculated during survival mode
      setShowResults(true);
      return;
    }

    let calculatedScore = 0;
    const questionsToCheck = questions.slice(0, currentQuestionIndex + 1);
    
    questionsToCheck.forEach((q) => {
      if (isBlindMode) {
        // For blind mode, check typed answer with flexible matching
        const typed = typedAnswers[q.id]?.toLowerCase().trim() || '';
        const correct = q.options[q.correctAnswer].toLowerCase().trim();
        const correctNumeric = correct.replace(/[^\d.-]/g, '');
        const typedNumeric = typed.replace(/[^\d.-]/g, '');
        
        // Check multiple ways the answer could be correct
        if (
          typed === correct ||
          typedNumeric === correctNumeric ||
          (typed && correct.includes(typed)) ||
          (correct && typed.includes(correct)) ||
          (typedNumeric && correctNumeric && typedNumeric === correctNumeric)
        ) {
          calculatedScore++;
        }
      } else {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          calculatedScore++;
        }
      }
    });

    setScore(calculatedScore);
    setShowResults(true);
  };

  const handleRestart = () => {
    // Reset all state
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTypedAnswers({});
    setScore(0);
    setShowResults(false);
    setSurvivalEnded(false);
    setQuizStarted(false);
    setAnsweredQuestionIds(new Set());
    setTimeLeft(null);
    
    // Reload questions
    const loadedQuestions = getQuestions(
      topicId,
      difficulty,
      questionCount === Infinity ? 200 : questionCount
    );
    setAllAvailableQuestions(loadedQuestions);
    
    if (isSurvivalMode) {
      setQuestions(loadedQuestions.length > 0 ? [loadedQuestions[0]] : []);
    } else {
      setQuestions(loadedQuestions.slice(0, questionCount === Infinity ? 20 : questionCount));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = isSurvivalMode
    ? Math.min(100, (currentQuestionIndex + 1) * 5) // Show progress for survival
    : questions.length > 0 
      ? ((currentQuestionIndex + 1) / questions.length) * 100 
      : 0;

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startScreen}>
          <View style={styles.startHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.startTitle}>
              {params.mode === 'time-attack' && '⏱️ Time Attack'}
              {params.mode === 'survival' && '🔥 Survival Mode'}
              {params.mode === 'marathon' && '🏃 Marathon'}
              {params.mode === 'blind' && '👁️ Blind Mode'}
              {params.mode === 'random' && '🎯 Random Practice'}
              {params.mode === 'topic' && `📚 ${params.topicName || 'Topic'} Practice`}
              {!params.mode && 'Quiz'}
            </Text>
          </View>

          <View style={styles.startCard}>
            <Text style={styles.startCardTitle}>Ready to Start?</Text>
            <Text style={styles.startCardText}>
              {questions.length} question{questions.length !== 1 ? 's' : ''} prepared
              {hasTimeLimit && `\nTime limit: ${parseInt(timeLimitStr) / 60} minutes`}
              {isSurvivalMode && '\nKeep going until you get one wrong!'}
              {isBlindMode && '\nType your answers (no multiple choice)'}
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartQuiz}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (showResults) {
    const totalQuestions = isSurvivalMode
      ? (survivalEnded ? currentQuestionIndex : currentQuestionIndex + 1)
      : questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {isSurvivalMode && survivalEnded ? '💥 Game Over!' : '🎉 Quiz Complete!'}
            </Text>
            <Text style={styles.resultsScore}>
              {score}/{totalQuestions}
            </Text>
            <Text style={styles.resultsPercentage}>{percentage}%</Text>
          </View>

          <View style={styles.resultsCard}>
            <Text style={styles.resultsCardTitle}>Your Results</Text>
            <View style={styles.resultsStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{score}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalQuestions - score}</Text>
                <Text style={styles.statLabel}>Incorrect</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{percentage}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            {isSurvivalMode && (
              <Text style={styles.survivalText}>
                You survived {currentQuestionIndex} question{currentQuestionIndex !== 1 ? 's' : ''}!
              </Text>
            )}

            {hasTimeLimit && timeLeft !== null && (
              <Text style={styles.timeText}>
                Time remaining: {formatTime(timeLeft)}
              </Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={handleRestart}
              activeOpacity={0.8}
            >
              <Text style={styles.restartButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.homeButtonText}>Back to Activities</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const showAnswer = isSurvivalMode && selectedAnswer !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.quizContainer}>
        {/* Header with progress and timer */}
        <View style={styles.quizHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                'Exit Quiz',
                'Are you sure you want to exit? Your progress will be lost.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Exit', onPress: () => router.back(), style: 'destructive' },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.questionCounter}>
              {isSurvivalMode 
                ? `Question ${currentQuestionIndex + 1} (Survival)`
                : `Question ${currentQuestionIndex + 1} of ${questions.length}`
              }
            </Text>
            {hasTimeLimit && timeLeft !== null && (
              <Text style={styles.timer}>
                ⏱️ {formatTime(timeLeft)}
              </Text>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Question Card */}
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          <View style={styles.questionHeader}>
            <Text style={styles.difficultyBadge}>
              {currentQuestion.difficulty.toUpperCase()}
            </Text>
            <Text style={styles.topicBadge}>{currentQuestion.topic}</Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {isBlindMode ? (
            <View style={styles.blindInputContainer}>
              <Text style={styles.blindModeHint}>
                Type your answer (no multiple choice options)
              </Text>
              <TextInput
                style={styles.blindInput}
                placeholder="Enter your answer..."
                value={typedAnswers[currentQuestion.id] || ''}
                onChangeText={handleTypedAnswer}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSubmitAnswer}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !typedAnswers[currentQuestion.id] && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitAnswer}
                disabled={!typedAnswers[currentQuestion.id]}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const showCorrect = showAnswer && index === currentQuestion.correctAnswer;
                const showIncorrect = showAnswer && isSelected && !isCorrect;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                      showCorrect && styles.optionButtonCorrect,
                      showIncorrect && styles.optionButtonIncorrect,
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={showAnswer}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        showCorrect && styles.optionTextCorrect,
                      ]}
                    >
                      {option}
                    </Text>
                    {showCorrect && <Text style={styles.correctIcon}>✓</Text>}
                    {showIncorrect && <Text style={styles.incorrectIcon}>✕</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {showAnswer && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationLabel}>Explanation:</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.navButtonText,
                currentQuestionIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          {!isSurvivalMode && (
            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNextQuestion}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonText}>
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →'}
              </Text>
            </TouchableOpacity>
          )}

          {currentQuestionIndex === questions.length - 1 && !isSurvivalMode && (
            <TouchableOpacity
              style={[styles.navButton, styles.finishButton]}
              onPress={handleFinishQuiz}
              activeOpacity={0.8}
            >
              <Text style={[styles.navButtonText, styles.finishButtonText]}>
                Finish Quiz
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ProfessionalColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: ProfessionalColors.textSecondary,
  },
  startScreen: {
    flex: 1,
    padding: Spacing.lg,
  },
  startHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: ProfessionalColors.text,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
  },
  startCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
  },
  startCardText: {
    fontSize: 16,
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: ProfessionalColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: ProfessionalColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  questionCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  timer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProfessionalColors.error,
    marginTop: Spacing.xs,
  },
  progressBarContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: ProfessionalColors.white,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.primary,
    borderRadius: BorderRadius.full,
  },
  questionCard: {
    flex: 1,
    backgroundColor: ProfessionalColors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  difficultyBadge: {
    backgroundColor: ProfessionalColors.primary,
    color: ProfessionalColors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    fontSize: 12,
    fontWeight: 'bold',
  },
  topicBadge: {
    backgroundColor: ProfessionalColors.background,
    color: ProfessionalColors.text,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xl,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: ProfessionalColors.background,
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
  blindInputContainer: {
    marginTop: Spacing.lg,
  },
  blindModeHint: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  blindInput: {
    backgroundColor: ProfessionalColors.background,
    borderWidth: 2,
    borderColor: ProfessionalColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
    minHeight: 50,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: ProfessionalColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  explanationContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: ProfessionalColors.background,
    borderRadius: BorderRadius.md,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.xs,
  },
  explanationText: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: ProfessionalColors.white,
    borderTopWidth: 1,
    borderTopColor: ProfessionalColors.border,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: ProfessionalColors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  navButtonTextDisabled: {
    color: ProfessionalColors.textSecondary,
  },
  finishButton: {
    backgroundColor: ProfessionalColors.primary,
    borderColor: ProfessionalColors.primary,
  },
  finishButtonText: {
    color: ProfessionalColors.white,
  },
  scrollView: {
    flex: 1,
  },
  resultsContent: {
    padding: Spacing.lg,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.md,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: Spacing.xs,
  },
  resultsPercentage: {
    fontSize: 24,
    fontWeight: '600',
    color: ProfessionalColors.textSecondary,
  },
  resultsCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: Spacing.lg,
  },
  resultsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
  },
  survivalText: {
    fontSize: 16,
    fontWeight: '600',
    color: ProfessionalColors.text,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  timeText: {
    fontSize: 14,
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  restartButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  restartButtonText: {
    color: ProfessionalColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: ProfessionalColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
  },
  homeButtonText: {
    color: ProfessionalColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

