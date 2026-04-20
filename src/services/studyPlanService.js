import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

function getUserStudyPlanRef(userId) {
  if (!userId) {
    throw new Error('A valid userId is required.')
  }

  return doc(db, 'users', userId, 'study', 'currentPlan')
}

export async function saveStudyPlan(userId, plan) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)

  await setDoc(
    userStudyPlanRef,
    {
      plan,
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
