/**
 * Vercel serverless API: Admin sets a student's password.
 * Requires Firebase Admin SDK (service account in FIREBASE_SERVICE_ACCOUNT env).
 * Caller must be authenticated as admin (Bearer token from Firebase Auth).
 *
 * Set FIREBASE_SERVICE_ACCOUNT in Vercel env as the full JSON string of your
 * Firebase service account key (Project Settings → Service accounts → Generate new key).
 */

import * as admin from 'firebase-admin';

const ADMIN_EMAILS = ['admin@example.com']; // Match app/admin/index.tsx

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.app();
  const creds = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!creds) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env not set. Add Firebase service account JSON.');
  }
  const serviceAccount = JSON.parse(creds) as admin.ServiceAccount;
  return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

type Req = { method?: string; headers?: { authorization?: string }; body?: unknown };
type Res = { status: (n: number) => Res; json: (o: object) => void };

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization' });
      return;
    }
    const idToken = authHeader.slice(7);

    const app = getAdminApp();
    const auth = app.auth();
    const decoded = await auth.verifyIdToken(idToken);
    const email = (decoded.email ?? '').toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      res.status(403).json({ error: 'Admin only' });
      return;
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const { userId, newPassword } = body;
    if (!userId || typeof newPassword !== 'string') {
      res.status(400).json({ error: 'userId and newPassword required' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    await auth.updateUser(userId, { password: newPassword });
    res.status(200).json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
}
