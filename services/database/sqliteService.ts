/**
 * SQLite database service for mobile (Android/iOS).
 * Fully offline; creates tables if they don't exist.
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
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

const DB_NAME = 'mathbridge.db';

// In-memory cache for current user session (AsyncStorage can be added for persistence across restarts)
let cachedSession: Session | null = null;

// Reuse the same DB connection; opening multiple times can cause "database is locked" or throw on second login
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === 'web') {
    return Promise.reject(new Error('SQLite is not available on web. Use Firebase service.'));
  }
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

function computeCombined(content: number, activities: number): number {
  return Math.round(Math.min(100, (content + activities) / 2));
}

async function ensureTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS progress (
      topic_id INTEGER PRIMARY KEY NOT NULL,
      content INTEGER NOT NULL DEFAULT 0,
      activities INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY NOT NULL,
      unlocked_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      quiz_id TEXT,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  // Add recovery_pin_hash for app-only password reset (ignore if already exists)
  try {
    await db.execAsync('ALTER TABLE users ADD COLUMN recovery_pin_hash TEXT');
  } catch {
    // Column already exists
  }
}

// Simple hash for local storage only (not cryptographically secure; replace with proper auth when syncing)
function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

const sqliteService: DatabaseService = {
  async createUser(credentials: UserCredentials): Promise<{ user: User; session: Session }> {
    const db = await getDb();
    await ensureTables(db);
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const passwordHash = simpleHash(credentials.password);
    const recoveryPinHash = credentials.recoveryPin != null && credentials.recoveryPin !== ''
      ? simpleHash(credentials.recoveryPin)
      : null;

    await db.runAsync(
      'INSERT INTO users (id, username, email, password_hash, created_at, recovery_pin_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [id, credentials.username, credentials.email, passwordHash, createdAt, recoveryPinHash]
    );

    const user: User = { id, username: credentials.username, email: credentials.email, createdAt };
    const session: Session = { userId: id, email: credentials.email, username: credentials.username };
    cachedSession = session;
    return { user, session };
  },

  async loginUser(emailOrUsername: string, password: string): Promise<Session | null> {
    const db = await getDb();
    await ensureTables(db);
    const passwordHash = simpleHash(password);
    const row = await db.getFirstAsync<{ id: string; username: string; email: string }>(
      'SELECT id, username, email FROM users WHERE (email = ? OR username = ?) AND password_hash = ?',
      [emailOrUsername.trim(), emailOrUsername.trim(), passwordHash]
    );
    if (!row) return null;
    const session: Session = { userId: row.id, email: row.email, username: row.username };
    cachedSession = session;
    return session;
  },

  async getUserData(): Promise<User | null> {
    if (!cachedSession) return null;
    const db = await getDb();
    const row = await db.getFirstAsync<{ id: string; username: string; email: string; created_at: string }>(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [cachedSession.userId]
    );
    if (!row) return null;
    return { id: row.id, username: row.username, email: row.email, createdAt: row.created_at };
  },

  async saveProgress(topicId: number, content: number, activities: number): Promise<void> {
    const db = await getDb();
    await ensureTables(db);
    const contentP = Math.round(Math.min(100, Math.max(0, content)));
    const activitiesP = Math.round(Math.min(100, Math.max(0, activities)));
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO progress (topic_id, content, activities, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(topic_id) DO UPDATE SET
         content = max(content, excluded.content),
         activities = excluded.activities,
         updated_at = excluded.updated_at`,
      [topicId, contentP, activitiesP, now]
    );
  },

  async getProgress(topicId?: number): Promise<TopicProgressMap | number | null> {
    const db = await getDb();
    await ensureTables(db);

    if (topicId !== undefined && topicId !== null) {
      const row = await db.getFirstAsync<{ content: number; activities: number }>(
        'SELECT content, activities FROM progress WHERE topic_id = ?',
        [topicId]
      );
      if (!row) return 0;
      return computeCombined(row.content, row.activities);
    }

    const rows = await db.getAllAsync<{ topic_id: number; content: number; activities: number }>(
      'SELECT topic_id, content, activities FROM progress'
    );
    const map: TopicProgressMap = {};
    for (const r of rows) {
      map[r.topic_id] = computeCombined(r.content, r.activities);
    }
    return map;
  },

  async getProgressDetail(topicId?: number): Promise<ProgressMap | TopicProgressDetail | null> {
    const db = await getDb();
    await ensureTables(db);

    if (topicId !== undefined && topicId !== null) {
      const row = await db.getFirstAsync<{ content: number; activities: number }>(
        'SELECT content, activities FROM progress WHERE topic_id = ?',
        [topicId]
      );
      if (!row) return null;
      return { content: row.content, activities: row.activities };
    }

    const rows = await db.getAllAsync<{ topic_id: number; content: number; activities: number }>(
      'SELECT topic_id, content, activities FROM progress'
    );
    const map: ProgressMap = {};
    for (const r of rows) {
      map[r.topic_id] = { content: r.content, activities: r.activities };
    }
    return map;
  },

  async unlockAchievement(achievementId: string): Promise<void> {
    const db = await getDb();
    await ensureTables(db);
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT OR IGNORE INTO achievements (id, unlocked_at) VALUES (?, ?)',
      [achievementId, now]
    );
  },

  async getAchievements(): Promise<AchievementRecord[]> {
    const db = await getDb();
    await ensureTables(db);
    const rows = await db.getAllAsync<{ id: string; unlocked_at: string }>(
      'SELECT id, unlocked_at FROM achievements'
    );
    return rows.map((r) => ({ id: r.id, unlockedAt: r.unlocked_at }));
  },

  async saveScore(record: Omit<ScoreRecord, 'id' | 'completedAt'>): Promise<void> {
    const db = await getDb();
    await ensureTables(db);
    const completedAt = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO scores (topic_id, quiz_id, score, total, passed, completed_at) VALUES (?, ?, ?, ?, ?, ?)',
      [
        record.topicId,
        record.quizId ?? null,
        record.score,
        record.total,
        record.passed ? 1 : 0,
        completedAt,
      ]
    );
  },

  async getScores(topicId?: number): Promise<ScoreRecord[]> {
    const db = await getDb();
    await ensureTables(db);
    const rows = topicId != null
      ? await db.getAllAsync<{ id: number; topic_id: number; quiz_id: string | null; score: number; total: number; passed: number; completed_at: string }>(
          'SELECT id, topic_id, quiz_id, score, total, passed, completed_at FROM scores WHERE topic_id = ? ORDER BY completed_at DESC',
          [topicId]
        )
      : await db.getAllAsync<{ id: number; topic_id: number; quiz_id: string | null; score: number; total: number; passed: number; completed_at: string }>(
          'SELECT id, topic_id, quiz_id, score, total, passed, completed_at FROM scores ORDER BY completed_at DESC'
        );
    return rows.map((r) => ({
      id: String(r.id),
      topicId: r.topic_id,
      quizId: r.quiz_id ?? undefined,
      score: r.score,
      total: r.total,
      passed: r.passed === 1,
      completedAt: r.completed_at,
    }));
  },

  async getLastActivityTimestamp(): Promise<string | null> {
    const db = await getDb();
    await ensureTables(db);
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM activity_meta WHERE key = 'last_activity'"
    );
    return row?.value ?? null;
  },

  async setLastActivityTimestamp(iso: string): Promise<void> {
    const db = await getDb();
    await ensureTables(db);
    await db.runAsync(
      "INSERT INTO activity_meta (key, value) VALUES ('last_activity', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
      [iso, iso]
    );
  },

  async clearAllProgress(): Promise<void> {
    const db = await getDb();
    await ensureTables(db);
    await db.runAsync('DELETE FROM progress');
  },

  async signOut(): Promise<void> {
    cachedSession = null;
  },

  async sendPasswordResetEmail(_email: string): Promise<void> {
    // No-op on native; password reset is available on web (Firebase)
  },

  async resetPasswordWithPin(emailOrUsername: string, recoveryPin: string, newPassword: string): Promise<void> {
    const db = await getDb();
    await ensureTables(db);
    const pinHash = simpleHash(recoveryPin);
    const row = await db.getFirstAsync<{ id: string; recovery_pin_hash: string | null }>(
      'SELECT id, recovery_pin_hash FROM users WHERE email = ? OR username = ?',
      [emailOrUsername.trim(), emailOrUsername.trim()]
    );
    if (!row) {
      throw new Error('No account found for this email.');
    }
    if (row.recovery_pin_hash == null || row.recovery_pin_hash !== pinHash) {
      throw new Error('Incorrect recovery PIN.');
    }
    const newPasswordHash = simpleHash(newPassword);
    await db.runAsync('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, row.id]);
  },
};

export default sqliteService;
