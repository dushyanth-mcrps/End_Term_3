
# 🚀 End-Term Project Submission Guidelines

## Course: *Building Web Applications with React*

### Batch: **2029**

---

## 🎯 Objective

The goal of this end-term project is to **build a real-world, production-level React application** that demonstrates:

* Strong understanding of **core React concepts**
* Ability to **design and solve a meaningful problem**
* Integration with **backend services - Firebase**
* Clean UI, scalable architecture, and thoughtful UX

> ⚠️ This is **NOT a toy project**. It should solve a **genuine, non-trivial problem**.

---

## 🧠 Problem Statement (Most Important)
* AI-powered Study Companion (personalized learning paths)
## Focused MVP (Core Features)
These 4 features fulfill the Mandatory React Requirements and CRUD operations required for the project.

1. Adaptive Study Path Generator (Create/Read)
The Logic: A form where users input a "Goal" (e.g., "Learn React Hooks") and "Timeframe" (e.g., "5 Days").

The Feature: Integration with an AI API (like OpenAI or Gemini) to generate a step-by-step roadmap.

React Focus: Controlled components for inputs and useState to manage the generated path.

2. Interactive "Focus Dashboard" (Read/Update)
The Logic: A central hub displaying the current step of the learning path.

The Feature: Users can mark sub-topics as "In Progress" or "Completed." This data must persist in Firebase.

React Focus: Lifting state up to ensure the progress bar and the task list stay synchronized.

3. Resource "Smart Vault" (CRUD)
The Logic: A personal library where the AI suggests relevant links (YouTube, Docs) for the current topic.

The Feature: Users can manually add, edit, or delete their own bookmarks and notes.

React Focus: Lists and Keys for rendering resources; useEffect for fetching data from the database.

4. Auth-Protected Personalization (Security)
The Logic: Use Firebase Auth to handle sign-ups.

The Feature: Users see only their unique learning paths and progress. Includes a "Protected Route" that redirects unauthenticated users to login.

React Focus: Context API to provide the user object globally across the app.

##  Stretch Features (To Earn Bonus Marks)
These features demonstrate Advanced Concepts like optimization and thoughtful UX.

1. AI Concept Summarizer (useRef & Lazy Loading):
A feature where users paste a long article, and the AI provides a 3-bullet summary. Use React.lazy and Suspense to load this heavy component only when needed to improve performance.

2. Performance Analytics (useMemo):
A visual chart showing "Study Consistency." Use useMemo to calculate complex statistics from the database (like "Time Spent per Category") without re-calculating on every render.

3. Smart Revision Reminders (Side Effects):
A system that uses useEffect and local storage (or database timestamps) to highlight topics the user hasn't reviewed in 48 hours, simulating "Spaced Repetition."
---

## ⚛️ 2. Mandatory React Requirements

Your project **must demonstrate strong usage of React fundamentals:**

### Core Concepts (Compulsory)

* Functional Components
* Props & Component Composition
* State Management using `useState`
* Side Effects using `useEffect`
* Conditional Rendering
* Lists & Keys

### Intermediate Concepts (Must Include)

* Lifting State Up
* Controlled Components
* Routing (React Router)
* Context API (global state)

### Advanced Concepts (Highly Recommended)

* `useMemo` (optimization)
* `useCallback`
* `useRef`
* Lazy Loading (`React.lazy`, `Suspense`)
* Performance optimization techniques

---

## 🔐 3. Authentication & Database

You must integrate **real backend services**:

### Allowed Options

* Firebase (Auth + Firestore)
* Appwrite
* Any similar BaaS

### Required Features

* User Authentication (Login/Signup)
* Protected Routes
* Persistent User Data
* CRUD operations (Create, Read, Update, Delete)

---

## 🎨 4. UI/UX Expectations

* Clean, responsive UI (mobile + desktop)
* Consistent design system
* Proper loading states & error handling
* Good user flow and navigation

### Suggested Tools

* Tailwind CSS / Chakra UI / Material UI

---

## 🏗️ 5. Project Structure & Code Quality

* Proper folder structure:

  ```
  /components
  /pages
  /hooks
  /context
  /services
  ```
* Reusable components
* Separation of concerns
* Clean and readable code
* Avoid unnecessary re-renders

---

## 📦 6. Required Features Checklist

Every project **must include:**

* ✅ Authentication system
* ✅ Dashboard / Main screen
* ✅ At least 2–3 core features solving the main problem
* ✅ CRUD functionality
* ✅ Persistent storage
* ✅ Routing
* ✅ State management (Context or equivalent)

---

## 📄 7. Submission Requirements

### 📁 GitHub Repository

* Proper README including:

  * Problem Statement
  * Features
  * Tech Stack
  * Setup Instructions
* Clean commits (no “final final last v2”)

### 🎥 Demo Video (Mandatory)

* 3–5 minutes
* Explain:

  * Problem
  * Features
  * Tech decisions

### 🌐 Live Deployment (Recommended)

* Vercel / Netlify

---

## ⚖️ 8. Evaluation Rubric (Total: 100 Marks)

| Criteria                 | Marks | Description                                |
| ------------------------ | ----- | ------------------------------------------ |
| Problem Statement & Idea | 15    | Originality, clarity, real-world relevance |
| React Fundamentals       | 20    | Proper use of state, props, hooks          |
| Advanced React Usage     | 15    | Optimization, hooks, architecture          |
| Backend Integration      | 15    | Auth, database, CRUD                       |
| UI/UX                    | 10    | Design, responsiveness, usability          |
| Code Quality             | 10    | Structure, readability, best practices     |
| Functionality            | 10    | Features working correctly                 |
| Demo & Explanation       | 5     | Clarity in explanation                     |

---

## 🚫 9. Academic Integrity

* ❌ Plagiarism will result in **zero marks**
* ❌ Blind AI-generated code without understanding = **penalized**
* ✅ You must be able to **explain every part of your code**

---

## 🧑‍⚖️ 10. Viva Expectations

During evaluation, you should be able to:

* Explain your architecture
* Justify your tech choices
* Debug your own code
* Answer React concept questions

---

## 💡 Pro Tips (From Experience)

* Start early. Last week builds always fail.
* Focus on **one strong idea**, not 10 weak features.
* Keep UI simple, logic strong.
* Test edge cases.
* Think like a **user**, not just a developer.

---

## 🔥 Final Note

> “This project is not just an assignment — it’s your **portfolio piece**.”

Build something you’d be proud to show in an interview.

---


