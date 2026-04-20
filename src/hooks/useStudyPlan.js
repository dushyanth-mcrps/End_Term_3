import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AppContext'
import { generateStudyPlan } from '../services/aiService'
import { getStudyPlan, saveStudyPlan } from '../services/studyPlanService'

export function useStudyPlan() {
  const { user, isAuthLoading } = useAuth()
  const [studyPlan, setStudyPlan] = useState([])
  const [isFetchingPlan, setIsFetchingPlan] = useState(true)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [hasLoadedPlan, setHasLoadedPlan] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadStudyPlan = async () => {
      if (isAuthLoading) {
        return
      }

      if (!user?.uid) {
        setStudyPlan([])
        setFetchError('')
        setHasLoadedPlan(true)
        setIsFetchingPlan(false)
        return
      }

      setIsFetchingPlan(true)
      setFetchError('')

      try {
        const studyPlanData = await getStudyPlan(user.uid)

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
  }, [user?.uid, isAuthLoading])

  const generateAndSavePlan = async ({ goal, timeframe }) => {
    setIsGeneratingPlan(true)
    setSaveError('')

    try {
      if (!user?.uid) {
        throw new Error('Please log in to generate and save a study plan.')
      }

      const generatedPlan = await generateStudyPlan(goal, timeframe)

      await saveStudyPlan(user.uid, generatedPlan)
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
