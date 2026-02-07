/**
 * Firebase config for web.
 * Uses EXPO_PUBLIC_* env vars when set (e.g. on Vercel); otherwise uses defaults below.
 * Restrict your API key by domain in Firebase Console → Project settings → General.
 */

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCNuCQnILPrdRaof39YSw1wt4dEOKSp2WM',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'mathbridge-handbook.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'mathbridge-handbook',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'mathbridge-handbook.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '24812114797',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:24812114797:web:b19658101458c00bffc064',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-RJ5BGHV5WQ',
};

export default firebaseConfig;
