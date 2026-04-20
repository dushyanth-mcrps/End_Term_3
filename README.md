# AI-powered Study Companion

A production-style React web app that helps learners create personalized study plans, track progress, manage learning resources, and use AI-powered support tools.

## Problem Statement

Students often struggle with three things:

1. planning what to study,
2. tracking progress consistently,
3. revising topics at the right time.

This project solves that by combining AI planning, progress tracking, secure user data, and revision support in one workflow.

## Features

### MVP Features

1. Adaptive Study Path Generator
- User enters a goal and timeframe.
- Gemini generates a day-wise study plan.
- Plan is saved per authenticated user.

2. Focus Dashboard
- Displays all study days and topics.
- Topic status tracking: Not Started, In Progress, Completed.
- Status updates are persisted to Firestore.

3. Smart Vault (CRUD)
- Add, edit, and delete personal resources.
- AI resource suggestions by topic (YouTube + docs).
- User data is scoped by authenticated user ID.

4. Authentication + Protected Routes
- Signup, login, logout with Firebase Auth.
- Protected routes for Dashboard and Vault.
- Unauthorized access redirects to Login.

### Stretch Features

1. AI Concept Summarizer
- Summarizes long text into exactly 3 bullet points.
- Lazy loaded with React.lazy and Suspense.

2. Performance Analytics (useMemo)
- Time spent per topic.
- Completion trends by day.
- Memoized calculations to avoid unnecessary recomputation.

3. Smart Revision System (useEffect)
- Tracks last-studied timestamps.
- Highlights topics not studied in 48 hours.
- Uses user-scoped localStorage timestamp persistence.

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Firebase Auth
- Firestore
- Gemini API

## Routes

- / : Home (Study Path + lazy AI Summarizer)
- /login : Authentication
- /dashboard : Protected dashboard (progress + analytics + reminders)
- /vault : Protected resource vault

## Project Structure

```
src/
	components/
	pages/
	hooks/
	context/
	services/
	utils/
```

## Environment Variables

Create local env file from template:

```bash
cp .env.example .env
```

Required variables:

- VITE_GEMINI_API_KEY
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Notes:

- .env is intentionally gitignored.
- .env.example is committed as a template.

## Local Setup

1. Clone the repository.
2. Install dependencies.
3. Add environment variables in .env.
4. Start the app.

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Firestore Security Rules

Use production-safe user isolation rules:

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

## Data Isolation

All user data is stored under users/{uid}/...:

- users/{uid}/study/currentPlan
- users/{uid}/resources/{resourceId}

No shared fallback user identity is used.

## Demo Flow (3 to 5 Minutes)

1. Sign up or log in.
2. Generate a study plan from Home.
3. Open Dashboard and update topic status.
4. Show analytics and revision reminders.
5. Use Smart Vault CRUD.
6. Trigger AI resource suggestions.
7. Open lazy-loaded AI Summarizer.
8. Switch user account to demonstrate user-specific data.

## Deployment

Use the complete checklist in DEPLOYMENT_CHECKLIST.md.

## Viva Readiness Pointers

Be ready to explain:

1. Auth flow and protected routing.
2. Firestore schema and security rules.
3. Hook design for progress, analytics, and reminders.
4. AI prompt/response normalization.
5. Why lazy loading and useMemo are used.
