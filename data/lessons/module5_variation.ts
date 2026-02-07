// Module 5: Variation — content from module5_variation.json

import type { PracticeLevel, PracticeQuestion } from './module1_quadratic';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleJson = require('./module5_variation.json');

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

export const MODULE_5_VARIATION_SECTIONS = {
  purpose: sections.purpose || '',
  learning_objectives: sections.learning_objectives || [],
  what_is_variation: sections.what_is_variation || {},
  key_words: sections.key_words || [],
  procedure: sections.procedure || {},
  worked_examples: sections.worked_examples || [],
};

export const VARIATION_DATA = {
  lessonId: moduleJson.module_id || 'module_5_variation',
  title: moduleJson.module_title || 'Variation',
  description: moduleJson.learning_competency || '',
  practiceActivities: {
    easy,
    medium,
    hard,
  } as PracticeLevel,
} as const;
