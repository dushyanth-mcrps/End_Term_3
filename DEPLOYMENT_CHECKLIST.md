# Deployment Checklist (Submission Ready)

Use this checklist before final submission and demo recording.

## 1. Local Quality Checks

1. Install dependencies:

```bash
npm install
```

2. Run lint:

```bash
npm run lint
```

3. Build production bundle:

```bash
npm run build
```

4. Preview production build locally:

```bash
npm run preview
```

## 2. Firebase Setup

1. Create Firebase project.
2. Enable Authentication with Email/Password.
3. Create Firestore in Production mode.
4. Add Firebase Web App and copy configuration values.

## 3. Firestore Rules (Mandatory)

Publish these rules in Firestore Rules tab:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /{document=**} {
        allow read, write: if isOwner(userId);
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4. Environment Variables

1. Create .env from .env.example:

```bash
cp .env.example .env
```

2. Fill all required values:

- VITE_GEMINI_API_KEY
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

3. Ensure .env is not committed.

## 5. Vercel Deployment

1. Import repository into Vercel.
2. Framework preset: Vite (usually auto-detected).
3. Add all VITE_ variables in Project Settings > Environment Variables.
4. Deploy.

Optional SPA fallback (if route refresh gives 404):

Create vercel.json with:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 6. Netlify Deployment (Alternative)

1. Connect repo in Netlify.
2. Build command: npm run build
3. Publish directory: dist
4. Add all VITE_ env variables.

SPA fallback:

Create public/_redirects with:

```txt
/* /index.html 200
```

## 7. Post-Deployment Verification

1. Signup works.
2. Login/logout works.
3. Protected routes redirect correctly.
4. Study plan generation works.
5. Dashboard status updates persist.
6. Vault CRUD works.
7. AI resource suggestions work.
8. AI summarizer works.
9. Analytics and revision reminders display properly.
10. User A cannot see User B data.

## 8. Submission-Ready Checklist

1. README includes:
- Problem statement
- Features
- Tech stack
- Setup steps

2. Live deployment link added.
3. Demo video recorded (3 to 5 minutes).
4. Commit messages are clean.
5. .env is not in git.
6. .env.example is committed.

## 9. Suggested Demo Order

1. Login or signup.
2. Generate study plan.
3. Update topic statuses.
4. Show analytics and revision reminders.
5. Demonstrate vault CRUD.
6. Show AI suggestions and summarizer.
7. Switch accounts and show data isolation.
