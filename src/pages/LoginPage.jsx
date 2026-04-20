import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const initialFormState = {
  email: '',
  password: '',
  confirmPassword: '',
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, authError, login, signup, logout, clearAuthError } = useAuth()
  const [mode, setMode] = useState('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState(initialFormState)
  const [validationError, setValidationError] = useState('')
  const redirectTo = location.state?.from?.pathname ?? '/dashboard'

  const handleModeChange = (nextMode) => {
    setMode(nextMode)
    setValidationError('')
    clearAuthError()
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormValues((previous) => ({ ...previous, [name]: value }))
    setValidationError('')
    clearAuthError()
  }

  const validateForm = () => {
    const email = formValues.email.trim()
    const password = formValues.password.trim()

    if (!email || !password) {
      setValidationError('Email and password are required.')
      return false
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters.')
        return false
      }

      if (password !== formValues.confirmPassword.trim()) {
        setValidationError('Passwords do not match.')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const payload = {
      email: formValues.email.trim(),
      password: formValues.password.trim(),
    }

    try {
      setIsSubmitting(true)

      if (mode === 'signup') {
        await signup(payload)
      } else {
        await login(payload)
      }

      setFormValues(initialFormState)
      navigate(redirectTo, { replace: true })
    } catch {
      // Auth errors are surfaced via context state.
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      setIsSubmitting(true)
      await logout()
    } catch {
      // Auth errors are surfaced via context state.
    } finally {
      setIsSubmitting(false)
    }
  }

  if (user) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Authentication</h1>
        <p className="mt-2 text-slate-600">Signed in as {user.email}</p>
        {authError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authError}
          </p>
        ) : null}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Go to Dashboard
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Authentication</h1>
      <p className="mt-2 text-slate-600">
        Sign up or log in to access your personal dashboard and saved study plans.
      </p>

      <div className="mt-4 inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => handleModeChange('login')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('signup')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {mode === 'signup' ? (
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formValues.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        ) : null}

        {validationError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {validationError}
          </p>
        ) : null}

        {authError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {authError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === 'signup'
              ? 'Creating account...'
              : 'Logging in...'
            : mode === 'signup'
              ? 'Create Account'
              : 'Login'}
        </button>
      </form>
    </section>
  )
}

export default LoginPage
