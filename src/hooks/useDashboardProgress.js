import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getStudyPlan, removeStudyPaths, updateProgress } from '../services/studyPlanService'

const DEFAULT_STATUS = 'Not Started'
const MINUTES_PER_MILLISECOND = 1 / 60000
const REVISION_THRESHOLD_HOURS = 48

function getProgressStorageKey(userId) {
  return `study-companion-progress-${userId}`
}

function getRevisionStorageKey(userId) {
  return `study-companion-revisions-${userId}`
}

function readStoredProgressMap(userId) {
  if (typeof window === 'undefined' || !userId) {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(getProgressStorageKey(userId))
    return storedValue ? JSON.parse(storedValue) : {}
  } catch {
    return {}
  }
}

function writeStoredProgressMap(userId, progressMap) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  try {
    window.localStorage.setItem(
      getProgressStorageKey(userId),
      JSON.stringify(progressMap),
    )
  } catch {
    // Ignore storage failures
  }
}

function readStoredRevisionMap(userId) {
  if (typeof window === 'undefined' || !userId) {
    return {}
  }

  try {
    const storedValue = window.localStorage.getItem(getRevisionStorageKey(userId))
    return storedValue ? JSON.parse(storedValue) : {}
  } catch {
    return {}
  }
}

function writeStoredRevisionMap(userId, revisionMap) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  try {
    window.localStorage.setItem(
      getRevisionStorageKey(userId),
      JSON.stringify(revisionMap),
    )
  } catch {
    // Ignore storage failures; the dashboard still works with in-memory state.
  }
}

function removePathKeysFromMap(mapObject, pathIds) {
  const idsToRemove = new Set(pathIds)

  return Object.fromEntries(
    Object.entries(mapObject).filter(([key]) => {
      const pathPrefix = key.split('-d')[0]
      return !idsToRemove.has(pathPrefix)
    }),
  )
}

