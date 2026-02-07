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
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import type {
  AchievementRecord,
  DatabaseService,
  ProgressMap,
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

function computeCombined(content: number, activities: number): number {
  return Math.round(Math.min(100, (content + activities) / 2));
}

const firebaseService: DatabaseService = {
  async createUser(credentials: UserCredentials): Promise<{ user: User; session: Session }> {
    const authInstance = getAuthInstance();
    const database = getDb();

    const userCred = await createUserWithEmailAndPassword(
      authInstance,
      credentials.email,
      credentials.password
    );
    const fbUser = userCred.user;

    await updateProfile(fbUser, { displayName: credentials.username });
    await sendEmailVerification(fbUser);

    const createdAt = new Date().toISOString();
    const userRef = doc(database, 'users', fbUser.uid);
    await setDoc(userRef, {
      username: credentials.username,
      email: credentials.email,
      createdAt,
    });

    const user: User = {
      id: fbUser.uid,
      username: credentials.username,
      email: credentials.email,
      createdAt,
    };
    const session: Session = { userId: fbUser.uid, email: credentials.email, username: credentials.username };
    setSession(session);
    return { user, session };
  },

  async loginUser(email: string, password: string): Promise<Session | null> {
    try {
      const authInstance = getAuthInstance();
      const database = getDb();

      const userCred = await signInWithEmailAndPassword(authInstance, email, password);
      const fbUser = userCred.user;

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
    } catch {
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
    };
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
      activities: activitiesP,
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

  async saveScore(record: Omit<ScoreRecord, 'id' | 'completedAt'>): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    const coll = collection(database, 'scores', userId, 'items');
    await addDoc(coll, {
      topicId: record.topicId,
      quizId: record.quizId ?? null,
      score: record.score,
      total: record.total,
      passed: record.passed,
      completedAt: new Date().toISOString(),
    });
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

  async clearAllProgress(): Promise<void> {
    const userId = getCurrentUserId();
    const database = getDb();
    const progressRef = doc(database, 'progress', userId);
    await setDoc(progressRef, {});
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

  async sendPasswordResetEmail(email: string): Promise<void> {
    const authInstance = getAuthInstance();
    await firebaseSendPasswordResetEmail(authInstance, email.trim());
  },

  async resetPasswordWithPin(_email: string, _recoveryPin: string, _newPassword: string): Promise<void> {
    throw new Error('Password reset with PIN is only available in the app.');
  },
};

export default firebaseService;
