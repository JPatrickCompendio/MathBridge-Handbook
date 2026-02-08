/**
 * Shared data types for database layer (SQLite on mobile, Firebase on web).
 * Same structure on both platforms.
 */

export type TopicProgressMap = { [topicId: number]: number };

export type TopicProgressDetail = {
  content: number;   // 0–100
  activities: number; // 0–100
};

export type ProgressMap = {
  [topicId: number]: TopicProgressDetail;
};

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string; // ISO
  /** Display name (e.g. from profile edit). Web/Firebase only. */
  displayName?: string;
  /** Profile photo URL (e.g. Cloudinary). Web/Firebase only. */
  photoUrl?: string;
}

export interface UserCredentials {
  username: string;
  email: string;
  password: string;
  /** Recovery PIN for offline app; used to reset password when forgotten. Optional on web. */
  recoveryPin?: string;
}

export interface Session {
  userId: string;
  email: string;
  username?: string;
}

export interface AchievementRecord {
  id: string;
  unlockedAt: string; // ISO
}

export interface ScoreRecord {
  id?: string;
  topicId: number;
  quizId?: string;
  score: number;
  total: number;
  passed: boolean;
  completedAt: string; // ISO
}

export interface ActivityLog {
  id?: string;
  userId: string;
  action: string;
  topicId?: number;
  payload?: Record<string, unknown>;
  at: string; // ISO
}

/** Shared database service interface — same API on all platforms */
export interface DatabaseService {
  createUser(credentials: UserCredentials): Promise<{ user: User; session: Session }>;
  loginUser(email: string, password: string): Promise<Session | null>;
  getUserData(): Promise<User | null>;

  saveProgress(topicId: number, content: number, activities: number): Promise<void>;
  getProgress(topicId?: number): Promise<TopicProgressMap | number | null>;
  /** Per-topic content/activities (for progress storage layer) */
  getProgressDetail(topicId?: number): Promise<ProgressMap | TopicProgressDetail | null>;

  unlockAchievement(achievementId: string): Promise<void>;
  getAchievements(): Promise<AchievementRecord[]>;

  saveScore(record: Omit<ScoreRecord, 'id' | 'completedAt'>): Promise<void>;
  getScores(topicId?: number): Promise<ScoreRecord[]>;

  getLastActivityTimestamp(): Promise<string | null>;
  setLastActivityTimestamp(iso: string): Promise<void>;
  /** Current consecutive-day streak (0 if none). */
  getStreak(): Promise<number>;
  /** Update last activity to now and return updated streak. */
  setLastActivityAndStreak(iso: string): Promise<number>;

  /** Clear all topic progress (for reset) */
  clearAllProgress(): Promise<void>;

  /** Clear session (call on logout) */
  signOut(): Promise<void>;

  /** Send password reset email (Firebase only on web; no-op on native) */
  sendPasswordResetEmail(email: string): Promise<void>;

  /** Reset password with recovery PIN (SQLite/app only; throws on web) */
  resetPasswordWithPin(email: string, recoveryPin: string, newPassword: string): Promise<void>;

  /** Update profile (displayName, photoUrl). Firebase/web only; no-op on native. */
  updateUserProfile?(updates: { displayName?: string; photoUrl?: string }): Promise<void>;
}
