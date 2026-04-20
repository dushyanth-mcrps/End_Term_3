import { AppContext } from './appContextObject'

export function AppProvider({ children }) {
  return <AppContext.Provider value={null}>{children}</AppContext.Provider>
}
