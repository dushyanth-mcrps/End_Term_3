import { createBrowserRouter } from 'react-router-dom'
import { createElement } from 'react'
import AppLayout from '../components/AppLayout'
import HomePage from '../pages/HomePage'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: createElement(AppLayout),
    children: [
      { index: true, element: createElement(HomePage) },
      { path: 'dashboard', element: createElement(DashboardPage) },
      { path: 'login', element: createElement(LoginPage) },
    ],
  },
])
