/**
 * Web-only database entry point.
 * Uses Firebase; never imports expo-sqlite (avoids wa-sqlite.wasm error).
 */

import firebaseService from './firebaseService';

export type { DatabaseService, User, Session, TopicProgressMap, ProgressMap, AchievementRecord, ScoreRecord, UserCredentials } from './types';
export const database = firebaseService;
