import { useMemo } from 'react'
import { useAuth } from '../context/useAuth'
import { getNavigationLinks } from '../services/navigationService'

export function useNavigationLinks() {
  const { isAuthenticated } = useAuth()

  return useMemo(
    () => getNavigationLinks(isAuthenticated),
    [isAuthenticated],
  )
}
