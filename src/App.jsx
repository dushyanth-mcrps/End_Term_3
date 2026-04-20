import { RouterProvider } from 'react-router-dom'
import { appRouter } from './services/router'

function App() {
  return <RouterProvider router={appRouter} />
}

export default App
