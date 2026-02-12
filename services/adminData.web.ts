// Web-only admin data helpers for teacher/admin dashboard.
// Reads from Firebase directly (shared with the existing web database config).

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from './database/firebaseConfig';
import type { AchievementRecord, QuizAnswerDetail, ScoreRecord } from './database/types';

type AdminUserSummary = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  displayName?: string;
  photoUrl?: string;

  combinedProgress: number; // 0–100
  topicProgress: { [topicId: number]: number };

  lastActivityDate?: string;
  streak?: number;

  quizzesTaken: number;
  avgScore: number;
  bestScore: number;
  lastQuizAt?: string;
};

type AdminOverview = {
  totalStudents: number;
  avgCombinedProgress: number;
  totalQuizzesTaken: number;
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!firebaseConfig.projectId) {
    throw new Error('Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.');
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return db!;
}

// Same weighting as the main app: 70% reading, 30% activities.
function computeCombined(content: number, activities: number): number {
  return Math.round(Math.min(100, Math.max(0, content * 0.7 + activities * 0.3)));
}

async function getUserProgressSummary(userId: string): Promise<{
  combinedProgress: number;
  topicProgress: { [topicId: number]: number };
}> {
  const database = getDb();
  const progressRef = doc(database, 'progress', userId);
  const snap = await getDoc(progressRef);
  const data = (snap.exists() ? snap.data() : {}) as Record<
    string,
    { content: number; activities: number }
  >;

  const topicProgress: { [topicId: number]: number } = {};
  let combinedSum = 0;
  let count = 0;
  for (const [tid, t] of Object.entries(data)) {
    const combined = computeCombined(t.content ?? 0, t.activities ?? 0);
    const topicId = Number(tid);
    topicProgress[topicId] = combined;
    combinedSum += combined;
    count += 1;
  }
  const combinedProgress = count > 0 ? Math.round(combinedSum / count) : 0;
  return { combinedProgress, topicProgress };
}

async function getUserScoreSummary(userId: string): Promise<{
  quizzesTaken: number;
  avgScore: number;
  bestScore: number;
  lastQuizAt?: string;
}> {
  const database = getDb();
  // Read the most recent 100 quiz attempts for this user
  const scoresColl = collection(database, 'scores', userId, 'items');
  const q = query(scoresColl, orderBy('completedAt', 'desc'), limit(100));
  const snap = await getDocs(q);

  let quizzesTaken = 0;
  let totalPct = 0;
  let bestPct = 0;
  let lastQuizAt: string | undefined = undefined;

  snap.docs.forEach((d) => {
    const data = d.data() as any;
    const score = Number(data.score ?? 0);
    const total = Number(data.total ?? 0) || 1;
    const pct = Math.round((score / total) * 100);
    quizzesTaken += 1;
    totalPct += pct;
    if (pct > bestPct) bestPct = pct;
    if (!lastQuizAt) {
      const ts = data.completedAt;
      lastQuizAt =
        typeof ts === 'string'
          ? ts
          : ts?.toDate?.()?.toISOString?.() ?? undefined;
    }
  });

  const avgScore = quizzesTaken > 0 ? Math.round(totalPct / quizzesTaken) : 0;
  return { quizzesTaken, avgScore, bestScore: bestPct, lastQuizAt };
}

async function getUserActivityMeta(userId: string): Promise<{
  lastActivityDate?: string;
  streak?: number;
}> {
  const database = getDb();
  const metaRef = doc(database, 'activity_meta', userId);
  const snap = await getDoc(metaRef);
  if (!snap.exists()) return {};
  const data = snap.data() as any;
  const lastActivityDate = (data.lastActivityDate as string) ?? undefined;
  const s = data.streak;
  let streak: number | undefined = undefined;
  if (s != null) {
    const n = typeof s === 'number' ? s : parseInt(String(s), 10);
    streak = Number.isNaN(n) ? undefined : n;
  }
  return { lastActivityDate, streak };
}

export async function fetchAllUsersWithSummaries(): Promise<{
  overview: AdminOverview;
  users: AdminUserSummary[];
}> {
  const database = getDb();
  const usersSnap = await getDocs(collection(database, 'users'));

  const summaries: AdminUserSummary[] = [];

  for (const docSnap of usersSnap.docs) {
    const d = docSnap.data() as any;
    const id = docSnap.id;
    const username = d.username as string;
    const email = d.email as string;
    const createdAt = (d.createdAt as string) ?? '';

    const [{ combinedProgress, topicProgress }, scores, activity] =
      await Promise.all([
        getUserProgressSummary(id),
        getUserScoreSummary(id),
        getUserActivityMeta(id),
      ]);

    summaries.push({
      id,
      username,
      email,
      createdAt,
      displayName: d.displayName,
      photoUrl: d.photoUrl,
      combinedProgress,
      topicProgress,
      lastActivityDate: activity.lastActivityDate,
      streak: activity.streak,
      quizzesTaken: scores.quizzesTaken,
      avgScore: scores.avgScore,
      bestScore: scores.bestScore,
      lastQuizAt: scores.lastQuizAt,
    });
  }

  const totalStudents = summaries.length;
  const avgCombinedProgress =
    totalStudents > 0
      ? Math.round(
          summaries.reduce((sum, u) => sum + u.combinedProgress, 0) /
            totalStudents
        )
      : 0;
  const totalQuizzesTaken = summaries.reduce(
    (sum, u) => sum + u.quizzesTaken,
    0
  );

  return {
    overview: {
      totalStudents,
      avgCombinedProgress,
      totalQuizzesTaken,
    },
    users: summaries,
  };
}

export async function fetchUserScores(userId: string): Promise<ScoreRecord[]> {
  const database = getDb();
  const coll = collection(database, 'scores', userId, 'items');
  const q = query(coll, orderBy('completedAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      topicId: data.topicId,
      quizId: data.quizId,
      difficulty: data.difficulty ?? undefined,
      score: data.score,
      total: data.total,
      passed: data.passed,
      completedAt:
        typeof data.completedAt === 'string'
          ? data.completedAt
          : data.completedAt?.toDate?.()?.toISOString?.() ?? '',
    };
  });
}

export async function fetchUserAchievements(userId: string): Promise<AchievementRecord[]> {
  const database = getDb();
  const coll = collection(database, 'achievements', userId, 'items');
  const snap = await getDocs(coll);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      unlockedAt: data.unlockedAt ?? '',
    };
  });
}

/** Fetches per-question answer details for a quiz attempt (web only; saved when student completes activity). */
export async function fetchQuizAttemptDetails(
  userId: string,
  scoreId: string
): Promise<QuizAnswerDetail[]> {
  const database = getDb();
  const scoreRef = doc(database, 'scores', userId, 'items', scoreId);
  const snap = await getDoc(scoreRef);
  if (!snap.exists()) return [];
  const data = snap.data() as any;
  const answers = data.answers;
  if (!Array.isArray(answers)) return [];
  return answers.map((a: any) => ({
    questionIndex: a.questionIndex ?? 0,
    questionText: a.questionText,
    selectedAnswer: a.selectedAnswer ?? '',
    correctAnswer: a.correctAnswer ?? '',
    isCorrect: !!a.isCorrect,
  }));
}

export type { AdminUserSummary, AdminOverview };

