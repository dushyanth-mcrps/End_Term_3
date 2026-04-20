import { createBrowserRouter } from 'react-router-dom'
import { createElement } from 'react'
import AppLayout from '../components/AppLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import VaultPage from '../pages/VaultPage'
import LoginPage from '../pages/LoginPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: createElement(AppLayout),
    children: [
      { index: true, element: createElement(HomePage) },
      {
        path: 'dashboard',
        element: createElement(
          ProtectedRoute,
          null,
          createElement(DashboardPage),
        ),
      },
      {
        path: 'vault',
        element: createElement(
          ProtectedRoute,
          null,
          createElement(VaultPage),
        ),
      },
      { path: 'login', element: createElement(LoginPage) },
    ],
  },
])
