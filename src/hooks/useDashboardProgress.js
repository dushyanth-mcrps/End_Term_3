import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getStudyPlan, updateProgress } from '../services/studyPlanService'

const DEFAULT_STATUS = 'Not Started'
const MINUTES_PER_MILLISECOND = 1 / 60000
const REVISION_THRESHOLD_HOURS = 48

function getRevisionStorageKey(userId) {
  return `study-companion-revisions-${userId}`
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
  return Math.max(0, Math.round(elapsedMilliseconds * MINUTES_PER_MILLISECOND))
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

function normalizeStoredPlan(plan = [], progress = {}, storedRevisionMap = {}) {
  return plan.map((dayEntry, dayIndex) => {
    const dayNumber = Number(dayEntry.day ?? dayIndex + 1)
    const rawTopics = Array.isArray(dayEntry.topics) ? dayEntry.topics : []

    const topics = rawTopics.map((topicEntry, topicIndex) => {
      const topicId = `d${dayNumber}-t${topicIndex + 1}`
      const title =
        typeof topicEntry === 'string'
          ? topicEntry
          : String(topicEntry.title ?? `Topic ${topicIndex + 1}`)
      const statusFromPlan =
        typeof topicEntry === 'object' && topicEntry !== null
          ? topicEntry.status
          : undefined
      const normalizedProgressEntry = normalizeProgressEntry(progress[topicId])
      const status = normalizedProgressEntry.status ?? statusFromPlan ?? DEFAULT_STATUS
      const lastStudiedAt =
        storedRevisionMap[topicId] ??
        normalizedProgressEntry.lastStudiedAt ??
        normalizedProgressEntry.lastUpdatedAt ??
        null

      return {
        id: topicId,
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
      day: dayNumber,
      topics,
    }
  })
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
        const normalizedPlan = normalizeStoredPlan(
          data?.plan ?? [],
          data?.progress ?? {},
          storedRevisionMap,
        )

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

  const handleStatusChange = async (topicId, nextStatus) => {
    if (!user?.uid) {
      setSyncError('Please log in to update progress.')
      return
    }

    const nowIsoString = new Date().toISOString()
    let updatedPlan = []

    setStudyPlan((previousPlan) => {
      updatedPlan = previousPlan.map((dayEntry) => ({
        ...dayEntry,
        topics: dayEntry.topics.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                ...(() => {
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
                    return {
                      status: nextStatus,
                      startedAt,
                      completedAt: nowIsoString,
                      timeSpentMinutes:
                        previousMinutes + getMinutesBetween(startedAt, nowIsoString),
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
      const progressMap = buildProgressMap(updatedPlan)
      await updateProgress(user.uid, progressMap)
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

        const studiedTime = new Date(topic.lastStudiedAt).getTime()
        if (Number.isNaN(studiedTime)) {
          return false
        }

        return currentTimeMs - studiedTime >= thresholdMs
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

        const studiedTime = new Date(topic.lastStudiedAt).getTime()
        if (Number.isNaN(studiedTime)) {
          return false
        }

        return currentTimeMs - studiedTime >= thresholdMs
      })
  }, [studyPlan, currentTimeMs])

  return {
    studyPlan,
    isLoading,
    fetchError,
    syncError,
    isEmptyState,
    handleStatusChange,
    revisionDueCount,
    overdueTopics,
  }
}
