/**
 * Firebase (Firestore + Auth) database service for web.
 * Uses Firebase Authentication for signup/login so only real accounts can sign in.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import type {
  AchievementRecord,
  DatabaseService,
  ProgressMap,
  QuizAnswerDetail,
  ScoreRecord,
  Session,
  TopicProgressMap,
  TopicProgressDetail,
  User,
  UserCredentials,
} from './types';
import firebaseConfig from './firebaseConfig';

let app: FirebaseApp | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

function getDb(): ReturnType<typeof getFirestore> {
  if (!firebaseConfig.projectId) {
    throw new Error('Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.');
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return db!;
}

function getAuthInstance(): ReturnType<typeof getAuth> {
  getDb(); // ensure app/auth initialized
  return auth!;
}

const SESSION_KEY = 'mathbridge_session';
const GUEST_USER_ID = 'guest';

function getCurrentUserId(): string {
  const authUser = auth?.currentUser;
  if (authUser?.uid) return authUser.uid;
  if (typeof localStorage === 'undefined') return GUEST_USER_ID;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return GUEST_USER_ID;
    const s = JSON.parse(raw) as Session;
    return s?.userId ?? GUEST_USER_ID;
  } catch {
    return GUEST_USER_ID;
  }
}

function setSession(session: Session | null): void {
  if (typeof localStorage === 'undefined') return;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

// 70% reading + 30% activities (10% per difficulty: Easy, Medium, Hard)
function computeCombined(content: number, activities: number): number {
  return Math.round(Math.min(100, Math.max(0, content * 0.70 + activities * 0.30)));
}

const ADMIN_EMAILS = ['admin@example.com']; // Web/admin: emails that can bypass emailVerified check

const firebaseService: DatabaseService = {
  async createUser(credentials: UserCredentials): Promise<{ user: User; session: Session }> {
    const authInstance = getAuthInstance();
    const database = getDb();

    const displayName = credentials.fullName?.trim() || credentials.username.trim();
    const email = credentials.email.trim();
    const isRealEmail = /\S+@\S+\.\S+/.test(email) && !email.includes('@mathbridge.local');

    const userCred = await createUserWithEmailAndPassword(
      authInstance,
      email,
      credentials.password
    );
    const fbUser = userCred.user;

    await updateProfile(fbUser, { displayName });
    if (isRealEmail) {
      await sendEmailVerification(fbUser);
    }

    const createdAt = new Date().toISOString();
    const userRef = doc(database, 'users', fbUser.uid);
    const userData: Record<string, unknown> = {
      username: displayName,
      email,
      createdAt,
    };
    if (credentials.lrn?.trim()) userData.lrn = credentials.lrn.trim();
    await setDoc(userRef, userData);

    const user: User = {
      id: fbUser.uid,
      username: displayName,
      email,
      createdAt,
    };
    const session: Session = { userId: fbUser.uid, email, username: displayName };
    setSession(session);
    return { user, session };
  },

  async loginUser(email: string, password: string): Promise<Session | null> {
    try {
      const authInstance = getAuthInstance();
      const database = getDb();

      const userCred = await signInWithEmailAndPassword(authInstance, email, password);
      const fbUser = userCred.user;

      const effectiveEmail = (fbUser.email ?? email).toLowerCase();
      const isAdminEmail = ADMIN_EMAILS.includes(effectiveEmail);
      const isPlaceholderEmail = effectiveEmail.includes('@mathbridge.local');

      // For regular student accounts, require email verification (except placeholder LRN-only accounts).
      // For predefined admin/teacher accounts, allow login even if not verified.
      if (!fbUser.emailVerified && !isAdminEmail && !isPlaceholderEmail) {
        await firebaseSignOut(authInstance);
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      const userRef = doc(database, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      const username = snap.exists() ? (snap.data().username as string) : (fbUser.displayName ?? '');

      const session: Session = {
        userId: fbUser.uid,
        email: fbUser.email ?? email,
        username: username || undefined,
      };
      setSession(session);
      return session;
    } catch (e) {
      if (e instanceof Error && e.message === 'EMAIL_NOT_VERIFIED') throw e;
      return null;
    }
  },

  async getUserData(): Promise<User | null> {
    const userId = getCurrentUserId();
    if (userId === GUEST_USER_ID) return null;
    const database = getDb();
    const userRef = doc(database, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      id: snap.id,
      username: d.username,
      email: d.email,
      createdAt: d.createdAt,
      displayName: d.displayName,
      photoUrl: d.photoUrl,
    };
  },

  async updateUserProfile(updates: { displayName?: string; photoUrl?: string }): Promise<void> {
    const userId = getCurrentUserId();
    if (userId === GUEST_USER_ID) return;
    const database = getDb();
    const userRef = doc(database, 'users', userId);
    const payload: Record<string, string> = {};
    if (updates.displayName !== undefined) payload.displayName = updates.displayName;
    if (updates.photoUrl !== undefined) payload.photoUrl = updates.photoUrl;
    if (Object.keys(payload).length === 0) return;
    await updateDoc(userRef, payload);
  },

  async saveProgress(topicId: number, content: number, activities: number): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    const contentP = Math.round(Math.min(100, Math.max(0, content)));
    const activitiesP = Math.round(Math.min(100, Math.max(0, activities)));
    const progressRef = doc(database, 'progress', userId);
    const snap = await getDoc(progressRef);
    const existing = (snap.exists() ? snap.data() : {}) as Record<string, { content: number; activities: number }>;
    const current = existing[String(topicId)] ?? { content: 0, activities: 0 };
    existing[String(topicId)] = {
      content: Math.max(current.content, contentP),
      activities: Math.max(current.activities, activitiesP),
    };
    await setDoc(progressRef, existing);
  },

  async getProgress(topicId?: number): Promise<TopicProgressMap | number | null> {
    const userId = getCurrentUserId();
    const database = getDb();
    const progressRef = doc(database, 'progress', userId);
    const snap = await getDoc(progressRef);
    const data = (snap.exists() ? snap.data() : {}) as Record<string, { content: number; activities: number }>;

    if (topicId !== undefined && topicId !== null) {
      const t = data[String(topicId)];
      return t ? computeCombined(t.content, t.activities) : 0;
    }

    const map: TopicProgressMap = {};
    for (const [tid, t] of Object.entries(data)) {
      map[Number(tid)] = computeCombined(t.content, t.activities);
    }
    return map;
  },

  async getProgressDetail(topicId?: number): Promise<ProgressMap | TopicProgressDetail | null> {
    const userId = getCurrentUserId();
    const database = getDb();
    const progressRef = doc(database, 'progress', userId);
    const snap = await getDoc(progressRef);
    const data = (snap.exists() ? snap.data() : {}) as Record<string, { content: number; activities: number }>;

    if (topicId !== undefined && topicId !== null) {
      const t = data[String(topicId)];
      return t ?? null;
    }
    const map: ProgressMap = {};
    for (const [tid, t] of Object.entries(data)) {
      map[Number(tid)] = t;
    }
    return map;
  },

  async unlockAchievement(achievementId: string): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    const achRef = doc(database, 'achievements', userId, 'items', achievementId);
    await setDoc(achRef, { unlockedAt: new Date().toISOString() });
  },

  async getAchievements(): Promise<AchievementRecord[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const database = getDb();
    const coll = collection(database, 'achievements', userId, 'items');
    const snap = await getDocs(coll);
    return snap.docs.map((d) => ({
      id: d.id,
      unlockedAt: d.data().unlockedAt ?? '',
    }));
  },

  async saveScore(record: Omit<ScoreRecord, 'id' | 'completedAt'> & { answers?: QuizAnswerDetail[] }): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    const coll = collection(database, 'scores', userId, 'items');
    const payload: Record<string, unknown> = {
      topicId: record.topicId,
      quizId: record.quizId ?? null,
      difficulty: record.difficulty ?? null,
      score: record.score,
      total: record.total,
      passed: record.passed,
      completedAt: new Date().toISOString(),
    };
    if (record.answers && record.answers.length > 0) {
      payload.answers = record.answers;
    }
    await addDoc(coll, payload);
  },

  async getScores(topicId?: number): Promise<ScoreRecord[]> {
    const userId = getCurrentUserId();
    const database = getDb();
    const coll = collection(database, 'scores', userId, 'items');
    const q = topicId != null
      ? query(coll, where('topicId', '==', topicId), orderBy('completedAt', 'desc'), limit(50))
      : query(coll, orderBy('completedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        topicId: data.topicId,
        quizId: data.quizId,
        difficulty: data.difficulty ?? undefined,
        score: data.score,
        total: data.total,
        passed: data.passed,
        completedAt: typeof data.completedAt === 'string' ? data.completedAt : (data.completedAt?.toDate?.()?.toISOString?.() ?? ''),
      };
    });
  },

  async getLastActivityTimestamp(): Promise<string | null> {
    const userId = getCurrentUserId();
    const database = getDb();
    const metaRef = doc(database, 'activity_meta', userId);
    const snap = await getDoc(metaRef);
    return snap.exists() ? (snap.data().lastActivity as string) ?? null : null;
  },

  async setLastActivityTimestamp(iso: string): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    const metaRef = doc(database, 'activity_meta', userId);
    await setDoc(metaRef, { lastActivity: iso }, { merge: true });
  },

  async getStreak(): Promise<number> {
    const userId = getCurrentUserId();
    const database = getDb();
    const metaRef = doc(database, 'activity_meta', userId);
    const snap = await getDoc(metaRef);
    const data = snap.exists() ? snap.data() : {};
    const n = data?.streak;
    if (n == null) return 0;
    const val = typeof n === 'number' ? n : parseInt(String(n), 10);
    return Number.isNaN(val) ? 0 : Math.max(0, val);
  },

  async setLastActivityAndStreak(iso: string): Promise<number> {
    const userId = getCurrentUserId();
    const database = getDb();
    const metaRef = doc(database, 'activity_meta', userId);
    const snap = await getDoc(metaRef);
    const data = snap.exists() ? snap.data() : {};
    const today = iso.slice(0, 10);
    const lastDate = (data?.lastActivityDate as string) ?? null;
    let streak = typeof data?.streak === 'number' ? data.streak : parseInt(String(data?.streak ?? 0), 10) || 0;
    streak = Math.max(0, streak);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate !== today) {
      if (lastDate === yesterday) streak += 1;
      else if (lastDate != null) streak = 1;
      else streak = 0;
    }
    await setDoc(metaRef, {
      lastActivity: iso,
      lastActivityDate: today,
      streak,
    }, { merge: true });
    return streak;
  },

  async clearAllProgress(): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    // Clear progress (topic completion %)
    const progressRef = doc(database, 'progress', userId);
    await setDoc(progressRef, {});
    // Clear all scores (quiz attempts)
    const scoresColl = collection(database, 'scores', userId, 'items');
    const scoresSnap = await getDocs(scoresColl);
    let batch = writeBatch(database);
    scoresSnap.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    // Clear all achievements
    const achievementsColl = collection(database, 'achievements', userId, 'items');
    const achievementsSnap = await getDocs(achievementsColl);
    batch = writeBatch(database);
    achievementsSnap.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    // Clear activity meta (streak, last activity)
    const activityMetaRef = doc(database, 'activity_meta', userId);
    await setDoc(activityMetaRef, { lastActivityDate: null, streak: 0 }, { merge: true });
  },

  async getEmailByLrn(lrn: string): Promise<string | null> {
    const database = getDb();
    const usersColl = collection(database, 'users');
    const q = query(usersColl, where('lrn', '==', lrn.trim()));
    const snap = await getDocs(q);
    const first = snap.docs[0];
    if (!first) return null;
    const email = first.data().email;
    return typeof email === 'string' ? email : null;
  },

  async signOut(): Promise<void> {
    setSession(null);
    try {
      const authInstance = getAuthInstance();
      await firebaseSignOut(authInstance);
    } catch {
      // ignore
    }
  },

  async sendPasswordResetEmail(_email: string): Promise<void> {
    // Not used on web; use requestPasswordReset instead so admin sets password in person.
    throw new Error('Use forgot password to request a reset. The teacher will set your password.');
  },

  async requestPasswordReset(identifier: string): Promise<void> {
    const database = getDb();
    const trimmed = identifier.trim();
    if (!trimmed) throw new Error('Enter your LRN or email.');
    const requestedAt = new Date().toISOString();
    const coll = collection(database, 'password_reset_requests');
    let userId: string | null = null;
    const usersSnap = await getDocs(collection(database, 'users'));
    const isEmail = /\S+@\S+\.\S+/.test(trimmed);
    for (const d of usersSnap.docs) {
      const data = d.data() as { email?: string; lrn?: string };
      const email = (data.email ?? '').toLowerCase();
      const lrn = (data.lrn ?? '').trim();
      if (email === trimmed.toLowerCase() || lrn === trimmed) {
        userId = d.id;
        break;
      }
    }
    await addDoc(coll, {
      identifier: trimmed,
      userId: userId ?? null,
      requestedAt,
      status: 'pending',
    });
  },

  async resetPasswordWithPin(_email: string, _recoveryPin: string, _newPassword: string): Promise<void> {
    throw new Error('Password reset with PIN is only available in the app.');
  },
};

export default firebaseService;
