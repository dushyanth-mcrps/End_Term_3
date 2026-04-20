import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useNavigationLinks } from '../hooks/useNavigationLinks'
import { APP_NAME } from '../utils/constants'

function AppLayout() {
  const links = useNavigationLinks()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar links={links} brandName={APP_NAME} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
