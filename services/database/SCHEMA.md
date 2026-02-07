# Database layer – schemas

Same logical data on both platforms; storage differs.

---

## SQLite (mobile: Android / iOS)

**Database name:** `mathbridge.db`

### Tables

```sql
-- User accounts (basic auth; password stored as simple hash for local use only)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TEXT NOT NULL
);

-- Per-topic progress: content % and activities %
CREATE TABLE IF NOT EXISTS progress (
  topic_id INTEGER PRIMARY KEY NOT NULL,
  content INTEGER NOT NULL DEFAULT 0,
  activities INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

-- Unlocked achievement ids and when
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY NOT NULL,
  unlocked_at TEXT NOT NULL
);

-- Quiz/activity scores
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  quiz_id TEXT,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  completed_at TEXT NOT NULL
);

-- Key-value meta (e.g. last_activity timestamp)
CREATE TABLE IF NOT EXISTS activity_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
```

Tables are created automatically on first use.

---

## Firebase Firestore (web)

**Config:** Set `EXPO_PUBLIC_FIREBASE_*` env vars (or equivalent for Vercel).

### Collections

- **`users`**  
  Document ID = `userId`.  
  Fields: `username`, `email`, `passwordHash`, `createdAt`.

- **`progress`**  
  Document ID = `userId`.  
  Fields: map `topicId -> { content: number, activities: number }`.

- **`achievements/{userId}/items`**  
  Document ID = `achievementId`.  
  Fields: `unlockedAt` (string, ISO).

- **`scores/{userId}/items`**  
  Auto-generated document IDs.  
  Fields: `topicId`, `quizId`, `score`, `total`, `passed`, `completedAt` (string, ISO).

- **`activity_meta`**  
  Document ID = `userId`.  
  Fields: `lastActivity` (string, ISO).

**Indexes (Firestore):**  
If you use `orderBy('completedAt', 'desc')` with `where('topicId', '==', ...)`, create a composite index in the Firebase console (or via `firestore.indexes.json`) for the `scores/{userId}/items` collection.

---

## Shared API (`DatabaseService`)

- `createUser(credentials)` → `{ user, session }`
- `loginUser(email, password)` → `Session | null`
- `getUserData()` → `User | null`
- `saveProgress(topicId, content, activities)` → `void`
- `getProgress(topicId?)` → `TopicProgressMap | number | null`
- `getProgressDetail(topicId?)` → `ProgressMap | TopicProgressDetail | null`
- `unlockAchievement(achievementId)` → `void`
- `getAchievements()` → `AchievementRecord[]`
- `saveScore(record)` → `void`
- `getScores(topicId?)` → `ScoreRecord[]`
- `getLastActivityTimestamp()` / `setLastActivityTimestamp(iso)` → `string | null` / `void`
- `clearAllProgress()` → `void`

Frontend and `utils/progressStorage.ts` use this API only; they do not call SQLite or Firebase directly.
