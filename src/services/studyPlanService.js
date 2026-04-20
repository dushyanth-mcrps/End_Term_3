import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

function getUserStudyPlanRef(userId) {
  if (!userId) {
    throw new Error('A valid userId is required.')
  }

  return doc(db, 'users', userId, 'study', 'currentPlan')
}

function initializeProgressMap(plan) {
  const progressMap = {}

  plan.forEach((dayEntry, dayIndex) => {
    const dayNumber = Number(dayEntry.day ?? dayIndex + 1)
    const topics = Array.isArray(dayEntry.topics) ? dayEntry.topics : []

    topics.forEach((_, topicIndex) => {
      const topicId = `d${dayNumber}-t${topicIndex + 1}`
      progressMap[topicId] = {
        status: 'Not Started',
        startedAt: null,
        completedAt: null,
        timeSpentMinutes: 0,
        lastUpdatedAt: null,
        lastStudiedAt: null,
      }
    })
  })

  return progressMap
}

export async function saveStudyPlan(userId, plan) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)
  const initialProgress = initializeProgressMap(plan)

  // Save initialized progress to localStorage as backup
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        `study-companion-progress-${userId}`,
        JSON.stringify(initialProgress),
      )
    } catch {
      // Ignore storage failures
    }
  }

  await setDoc(
    userStudyPlanRef,
    {
      plan,
      progress: initialProgress,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function getStudyPlan(userId) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)
  const snapshot = await getDoc(userStudyPlanRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()

  return {
    plan: data.plan ?? [],
    progress: data.progress ?? {},
    updatedAt: data.updatedAt ?? null,
  }
}

export async function updateProgress(userId, progress) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)

  await setDoc(
    userStudyPlanRef,
    {
      progress,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
