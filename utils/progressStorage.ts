// Simple progress storage utility
// In a production app, you'd use AsyncStorage or a database

type TopicProgress = {
  [topicId: number]: number;
};

// In-memory storage (replace with AsyncStorage for persistence)
let progressStorage: TopicProgress = {};

export const getTopicProgress = async (topicId?: number): Promise<TopicProgress | number | null> => {
  if (topicId) {
    return progressStorage[topicId] || 0;
  }
  return progressStorage;
};

export const saveTopicProgress = async (topicId: number, progress: number): Promise<void> => {
  progressStorage[topicId] = Math.min(100, Math.max(0, progress));
  // In a real app, you'd also save to AsyncStorage here
  // await AsyncStorage.setItem(`topic_${topicId}_progress`, progress.toString());
};

export const updateTopicProgress = async (topicId: number, progress: number): Promise<void> => {
  const currentProgress = (await getTopicProgress(topicId)) as number;
  if (progress > currentProgress) {
    await saveTopicProgress(topicId, progress);
  }
};

export const resetTopicProgress = async (topicId?: number): Promise<void> => {
  if (topicId) {
    delete progressStorage[topicId];
  } else {
    progressStorage = {};
  }
};

