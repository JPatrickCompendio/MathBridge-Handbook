// Progress storage: per-topic content (0-100) + activities (0-100).
// Combined = (content + activities) / 2 → 100% when both complete.
// Delegates to platform database (SQLite on mobile, Firebase on web).

import { database } from '../services/database';

export type TopicProgress = { [topicId: number]: number };

function clamp(p: number): number {
  return Math.round(Math.min(100, Math.max(0, p)));
}

export const getTopicProgress = async (topicId?: number): Promise<TopicProgress | number | null> => {
  try {
    return await database.getProgress(topicId);
  } catch (e) {
    console.warn('getTopicProgress failed:', e);
    if (topicId != null) return 0;
    return {};
  }
};

export const getTopicContentProgress = async (topicId: number): Promise<number> => {
  try {
    const detail = await database.getProgressDetail(topicId);
    if (detail && 'content' in detail) return detail.content;
    return 0;
  } catch (e) {
    console.warn('getTopicContentProgress failed:', e);
    return 0;
  }
};

export const getTopicActivitiesProgress = async (topicId: number): Promise<number> => {
  try {
    const detail = await database.getProgressDetail(topicId);
    if (detail && 'activities' in detail) return detail.activities;
    return 0;
  } catch (e) {
    console.warn('getTopicActivitiesProgress failed:', e);
    return 0;
  }
};

export const saveTopicProgress = async (topicId: number, progress: number): Promise<void> => {
  const p = clamp(progress);
  try {
    await database.saveProgress(topicId, p, p);
  } catch (e) {
    console.warn('saveTopicProgress failed:', e);
  }
};

export const saveTopicContentProgress = async (topicId: number, progress: number): Promise<void> => {
  const p = clamp(progress);
  try {
    const detail = await database.getProgressDetail(topicId);
    const content = Math.max(detail && 'content' in detail ? detail.content : 0, p);
    const activities = detail && 'activities' in detail ? detail.activities : 0;
    await database.saveProgress(topicId, content, activities);
  } catch (e) {
    console.warn('saveTopicContentProgress failed:', e);
  }
};

export const saveTopicActivitiesProgress = async (topicId: number, progress: number): Promise<void> => {
  const p = clamp(progress);
  try {
    const detail = await database.getProgressDetail(topicId);
    const content = detail && 'content' in detail ? detail.content : 0;
    await database.saveProgress(topicId, content, p);
  } catch (e) {
    console.warn('saveTopicActivitiesProgress failed:', e);
  }
};

export const updateTopicProgress = async (topicId: number, progress: number): Promise<void> => {
  const current = (await getTopicProgress(topicId)) as number;
  if (progress > current) await saveTopicProgress(topicId, progress);
};

export const resetTopicProgress = async (topicId?: number): Promise<void> => {
  try {
    if (topicId !== undefined && topicId !== null) {
      await database.saveProgress(topicId, 0, 0);
    } else {
      await database.clearAllProgress();
    }
  } catch (e) {
    console.warn('resetTopicProgress failed:', e);
  }
};
