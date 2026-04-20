export function getNavigationLinks(isAuthenticated) {
  const baseLinks = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
  ]

  if (isAuthenticated) {
    baseLinks.push({ label: 'Vault', path: '/vault' })
  }

  if (!isAuthenticated) {
    baseLinks.push({ label: 'Login', path: '/login' })
  }

  return baseLinks
}
