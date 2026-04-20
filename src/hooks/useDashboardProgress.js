import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AppContext'
import { getStudyPlan, updateProgress } from '../services/studyPlanService'

const DEFAULT_STATUS = 'Not Started'

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
  const { user, isAuthLoading } = useAuth()
  const [studyPlan, setStudyPlan] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [syncError, setSyncError] = useState('')

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
  }, [user?.uid, isAuthLoading])

  const handleStatusChange = async (topicId, nextStatus) => {
    if (!user?.uid) {
      setSyncError('Please log in to update progress.')
      return
    }

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

  return {
    studyPlan,
    isLoading,
    fetchError,
    syncError,
    isEmptyState,
    handleStatusChange,
  }
}
