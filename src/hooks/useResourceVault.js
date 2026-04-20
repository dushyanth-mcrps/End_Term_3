import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { suggestResources } from '../services/aiService'
import {
  addResource,
  editResource,
  getResources,
  removeResource,
} from '../services/resourceService'

export function useResourceVault() {
  const { user, isAuthLoading } = useAuth()
  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState({ youtube: [], docs: [] })
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState('')
  const [suggestionTopic, setSuggestionTopic] = useState('')

  useEffect(() => {
    let isCancelled = false

    const fetchResources = async () => {
      if (isAuthLoading) {
        return
      }

      if (!user?.uid) {
        setResources([])
        setError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const fetchedResources = await getResources(user.uid)

        if (!isCancelled) {
          setResources(fetchedResources)
        }
      } catch (fetchError) {
        if (!isCancelled) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : 'Failed to fetch resources.'
          setError(message)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchResources()

    return () => {
      isCancelled = true
    }
  }, [user?.uid, isAuthLoading])

  const requestSuggestions = async (topic) => {
    const normalizedTopic = String(topic ?? '').trim()

    if (!normalizedTopic) {
      setSuggestionsError('Enter a topic to get AI suggestions.')
      setAiSuggestions({ youtube: [], docs: [] })
      return false
    }

    try {
      setIsSuggestionsLoading(true)
      setSuggestionsError('')
      setSuggestionTopic(normalizedTopic)

      const suggestions = await suggestResources(normalizedTopic)
      setAiSuggestions(suggestions)
      return true
    } catch (suggestionError) {
      const message =
        suggestionError instanceof Error
          ? suggestionError.message
          : 'Failed to load AI resource suggestions.'
      setSuggestionsError(message)
      setAiSuggestions({ youtube: [], docs: [] })
      return false
    } finally {
      setIsSuggestionsLoading(false)
    }
  }

  const createResource = async (resource) => {
    try {
      setError('')

      if (!user?.uid) {
        throw new Error('Please log in to add resources.')
      }

      const resourceId = await addResource(user.uid, resource)

      const optimisticResource = {
        id: resourceId,
        ...resource,
      }

      setResources((prevResources) => [optimisticResource, ...prevResources])
      return true
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : 'Failed to add resource.'
      setError(message)
      return false
    }
  }

  const updateResource = async (resourceId, updates) => {
    try {
      setError('')

      if (!user?.uid) {
        throw new Error('Please log in to update resources.')
      }

      await editResource(user.uid, resourceId, updates)

      setResources((prevResources) =>
        prevResources.map((resource) =>
          resource.id === resourceId ? { ...resource, ...updates } : resource,
        ),
      )
      return true
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update resource.'
      setError(message)
      return false
    }
  }

  const deleteResource = async (resourceId) => {
    try {
      setError('')

      if (!user?.uid) {
        throw new Error('Please log in to delete resources.')
      }

      await removeResource(user.uid, resourceId)
      setResources((prevResources) =>
        prevResources.filter((resource) => resource.id !== resourceId),
      )
      return true
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete resource.'
      setError(message)
      return false
    }
  }

  return {
    resources,
    isLoading,
    error,
    aiSuggestions,
    isSuggestionsLoading,
    suggestionsError,
    suggestionTopic,
    createResource,
    updateResource,
    deleteResource,
    requestSuggestions,
  }
}
