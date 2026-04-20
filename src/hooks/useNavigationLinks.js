import { useMemo } from 'react'
import { useAuth } from '../context/AppContext'
import { getNavigationLinks } from '../services/navigationService'

export function useNavigationLinks() {
  const { isAuthenticated } = useAuth()

  return useMemo(
    () => getNavigationLinks(isAuthenticated),
    [isAuthenticated],
  )
}
