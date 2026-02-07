// Module 1: Quadratic Equations — content from module1_quadratic_equations.json
// Exports: module content (sections I–V) and practice activities for the quiz.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleJson = require('./module1_quadratic_equations.json');

export interface PracticeQuestion {
  question: string;
  choices: { A: string; B: string; C: string; D: string };
  correctChoice: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface PracticeLevel {
  easy: PracticeQuestion[];
  medium: PracticeQuestion[];
  hard: PracticeQuestion[];
}

const Sections = moduleJson.sections as {
  I_Purpose_and_Learning_Objectives: {
    purpose_block: string;
    learning_objectives_intro: string;
    learning_objectives_list: string[];
  };
  II_What_Is_a_Quadratic_Equation: string[];
  III_Key_Words_and_Concepts: string;
  IV_General_Procedure: string[];
  V_Methods_of_Solving_Quadratic_Equations: {
    intro_paragraphs: string[];
    methods: Record<string, string[]>;
  };
  VII_Practice_Activities?: {
    levels?: {
      easy?: Array<{ prompt: string; options: Record<string, string>; correct: string }>;
      medium?: Array<{ prompt: string; options: Record<string, string>; correct: string }>;
      hard?: Array<{ prompt: string; options: Record<string, string>; correct: string }>;
    };
  };
};

export const MODULE_1_SECTIONS = Sections;

const metadata = moduleJson.metadata as { module_title?: string; learning_competency?: string };

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
  items: Array<{ prompt: string; options: Record<string, string>; correct: string }> | undefined
): PracticeQuestion[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => {
    const choices = normalizeChoices(item.options || {});
    const correct = (item.correct || 'A').toUpperCase().charAt(0) as 'A' | 'B' | 'C' | 'D';
    return {
      question: item.prompt,
      choices,
      correctChoice: choices[correct] ? correct : 'A',
      explanation: undefined,
    };
  });
}

const practiceLevels = moduleJson.sections?.VII_Practice_Activities?.levels;
const easy = mapPracticeLevel(practiceLevels?.easy);
const medium = mapPracticeLevel(practiceLevels?.medium);
const hard = mapPracticeLevel(practiceLevels?.hard);

const methodsContent = Sections.V_Methods_of_Solving_Quadratic_Equations?.methods ?? {};
const methodList = [
  { id: 'factoring', name: 'Factoring', key: 'A. Solving by Factoring' },
  { id: 'extractingSquareRoots', name: 'Extracting Square Root', key: 'B. Solving by Extracting Square Roots' },
  { id: 'completingSquare', name: 'Completing the Square', key: 'C. Solving by Completing the Square' },
  { id: 'quadraticFormula', name: 'Quadratic Formula', key: 'D. Solving Using the Quadratic Formula' },
];
const methods: Record<string, { id: string; name: string; whenToUse: string; steps: string[]; examples: { problem: string; solution: string }[] }> = {};
methodList.forEach(({ id, name, key }) => {
  const paragraphs = methodsContent[key];
  const whenToUse = Array.isArray(paragraphs) && paragraphs[0] ? paragraphs[0] : name;
  const solution = Array.isArray(paragraphs) ? paragraphs.slice(1).join('\n\n') : '';
  methods[id] = {
    id,
    name,
    whenToUse,
    steps: [],
    examples: solution ? [{ problem: '', solution }] : [],
  };
});

export const QUADRATIC_EQUATIONS_DATA = {
  lessonId: 'module1_quadratic_equations',
  title: metadata?.module_title || 'Quadratic Equations',
  description:
    metadata?.learning_competency ||
    'Learn to identify and apply steps in solving quadratic equations using factoring, extracting square roots, completing the square, and the quadratic formula.',
  methods,
  practiceActivities: {
    easy: easy.length ? easy : [],
    medium: medium.length ? medium : [],
    hard: hard.length ? hard : [],
  },
} as const;

export type QuadraticEquationsData = typeof QUADRATIC_EQUATIONS_DATA;
