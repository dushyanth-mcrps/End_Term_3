# Deployment Checklist

Use this checklist every time you deploy the AI-powered Study Companion.

## 1. Pre-Deployment Basics

- [ ] Confirm you are on the correct branch (`main` for production).
- [ ] Pull latest changes from remote.
- [ ] Ensure working tree is clean (`git status`).
- [ ] Verify commit message quality and commit all intended changes.
- [ ] Push code to GitHub.

## 2. Environment Variables

- [ ] Confirm `.env` exists locally and is not committed.
- [ ] Confirm `.env.example` is updated if any new env vars were added.
- [ ] Required variables are set:
  - [ ] `VITE_GROQ_API_KEY`
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] Add the same variables in your hosting platform (Vercel/Netlify/Firebase Hosting).

## 3. Code Quality and Build

- [ ] Run lint:

```bash
npm run lint
```

- [ ] Run production build:

```bash
npm run build
```

- [ ] Confirm build completes without errors.
- [ ] Review warnings (bundle size warnings are acceptable if expected).

## 4. Firebase Configuration

- [ ] Firebase project is selected correctly.
- [ ] Firebase Auth providers (Email/Password) are enabled.
- [ ] Firestore is active.
- [ ] Firestore rules enforce user isolation (`users/{uid}/...`).
- [ ] Test user can log in and only access their own data.

## 5. Feature Validation Before Deploy

- [ ] Generate a study path from Home.
- [ ] Add another path and confirm previous path progress does not reset.
- [ ] Update topic statuses (Not Started/In Progress/Completed).
- [ ] Verify revision reminders work (48-hour logic).
- [ ] Verify AI resource suggestions return usable YouTube/docs links.
- [ ] Verify Smart Vault CRUD (add/edit/delete).
- [ ] Verify AI Summarizer loads and returns 3 bullet points.
- [ ] Verify logout/login and protected route behavior.

## 6. Deployment Steps

### Option A: Vercel
- [ ] Import GitHub repository in Vercel.
- [ ] Set framework preset to Vite.
- [ ] Add all required environment variables.
- [ ] Deploy latest `main` branch.

### Option B: Netlify
- [ ] Import GitHub repository in Netlify.
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Add all required environment variables.
- [ ] Deploy latest `main` branch.

### Option C: Firebase Hosting
- [ ] Install Firebase CLI and login.
- [ ] Build app (`npm run build`).
- [ ] Initialize hosting if not already done.
- [ ] Deploy:

```bash
firebase deploy
```

## 7. Post-Deployment Verification

- [ ] Open deployed URL in desktop browser.
- [ ] Open deployed URL in mobile view.
- [ ] Verify no console-breaking runtime errors.
- [ ] Verify login/signup works in production.
- [ ] Verify Firestore reads/writes work in production.
- [ ] Verify AI features work with production env keys.
- [ ] Verify all routes load:
  - [ ] `/`
  - [ ] `/login`
  - [ ] `/dashboard`
  - [ ] `/vault`

## 8. Release Notes and Backup

- [ ] Tag release in Git (optional but recommended).
- [ ] Save a short changelog entry for what was deployed.
- [ ] Keep demo video link and README updated.
- [ ] Record rollback plan (previous stable commit hash).

## 9. Quick Rollback Plan

- [ ] Identify last stable commit hash.
- [ ] Re-deploy that commit from hosting provider or Git.
- [ ] Validate critical flows after rollback (auth, dashboard, vault, AI calls).

---

Last updated: 2026-04-21
Project: AI-powered Study Companion
