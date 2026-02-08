import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing } from '../constants/colors';
import { database } from '../services/database';
import { saveTopicActivitiesProgress } from '../utils/progressStorage';
import { getSpacing, isSmallDevice, isTablet, isWeb, scaleFont, scaleSize } from '../utils/responsive';

const QUIZ_WEB_MAX_WIDTH = 680;

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
  { id: 101, question: 'Two sides of a right triangle are 5 and 12. What is the hypotenuse?', options: ['13', '17', '7', '√119'], correctAnswer: 0, explanation: '5² + 12² = 25 + 144 = 169, so hypotenuse = √169 = 13', topic: 'Geometry', difficulty: 'hard' },
  { id: 102, question: 'What is the area of an equilateral triangle with side length 4?', options: ['4√3', '8', '6√3', '12'], correctAnswer: 0, explanation: 'Area = (s²√3)/4 = (16√3)/4 = 4√3', topic: 'Geometry', difficulty: 'hard' },
  { id: 103, question: 'In similar triangles, corresponding sides are:', options: ['equal', 'proportional', 'parallel', 'perpendicular'], correctAnswer: 1, explanation: 'In similar triangles, corresponding sides are in proportion.', topic: 'Geometry', difficulty: 'hard' },
  { id: 104, question: 'What is the length of the diagonal of a square with side 6?', options: ['6', '6√2', '12', '3√2'], correctAnswer: 1, explanation: 'Diagonal = side × √2 = 6√2', topic: 'Geometry', difficulty: 'hard' },
  { id: 105, question: 'The legs of a right triangle are 8 and 15. What is the hypotenuse?', options: ['17', '23', '7', '√161'], correctAnswer: 0, explanation: '8² + 15² = 64 + 225 = 289, so hypotenuse = √289 = 17', topic: 'Geometry', difficulty: 'hard' },

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
  { id: 106, question: 'Solve x² - 9 = 0.', options: ['x = ±3', 'x = 3', 'x = -3', 'x = 9'], correctAnswer: 0, explanation: 'x² = 9, so x = ±√9 = ±3', topic: 'Algebra', difficulty: 'hard' },
  { id: 107, question: 'Factor x² - 4x + 4.', options: ['(x-2)²', '(x+2)²', '(x-4)(x+1)', '(x-1)(x-4)'], correctAnswer: 0, explanation: 'x² - 4x + 4 = (x - 2)²', topic: 'Algebra', difficulty: 'hard' },
  { id: 108, question: 'What are the roots of x² + 5x + 6 = 0?', options: ['-2 and -3', '2 and 3', '-1 and -6', '1 and 6'], correctAnswer: 0, explanation: 'Factoring: (x+2)(x+3)=0, so x = -2 or x = -3', topic: 'Algebra', difficulty: 'hard' },
  { id: 109, question: 'Solve 2x² - 8 = 0.', options: ['x = ±2', 'x = 2', 'x = -2', 'x = ±4'], correctAnswer: 0, explanation: '2x² = 8, x² = 4, so x = ±2', topic: 'Algebra', difficulty: 'hard' },
  { id: 110, question: 'For ax² + bx + c = 0, the sum of roots equals:', options: ['-b/a', 'b/a', 'c/a', '-c/a'], correctAnswer: 0, explanation: 'For a quadratic, sum of roots = -b/a', topic: 'Algebra', difficulty: 'hard' },

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
  { id: 111, question: 'What is cos(0°)?', options: ['0', '0.5', '1', '√2/2'], correctAnswer: 2, explanation: 'cos(0°) = 1', topic: 'Trigonometry', difficulty: 'medium' },
  // Trigonometry - Hard
  { id: 45, question: 'What is sin(90°)?', options: ['0', '0.5', '1', '√2/2'], correctAnswer: 2, explanation: 'sin(90°) = 1', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 112, question: 'What is tan(45°)?', options: ['0', '1', '√2', '√2/2'], correctAnswer: 1, explanation: 'tan(45°) = 1', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 113, question: 'In a right triangle, if opposite = 3 and hypotenuse = 5, what is sin(θ)?', options: ['3/5', '4/5', '5/3', '3/4'], correctAnswer: 0, explanation: 'sin(θ) = opposite/hypotenuse = 3/5', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 114, question: 'What is the area of a triangle with two sides 7 and 10 and included angle 60°?', options: ['(35√3)/2', '35', '70', '35√3'], correctAnswer: 0, explanation: 'Area = (1/2)ab sin C = (1/2)(7)(10)sin 60° = 35(√3/2)', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 115, question: 'What is cos(90°)?', options: ['0', '1', '-1', '√2/2'], correctAnswer: 0, explanation: 'cos(90°) = 0', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 116, question: 'If sin(θ) = 0.6 and the hypotenuse is 10, what is the opposite side?', options: ['6', '8', '10', '0.06'], correctAnswer: 0, explanation: 'opposite = hypotenuse × sin(θ) = 10 × 0.6 = 6', topic: 'Trigonometry', difficulty: 'hard' },

  // Variation - Easy
  { id: 46, question: 'Which is the formula for direct variation?', options: ['y = k/x', 'y = kx', 'y = kx²', 'y = x/k'], correctAnswer: 1, explanation: 'Direct variation has the form y = kx, where k is the constant of variation.', topic: 'Variation', difficulty: 'easy' },
  { id: 47, question: 'If y varies directly with x, and x doubles, y:', options: ['halves', 'doubles', 'stays the same', 'becomes zero'], correctAnswer: 1, explanation: 'In direct variation, y is proportional to x, so if x doubles, y doubles.', topic: 'Variation', difficulty: 'easy' },
  { id: 48, question: 'Which shows inverse variation?', options: ['y = kx', 'y = k/x', 'y = kx²', 'y = x + k'], correctAnswer: 1, explanation: 'Inverse variation has the form y = k/x or xy = k.', topic: 'Variation', difficulty: 'easy' },
  { id: 49, question: 'In y = kx, k is called:', options: ['variable', 'coefficient', 'constant of variation', 'exponent'], correctAnswer: 2, explanation: 'k is the constant of variation that relates the variables.', topic: 'Variation', difficulty: 'easy' },
  { id: 50, question: 'If y = 5x, what is y when x = 2?', options: ['5', '8', '10', '12'], correctAnswer: 2, explanation: 'y = 5(2) = 10.', topic: 'Variation', difficulty: 'easy' },
  // Variation - Medium
  { id: 51, question: 'If y varies inversely with x, and y = 6 when x = 3, find y when x = 9.', options: ['2', '18', '4', '6'], correctAnswer: 0, explanation: 'y = k/x → 6 = k/3 → k = 18. Then y = 18/9 = 2.', topic: 'Variation', difficulty: 'medium' },
  { id: 52, question: 'If y varies jointly with x and z, and y = 12 when x = 2, z = 3, find y when x = 4, z = 3.', options: ['12', '18', '24', '36'], correctAnswer: 2, explanation: 'y = kxz → 12 = k(2)(3) → k = 2. Then y = 2(4)(3) = 24.', topic: 'Variation', difficulty: 'medium' },
  { id: 53, question: 'Which is joint variation?', options: ['y = kx', 'y = k/x', 'y = kxz', 'y = x + z'], correctAnswer: 2, explanation: 'Joint variation: one variable depends on two or more others, e.g. y = kxz.', topic: 'Variation', difficulty: 'medium' },
  { id: 54, question: 'If y = kx/z, this is:', options: ['direct', 'inverse', 'joint', 'combined'], correctAnswer: 3, explanation: 'Combined variation: direct with one variable and inverse with another.', topic: 'Variation', difficulty: 'medium' },
  { id: 55, question: 'If y = 2x, what is x when y = 14?', options: ['5', '6', '7', '8'], correctAnswer: 2, explanation: '14 = 2x → x = 7.', topic: 'Variation', difficulty: 'medium' },
  // Variation - Hard
  { id: 56, question: 'y varies jointly with x and z. If y = 30 when x = 5, z = 2, find y when x = 10, z = 4.', options: ['60', '120', '240', '300'], correctAnswer: 1, explanation: 'y = kxz → 30 = k(5)(2) → k = 3. Then y = 3(10)(4) = 120.', topic: 'Variation', difficulty: 'hard' },
  { id: 57, question: 'y varies inversely with x. If y = 15 when x = 4, find x when y = 5.', options: ['8', '10', '12', '15'], correctAnswer: 2, explanation: 'y = k/x → 15 = k/4 → k = 60. Then 5 = 60/x → x = 12.', topic: 'Variation', difficulty: 'hard' },
  { id: 58, question: 'y varies directly with x and inversely with z. If y = 10 when x = 5, z = 2, find y when x = 15, z = 6.', options: ['5', '10', '15', '20'], correctAnswer: 1, explanation: 'y = kx/z → 10 = k(5)/2 → k = 4. Then y = 4(15)/6 = 10.', topic: 'Variation', difficulty: 'hard' },
  { id: 59, question: 'A worker finishes a job in 8 hours with 3 workers. How long will it take 6 workers? (Inverse variation)', options: ['16 h', '12 h', '8 h', '4 h'], correctAnswer: 3, explanation: 'Time varies inversely with workers. 8×3 = k = 24. 24/6 = 4 h.', topic: 'Variation', difficulty: 'hard' },
  { id: 60, question: 'The force of gravity varies jointly with two masses and inversely with the square of the distance. If the distance doubles, gravity:', options: ['doubles', 'halves', 'quarters', 'stays the same'], correctAnswer: 2, explanation: 'If distance doubles, the square of distance quadruples, so gravity is divided by 4 (quarters).', topic: 'Variation', difficulty: 'hard' },
  
];

