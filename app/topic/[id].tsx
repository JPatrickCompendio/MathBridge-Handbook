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
import { BorderRadius, Spacing } from '../../constants/colors';
import { updateTopicProgress } from '../../utils/progressStorage';
import { getSafeAreaTopPadding, getSpacing } from '../../utils/responsive';

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

// Geometry Topic Data
const GEOMETRY_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Geometry',
    content: 'Geometry is the branch of mathematics that deals with shapes, sizes, and properties of figures and spaces. In this comprehensive lesson, we will explore fundamental geometric concepts that form the foundation of spatial reasoning and mathematical thinking. Geometry helps us understand the world around us, from the shapes of buildings to the patterns in nature. We will begin by learning about basic geometric elements: points, lines, angles, and shapes. Understanding these fundamentals is crucial for more advanced geometric concepts. Points are the most basic geometric element - they have no dimensions but mark a specific location. Lines are created by connecting points and extend infinitely in both directions. When two lines meet, they form angles, which measure the rotation between them. Shapes are closed figures formed by connecting lines, and they can be simple like triangles or complex like polygons. Geometry is used in architecture, engineering, art, and many other fields. By the end of this lesson, you will have a solid understanding of basic geometric concepts and be able to identify and describe various geometric shapes and their properties.',
    concepts: [
      'Points are locations in space with no size, no width, no length, and no depth',
      'Lines extend infinitely in both directions and are made up of an infinite number of points',
      'Line segments have two endpoints and a definite length',
      'Rays have one endpoint and extend infinitely in one direction',
      'Angles are formed by two rays sharing a common endpoint called the vertex',
      'Shapes are closed figures with boundaries that can be two-dimensional or three-dimensional',
      'Polygons are closed shapes made of straight line segments',
      'Circles are round shapes where all points are equidistant from the center',
    ],
    examples: [
      {
        question: 'What is a point and how is it represented?',
        solution: 'A point is a location in space that has no size, no width, no length, and no depth. It is the most basic geometric element and is represented by a dot. Points are named with capital letters, such as point A or point B. In geometry, points are used to define other geometric objects like lines and shapes.',
      },
      {
        question: 'What is the difference between a line, a line segment, and a ray?',
        solution: 'A line extends infinitely in both directions and has no endpoints. A line segment has two endpoints and a definite length - it is a portion of a line. A ray has one endpoint and extends infinitely in one direction. For example, if you have points A and B, the line segment AB has endpoints at A and B, while a ray starting at A and going through B would continue past B forever.',
      },
      {
        question: 'How are angles measured and what units are used?',
        solution: 'Angles are measured in degrees using a protractor. A full circle contains 360 degrees. A right angle measures 90 degrees, a straight angle measures 180 degrees (forming a straight line), and a full rotation is 360 degrees. Angles can also be measured in radians, where 360 degrees equals 2π radians. The degree is the most common unit for measuring angles in everyday geometry.',
      },
      {
        question: 'What are polygons and how are they classified?',
        solution: 'Polygons are closed two-dimensional shapes made of straight line segments. They are classified by the number of sides: triangle (3 sides), quadrilateral (4 sides), pentagon (5 sides), hexagon (6 sides), heptagon (7 sides), octagon (8 sides), and so on. Polygons can be regular (all sides and angles equal) or irregular (sides and angles differ).',
      },
    ],
    quiz: {
      id: 1,
      questions: [
        {
          id: 1,
          question: 'What is the sum of angles in a triangle?',
          options: ['90°', '180°', '270°', '360°'],
          correctAnswer: 1,
          explanation: 'The sum of all angles in a triangle always equals 180 degrees, regardless of the type of triangle.',
        },
        {
          id: 2,
          question: 'How many sides does a pentagon have?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 2,
          explanation: 'A pentagon has 5 sides. "Penta" means five in Greek.',
        },
        {
          id: 3,
          question: 'What is a right angle?',
          options: ['45°', '90°', '180°', '360°'],
          correctAnswer: 1,
          explanation: 'A right angle measures exactly 90 degrees and forms a perfect L-shape.',
        },
        {
          id: 4,
          question: 'What is the difference between a line and a line segment?',
          options: ['A line has endpoints, a line segment does not', 'A line segment has endpoints, a line extends infinitely', 'They are the same', 'A line is curved, a line segment is straight'],
          correctAnswer: 1,
          explanation: 'A line extends infinitely in both directions with no endpoints, while a line segment has two endpoints and a definite length.',
        },
        {
          id: 5,
          question: 'How many degrees are in a full circle?',
          options: ['180°', '270°', '360°', '90°'],
          correctAnswer: 2,
          explanation: 'A full circle contains 360 degrees, which represents one complete rotation.',
        },
      ],
      passingScore: 4, // Need to get at least 4 out of 5 correct
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 2,
    title: 'Types of Angles',
    content: 'Angles can be classified based on their measure, and understanding these classifications is fundamental to geometry. In this lesson, we will explore the different types of angles and learn how to identify and measure them. Angles are everywhere in our daily lives - in the corners of rooms, the hands of a clock, and the intersection of roads. By understanding angle types, we can solve geometric problems, understand spatial relationships, and apply this knowledge to real-world situations. We will learn about acute angles, which are sharp and less than 90 degrees, right angles which form perfect L-shapes at exactly 90 degrees, obtuse angles which are wider than right angles but less than 180 degrees, and straight angles which form a perfect line at 180 degrees. We will also explore reflex angles, which are greater than 180 degrees but less than 360 degrees, and full rotation angles. Understanding how to measure and classify angles is essential for working with shapes, calculating areas, and solving geometric proofs. This knowledge forms the foundation for more advanced topics like trigonometry and coordinate geometry.',
    concepts: [
      'Acute angles measure less than 90° and appear sharp or narrow',
      'Right angles measure exactly 90° and form perfect L-shapes',
      'Obtuse angles measure greater than 90° but less than 180°',
      'Straight angles measure exactly 180° and form a straight line',
      'Reflex angles measure greater than 180° but less than 360°',
      'Complementary angles are two angles that add up to 90°',
      'Supplementary angles are two angles that add up to 180°',
      'Adjacent angles share a common side and vertex',
    ],
    examples: [
      {
        question: 'What is an acute angle and give examples?',
        solution: 'An acute angle is any angle that measures less than 90 degrees. Examples include 30°, 45°, 60°, and 75°. Acute angles appear sharp or narrow and are commonly found in triangles. For instance, all angles in an equilateral triangle are acute (60° each).',
      },
      {
        question: 'What is an obtuse angle and how does it differ from an acute angle?',
        solution: 'An obtuse angle measures more than 90 degrees but less than 180 degrees. Examples include 120°, 135°, and 150°. Unlike acute angles which are sharp, obtuse angles appear wide or open. The key difference is that acute angles are less than 90°, while obtuse angles are greater than 90° but less than 180°.',
      },
      {
        question: 'What are complementary and supplementary angles?',
        solution: 'Complementary angles are two angles whose measures add up to 90 degrees. For example, 30° and 60° are complementary. Supplementary angles are two angles whose measures add up to 180 degrees. For example, 120° and 60° are supplementary. These relationships are useful for solving angle problems in geometry.',
      },
      {
        question: 'How do you measure angles using a protractor?',
        solution: 'To measure an angle with a protractor: 1) Place the center of the protractor on the vertex of the angle, 2) Align one ray with the 0° mark, 3) Read the measurement where the other ray intersects the protractor scale. Protractors typically measure from 0° to 180°, and you should use the scale that gives you the smaller angle measurement.',
      },
    ],
    quiz: {
      id: 2,
      questions: [
        {
          id: 1,
          question: 'What type of angle measures 45°?',
          options: ['Right', 'Acute', 'Obtuse', 'Straight'],
          correctAnswer: 1,
          explanation: '45° is less than 90°, so it is an acute angle.',
        },
        {
          id: 2,
          question: 'What type of angle measures 120°?',
          options: ['Right', 'Acute', 'Obtuse', 'Straight'],
          correctAnswer: 2,
          explanation: '120° is greater than 90° but less than 180°, so it is an obtuse angle.',
        },
        {
          id: 3,
          question: 'How many degrees are in a straight angle?',
          options: ['90°', '180°', '270°', '360°'],
          correctAnswer: 1,
          explanation: 'A straight angle measures exactly 180 degrees, forming a straight line.',
        },
        {
          id: 4,
          question: 'What are two angles called if they add up to 90°?',
          options: ['Supplementary', 'Complementary', 'Adjacent', 'Vertical'],
          correctAnswer: 1,
          explanation: 'Complementary angles are two angles whose measures add up to 90 degrees.',
        },
        {
          id: 5,
          question: 'Which angle type forms a perfect L-shape?',
          options: ['Acute', 'Right', 'Obtuse', 'Straight'],
          correctAnswer: 1,
          explanation: 'A right angle measures exactly 90 degrees and forms a perfect L-shape.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 3,
    title: 'Triangles',
    content: 'Triangles are three-sided polygons and are one of the most fundamental and important shapes in geometry. They are the simplest polygon and form the building blocks for more complex geometric shapes. Triangles have unique properties that make them essential in mathematics, engineering, and architecture. In this comprehensive lesson, we will explore the various types of triangles, their properties, and how they are classified. Triangles can be classified in two ways: by their sides (equilateral, isosceles, scalene) and by their angles (acute, right, obtuse). Each type has specific characteristics and properties. The triangle is a rigid structure, meaning it cannot be deformed without changing the length of its sides - this property makes triangles essential in construction and engineering. We will learn about the angles in triangles, the Pythagorean theorem for right triangles, and how to calculate the area and perimeter of triangles. Understanding triangles is crucial for studying trigonometry, coordinate geometry, and many practical applications in real life.',
    concepts: [
      'Triangles have three sides and three angles that always sum to 180°',
      'Equilateral triangles have all three sides equal and all angles measure 60°',
      'Isosceles triangles have exactly two equal sides and two equal angles',
      'Scalene triangles have no equal sides and no equal angles',
      'Acute triangles have all angles less than 90°',
      'Right triangles have one 90° angle and follow the Pythagorean theorem',
      'Obtuse triangles have one angle greater than 90°',
      'The area of a triangle is calculated as (base × height) / 2',
    ],
    examples: [
      {
        question: 'What is an equilateral triangle and what are its properties?',
        solution: 'An equilateral triangle has all three sides of equal length and all three angles measuring exactly 60 degrees. It is both equiangular (all angles equal) and equilateral (all sides equal). Because of its symmetry, it is considered a regular polygon. Equilateral triangles are commonly used in architecture and design due to their balanced appearance.',
      },
      {
        question: 'What is a right triangle and what is the Pythagorean theorem?',
        solution: 'A right triangle has one angle that measures exactly 90 degrees. The side opposite the right angle is called the hypotenuse and is always the longest side. The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c², where c is the hypotenuse. This theorem is fundamental in geometry and has countless applications.',
      },
      {
        question: 'How do you calculate the area of a triangle?',
        solution: 'The area of a triangle is calculated using the formula: Area = (base × height) / 2. The base is any side of the triangle, and the height is the perpendicular distance from the base to the opposite vertex. For example, if a triangle has a base of 10 units and a height of 6 units, the area would be (10 × 6) / 2 = 30 square units.',
      },
      {
        question: 'What is the difference between an isosceles and scalene triangle?',
        solution: 'An isosceles triangle has exactly two sides of equal length and two angles of equal measure. The equal sides are called legs, and the third side is the base. A scalene triangle has no equal sides and no equal angles - all three sides and angles are different. Scalene triangles are the most common type of triangle in nature and everyday objects.',
      },
    ],
    quiz: {
      id: 3,
      questions: [
        {
          id: 1,
          question: 'What is the sum of angles in any triangle?',
          options: ['90°', '180°', '270°', '360°'],
          correctAnswer: 1,
          explanation: 'All triangles have angles that sum to 180 degrees, regardless of their type. This is a fundamental property of triangles.',
        },
        {
          id: 2,
          question: 'How many equal sides does an isosceles triangle have?',
          options: ['0', '2', '3', 'All sides are equal'],
          correctAnswer: 1,
          explanation: 'An isosceles triangle has exactly two sides of equal length, called the legs.',
        },
        {
          id: 3,
          question: 'What is the longest side of a right triangle called?',
          options: ['Base', 'Height', 'Hypotenuse', 'Leg'],
          correctAnswer: 2,
          explanation: 'The hypotenuse is the side opposite the right angle and is always the longest side in a right triangle.',
        },
        {
          id: 4,
          question: 'What do all angles in an equilateral triangle measure?',
          options: ['45°', '60°', '90°', '120°'],
          correctAnswer: 1,
          explanation: 'In an equilateral triangle, all three angles measure exactly 60 degrees, since 180° / 3 = 60°.',
        },
        {
          id: 5,
          question: 'What is the formula for the area of a triangle?',
          options: ['base × height', '(base × height) / 2', 'base + height', 'base² × height'],
          correctAnswer: 1,
          explanation: 'The area of a triangle is calculated as (base × height) / 2. This formula works for all types of triangles.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
];

// Algebra Lessons
const ALGEBRA_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Algebra',
    content: 'Algebra is a fundamental branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. It is one of the most important areas of mathematics because it provides tools for solving problems involving unknown values. Algebra helps us generalize arithmetic and work with patterns and relationships. In this comprehensive lesson, we will explore the basic concepts of algebra, including variables, constants, expressions, and equations. Variables are symbols (usually letters like x, y, or z) that represent unknown or changeable values. Constants are fixed numerical values. When we combine variables and constants using operations like addition, subtraction, multiplication, and division, we create algebraic expressions. Equations are mathematical statements that show two expressions are equal, and solving equations means finding the value of the variable that makes the equation true. Algebra is used extensively in science, engineering, economics, and many other fields. Understanding algebra is essential for advanced mathematics, including calculus, statistics, and linear algebra. By mastering basic algebraic concepts, you will be able to solve complex problems and understand mathematical relationships.',
    concepts: [
      'Variables are symbols (letters) that represent unknown or changeable values',
      'Constants are fixed numerical values that do not change',
      'Algebraic expressions combine variables and constants using operations',
      'Equations are mathematical statements showing two expressions are equal',
      'Solving an equation means finding the value of the variable',
      'Like terms are terms with the same variable and exponent',
      'Coefficients are the numbers multiplied by variables',
      'Terms are the parts of an expression separated by + or - signs',
    ],
    examples: [
      {
        question: 'What is a variable and how is it used in algebra?',
        solution: 'A variable is a symbol (usually a letter like x, y, or z) that represents an unknown or changeable value. Variables allow us to write general rules and solve problems where we do not know the exact values. For example, in the equation 2x + 3 = 11, x is the variable representing the unknown number we need to find. Variables make algebra powerful because they let us work with unknown quantities.',
      },
      {
        question: 'What is the difference between an expression and an equation?',
        solution: 'An algebraic expression is a combination of variables, constants, and operations (like 3x + 5 or 2y - 7) but does not contain an equals sign. An equation is a mathematical statement that shows two expressions are equal (like 3x + 5 = 14). Expressions represent values, while equations represent relationships between values. We can evaluate expressions by substituting values for variables, but we solve equations to find the values of variables.',
      },
      {
        question: 'How do you solve a simple equation like x + 7 = 12?',
        solution: 'To solve x + 7 = 12, we need to isolate the variable x. Since 7 is added to x, we subtract 7 from both sides of the equation: x + 7 - 7 = 12 - 7, which simplifies to x = 5. We can check our answer by substituting 5 back into the original equation: 5 + 7 = 12, which is correct. The key is to use inverse operations to undo what has been done to the variable.',
      },
      {
        question: 'What are like terms and how do you combine them?',
        solution: 'Like terms are terms that have the same variable raised to the same power. For example, 3x and 5x are like terms, but 3x and 3x² are not. To combine like terms, add or subtract their coefficients. For example, 3x + 5x = 8x, and 7y - 2y = 5y. Combining like terms simplifies expressions and makes equations easier to solve.',
      },
    ],
    quiz: {
      id: 1,
      questions: [
        {
          id: 1,
          question: 'What does a variable represent?',
          options: ['A fixed value', 'An unknown value', 'A constant', 'An operation'],
          correctAnswer: 1,
          explanation: 'A variable represents an unknown or changeable value that we need to find or work with.',
        },
        {
          id: 2,
          question: 'In the equation 3x + 5 = 14, what is the variable?',
          options: ['3', '5', 'x', '14'],
          correctAnswer: 2,
          explanation: 'x is the variable in this equation. It represents the unknown value we need to find.',
        },
        {
          id: 3,
          question: 'What is the solution to x + 7 = 12?',
          options: ['5', '7', '12', '19'],
          correctAnswer: 0,
          explanation: 'x + 7 = 12, so x = 12 - 7 = 5.',
        },
        {
          id: 4,
          question: 'What is the difference between an expression and an equation?',
          options: ['An expression has an equals sign, an equation does not', 'An equation has an equals sign, an expression does not', 'They are the same', 'An expression has variables, an equation does not'],
          correctAnswer: 1,
          explanation: 'An equation contains an equals sign showing two expressions are equal, while an expression is just a combination of variables and constants without an equals sign.',
        },
        {
          id: 5,
          question: 'Which are like terms: 3x, 5x, and 2y?',
          options: ['3x and 2y', '5x and 2y', '3x and 5x', 'All of them'],
          correctAnswer: 2,
          explanation: '3x and 5x are like terms because they have the same variable (x) with the same exponent (1). 2y is not a like term because it has a different variable.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 2,
    title: 'Linear Equations',
    content: 'Linear equations are equations where the highest power of the variable is 1. They are called "linear" because when graphed on a coordinate plane, they form straight lines. Linear equations are fundamental in algebra and are used to model many real-world situations. In this comprehensive lesson, we will learn how to solve linear equations step by step. Linear equations have the general form ax + b = c, where a, b, and c are constants and a ≠ 0. To solve linear equations, we use inverse operations to isolate the variable. The goal is to get the variable by itself on one side of the equation. We can add, subtract, multiply, or divide both sides of an equation by the same value without changing the solution. This is based on the properties of equality. Solving linear equations is a critical skill that will help you in more advanced mathematics and in solving real-world problems. We will practice solving various types of linear equations, including those with fractions and decimals. Understanding linear equations prepares you for systems of equations, linear functions, and graphing.',
    concepts: [
      'Linear equations have the form ax + b = c where the variable has power 1',
      'To solve, use inverse operations to isolate the variable',
      'What you do to one side, you must do to the other side',
      'Addition and subtraction are inverse operations',
      'Multiplication and division are inverse operations',
      'Always check your answer by substituting back into the original equation',
      'Linear equations have exactly one solution',
      'The graph of a linear equation is a straight line',
    ],
    examples: [
      {
        question: 'How do you solve the equation 2x - 5 = 11?',
        solution: 'Step 1: Add 5 to both sides to eliminate the -5: 2x - 5 + 5 = 11 + 5, which gives 2x = 16. Step 2: Divide both sides by 2 to isolate x: 2x / 2 = 16 / 2, which gives x = 8. Check: 2(8) - 5 = 16 - 5 = 11 ✓. The solution is x = 8.',
      },
      {
        question: 'What are inverse operations and why are they important?',
        solution: 'Inverse operations are operations that undo each other. Addition and subtraction are inverses - if you add 5, you can undo it by subtracting 5. Multiplication and division are inverses - if you multiply by 3, you can undo it by dividing by 3. Inverse operations are essential for solving equations because they allow us to isolate the variable by undoing what has been done to it.',
      },
      {
        question: 'How do you solve an equation with fractions like (x/3) + 2 = 7?',
        solution: 'Step 1: Subtract 2 from both sides: x/3 + 2 - 2 = 7 - 2, which gives x/3 = 5. Step 2: Multiply both sides by 3 to eliminate the fraction: (x/3) × 3 = 5 × 3, which gives x = 15. Check: (15/3) + 2 = 5 + 2 = 7 ✓. The solution is x = 15.',
      },
      {
        question: 'Why is it important to check your answer after solving an equation?',
        solution: 'Checking your answer verifies that you solved the equation correctly. To check, substitute your solution back into the original equation and see if both sides are equal. If they are equal, your solution is correct. If not, you made an error and need to solve again. Checking helps catch mistakes and builds confidence in your algebraic skills.',
      },
    ],
    quiz: {
      id: 2,
      questions: [
        {
          id: 1,
          question: 'What is the solution to 3x - 6 = 9?',
          options: ['1', '5', '15', '45'],
          correctAnswer: 1,
          explanation: '3x - 6 = 9, so 3x = 15, therefore x = 5.',
        },
        {
          id: 2,
          question: 'What operation is used to solve 5x = 20?',
          options: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
          correctAnswer: 3,
          explanation: 'To solve 5x = 20, divide both sides by 5 to get x = 4.',
        },
        {
          id: 3,
          question: 'Solve: 2x + 3 = 11',
          options: ['4', '7', '14', '25'],
          correctAnswer: 0,
          explanation: '2x + 3 = 11, so 2x = 8, therefore x = 4.',
        },
        {
          id: 4,
          question: 'What is the inverse operation of addition?',
          options: ['Multiplication', 'Subtraction', 'Division', 'Exponentiation'],
          correctAnswer: 1,
          explanation: 'Subtraction is the inverse of addition. To undo addition, we subtract.',
        },
        {
          id: 5,
          question: 'How many solutions does a linear equation typically have?',
          options: ['0', '1', '2', 'Infinite'],
          correctAnswer: 1,
          explanation: 'A linear equation typically has exactly one solution, unless it is an identity (infinite solutions) or a contradiction (no solutions).',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 3,
    title: 'Quadratic Equations',
    content: 'Quadratic equations are polynomial equations of degree 2, meaning the highest power of the variable is 2. They have the general form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. Quadratic equations are more complex than linear equations and appear frequently in mathematics, physics, engineering, and economics. In this comprehensive lesson, we will explore various methods for solving quadratic equations, including factoring, completing the square, and using the quadratic formula. Quadratic equations can have 0, 1, or 2 real solutions depending on the discriminant (b² - 4ac). When graphed, quadratic equations form parabolas, which are U-shaped curves that can open upward or downward. Understanding quadratic equations is essential for advanced algebra, calculus, and many practical applications. We will learn how to identify quadratic equations, solve them using different methods, and interpret their solutions. The quadratic formula is a powerful tool that can solve any quadratic equation, and understanding when to use each method is an important skill.',
    concepts: [
      'Quadratic equations have the standard form ax² + bx + c = 0 where a ≠ 0',
      'The highest power of the variable in a quadratic equation is 2',
      'Quadratic equations can be solved by factoring, completing the square, or the quadratic formula',
      'The discriminant (b² - 4ac) determines the number of solutions',
      'If discriminant > 0, there are 2 real solutions',
      'If discriminant = 0, there is 1 real solution',
      'If discriminant < 0, there are no real solutions (only complex)',
      'The graph of a quadratic equation is a parabola',
    ],
    examples: [
      {
        question: 'What is the standard form of a quadratic equation?',
        solution: 'The standard form of a quadratic equation is ax² + bx + c = 0, where a, b, and c are constants (coefficients) and a ≠ 0. The coefficient a cannot be zero because if a = 0, the equation would be linear, not quadratic. Examples include x² - 5x + 6 = 0, where a = 1, b = -5, and c = 6.',
      },
      {
        question: 'How many solutions can a quadratic equation have?',
        solution: 'A quadratic equation can have 0, 1, or 2 real solutions. The number of solutions depends on the discriminant (b² - 4ac). If the discriminant is positive, there are 2 distinct real solutions. If it is zero, there is exactly 1 real solution (a repeated root). If it is negative, there are no real solutions, only complex solutions. For example, x² - 4 = 0 has 2 solutions (x = 2 and x = -2), while x² = 0 has 1 solution (x = 0).',
      },
      {
        question: 'What is the quadratic formula and when is it used?',
        solution: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / (2a), which can solve any quadratic equation ax² + bx + c = 0. It is used when factoring is difficult or impossible. The ± symbol means there are usually two solutions: one with + and one with -. For example, to solve x² - 5x + 6 = 0, we have a = 1, b = -5, c = 6, so x = (5 ± √(25 - 24)) / 2 = (5 ± 1) / 2, giving x = 3 or x = 2.',
      },
      {
        question: 'What is a parabola and how does it relate to quadratic equations?',
        solution: 'A parabola is the U-shaped curve that represents the graph of a quadratic equation. If the coefficient a > 0, the parabola opens upward (like a U). If a < 0, it opens downward (like an upside-down U). The vertex is the highest or lowest point of the parabola. Parabolas are symmetrical and have many applications in physics (projectile motion), engineering (arch design), and economics (profit maximization).',
      },
    ],
    quiz: {
      id: 3,
      questions: [
        {
          id: 1,
          question: 'What is the degree of a quadratic equation?',
          options: ['1', '2', '3', '4'],
          correctAnswer: 1,
          explanation: 'A quadratic equation has degree 2, meaning the highest power of the variable is 2 (x²).',
        },
        {
          id: 2,
          question: 'In ax² + bx + c = 0, what must be true about a?',
          options: ['a = 0', 'a ≠ 0', 'a > 0', 'a < 0'],
          correctAnswer: 1,
          explanation: 'In a quadratic equation, a must not equal 0, otherwise it would be a linear equation, not quadratic.',
        },
        {
          id: 3,
          question: 'What is the shape of the graph of a quadratic equation?',
          options: ['Straight line', 'Parabola', 'Circle', 'Triangle'],
          correctAnswer: 1,
          explanation: 'The graph of a quadratic equation is a parabola, which is a U-shaped or inverted U-shaped curve.',
        },
        {
          id: 4,
          question: 'What does the discriminant tell us about a quadratic equation?',
          options: ['The number of solutions', 'The shape of the graph', 'The vertex location', 'The y-intercept'],
          correctAnswer: 0,
          explanation: 'The discriminant (b² - 4ac) tells us how many real solutions the quadratic equation has: positive = 2 solutions, zero = 1 solution, negative = 0 real solutions.',
        },
        {
          id: 5,
          question: 'How many solutions does x² - 4 = 0 have?',
          options: ['0', '1', '2', 'Infinite'],
          correctAnswer: 2,
          explanation: 'x² - 4 = 0 can be factored as (x - 2)(x + 2) = 0, so x = 2 or x = -2. Therefore, it has 2 solutions.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
];

// Statistics Lessons
const STATISTICS_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Statistics',
    content: 'Statistics is the science of collecting, organizing, analyzing, and interpreting data to make informed decisions and draw meaningful conclusions. It is one of the most important branches of mathematics and is used in virtually every field, from science and medicine to business and social sciences. In this comprehensive lesson, we will explore the fundamental concepts of statistics, including data collection, populations, samples, and the importance of statistical analysis. Statistics helps us understand patterns in data, make predictions, test hypotheses, and support decision-making. We will learn about the difference between descriptive statistics, which summarize and describe data, and inferential statistics, which allow us to make conclusions about populations based on samples. Understanding statistics is essential for interpreting research findings, evaluating claims, and making data-driven decisions in both personal and professional contexts. The ability to work with data and understand statistical concepts is increasingly important in our data-driven world.',
    concepts: [
      'Statistics is the science of collecting, organizing, analyzing, and interpreting data',
      'Data is information collected through observation, measurement, or experimentation',
      'Population is the entire group of individuals or objects being studied',
      'Sample is a subset of the population selected for analysis',
      'Descriptive statistics summarize and describe data characteristics',
      'Inferential statistics make conclusions about populations based on samples',
      'Variables are characteristics that can vary or change',
      'Statistics help us make informed decisions and understand patterns',
    ],
    examples: [
      {
        question: 'What is the difference between a population and a sample, and why is this distinction important?',
        solution: 'A population is the entire group of individuals, objects, or events that we want to study. A sample is a smaller subset selected from the population. For example, if we want to study all students in a school (population), we might select 100 students (sample) to survey. This distinction is crucial because studying entire populations is often impractical, expensive, or impossible. Well-chosen samples can accurately represent populations, allowing us to make inferences about the whole group based on the sample data.',
      },
      {
        question: 'Why do we use samples instead of studying entire populations?',
        solution: 'Samples are used because studying entire populations is often impractical, expensive, time-consuming, or impossible. For instance, it would be impossible to survey every person in a country, but we can survey a representative sample. Well-designed samples can accurately represent the population while being much more manageable. Samples also allow for more detailed analysis since we can focus resources on a smaller group. However, it is crucial that samples are representative of the population to ensure accurate conclusions.',
      },
      {
        question: 'What is the difference between descriptive and inferential statistics?',
        solution: 'Descriptive statistics summarize and describe the characteristics of a dataset using measures like mean, median, mode, and standard deviation. They help us understand what the data shows. Inferential statistics, on the other hand, allow us to make conclusions or predictions about a population based on sample data. For example, if we find that 60% of a sample of 1000 voters support a candidate, inferential statistics help us estimate the percentage of all voters (the population) who support that candidate, along with a margin of error.',
      },
      {
        question: 'How is statistics used in real-world applications?',
        solution: 'Statistics is used extensively in many fields. In medicine, it helps test the effectiveness of treatments through clinical trials. In business, it aids in market research and quality control. In sports, it analyzes player performance. In government, it informs policy decisions through census data and surveys. In science, it validates research findings. Statistics helps us make sense of large amounts of data, identify trends, test hypotheses, and make predictions based on evidence rather than guesswork.',
      },
    ],
    quiz: {
      id: 1,
      questions: [
        {
          id: 1,
          question: 'What is statistics?',
          options: ['The study of numbers', 'The science of data', 'A type of math', 'All of the above'],
          correctAnswer: 3,
          explanation: 'Statistics is the science of collecting, organizing, analyzing, and interpreting data, which involves working with numbers and mathematics.',
        },
        {
          id: 2,
          question: 'What is a sample?',
          options: ['The entire group', 'A subset of the population', 'A type of data', 'A statistic'],
          correctAnswer: 1,
          explanation: 'A sample is a subset of the population selected for study and analysis.',
        },
        {
          id: 3,
          question: 'Why do we use samples instead of populations?',
          options: ['Samples are easier and more practical', 'Populations are too large', 'Samples are more accurate', 'Both A and B'],
          correctAnswer: 3,
          explanation: 'We use samples because studying entire populations is often impractical, impossible, or too expensive, and samples can be easier to manage while still being representative.',
        },
        {
          id: 4,
          question: 'What is the difference between descriptive and inferential statistics?',
          options: ['Descriptive summarizes data, inferential makes predictions', 'They are the same', 'Descriptive uses samples, inferential uses populations', 'There is no difference'],
          correctAnswer: 0,
          explanation: 'Descriptive statistics summarize and describe data characteristics, while inferential statistics make conclusions about populations based on sample data.',
        },
        {
          id: 5,
          question: 'What is a population in statistics?',
          options: ['A small group', 'The entire group being studied', 'A type of chart', 'A statistical measure'],
          correctAnswer: 1,
          explanation: 'A population is the entire group of individuals, objects, or events that we want to study in statistics.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 2,
    title: 'Measures of Central Tendency',
    content: 'Measures of central tendency are statistical measures that describe the center or typical value of a dataset. They help us understand where the "middle" of our data lies and provide a single value that represents the entire dataset. The three main measures of central tendency are the mean, median, and mode, each with its own strengths and applications. The mean (average) is calculated by adding all values and dividing by the number of values. It is sensitive to outliers and works well with normally distributed data. The median is the middle value when data is ordered from smallest to largest. It is not affected by outliers and is useful for skewed distributions. The mode is the most frequently occurring value and is useful for categorical data. Understanding when to use each measure is crucial for accurate data analysis. Different situations call for different measures, and knowing which one to use helps us make better interpretations of data.',
    concepts: [
      'Mean (average) is calculated by summing all values and dividing by the count',
      'Median is the middle value when data is ordered from smallest to largest',
      'Mode is the value that appears most frequently in the dataset',
      'Mean is sensitive to outliers and extreme values',
      'Median is resistant to outliers and works well with skewed data',
      'Mode is useful for categorical data and finding the most common value',
      'For even numbers of values, median is the average of the two middle values',
      'A dataset can have one mode (unimodal), two modes (bimodal), or no mode',
    ],
    examples: [
      {
        question: 'How do you calculate the mean and when is it most appropriate to use?',
        solution: 'The mean is calculated by adding all values together and dividing by the number of values: Mean = Sum of all values / Number of values. For example, for the data [2, 4, 6, 8, 10], the mean is (2 + 4 + 6 + 8 + 10) / 5 = 30 / 5 = 6. The mean is most appropriate when data is normally distributed (bell-shaped) and there are no extreme outliers. It is widely used because it uses all data points and is easy to understand.',
      },
      {
        question: 'What is the median and why is it useful for skewed data?',
        solution: 'The median is the middle value when data is arranged in order. For an odd number of values, it is the middle value. For an even number, it is the average of the two middle values. For example, in [1, 3, 5, 7, 9, 11], the median is (5 + 7) / 2 = 6. The median is useful for skewed data because it is not affected by extreme values (outliers). Unlike the mean, which can be pulled toward outliers, the median gives a better representation of the "typical" value in skewed distributions.',
      },
      {
        question: 'What is the mode and when would you use it?',
        solution: 'The mode is the value that appears most frequently in a dataset. For example, in [2, 3, 3, 4, 5, 3, 6], the mode is 3 because it appears three times. The mode is particularly useful for categorical data (like favorite colors or types of cars) where we want to know the most common category. It can also be useful for discrete numerical data. A dataset can have no mode (if all values are unique), one mode (unimodal), or multiple modes (bimodal or multimodal).',
      },
      {
        question: 'How do outliers affect the mean, median, and mode?',
        solution: 'Outliers (extreme values) significantly affect the mean because the mean uses all values in its calculation. For example, if we have [1, 2, 3, 4, 100], the mean is 22, which is not representative of most values. The median is not affected by outliers - in the same example, the median is 3, which better represents the data. The mode is also not affected by outliers unless the outlier becomes the most frequent value. This is why median is preferred for data with outliers, such as income data where a few very high incomes would skew the mean.',
      },
    ],
    quiz: {
      id: 2,
      questions: [
        {
          id: 1,
          question: 'What is the mean of [2, 4, 6, 8, 10]?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 1,
          explanation: 'Mean = (2 + 4 + 6 + 8 + 10) / 5 = 30 / 5 = 6',
        },
        {
          id: 2,
          question: 'What is the median of [1, 3, 5, 7, 9, 11]?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 1,
          explanation: 'With 6 values, the median is the average of the two middle values: (5 + 7) / 2 = 6',
        },
        {
          id: 3,
          question: 'What is the mode of [2, 3, 3, 4, 5, 3, 6]?',
          options: ['2', '3', '4', '5'],
          correctAnswer: 1,
          explanation: 'The mode is 3 because it appears most frequently (3 times) in the dataset.',
        },
        {
          id: 4,
          question: 'Which measure is most affected by outliers?',
          options: ['Mean', 'Median', 'Mode', 'All equally'],
          correctAnswer: 0,
          explanation: 'The mean is most affected by outliers because it uses all values in its calculation, so extreme values pull the mean toward them.',
        },
        {
          id: 5,
          question: 'Which measure is best for skewed data with outliers?',
          options: ['Mean', 'Median', 'Mode', 'All are equal'],
          correctAnswer: 1,
          explanation: 'The median is best for skewed data with outliers because it is not affected by extreme values and provides a better representation of the typical value.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 3,
    title: 'Data Visualization',
    content: 'Data visualization is the graphical representation of data and information. It uses visual elements like charts, graphs, and maps to help people understand patterns, trends, and relationships in data more easily than raw numbers alone. Effective data visualization makes complex data accessible and allows us to quickly identify patterns, outliers, and insights. In this comprehensive lesson, we will explore various types of charts and graphs, when to use each type, and how to create effective visualizations. Common types of visualizations include bar charts for comparing categories, line graphs for showing trends over time, pie charts for displaying proportions, histograms for frequency distributions, and scatter plots for relationships between variables. Each type of chart has specific uses and advantages. Good data visualization follows principles of clarity, accuracy, and simplicity. Understanding how to read and create visualizations is essential for data analysis, presentation, and decision-making in many fields.',
    concepts: [
      'Bar charts are used to compare different categories or groups',
      'Line graphs show trends and changes over time',
      'Pie charts display proportions or percentages of a whole',
      'Histograms show frequency distributions of continuous data',
      'Scatter plots show relationships between two variables',
      'The choice of chart type depends on the data and the message',
      'Good visualizations are clear, accurate, and easy to understand',
      'Charts should have proper labels, titles, and scales',
    ],
    examples: [
      {
        question: 'When would you use a bar chart versus a line graph?',
        solution: 'Bar charts are best for comparing different categories or groups at a specific point in time. For example, comparing sales across different products or comparing test scores across different students. Line graphs are best for showing trends and changes over time. For example, showing how sales change from month to month or how temperature changes throughout the day. The key difference is that bar charts compare categories, while line graphs show changes over time.',
      },
      {
        question: 'What does a pie chart show and when is it most appropriate?',
        solution: 'Pie charts show proportions or percentages of a whole, where each slice represents a part of the total. They are most appropriate when you want to show how different categories contribute to a total. For example, showing the percentage of budget allocated to different departments or the distribution of votes among candidates. Pie charts work best with a small number of categories (usually 5 or fewer) and when the parts add up to 100%. They are not good for comparing precise values or showing trends over time.',
      },
      {
        question: 'What is a histogram and how does it differ from a bar chart?',
        solution: 'A histogram is used to display the frequency distribution of continuous numerical data. It shows how data is distributed across different ranges (bins). For example, showing how many students scored in different score ranges on a test. Histograms differ from bar charts in that histograms show the distribution of continuous data (like ages or weights), while bar charts compare discrete categories (like different products). In histograms, the bars touch each other because they represent continuous ranges, while bar charts have gaps between bars.',
      },
      {
        question: 'What makes a good data visualization?',
        solution: 'A good data visualization is clear, accurate, and easy to understand. It should have a clear title that describes what is being shown, properly labeled axes with units, appropriate scales that don\'t mislead viewers, and a legend if multiple data series are shown. Colors should be used effectively to highlight important information without being distracting. The visualization should tell a story and help viewers quickly understand the key message. It should avoid clutter and unnecessary elements that could confuse the viewer. Good visualizations make data accessible to people who may not be familiar with the underlying numbers.',
      },
    ],
    quiz: {
      id: 3,
      questions: [
        {
          id: 1,
          question: 'Which chart is best for showing trends over time?',
          options: ['Bar chart', 'Line graph', 'Pie chart', 'Histogram'],
          correctAnswer: 1,
          explanation: 'Line graphs are ideal for showing trends and changes over time, as they clearly display how values change continuously.',
        },
        {
          id: 2,
          question: 'What does a pie chart show?',
          options: ['Trends', 'Comparisons', 'Proportions', 'Frequencies'],
          correctAnswer: 2,
          explanation: 'Pie charts show proportions or percentages of a whole, where each slice represents a part of the total.',
        },
        {
          id: 3,
          question: 'What is a histogram used for?',
          options: ['Comparing categories', 'Showing trends', 'Displaying frequency distributions', 'Showing proportions'],
          correctAnswer: 2,
          explanation: 'Histograms are used to display frequency distributions of continuous numerical data, showing how data is distributed across ranges.',
        },
        {
          id: 4,
          question: 'When should you use a bar chart?',
          options: ['To show trends over time', 'To compare different categories', 'To show proportions', 'To show relationships'],
          correctAnswer: 1,
          explanation: 'Bar charts are used to compare different categories or groups, making it easy to see differences between them.',
        },
        {
          id: 5,
          question: 'What is the main difference between a histogram and a bar chart?',
          options: ['Histograms show continuous data, bar charts show categories', 'They are the same', 'Histograms have gaps, bar charts do not', 'Bar charts are always vertical'],
          correctAnswer: 0,
          explanation: 'Histograms display frequency distributions of continuous data (like ages or weights) with touching bars, while bar charts compare discrete categories with gaps between bars.',
        },
      ],
      passingScore: 4,
    },
    completed: false,
    quizPassed: false,
  },
];

// Trigonometry Lessons
const TRIGONOMETRY_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Trigonometry',
    content: 'Trigonometry is the study of relationships between angles and sides of triangles. It is essential for understanding waves, oscillations, and circular motion.',
    concepts: [
      'Trigonometry deals with triangles and angles',
      'Right triangles have one 90° angle',
      'The three main ratios are sine, cosine, and tangent',
      'Trigonometry is used in many real-world applications',
    ],
    examples: [
      {
        question: 'What is a right triangle?',
        solution: 'A right triangle is a triangle with one angle measuring exactly 90 degrees. The side opposite the right angle is called the hypotenuse.',
      },
      {
        question: 'What are the three main trigonometric ratios?',
        solution: 'Sine (sin), Cosine (cos), and Tangent (tan). These ratios relate the angles of a right triangle to the lengths of its sides.',
      },
    ],
    quiz: {
      id: 1,
      questions: [
        {
          id: 1,
          question: 'What is trigonometry?',
          options: ['Study of triangles', 'Study of angles and triangles', 'Study of circles', 'Study of shapes'],
          correctAnswer: 1,
          explanation: 'Trigonometry is the study of relationships between angles and sides of triangles.',
        },
        {
          id: 2,
          question: 'How many 90° angles does a right triangle have?',
          options: ['0', '1', '2', '3'],
          correctAnswer: 1,
          explanation: 'A right triangle has exactly one 90° angle (a right angle).',
        },
        {
          id: 3,
          question: 'What is the longest side of a right triangle called?',
          options: ['Base', 'Height', 'Hypotenuse', 'Leg'],
          correctAnswer: 2,
          explanation: 'The hypotenuse is the side opposite the right angle and is always the longest side.',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 2,
    title: 'Sine, Cosine, and Tangent',
    content: 'Sine, cosine, and tangent are the three primary trigonometric functions. They relate angles to the ratios of sides in right triangles.',
    concepts: [
      'Sine (sin) = Opposite / Hypotenuse',
      'Cosine (cos) = Adjacent / Hypotenuse',
      'Tangent (tan) = Opposite / Adjacent',
      'These ratios are constant for a given angle',
    ],
    examples: [
      {
        question: 'How do you calculate sine?',
        solution: 'Sine of an angle = length of opposite side / length of hypotenuse',
      },
      {
        question: 'What is SOH-CAH-TOA?',
        solution: 'A memory aid: Sine = Opposite/Hypotenuse, Cosine = Adjacent/Hypotenuse, Tangent = Opposite/Adjacent',
      },
    ],
    quiz: {
      id: 2,
      questions: [
        {
          id: 1,
          question: 'What does SOH stand for?',
          options: ['Sine = Opposite/Hypotenuse', 'Sine = Opposite/Adjacent', 'Sine = Adjacent/Hypotenuse', 'Sine = Hypotenuse/Opposite'],
          correctAnswer: 0,
          explanation: 'SOH means Sine = Opposite / Hypotenuse',
        },
        {
          id: 2,
          question: 'What is the formula for cosine?',
          options: ['Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Adjacent'],
          correctAnswer: 1,
          explanation: 'Cosine = Adjacent / Hypotenuse (CAH)',
        },
        {
          id: 3,
          question: 'What is the formula for tangent?',
          options: ['Opposite/Hypotenuse', 'Adjacent/Hypotenuse', 'Opposite/Adjacent', 'Hypotenuse/Opposite'],
          correctAnswer: 2,
          explanation: 'Tangent = Opposite / Adjacent (TOA)',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 3,
    title: 'Unit Circle',
    content: 'The unit circle is a circle with radius 1 centered at the origin. It is fundamental in trigonometry and helps us understand trigonometric functions for all angles.',
    concepts: [
      'The unit circle has radius 1',
      'Angles are measured in degrees or radians',
      'Trigonometric functions can be found using coordinates',
      'The unit circle extends trigonometry beyond right triangles',
    ],
    examples: [
      {
        question: 'What is the radius of a unit circle?',
        solution: 'The unit circle has a radius of 1 unit. It is centered at the origin (0, 0) of a coordinate plane.',
      },
      {
        question: 'How are angles measured on the unit circle?',
        solution: 'Angles can be measured in degrees (0° to 360°) or radians (0 to 2π). Positive angles are measured counterclockwise from the positive x-axis.',
      },
    ],
    quiz: {
      id: 3,
      questions: [
        {
          id: 1,
          question: 'What is the radius of a unit circle?',
          options: ['0', '1', '2', 'π'],
          correctAnswer: 1,
          explanation: 'A unit circle has a radius of exactly 1 unit.',
        },
        {
          id: 2,
          question: 'How many radians are in a full circle?',
          options: ['90', '180', '360', '2π'],
          correctAnswer: 3,
          explanation: 'A full circle contains 2π radians, which is equivalent to 360 degrees.',
        },
        {
          id: 3,
          question: 'Where is the unit circle centered?',
          options: ['(1, 1)', '(0, 0)', '(0, 1)', '(1, 0)'],
          correctAnswer: 1,
          explanation: 'The unit circle is centered at the origin (0, 0) of the coordinate plane.',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
];

// Calculus Lessons
const CALCULUS_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Calculus',
    content: 'Calculus is the mathematical study of continuous change. It has two main branches: differential calculus (studying rates of change) and integral calculus (studying accumulation).',
    concepts: [
      'Calculus studies continuous change',
      'Differential calculus deals with derivatives and rates of change',
      'Integral calculus deals with integrals and accumulation',
      'Calculus is used in physics, engineering, and many other fields',
    ],
    examples: [
      {
        question: 'What is calculus used for?',
        solution: 'Calculus is used to study rates of change, find maximum and minimum values, calculate areas and volumes, and solve many real-world problems in science and engineering.',
      },
      {
        question: 'What are the two main branches of calculus?',
        solution: 'Differential calculus (studying derivatives and rates of change) and integral calculus (studying integrals and accumulation).',
      },
    ],
    quiz: {
      id: 1,
      questions: [
        {
          id: 1,
          question: 'What does calculus study?',
          options: ['Discrete numbers', 'Continuous change', 'Shapes', 'Angles'],
          correctAnswer: 1,
          explanation: 'Calculus is the mathematical study of continuous change.',
        },
        {
          id: 2,
          question: 'How many main branches does calculus have?',
          options: ['1', '2', '3', '4'],
          correctAnswer: 1,
          explanation: 'Calculus has two main branches: differential calculus and integral calculus.',
        },
        {
          id: 3,
          question: 'What does differential calculus study?',
          options: ['Accumulation', 'Rates of change', 'Areas', 'Volumes'],
          correctAnswer: 1,
          explanation: 'Differential calculus studies derivatives and rates of change.',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 2,
    title: 'Limits',
    content: 'Limits are fundamental to calculus. A limit describes the value that a function approaches as the input approaches a particular value.',
    concepts: [
      'A limit describes approaching behavior',
      'Limits can be evaluated even if the function is undefined at that point',
      'Limits help define derivatives and integrals',
      'Not all limits exist',
    ],
    examples: [
      {
        question: 'What is a limit?',
        solution: 'A limit is the value that a function approaches as the input approaches a particular value. It describes what happens "near" a point, not necessarily at that point.',
      },
      {
        question: 'Why are limits important?',
        solution: 'Limits are the foundation of calculus. They allow us to define derivatives and integrals, and they help us understand function behavior.',
      },
    ],
    quiz: {
      id: 2,
      questions: [
        {
          id: 1,
          question: 'What does a limit describe?',
          options: ['Exact value', 'Approaching behavior', 'Function value', 'Derivative'],
          correctAnswer: 1,
          explanation: 'A limit describes the value that a function approaches as the input approaches a particular value.',
        },
        {
          id: 2,
          question: 'Can a limit exist even if the function is undefined at that point?',
          options: ['No', 'Yes', 'Sometimes', 'Never'],
          correctAnswer: 1,
          explanation: 'Yes, limits describe approaching behavior, so they can exist even when the function is undefined at that exact point.',
        },
        {
          id: 3,
          question: 'What is the limit of f(x) = x² as x approaches 2?',
          options: ['2', '4', '8', '16'],
          correctAnswer: 1,
          explanation: 'As x approaches 2, x² approaches 4, so the limit is 4.',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 3,
    title: 'Derivatives',
    content: 'Derivatives measure the rate of change of a function. They tell us how fast a quantity is changing at any given point and are essential in optimization problems.',
    concepts: [
      'Derivatives measure instantaneous rate of change',
      'The derivative of a function at a point is the slope of the tangent line',
      'Derivatives help find maximum and minimum values',
      'Common derivative rules simplify calculations',
    ],
    examples: [
      {
        question: 'What does a derivative represent?',
        solution: 'A derivative represents the instantaneous rate of change of a function. It tells us how fast the function is changing at a specific point.',
      },
      {
        question: 'What is the geometric meaning of a derivative?',
        solution: 'Geometrically, the derivative at a point is the slope of the tangent line to the function at that point.',
      },
    ],
    quiz: {
      id: 3,
      questions: [
        {
          id: 1,
          question: 'What does a derivative measure?',
          options: ['Area', 'Volume', 'Rate of change', 'Distance'],
          correctAnswer: 2,
          explanation: 'Derivatives measure the instantaneous rate of change of a function.',
        },
        {
          id: 2,
          question: 'What is the geometric meaning of a derivative?',
          options: ['Area under curve', 'Slope of tangent line', 'Length of curve', 'Volume'],
          correctAnswer: 1,
          explanation: 'The derivative at a point is the slope of the tangent line to the function at that point.',
        },
        {
          id: 3,
          question: 'What is the derivative of f(x) = x²?',
          options: ['x', '2x', 'x²', '2x²'],
          correctAnswer: 1,
          explanation: 'The derivative of x² is 2x, using the power rule: bring down the exponent and reduce it by 1.',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
];

// Probability Lessons
const PROBABILITY_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Probability',
    content: 'Probability is the measure of how likely an event is to occur. It ranges from 0 (impossible) to 1 (certain) and helps us make predictions and decisions.',
    concepts: [
      'Probability ranges from 0 to 1',
      '0 means impossible, 1 means certain',
      'Probability = Favorable outcomes / Total outcomes',
      'Probability helps us understand chance and uncertainty',
    ],
    examples: [
      {
        question: 'What is probability?',
        solution: 'Probability is a measure of how likely an event is to occur. It is expressed as a number between 0 and 1, where 0 means impossible and 1 means certain.',
      },
      {
        question: 'How do you calculate probability?',
        solution: 'Probability = Number of favorable outcomes / Total number of possible outcomes',
      },
    ],
    quiz: {
      id: 1,
      questions: [
        {
          id: 1,
          question: 'What is the range of probability values?',
          options: ['0 to 10', '0 to 100', '0 to 1', '-1 to 1'],
          correctAnswer: 2,
          explanation: 'Probability values range from 0 (impossible) to 1 (certain).',
        },
        {
          id: 2,
          question: 'What does a probability of 0 mean?',
          options: ['Certain', 'Impossible', '50% chance', 'Unknown'],
          correctAnswer: 1,
          explanation: 'A probability of 0 means the event is impossible and will never occur.',
        },
        {
          id: 3,
          question: 'What is the probability of flipping heads on a fair coin?',
          options: ['0', '0.5', '1', '2'],
          correctAnswer: 1,
          explanation: 'A fair coin has 2 possible outcomes (heads or tails), so P(heads) = 1/2 = 0.5',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 2,
    title: 'Basic Probability Rules',
    content: 'There are fundamental rules in probability that help us calculate the likelihood of events. Understanding these rules is essential for solving probability problems.',
    concepts: [
      'Addition rule: P(A or B) = P(A) + P(B) - P(A and B)',
      'Multiplication rule: P(A and B) = P(A) × P(B) for independent events',
      'Complement rule: P(not A) = 1 - P(A)',
      'These rules help solve complex probability problems',
    ],
    examples: [
      {
        question: 'What is the complement rule?',
        solution: 'The complement rule states that P(not A) = 1 - P(A). If the probability of an event is 0.3, the probability of it not happening is 0.7.',
      },
      {
        question: 'When do we use the multiplication rule?',
        solution: 'The multiplication rule is used for independent events. If events A and B are independent, P(A and B) = P(A) × P(B).',
      },
    ],
    quiz: {
      id: 2,
      questions: [
        {
          id: 1,
          question: 'What is P(not A) if P(A) = 0.7?',
          options: ['0.3', '0.7', '1.7', '0'],
          correctAnswer: 0,
          explanation: 'Using the complement rule: P(not A) = 1 - P(A) = 1 - 0.7 = 0.3',
        },
        {
          id: 2,
          question: 'If two events are independent, what is P(A and B)?',
          options: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A) - P(B)', 'P(A) / P(B)'],
          correctAnswer: 1,
          explanation: 'For independent events, P(A and B) = P(A) × P(B)',
        },
        {
          id: 3,
          question: 'What is the probability of rolling a 6 on a fair die?',
          options: ['1/6', '1/2', '1/3', '1'],
          correctAnswer: 0,
          explanation: 'A fair die has 6 possible outcomes, and only 1 is a 6, so P(6) = 1/6',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
  {
    id: 3,
    title: 'Conditional Probability',
    content: 'Conditional probability is the probability of an event occurring given that another event has already occurred. It is written as P(A|B), meaning "probability of A given B".',
    concepts: [
      'Conditional probability: P(A|B) = P(A and B) / P(B)',
      'It measures how one event affects another',
      'Independent events have P(A|B) = P(A)',
      'Conditional probability is used in many real-world applications',
    ],
    examples: [
      {
        question: 'What is conditional probability?',
        solution: 'Conditional probability is the probability of an event A occurring given that event B has already occurred. It is calculated as P(A|B) = P(A and B) / P(B).',
      },
      {
        question: 'When are two events independent?',
        solution: 'Two events are independent if P(A|B) = P(A), meaning that the occurrence of B does not affect the probability of A.',
      },
    ],
    quiz: {
      id: 3,
      questions: [
        {
          id: 1,
          question: 'What does P(A|B) mean?',
          options: ['Probability of A and B', 'Probability of A given B', 'Probability of A or B', 'Probability of not A'],
          correctAnswer: 1,
          explanation: 'P(A|B) means the probability of A occurring given that B has already occurred.',
        },
        {
          id: 2,
          question: 'How do you calculate P(A|B)?',
          options: ['P(A) + P(B)', 'P(A and B) / P(B)', 'P(A) × P(B)', 'P(A) - P(B)'],
          correctAnswer: 1,
          explanation: 'Conditional probability is calculated as P(A|B) = P(A and B) / P(B)',
        },
        {
          id: 3,
          question: 'If events A and B are independent, what is P(A|B)?',
          options: ['P(A) + P(B)', 'P(A) × P(B)', 'P(A)', 'P(B)'],
          correctAnswer: 2,
          explanation: 'If events are independent, P(A|B) = P(A) because B does not affect the probability of A.',
        },
      ],
      passingScore: 2,
    },
    completed: false,
    quizPassed: false,
  },
];

const TOPIC_INFO: { [key: string]: { name: string; icon: string; description: string } } = {
  '1': {
    name: 'Geometry',
    icon: '📐',
    description: 'Learn about shapes, angles, and spatial relationships',
  },
  '2': {
    name: 'Algebra',
    icon: '🧮',
    description: 'Master equations, variables, and algebraic expressions',
  },
  '3': {
    name: 'Statistics',
    icon: '📊',
    description: 'Understand data analysis and probability',
  },
  '4': {
    name: 'Trigonometry',
    icon: '📏',
    description: 'Explore angles, triangles, and circular functions',
  },
  '5': {
    name: 'Calculus',
    icon: '⚖️',
    description: 'Learn about rates of change and accumulation',
  },
  '6': {
    name: 'Probability',
    icon: '🎯',
    description: 'Study chance, randomness, and predictions',
  },
};

// Get lessons for a specific topic
const getLessonsForTopic = (topicId: string): Lesson[] => {
  switch (topicId) {
    case '1':
      return GEOMETRY_LESSONS;
    case '2':
      return ALGEBRA_LESSONS;
    case '3':
      return STATISTICS_LESSONS;
    case '4':
      return TRIGONOMETRY_LESSONS;
    case '5':
      return CALCULUS_LESSONS;
    case '6':
      return PROBABILITY_LESSONS;
    default:
      return GEOMETRY_LESSONS;
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

  // Reload lessons when topic ID changes
  useEffect(() => {
    const newLessons = getLessonsForTopic(topicId);
    setLessons(newLessons);
    setCurrentLessonIndex(0);
    setScrollProgress(0);
  }, [topicId]);

  // Initialize progress when lessons change
  useEffect(() => {
    const completedCount = lessons.filter((l) => l.completed && l.quizPassed).length;
    const baseProgress = (completedCount / lessons.length) * 100;
    
    // Initialize scroll progress with completed lessons progress
    // Scroll will add incremental progress for current lesson
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
      
      // Save progress to storage
      if (id) {
        updateTopicProgress(parseInt(id), newProgress);
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
        
        // Save progress to storage as user scrolls (throttle updates)
        if (id) {
          updateTopicProgress(parseInt(id), overallProgress);
        }
      }
    },
  });

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
          <View style={[styles.progressBarFill, { width: `${scrollProgress}%` }]} />
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
                      <Text style={styles.questionText}>
                        {qIndex + 1}. {question.question}
                      </Text>
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
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextSelected,
                                showResult && isCorrectOption && styles.optionTextCorrect,
                              ]}
                            >
                              {option}
                            </Text>
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
                        <Text style={styles.explanationText}>{question.explanation}</Text>
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

