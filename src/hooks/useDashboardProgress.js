import { useEffect, useMemo, useState } from 'react'
import { auth } from '../services/firebase'
import { getStudyPlan, updateProgress } from '../services/studyPlanService'

const FALLBACK_USER_ID = 'demo-user'
const DEFAULT_STATUS = 'Not Started'

function resolveUserId() {
  return auth.currentUser?.uid ?? FALLBACK_USER_ID
}

function normalizeStoredPlan(plan = [], progress = {}) {
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
      const status = progress[topicId] ?? statusFromPlan ?? DEFAULT_STATUS

      return {
        id: topicId,
        title,
        status,
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
      accumulator[topic.id] = topic.status
    })

    return accumulator
  }, {})
}

export function useDashboardProgress() {
  const [studyPlan, setStudyPlan] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    let isCancelled = false

    const fetchPlan = async () => {
      setIsLoading(true)
      setFetchError('')

      try {
        const userId = resolveUserId()
        const data = await getStudyPlan(userId)
        const normalizedPlan = normalizeStoredPlan(data?.plan ?? [], data?.progress ?? {})

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
  }, [])

  const handleStatusChange = async (topicId, nextStatus) => {
    const userId = resolveUserId()
    let updatedPlan = []

    setStudyPlan((previousPlan) => {
      updatedPlan = previousPlan.map((dayEntry) => ({
        ...dayEntry,
        topics: dayEntry.topics.map((topic) =>
          topic.id === topicId ? { ...topic, status: nextStatus } : topic,
        ),
      }))

      return updatedPlan
    })

    setSyncError('')

    try {
      const progressMap = buildProgressMap(updatedPlan)
      await updateProgress(userId, progressMap)
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

  return {
    studyPlan,
    isLoading,
    fetchError,
    syncError,
    isEmptyState,
    handleStatusChange,
  }
}
