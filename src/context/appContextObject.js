import { createContext } from 'react'

export const AppContext = createContext({
	user: null,
	isAuthenticated: false,
	isAuthLoading: true,
	authError: '',
	signup: async () => {},
	login: async () => {},
	logout: async () => {},
	clearAuthError: () => {},
})
