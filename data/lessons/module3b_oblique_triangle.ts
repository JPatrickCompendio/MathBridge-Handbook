// Module 3B: Oblique Triangle — content from module3b_oblique_triangle.json

import type { PracticeLevel, PracticeQuestion } from './module1_quadratic';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleJson = require('./module3b_oblique_triangle.json');

const sections = moduleJson.sections || {};
const practiceActivities = moduleJson.practice_activities || {};

function normalizeChoices(opts: Record<string, string>): { A: string; B: string; C: string; D: string } {
  const fallback = '—';
  return {
    A: opts.A ?? opts.a ?? fallback,
    B: opts.B ?? opts.b ?? fallback,
    C: opts.C ?? opts.c ?? fallback,
    D: opts.D ?? opts.d ?? fallback,
  };
}

function mapPracticeLevel(
  items: Array<{ question: string; choices: Record<string, string>; correct: string }> | undefined
): PracticeQuestion[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => {
    const choices = normalizeChoices(item.choices || {});
    const correct = (item.correct || 'A').toUpperCase().charAt(0) as 'A' | 'B' | 'C' | 'D';
    return {
      question: item.question,
      choices,
      correctChoice: choices[correct] !== undefined ? correct : 'A',
    };
  });
}

const easy = mapPracticeLevel(practiceActivities.easy);
const medium = mapPracticeLevel(practiceActivities.medium);
const hard = mapPracticeLevel(practiceActivities.hard);

export const MODULE_3B_OBLIQUE_TRIANGLE_SECTIONS = {
  purpose: sections.purpose || '',
  learning_objectives: sections.learning_objectives || [],
  what_are_oblique_triangles: sections.what_are_oblique_triangles || {},
  key_words_and_concepts: sections.key_words_and_concepts || [],
  law_of_sines: sections.law_of_sines || {},
  law_of_cosines: sections.law_of_cosines || {},
};

export const OBLIQUE_TRIANGLE_PRACTICE: PracticeLevel = {
  easy,
  medium,
  hard,
};
