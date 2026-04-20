import { useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { loginUser, logoutUser, signupUser } from '../services/authService'
import { AppContext } from './appContextObject'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsAuthLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signup = async (credentials) => {
    try {
      setAuthError('')
      return await signupUser(credentials)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed.'
      setAuthError(message)
      throw error
    }
  }

  const login = async (credentials) => {
    try {
      setAuthError('')
      return await loginUser(credentials)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      setAuthError(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      setAuthError('')
      await logoutUser()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed.'
      setAuthError(message)
      throw error
    }
  }

  const clearAuthError = () => setAuthError('')

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      authError,
      signup,
      login,
      logout,
      clearAuthError,
    }),
    [user, isAuthLoading, authError],
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export function useAuth() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAuth must be used within an AppProvider.')
  }

  return context
}
