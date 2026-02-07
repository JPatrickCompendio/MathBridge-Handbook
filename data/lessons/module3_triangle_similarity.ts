// Module 3A: Triangle Similarity — content from module3_triangle_similarity.json
// Exports: module content and practice activities for the Activities modal.

import type { PracticeLevel, PracticeQuestion } from './module1_quadratic';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleJson = require('./module3_triangle_similarity.json');

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

export const MODULE_3_TRIANGLE_SIMILARITY_SECTIONS = {
  purpose: sections.purpose || '',
  learning_objectives: sections.learning_objectives || [],
  what_are_similar_triangles: sections.what_are_similar_triangles || { conditions: [], notes: [] },
  key_words_and_concepts: sections.key_words_and_concepts || [],
  corresponding_parts: sections.corresponding_parts || { definition: '', rules: [] },
  ways_to_know_if_triangles_are_similar: sections.ways_to_know_if_triangles_are_similar || { methods: {} },
};

export const TRIANGLE_SIMILARITY_DATA = {
  lessonId: moduleJson.module_id || 'module_3a_triangle_similarity',
  title: moduleJson.module_title || 'Triangle Similarity',
  description: moduleJson.learning_competency || '',
  practiceActivities: {
    easy,
    medium,
    hard,
  } as PracticeLevel,
} as const;