// Map activity topicId (1–5) to question bank topic names
const TOPIC_ID_TO_BANK: { [key: string]: string } = {
  '1': 'Algebra',       // Quadratic Equations → Algebra
  '2': 'Geometry',     // Pythagorean Triples → Geometry
  '3': 'Geometry',     // Triangle Measures → Geometry
  '4': 'Trigonometry', // Area of Triangles → Trigonometry
  '5': 'Variation',
};

// Get questions based on topic + difficulty (used by Activities topic practice)
const getQuestions = (
  topicId?: string,
  difficulty?: string,
  count: number = 10
): Question[] => {
  let filtered = QUESTION_BANK;

  if (topicId && TOPIC_ID_TO_BANK[topicId]) {
    const topicName = TOPIC_ID_TO_BANK[topicId];
    filtered = filtered.filter((q) => q.topic === topicName);
  }

  if (difficulty && difficulty !== 'mixed') {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }

  // If no questions match (e.g. wrong params), use whole bank and optionally filter by difficulty only
  if (filtered.length === 0) {
    filtered = difficulty && difficulty !== 'mixed'
      ? QUESTION_BANK.filter((q) => q.difficulty === difficulty)
      : [...QUESTION_BANK];
  }

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export default function QuizScreen() {
  const router = useRouter();
  const goBackFromQuiz = () => {
    if (isWeb()) {
      router.replace('/tabs/activities' as any);
    } else {
      router.back();
    }
  };
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
  const [submittedBlindIds, setSubmittedBlindIds] = useState<Set<number>>(new Set());
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
      
      // Mark this question as submitted (user cannot proceed without submitting)
      setSubmittedBlindIds((prev) => new Set([...prev, currentQuestion.id]));
      
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
    // Record activities progress for this topic (50% of topic progress; other 50% from reading content)
    if (topicId) {
      const id = parseInt(topicId, 10);
      if (!Number.isNaN(id)) saveTopicActivitiesProgress(id, 100);
    }
    // Save score for Topics Practice so best score shows on Activities tab
    const tid = topicId ? parseInt(topicId, 10) : NaN;
    const difficulty = params.difficulty as 'easy' | 'medium' | 'hard' | undefined;
    if (!Number.isNaN(tid) && difficulty && params.mode === 'topic-quiz') {
      database.saveScore({
        topicId: tid,
        difficulty,
        score: calculatedScore,
        total: questions.length,
        passed: calculatedScore >= Math.ceil(questions.length * 0.6),
      }).catch((e) => console.warn('Save score failed:', e));
    }
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
    setSubmittedBlindIds(new Set());
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
    // No questions available (e.g. topic/difficulty had no match before fallback)
    if (questions.length === 0) {
      return (
        <SafeAreaView style={[styles.container, isWeb() && styles.containerWeb]} edges={['top', 'left', 'right']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No questions available for this topic and difficulty.</Text>
            <TouchableOpacity style={styles.startButton} onPress={goBackFromQuiz} activeOpacity={0.8}>
              <Text style={styles.startButtonText}>Back to Activities</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, isWeb() && styles.containerWeb]} edges={['top', 'left', 'right']}>
        <ScrollView
          style={[styles.scrollView, isWeb() && styles.scrollViewWeb]}
          contentContainerStyle={styles.startScreen}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.startHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={goBackFromQuiz}
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
              {(params.mode === 'topic' || params.mode === 'topic-quiz') && `📚 ${params.topicName || 'Topic'} Practice`}
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showResults) {
    const totalQuestions = isSurvivalMode
      ? (survivalEnded ? currentQuestionIndex : currentQuestionIndex + 1)
      : questions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    return (
      <SafeAreaView style={[styles.container, isWeb() && styles.containerWeb]} edges={['top', 'left', 'right']}>
        <ScrollView
          style={[styles.scrollView, isWeb() && styles.scrollViewWeb]}
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
              onPress={goBackFromQuiz}
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
      <SafeAreaView style={[styles.container, isWeb() && styles.containerWeb]} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const showAnswer = isSurvivalMode && selectedAnswer !== undefined;
  const hasAnsweredCurrent = isBlindMode
    ? submittedBlindIds.has(currentQuestion.id)
    : selectedAnswers[currentQuestion.id] !== undefined;

  return (
    <SafeAreaView style={[styles.container, isWeb() && styles.containerWeb]} edges={['top', 'left', 'right']}>
      <View style={[styles.quizContainer, isWeb() && styles.quizContainerWeb]}>
        {/* Header with progress and timer */}
        <View style={styles.quizHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isWeb()) {
                if (typeof window !== 'undefined' && window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  goBackFromQuiz();
                }
              } else {
                Alert.alert(
                  'Exit Quiz',
                  'Are you sure you want to exit? Your progress will be lost.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Exit', onPress: goBackFromQuiz, style: 'destructive' },
                  ]
                );
              }
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

        {/* Question Card with ScrollView */}
        <ScrollView 
          style={styles.questionCardScroll}
          contentContainerStyle={styles.questionCardContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
        </ScrollView>

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
              style={[
                styles.navButton,
                !hasAnsweredCurrent && styles.navButtonDisabled,
              ]}
              onPress={handleNextQuestion}
              disabled={!hasAnsweredCurrent}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.navButtonText,
                  !hasAnsweredCurrent && styles.navButtonTextDisabled,
                ]}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →'}
              </Text>
            </TouchableOpacity>
          )}

          {currentQuestionIndex === questions.length - 1 && !isSurvivalMode && (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.finishButton,
                !hasAnsweredCurrent && styles.navButtonDisabled,
              ]}
              onPress={handleFinishQuiz}
              disabled={!hasAnsweredCurrent}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.navButtonText,
                  styles.finishButtonText,
                  !hasAnsweredCurrent && styles.navButtonTextDisabled,
                ]}
              >
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
  containerWeb: {
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    color: ProfessionalColors.textSecondary,
  },
  startScreen: {
    padding: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl) + 80,
  },
  startHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xl),
  },
  backButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(Spacing.md),
    flexShrink: 0,
  },
  backIcon: {
    fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
    color: ProfessionalColors.text,
  },
  startTitle: {
    fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    flex: 1,
    minWidth: 0,
  },
  startCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.xl),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
    marginHorizontal: getSpacing(Spacing.md),
  },
  startCardTitle: {
    fontSize: scaleFont(isTablet() ? 24 : isSmallDevice() ? 18 : 20),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
    textAlign: 'center',
  },
  startCardText: {
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: getSpacing(Spacing.xl),
    lineHeight: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
  },
  startButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(BorderRadius.lg),
    paddingVertical: getSpacing(Spacing.lg),
    paddingHorizontal: getSpacing(Spacing.xxl),
    shadowColor: ProfessionalColors.primary,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(8),
    elevation: 6,
    minHeight: scaleSize(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(isTablet() ? 20 : isSmallDevice() ? 16 : 18),
    fontWeight: 'bold',
  },
  quizContainer: {
    flex: 1,
  },
  quizContainerWeb: {
    maxWidth: QUIZ_WEB_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
    marginVertical: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingTop: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.md),
    backgroundColor: ProfessionalColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ProfessionalColors.border,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 0,
  },
  questionCounter: {
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    fontWeight: '600',
    color: ProfessionalColors.text,
  },
  timer: {
    fontSize: scaleFont(isTablet() ? 14 : isSmallDevice() ? 11 : 13),
    fontWeight: 'bold',
    color: ProfessionalColors.error,
    marginTop: getSpacing(Spacing.xs),
  },
  progressBarContainer: {
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingVertical: getSpacing(Spacing.md),
    backgroundColor: ProfessionalColors.white,
  },
  progressBarBackground: {
    height: scaleSize(8),
    backgroundColor: ProfessionalColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.primary,
    borderRadius: BorderRadius.full,
  },
  questionCardScroll: {
    flex: 1,
  },
  questionCardContent: {
    padding: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.xl),
  },
  questionCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.xl),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    gap: getSpacing(Spacing.sm),
    marginBottom: getSpacing(Spacing.lg),
    flexWrap: 'nowrap',
  },
  difficultyBadge: {
    backgroundColor: ProfessionalColors.primary,
    color: ProfessionalColors.white,
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(BorderRadius.sm),
    fontSize: scaleFont(isTablet() ? 14 : isSmallDevice() ? 10 : 12),
    fontWeight: 'bold',
    flexShrink: 0,
  },
  topicBadge: {
    backgroundColor: ProfessionalColors.background,
    color: ProfessionalColors.text,
    paddingHorizontal: getSpacing(Spacing.sm),
    paddingVertical: scaleSize(4),
    borderRadius: scaleSize(BorderRadius.sm),
    fontSize: scaleFont(isTablet() ? 14 : isSmallDevice() ? 10 : 12),
    fontWeight: '600',
    flexShrink: 1,
    minWidth: 0,
  },
  questionText: {
    fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
    fontWeight: '600',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xl),
    lineHeight: scaleFont(isTablet() ? 38 : isSmallDevice() ? 28 : 32),
  },
  optionsContainer: {
    gap: getSpacing(Spacing.md),
  },
  optionButton: {
    padding: getSpacing(Spacing.lg),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.background,
    borderWidth: scaleSize(2),
    borderColor: ProfessionalColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: scaleSize(50),
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
    fontSize: scaleFont(isTablet() ? 20 : isSmallDevice() ? 16 : 18),
    color: ProfessionalColors.text,
    flex: 1,
    minWidth: 0,
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
    fontSize: scaleFont(isTablet() ? 22 : isSmallDevice() ? 18 : 20),
    color: ProfessionalColors.success,
    fontWeight: 'bold',
    flexShrink: 0,
    marginLeft: getSpacing(Spacing.sm),
  },
  incorrectIcon: {
    fontSize: scaleFont(isTablet() ? 22 : isSmallDevice() ? 18 : 20),
    color: ProfessionalColors.error,
    fontWeight: 'bold',
    flexShrink: 0,
    marginLeft: getSpacing(Spacing.sm),
  },
  blindInputContainer: {
    marginTop: getSpacing(Spacing.lg),
  },
  blindModeHint: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.textSecondary,
    marginBottom: getSpacing(Spacing.md),
    fontStyle: 'italic',
  },
  blindInput: {
    backgroundColor: ProfessionalColors.background,
    borderWidth: scaleSize(2),
    borderColor: ProfessionalColors.border,
    borderRadius: scaleSize(BorderRadius.md),
    padding: getSpacing(Spacing.lg),
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
    minHeight: scaleSize(50),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(BorderRadius.md),
    padding: getSpacing(Spacing.md),
    alignItems: 'center',
    minHeight: scaleSize(44),
    justifyContent: 'center',
  },
  submitButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    fontWeight: 'bold',
  },
  explanationContainer: {
    marginTop: getSpacing(Spacing.lg),
    padding: getSpacing(Spacing.md),
    backgroundColor: ProfessionalColors.background,
    borderRadius: scaleSize(BorderRadius.md),
  },
  explanationLabel: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.xs),
  },
  explanationText: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.textSecondary,
    lineHeight: scaleFont(isTablet() ? 24 : isSmallDevice() ? 18 : 20),
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(Spacing.lg),
    paddingTop: getSpacing(Spacing.md),
    paddingBottom: getSpacing(Spacing.lg),
    backgroundColor: ProfessionalColors.white,
    borderTopWidth: 1,
    borderTopColor: ProfessionalColors.border,
    gap: getSpacing(Spacing.md),
    flexShrink: 0,
  },
  navButton: {
    flex: 1,
    padding: getSpacing(Spacing.lg),
    borderRadius: scaleSize(BorderRadius.md),
    backgroundColor: ProfessionalColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    minHeight: scaleSize(54),
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    fontWeight: '600',
    color: ProfessionalColors.text,
    textAlign: 'center',
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
  scrollViewWeb: {
    maxWidth: QUIZ_WEB_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
  resultsContent: {
    padding: getSpacing(Spacing.lg),
    paddingBottom: getSpacing(Spacing.xxl) + 80,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: getSpacing(Spacing.xl),
  },
  resultsTitle: {
    fontSize: scaleFont(isTablet() ? 32 : isSmallDevice() ? 24 : 28),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.md),
    textAlign: 'center',
  },
  resultsScore: {
    fontSize: scaleFont(isTablet() ? 56 : isSmallDevice() ? 40 : 48),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  resultsPercentage: {
    fontSize: scaleFont(isTablet() ? 28 : isSmallDevice() ? 20 : 24),
    fontWeight: '600',
    color: ProfessionalColors.textSecondary,
  },
  resultsCard: {
    backgroundColor: ProfessionalColors.white,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.xl),
    marginBottom: getSpacing(Spacing.xl),
    marginHorizontal: getSpacing(Spacing.md),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleSize(8),
    elevation: 4,
  },
  resultsCardTitle: {
    fontSize: scaleFont(isTablet() ? 24 : isSmallDevice() ? 18 : 20),
    fontWeight: 'bold',
    color: ProfessionalColors.text,
    marginBottom: getSpacing(Spacing.lg),
    textAlign: 'center',
  },
  resultsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: getSpacing(Spacing.lg),
    flexWrap: 'nowrap',
    gap: getSpacing(Spacing.sm),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: scaleFont(isTablet() ? 36 : isSmallDevice() ? 26 : 32),
    fontWeight: 'bold',
    color: ProfessionalColors.primary,
    marginBottom: getSpacing(Spacing.xs),
  },
  statLabel: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
  },
  survivalText: {
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    fontWeight: '600',
    color: ProfessionalColors.text,
    textAlign: 'center',
    marginTop: getSpacing(Spacing.md),
  },
  timeText: {
    fontSize: scaleFont(isTablet() ? 16 : isSmallDevice() ? 12 : 14),
    color: ProfessionalColors.textSecondary,
    textAlign: 'center',
    marginTop: getSpacing(Spacing.sm),
  },
  actionsContainer: {
    gap: getSpacing(Spacing.md),
    paddingHorizontal: getSpacing(Spacing.md),
  },
  restartButton: {
    backgroundColor: ProfessionalColors.primary,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    alignItems: 'center',
    minHeight: scaleSize(50),
    justifyContent: 'center',
  },
  restartButtonText: {
    color: ProfessionalColors.white,
    fontSize: scaleFont(isTablet() ? 20 : isSmallDevice() ? 16 : 18),
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: ProfessionalColors.background,
    borderRadius: scaleSize(BorderRadius.lg),
    padding: getSpacing(Spacing.lg),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ProfessionalColors.border,
    minHeight: scaleSize(50),
    justifyContent: 'center',
  },
  homeButtonText: {
    color: ProfessionalColors.text,
    fontSize: scaleFont(isTablet() ? 18 : isSmallDevice() ? 14 : 16),
    fontWeight: '600',
  },
});

