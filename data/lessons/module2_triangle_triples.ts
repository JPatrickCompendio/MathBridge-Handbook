// Module 2: Pythagorean Triples (Triangle Triples) — content from module2_triangle_triples.json
// Exports: module content and practice activities for the Activities modal.

import type { PracticeLevel, PracticeQuestion } from './module1_quadratic';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleJson = require('./module2_triangle_triples.json');

const sections = moduleJson.sections || {};
const practiceActivities = sections.practice_activities || {};

function toPracticeQuestion(
  item: { question: string; correct_answer: string },
  options: { A: string; B: string; C: string; D: string },
  correctKey: 'A' | 'B' | 'C' | 'D'
): PracticeQuestion {
  return {
    question: item.question,
    choices: options,
    correctChoice: correctKey,
  };
}

// Easy: build questions with 4 choices each (correct_answer + distractors)
const easyRaw = practiceActivities.easy || [];
const easy: PracticeQuestion[] = [
  toPracticeQuestion(
    easyRaw[0] || { question: 'Which is a triangle triple?', correct_answer: '(3, 4, 5)' },
    { A: '(3, 4, 5)', B: '(2, 3, 4)', C: '(4, 5, 6)', D: '(1, 2, 3)' },
    'A'
  ),
  toPracticeQuestion(
    easyRaw[1] || { question: 'Is (5, 12, 13) a triangle triple?', correct_answer: 'Yes' },
    { A: 'Yes', B: 'No', C: 'Sometimes', D: 'Only for right triangles' },
    'A'
  ),
  toPracticeQuestion(
    easyRaw[2] || { question: 'Which satisfies the theorem?', correct_answer: '(6, 8, 10)' },
    { A: '(6, 8, 10)', B: '(2, 4, 5)', C: '(5, 7, 9)', D: '(4, 6, 7)' },
    'A'
  ),
  toPracticeQuestion(
    easyRaw[3] || { question: 'The hypotenuse is the?', correct_answer: 'Longest side' },
    { A: 'Longest side', B: 'Shortest side', C: 'One of the legs', D: 'The base' },
    'A'
  ),
  toPracticeQuestion(
    easyRaw[4] || { question: 'Which forms a right triangle?', correct_answer: '9, 12, 15' },
    { A: '9, 12, 15', B: '4, 5, 6', C: '2, 3, 4', D: '7, 8, 9' },
    'A'
  ),
];

// Medium
const mediumRaw = practiceActivities.medium || [];
const medium: PracticeQuestion[] = [
  toPracticeQuestion(
    mediumRaw[0] || { question: 'Which is a primitive triple?', correct_answer: '(3, 4, 5)' },
    { A: '(3, 4, 5)', B: '(6, 8, 10)', C: '(9, 12, 15)', D: '(12, 16, 20)' },
    'A'
  ),
  toPracticeQuestion(
    mediumRaw[1] || { question: 'Is (9, 40, 41) a triple?', correct_answer: 'Yes' },
    { A: 'Yes', B: 'No', C: 'Only primitive', D: 'Non-primitive only' },
    'A'
  ),
  toPracticeQuestion(
    mediumRaw[2] || { question: 'Which is NOT a triple?', correct_answer: '(8, 15, 16)' },
    { A: '(8, 15, 16)', B: '(3, 4, 5)', C: '(5, 12, 13)', D: '(6, 8, 10)' },
    'A'
  ),
  toPracticeQuestion(
    mediumRaw[3] || { question: 'Which set forms a right triangle?', correct_answer: '6, 8, 10' },
    { A: '6, 8, 10', B: '2, 4, 5', C: '5, 7, 9', D: '4, 6, 7' },
    'A'
  ),
  toPracticeQuestion(
    mediumRaw[4] || { question: 'Which is non-primitive?', correct_answer: '(6, 8, 10)' },
    { A: '(6, 8, 10)', B: '(3, 4, 5)', C: '(5, 12, 13)', D: '(7, 24, 25)' },
    'A'
  ),
];

// Hard
const hardRaw = practiceActivities.hard || [];
const hard: PracticeQuestion[] = [
  toPracticeQuestion(
    hardRaw[0] || { question: 'Which of these triples is right?', correct_answer: '8, 15, 17' },
    { A: '8, 15, 17', B: '7, 14, 16', C: '9, 16, 18', D: '10, 14, 18' },
    'A'
  ),
  toPracticeQuestion(
    hardRaw[1] || { question: 'Which is a triple?', correct_answer: '(12, 35, 37)' },
    { A: '(12, 35, 37)', B: '(10, 34, 36)', C: '(11, 34, 38)', D: '(13, 36, 38)' },
    'A'
  ),
  toPracticeQuestion(
    hardRaw[2] || { question: 'Which fails the theorem?', correct_answer: '(7, 24, 26)' },
    { A: '(7, 24, 26)', B: '(7, 24, 25)', C: '(5, 12, 13)', D: '(8, 15, 17)' },
    'A'
  ),
  toPracticeQuestion(
    hardRaw[3] || { question: 'Which is a multiple of (3, 4, 5)?', correct_answer: '(6, 8, 10)' },
    { A: '(6, 8, 10)', B: '(4, 5, 6)', C: '(5, 12, 13)', D: '(8, 15, 17)' },
    'A'
  ),
  toPracticeQuestion(
    hardRaw[4] || { question: 'Which set forms a right triangle?', correct_answer: '(15, 20, 25)' },
    { A: '(15, 20, 25)', B: '(10, 18, 22)', C: '(12, 18, 24)', D: '(14, 19, 26)' },
    'A'
  ),
];

export const MODULE_2_SECTIONS = {
  purpose: sections.purpose || '',
  learning_objectives: sections.learning_objectives || [],
  theorem: sections.theorem || { statement: '', formula: '' },
  section_ii_theorem_and_triples: sections.section_ii_theorem_and_triples || {
    theorem_definition: '',
    formula: '',
    theorem_application: '',
    from_theorem_intro: '',
    example_triple_set: '',
    example_triple_explanation: '',
    connection: '',
    definition: '',
    formula_repeat: '',
    where_intro: '',
    where_bullets: [] as string[],
    conclusion: '',
  },
  section_iii_key_words: sections.section_iii_key_words || { terms: [] },
  keywords: sections.keywords || [],
  section_iv_procedure: sections.section_iv_procedure || { intro: '', steps: [] },
  procedure_steps: sections.procedure_steps || [],
  section_v_worked_examples: sections.section_v_worked_examples || [],
  examples: sections.examples || [],
};

export const PYTHAGOREAN_TRIPLES_DATA = {
  lessonId: moduleJson.module_id || 'module_2_triangle_triples',
  title: moduleJson.module_title || 'Pythagorean Triples',
  description: moduleJson.learning_competency || '',
  practiceActivities: {
    easy,
    medium,
    hard,
  } as PracticeLevel,
} as const;
