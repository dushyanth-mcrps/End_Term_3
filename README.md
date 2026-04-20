# AI-powered Study Companion

A production-style React web app that helps learners create personalized study plans, track progress, manage learning resources, and use AI-powered support tools.

## Problem Statement

Students often struggle with three things:

1. planning what to study,
2. tracking progress consistently,
3. revising topics at the right time.

This project solves that by combining AI planning, progress tracking, secure user data, revision support, and resource management in one workflow.

## Features

### MVP Features

1. Adaptive Study Path Generator
- User enters a goal and timeframe.
- Groq generates a day-wise study plan.
- Plan is saved per authenticated user.

2. Focus Dashboard
- Displays all study paths, days, and topics.
- Topic status tracking: Not Started, In Progress, Completed.
- Status updates are persisted to Firestore + localStorage fallback.

3. Multi-Path Management
- Supports multiple concurrent study paths for one user.
- Delete any path you no longer need.
- Bulk delete fully completed paths.

4. Smart Vault (CRUD)
- Add, edit, and delete personal resources.
- AI resource suggestions by topic (YouTube + docs).
- User data is scoped by authenticated user ID.

5. Authentication + Protected Routes
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

4. Live Study-Time Refresh
- In-progress topic minutes update automatically every 30 seconds.
- Completed topics retain persisted time spent.

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Firebase Auth
- Firestore
- Groq API

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

- VITE_GROQ_API_KEY
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

## Study Plan Data Model

The study document supports multiple paths:

- `paths[]` : array of study paths (goal, timeframe, plan, progress, timestamps)
- `activePathId` : currently active path id
- `plan` and `progress` : active path snapshot for backward compatibility

## AI Resource Links

AI-suggested resource links are normalized so they remain usable:

- YouTube suggestions open search results instead of fragile single video IDs.
- Docs suggestions fall back to documentation search results when needed.

## Demo Video

- [Watch the demo video](https://drive.google.com/file/d/1SBSmBDV4nguuyQAxxSHyfw1NEkfZcM0W/view?usp=drive_link)

