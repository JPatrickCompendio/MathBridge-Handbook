/**
 * Native (iOS/Android) database entry point.
 * Uses SQLite only; never loaded on web (Metro resolves index.web.ts for web).
 */

import sqliteService from './sqliteService';

export type { DatabaseService, User, Session, TopicProgressMap, ProgressMap, AchievementRecord, ScoreRecord, UserCredentials } from './types';
export const database = sqliteService;
