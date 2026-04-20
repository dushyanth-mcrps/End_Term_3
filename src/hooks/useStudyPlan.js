import { useEffect, useMemo, useState } from 'react'
import { auth } from '../services/firebase'
import { generateStudyPlan } from '../services/aiService'
import { getStudyPlan, saveStudyPlan } from '../services/studyPlanService'

const FALLBACK_USER_ID = 'demo-user'

function resolveUserId() {
  return auth.currentUser?.uid ?? FALLBACK_USER_ID
}

export function useStudyPlan() {
  const [studyPlan, setStudyPlan] = useState([])
  const [isFetchingPlan, setIsFetchingPlan] = useState(true)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [hasLoadedPlan, setHasLoadedPlan] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadStudyPlan = async () => {
      setIsFetchingPlan(true)
      setFetchError('')

      try {
        const userId = resolveUserId()
        const studyPlanData = await getStudyPlan(userId)

        if (!isCancelled) {
          setStudyPlan(studyPlanData?.plan ?? [])
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error instanceof Error ? error.message : 'Failed to fetch study plan.'
          setFetchError(message)
        }
      } finally {
        if (!isCancelled) {
          setHasLoadedPlan(true)
          setIsFetchingPlan(false)
        }
      }
    }

    loadStudyPlan()

    return () => {
      isCancelled = true
    }
  }, [])

  const generateAndSavePlan = async ({ goal, timeframe }) => {
    setIsGeneratingPlan(true)
    setSaveError('')

    try {
      const generatedPlan = await generateStudyPlan(goal, timeframe)
      const userId = resolveUserId()

      await saveStudyPlan(userId, generatedPlan)
      setStudyPlan(generatedPlan)

      return generatedPlan
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate study plan.'
      setSaveError(message)
      throw error
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const isEmptyState = useMemo(
    () => hasLoadedPlan && !isFetchingPlan && studyPlan.length === 0,
    [hasLoadedPlan, isFetchingPlan, studyPlan.length],
  )

  return {
    studyPlan,
    isFetchingPlan,
    isGeneratingPlan,
    fetchError,
    saveError,
    isEmptyState,
    generateAndSavePlan,
  }
}
