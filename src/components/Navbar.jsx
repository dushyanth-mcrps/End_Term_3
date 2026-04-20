import { NavLink } from 'react-router-dom'

function Navbar({ links, brandName, userEmail, onLogout, isLoggingOut }) {
  const getNavLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
    }`

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-slate-900">{brandName}</span>
        <div className="flex items-center gap-2">
          {links.map((link) => (
            <NavLink key={link.path} to={link.path} className={getNavLinkClass}>
              {link.label}
            </NavLink>
          ))}

          {userEmail ? (
            <>
              <span className="hidden text-xs text-slate-500 sm:inline">{userEmail}</span>
              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
