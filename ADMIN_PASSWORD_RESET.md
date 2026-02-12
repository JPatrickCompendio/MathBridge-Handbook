# Admin Password Reset Setup

When a student clicks "Forgot Password" on the web login, a request is created for the admin. The admin sets a new password in the Students tab and tells the student in person. This requires a serverless API that uses Firebase Admin SDK.

## When You See "Password reset API not found"

This usually means one of:

1. **You're running locally** (`expo start --web`) – The API only exists when deployed to Vercel or when using `vercel dev`.
2. **Not deployed to Vercel** – The API route must be deployed.
3. **Missing FIREBASE_SERVICE_ACCOUNT** – The env var must be set in Vercel.

---

## Setup Steps

### 1. Deploy to Vercel

1. Push your code to GitHub and connect the repo to [Vercel](https://vercel.com).
2. Vercel will detect the Expo project. Use these settings:
   - **Build Command:** `npx expo export -p web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2. Add Firebase Service Account

1. In [Firebase Console](https://console.firebase.google.com) → your project → **Project Settings** → **Service accounts**.
2. Click **Generate new private key**.
3. In Vercel: **Project Settings** → **Environment Variables**.
4. Add:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Paste the **entire JSON** from the downloaded key file (as a single line or minified).
   - **Environment:** Production (and Preview if you want)

### 3. Redeploy

After adding the env var, go to **Deployments** → **...** on the latest deployment → **Redeploy**. Env vars are only applied on new deployments.

---

## Local Testing

To test the admin password reset locally:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dev` (instead of `expo start --web`)
3. Open the URL shown (e.g. `http://localhost:3000`)
4. Log in as admin and try setting a password

`vercel dev` runs both the app and the API routes locally.

---

## Update Admin Email

Ensure the admin email matches in both places:

- `app/admin/index.tsx` – line with `ADMIN_EMAILS`
- `api/admin-set-password.ts` – line with `ADMIN_EMAILS`

Replace `admin@example.com` with your real teacher/admin email.
