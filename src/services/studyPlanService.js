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

function createPathId() {
  return `path-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function inferLegacyGoalFromPlan(plan) {
  const firstDay = Array.isArray(plan) ? plan[0] : null
  const firstTopic = Array.isArray(firstDay?.topics) ? firstDay.topics[0] : ''
  const topicText = typeof firstTopic === 'string' ? firstTopic : String(firstTopic?.title ?? '')

  const introMatch = topicText.match(/introduction to\s+(.+?)(?:\s*-\s*day\s*\d+)?$/i)
  if (introMatch?.[1]) {
    return introMatch[1].trim()
  }

  return 'Study Path 1'
}

function normalizeLegacyPathData(data) {
  const paths = Array.isArray(data?.paths) ? data.paths : []
  if (paths.length > 0) {
    return paths
  }

  const legacyPlan = Array.isArray(data?.plan) ? data.plan : []
  if (legacyPlan.length === 0) {
    return []
  }

  return [
    {
      id: createPathId(),
      goal: inferLegacyGoalFromPlan(legacyPlan),
      timeframe: legacyPlan.length,
      plan: legacyPlan,
      progress: data?.progress ?? initializeProgressMap(legacyPlan),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

export async function saveStudyPlan(userId, plan, options = {}) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)
  const snapshot = await getDoc(userStudyPlanRef)
  const existingData = snapshot.exists() ? snapshot.data() : {}
  const existingPaths = normalizeLegacyPathData(existingData)
  const initialProgress = initializeProgressMap(plan)
  const pathId = createPathId()
  const nowIso = new Date().toISOString()
  const nextPath = {
    id: pathId,
    goal: options.goal ?? 'Untitled Goal',
    timeframe: options.timeframe ?? plan.length,
    plan,
    progress: initialProgress,
    createdAt: nowIso,
    updatedAt: nowIso,
  }
  const updatedPaths = [...existingPaths, nextPath]

  // Save initialized progress to localStorage as backup
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        `study-companion-progress-${userId}`,
        JSON.stringify({
          ...(existingData?.progress ?? {}),
          ...initialProgress,
        }),
      )
    } catch {
      // Ignore storage failures
    }
  }

  await setDoc(
    userStudyPlanRef,
    {
      paths: updatedPaths,
      plan: plan,
      progress: initialProgress,
      activePathId: pathId,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  )

  return {
    pathId,
    goal: nextPath.goal,
    timeframe: nextPath.timeframe,
    plan,
    progress: initialProgress,
  }
}

export async function getStudyPlan(userId) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)
  const snapshot = await getDoc(userStudyPlanRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data()
  const paths = normalizeLegacyPathData(data)
  const activePathId = data.activePathId ?? paths[paths.length - 1]?.id ?? null
  const activePath = paths.find((path) => path.id === activePathId) ?? paths[paths.length - 1] ?? null

  return {
    plan: activePath?.plan ?? data.plan ?? [],
    progress: activePath?.progress ?? data.progress ?? {},
    paths,
    activePathId,
    updatedAt: data.updatedAt ?? null,
  }
}

export async function updateProgress(userId, progress, pathId = null) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)
  const snapshot = await getDoc(userStudyPlanRef)

  if (!snapshot.exists()) {
    throw new Error('No study plan found to update progress.')
  }

  const data = snapshot.data()
  const paths = normalizeLegacyPathData(data)

  if (paths.length === 0) {
    throw new Error('No study paths available to update progress.')
  }

  const targetPathId = pathId ?? data.activePathId ?? paths[paths.length - 1]?.id
  const updatedPaths = paths.map((path) =>
    path.id === targetPathId
      ? {
          ...path,
          progress,
          updatedAt: new Date().toISOString(),
        }
      : path,
  )

  const activePath = updatedPaths.find((path) => path.id === targetPathId) ?? updatedPaths[updatedPaths.length - 1]

  await setDoc(
    userStudyPlanRef,
    {
      paths: updatedPaths,
      plan: activePath?.plan ?? [],
      progress: activePath?.progress ?? {},
      activePathId: targetPathId,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  )
}

export async function removeStudyPaths(userId, pathIds) {
  const userStudyPlanRef = getUserStudyPlanRef(userId)
  const snapshot = await getDoc(userStudyPlanRef)

  if (!snapshot.exists()) {
    return { removedCount: 0 }
  }

  const data = snapshot.data()
  const paths = normalizeLegacyPathData(data)
  const idsToRemove = new Set(
    Array.isArray(pathIds)
      ? pathIds.map((pathId) => String(pathId ?? '').trim()).filter(Boolean)
      : [],
  )

  if (idsToRemove.size === 0) {
    return { removedCount: 0 }
  }

  const updatedPaths = paths.filter((path) => !idsToRemove.has(path.id))
  const removedCount = paths.length - updatedPaths.length

  const activePathId =
    updatedPaths.find((path) => path.id === data.activePathId)?.id ??
    updatedPaths[updatedPaths.length - 1]?.id ??
    null
  const activePath =
    updatedPaths.find((path) => path.id === activePathId) ??
    updatedPaths[updatedPaths.length - 1] ??
    null

  await setDoc(
    userStudyPlanRef,
    {
      paths: updatedPaths,
      plan: activePath?.plan ?? [],
      progress: activePath?.progress ?? {},
      activePathId,
      updatedAt: serverTimestamp(),
    },
    { merge: false },
  )

  return { removedCount }
}
