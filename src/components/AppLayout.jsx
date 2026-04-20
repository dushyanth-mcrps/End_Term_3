import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useNavigationLinks } from '../hooks/useNavigationLinks'
import { APP_NAME } from '../utils/constants'
import { useAuth } from '../context/useAuth'

function AppLayout() {
  const links = useNavigationLinks()
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch {
      // Auth errors are surfaced through context state.
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        links={links}
        brandName={APP_NAME}
        userEmail={user?.email ?? ''}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