function parseDateValue(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function getMinutesBetween(startValue, endValue) {
  const startDate = parseDateValue(startValue)
  const endDate = parseDateValue(endValue) ?? new Date()

  if (!startDate) {
    return 0
  }

  const elapsedMilliseconds = Math.max(0, endDate.getTime() - startDate.getTime())
  if (elapsedMilliseconds === 0) {
    return 0
  }

  return Math.max(1, Math.ceil(elapsedMilliseconds * MINUTES_PER_MILLISECOND))
}

function normalizeProgressEntry(progressEntry) {
  if (typeof progressEntry === 'string') {
    return {
      status: progressEntry,
      startedAt: null,
      completedAt: null,
      timeSpentMinutes: 0,
      lastUpdatedAt: null,
      lastStudiedAt: null,
    }
  }

  if (!progressEntry || typeof progressEntry !== 'object') {
    return {
      status: DEFAULT_STATUS,
      startedAt: null,
      completedAt: null,
      timeSpentMinutes: 0,
      lastUpdatedAt: null,
      lastStudiedAt: null,
    }
  }

  const status = progressEntry.status ?? DEFAULT_STATUS
  const startedAt = progressEntry.startedAt ?? null
  const completedAt = progressEntry.completedAt ?? null
  const storedMinutes = Number(progressEntry.timeSpentMinutes ?? 0)

  return {
    status,
    startedAt,
    completedAt,
    timeSpentMinutes:
      storedMinutes > 0
        ? storedMinutes
        : getMinutesBetween(startedAt, completedAt || null),
    lastUpdatedAt: progressEntry.lastUpdatedAt ?? null,
    lastStudiedAt: progressEntry.lastStudiedAt ?? progressEntry.lastUpdatedAt ?? null,
  }
}

function inferPathGoal(pathData, fallbackIndex) {
  const goal = String(pathData.goal ?? '').trim()
  if (goal && goal !== 'Existing Study Path') {
    return goal
  }

  const firstDay = Array.isArray(pathData.plan) ? pathData.plan[0] : null
  const firstTopic = Array.isArray(firstDay?.topics) ? firstDay.topics[0] : ''
  const topicText =
    typeof firstTopic === 'string'
      ? firstTopic
      : String(firstTopic?.title ?? '')

  const introMatch = topicText.match(/introduction to\s+(.+?)(?:\s*-\s*day\s*\d+)?$/i)
  if (introMatch?.[1]) {
    return introMatch[1].trim()
  }

  return `Study Path ${fallbackIndex + 1}`
}

function normalizeSinglePath(pathData = {}, fallbackIndex = 0, storedRevisionMap = {}, storedProgressMap = {}) {
  const pathId = String(pathData.id ?? `legacy-path-${fallbackIndex + 1}`)
  const pathGoal = inferPathGoal(pathData, fallbackIndex)
  const plan = Array.isArray(pathData.plan) ? pathData.plan : []
  const progress = pathData.progress ?? {}

  // Merge Firestore progress with localStorage progress (localStorage is backup/fallback)
  const mergedProgress = { ...progress, ...storedProgressMap }

  return plan.map((dayEntry, dayIndex) => {
    const dayNumber = Number(dayEntry.day ?? dayIndex + 1)
    const rawTopics = Array.isArray(dayEntry.topics) ? dayEntry.topics : []

    const topics = rawTopics.map((topicEntry, topicIndex) => {
      const topicId = `${pathId}-d${dayNumber}-t${topicIndex + 1}`
      const title =
        typeof topicEntry === 'string'
          ? topicEntry
          : String(topicEntry.title ?? `Topic ${topicIndex + 1}`)
      const statusFromPlan =
        typeof topicEntry === 'object' && topicEntry !== null
          ? topicEntry.status
          : undefined
      const legacyTopicId = `d${dayNumber}-t${topicIndex + 1}`
      const normalizedProgressEntry = normalizeProgressEntry(
        mergedProgress[topicId] ?? mergedProgress[legacyTopicId],
      )
      const status = normalizedProgressEntry.status ?? statusFromPlan ?? DEFAULT_STATUS
      const lastStudiedAt =
        storedRevisionMap[topicId] ??
        normalizedProgressEntry.lastStudiedAt ??
        normalizedProgressEntry.lastUpdatedAt ??
        null

      return {
        id: topicId,
        pathId,
        pathGoal,
        title,
        status,
        startedAt: normalizedProgressEntry.startedAt,
        completedAt: normalizedProgressEntry.completedAt,
        timeSpentMinutes: normalizedProgressEntry.timeSpentMinutes,
        lastUpdatedAt: normalizedProgressEntry.lastUpdatedAt,
        lastStudiedAt,
      }
    })

    return {
      id: `${pathId}-day-${dayNumber}`,
      pathId,
      pathGoal,
      day: dayNumber,
      topics,
    }
  })
}

function normalizeStoredPlan(data = {}, storedRevisionMap = {}, storedProgressMap = {}) {
  const paths = Array.isArray(data?.paths) ? data.paths : []

  if (paths.length > 0) {
    return paths.flatMap((pathData, pathIndex) =>
      normalizeSinglePath(pathData, pathIndex, storedRevisionMap, storedProgressMap),
    )
  }

  const legacyPlan = Array.isArray(data?.plan) ? data.plan : []
  const legacyProgress = data?.progress ?? {}

  return normalizeSinglePath(
    {
      id: 'legacy-path-1',
      plan: legacyPlan,
      progress: legacyProgress,
    },
    0,
    storedRevisionMap,
    storedProgressMap,
  )
}

function buildProgressMap(studyPlan) {
  return studyPlan.reduce((accumulator, dayEntry) => {
    dayEntry.topics.forEach((topic) => {
      accumulator[topic.id] = {
        status: topic.status,
        startedAt: topic.startedAt ?? null,
        completedAt: topic.completedAt ?? null,
        timeSpentMinutes: Number(topic.timeSpentMinutes ?? 0),
        lastUpdatedAt: topic.lastUpdatedAt ?? null,
        lastStudiedAt: topic.lastStudiedAt ?? null,
      }
    })

    return accumulator
  }, {})
}

export function useDashboardProgress() {
  const { user, isAuthLoading } = useAuth()
  const [studyPlan, setStudyPlan] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [syncError, setSyncError] = useState('')
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [isDeletingPath, setIsDeletingPath] = useState(false)

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTimeMs(Date.now())
    }

    updateCurrentTime()
    const intervalId = window.setInterval(updateCurrentTime, 60 * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    const fetchPlan = async () => {
      if (isAuthLoading) {
        return
      }

      if (!user?.uid) {
        setStudyPlan([])
        setFetchError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setFetchError('')

      try {
        const data = await getStudyPlan(user.uid)
        const storedRevisionMap = readStoredRevisionMap(user.uid)
        const storedProgressMap = readStoredProgressMap(user.uid)
        const normalizedPlan = normalizeStoredPlan(data ?? {}, storedRevisionMap, storedProgressMap)

        if (!isCancelled) {
          setStudyPlan(normalizedPlan)
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to load dashboard study plan.'
          setFetchError(message)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchPlan()

    return () => {
      isCancelled = true
    }
  }, [user?.uid, isAuthLoading])

  useEffect(() => {
    if (!user?.uid || studyPlan.length === 0) {
      return
    }

    const revisionMap = buildProgressMap(studyPlan)
    const lastStudiedMap = Object.entries(revisionMap).reduce((accumulator, [topicId, topic]) => {
      accumulator[topicId] = topic.lastStudiedAt ?? null
      return accumulator
    }, {})

    writeStoredRevisionMap(user.uid, lastStudiedMap)
  }, [studyPlan, user?.uid])

  useEffect(() => {
    if (!user?.uid || studyPlan.length === 0) {
      return
    }

    const progressMap = buildProgressMap(studyPlan)
    writeStoredProgressMap(user.uid, progressMap)
  }, [studyPlan, user?.uid])

  const handleStatusChange = async (topicId, nextStatus) => {
    if (!user?.uid) {
      setSyncError('Please log in to update progress.')
      return
    }

    const nowIsoString = new Date().toISOString()
    let updatedPlan = []
    let selectedPathId = null

    setStudyPlan((previousPlan) => {
      updatedPlan = previousPlan.map((dayEntry) => ({
        ...dayEntry,
        topics: dayEntry.topics.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                ...(() => {
                  selectedPathId = topic.pathId
                  const previousMinutes = Number(topic.timeSpentMinutes ?? 0)
                  const previousStartedAt = topic.startedAt ?? null

                  if (nextStatus === 'In Progress') {
                    return {
                      status: nextStatus,
                      startedAt: previousStartedAt ?? nowIsoString,
                      completedAt: null,
                      timeSpentMinutes: previousMinutes,
                      lastUpdatedAt: nowIsoString,
                      lastStudiedAt: nowIsoString,
                    }
                  }

                  if (nextStatus === 'Completed') {
                    const startedAt = previousStartedAt ?? nowIsoString
                    const gainedMinutes = getMinutesBetween(startedAt, nowIsoString)
                    const minimumCompletionMinutes = previousMinutes === 0 ? 1 : 0

                    return {
                      status: nextStatus,
                      startedAt,
                      completedAt: nowIsoString,
                      timeSpentMinutes:
                        previousMinutes + Math.max(gainedMinutes, minimumCompletionMinutes),
                      lastUpdatedAt: nowIsoString,
                      lastStudiedAt: nowIsoString,
                    }
                  }

                  return {
                    status: nextStatus,
                    startedAt: previousStartedAt,
                    completedAt: topic.completedAt ?? null,
                    timeSpentMinutes: previousMinutes,
                    lastUpdatedAt: nowIsoString,
                    lastStudiedAt: topic.lastStudiedAt ?? null,
                  }
                })(),
              }
            : topic,
        ),
      }))

      return updatedPlan
    })

    setSyncError('')

    try {
      const selectedPathPlan = updatedPlan.filter((dayEntry) => dayEntry.pathId === selectedPathId)
      const progressMap = buildProgressMap(selectedPathPlan)
      // Save to both Firestore and localStorage immediately
      const storedProgressMap = readStoredProgressMap(user.uid)
      writeStoredProgressMap(user.uid, { ...storedProgressMap, ...progressMap })
      await updateProgress(user.uid, progressMap, selectedPathId)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to sync topic progress.'
      setSyncError(message)
    }
  }

  const isEmptyState = useMemo(
    () => !isLoading && !fetchError && studyPlan.length === 0,
    [isLoading, fetchError, studyPlan.length],
  )

  const revisionDueCount = useMemo(() => {
    const thresholdMs = REVISION_THRESHOLD_HOURS * 60 * 60 * 1000

    return studyPlan
      .flatMap((dayEntry) => dayEntry.topics)
      .filter((topic) => {
        if (!topic.lastStudiedAt) {
          return topic.status !== 'Completed'
        }

        const studiedDate = parseDateValue(topic.lastStudiedAt)
        if (!studiedDate) {
          return true
        }

        return currentTimeMs - studiedDate.getTime() >= thresholdMs
      }).length
  }, [studyPlan, currentTimeMs])

  const overdueTopics = useMemo(() => {
    const thresholdMs = REVISION_THRESHOLD_HOURS * 60 * 60 * 1000

    return studyPlan
      .flatMap((dayEntry) =>
        dayEntry.topics.map((topic) => ({
          ...topic,
          day: dayEntry.day,
        })),
      )
      .filter((topic) => {
        if (!topic.lastStudiedAt) {
          return topic.status !== 'Completed'
        }

        const studiedDate = parseDateValue(topic.lastStudiedAt)
        if (!studiedDate) {
          return true
        }

        return currentTimeMs - studiedDate.getTime() >= thresholdMs
      })
  }, [studyPlan, currentTimeMs])

  const pathSummaries = useMemo(() => {
    const groupedByPath = new Map()

    studyPlan.forEach((dayEntry) => {
      if (!groupedByPath.has(dayEntry.pathId)) {
        groupedByPath.set(dayEntry.pathId, {
          pathId: dayEntry.pathId,
          pathGoal: dayEntry.pathGoal,
          totalTopics: 0,
          completedTopics: 0,
          totalDays: 0,
        })
      }

      const summary = groupedByPath.get(dayEntry.pathId)
      summary.totalDays += 1
      summary.totalTopics += dayEntry.topics.length
      summary.completedTopics += dayEntry.topics.filter((topic) => topic.status === 'Completed').length
    })

    return Array.from(groupedByPath.values()).map((summary) => ({
      ...summary,
      isCompleted: summary.totalTopics > 0 && summary.completedTopics === summary.totalTopics,
    }))
  }, [studyPlan])

  const removePathDataFromLocalStorage = (pathIds) => {
    if (!user?.uid || pathIds.length === 0) {
      return
    }

    const progressMap = readStoredProgressMap(user.uid)
    const revisionMap = readStoredRevisionMap(user.uid)

    const nextProgressMap = removePathKeysFromMap(progressMap, pathIds)
    const nextRevisionMap = removePathKeysFromMap(revisionMap, pathIds)

    writeStoredProgressMap(user.uid, nextProgressMap)
    writeStoredRevisionMap(user.uid, nextRevisionMap)
  }

  const handleDeletePath = async (pathId) => {
    if (!user?.uid || !pathId) {
      return
    }

    const targetPath = pathSummaries.find((summary) => summary.pathId === pathId)
    const confirmationMessage = targetPath
      ? `Delete "${targetPath.pathGoal}" and all its progress?`
      : 'Delete this study path and all its progress?'

    if (typeof window !== 'undefined' && !window.confirm(confirmationMessage)) {
      return
    }

    setSyncError('')
    setIsDeletingPath(true)

    try {
      await removeStudyPaths(user.uid, [pathId])
      removePathDataFromLocalStorage([pathId])
      setStudyPlan((previousPlan) => previousPlan.filter((dayEntry) => dayEntry.pathId !== pathId))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete study path.'
      setSyncError(message)
    } finally {
      setIsDeletingPath(false)
    }
  }

  const handleDeleteCompletedPaths = async () => {
    if (!user?.uid) {
      return
    }

    const completedPathIds = pathSummaries
      .filter((summary) => summary.isCompleted)
      .map((summary) => summary.pathId)

    if (completedPathIds.length === 0) {
      setSyncError('No completed study paths available to delete.')
      return
    }

    const confirmationMessage = `Delete ${completedPathIds.length} completed path(s)? This cannot be undone.`
    if (typeof window !== 'undefined' && !window.confirm(confirmationMessage)) {
      return
    }

    setSyncError('')
    setIsDeletingPath(true)

    try {
      await removeStudyPaths(user.uid, completedPathIds)
      removePathDataFromLocalStorage(completedPathIds)
      setStudyPlan((previousPlan) =>
        previousPlan.filter((dayEntry) => !completedPathIds.includes(dayEntry.pathId)),
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete completed study paths.'
      setSyncError(message)
    } finally {
      setIsDeletingPath(false)
    }
  }

  return {
    studyPlan,
    isLoading,
    fetchError,
    syncError,
    isEmptyState,
    handleStatusChange,
    revisionDueCount,
    overdueTopics,
    pathSummaries,
    isDeletingPath,
    handleDeletePath,
    handleDeleteCompletedPaths,
  }
}
