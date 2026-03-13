# Deploy Firestore Rules

The "Missing or insufficient permissions" error on web login means your Firestore rules need to be updated.

## Option 1: Deploy via Firebase Console (quickest)

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project
2. Open **Firestore Database** → **Rules**
3. Replace the rules with the contents of `firestore.rules`
4. Click **Publish**

## Option 2: Deploy via Firebase CLI

```bash
firebase deploy --only firestore:rules
```

Make sure `firebase.json` includes:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

## What the rules allow

- **users**: Authenticated users can read any user doc (needed for login + admin dashboard). Users can only create/update their own.
- **progress, scores, achievements, activity_meta**: Each user can only read/write their own data.
- **password_reset_requests**: Anyone can create (forgot password); authenticated users can read/update (admin marks complete).

After deploying, try logging in again on web.
