// Navigation guard utilities to prevent unauthorized back navigation

export const preventBackNavigation = () => {
  // Push multiple states to make it harder to go back
  window.history.pushState(null, '', window.location.pathname)
  window.history.pushState(null, '', window.location.pathname)
  window.history.pushState(null, '', window.location.pathname)
}

export const setupNavigationGuard = (isAuthenticated, redirectTo = '/login') => {
  const handlePopState = (event) => {
    if (!isAuthenticated) {
      // Prevent back navigation
      event.preventDefault()
      
      // Push states again
      preventBackNavigation()
      
      // Force redirect
      window.location.replace(redirectTo)
    }
  }

  const handleBeforeUnload = (event) => {
    if (!isAuthenticated) {
      preventBackNavigation()
    }
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !isAuthenticated) {
      preventBackNavigation()
      window.location.replace(redirectTo)
    }
  }

  // Add event listeners
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Initial setup
  if (!isAuthenticated) {
    preventBackNavigation()
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

export const clearBrowserHistory = () => {
  // Clear browser history by replacing current state multiple times
  window.history.replaceState(null, '', '/login')
  window.history.pushState(null, '', '/login')
  window.history.pushState(null, '', '/login')
  window.history.back()
  
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name)
      })
    })
  }
}
