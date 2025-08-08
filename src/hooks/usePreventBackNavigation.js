import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const usePreventBackNavigation = (shouldPrevent = true, redirectTo = '/login') => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!shouldPrevent) return

    // Push a dummy state to prevent back navigation
    const pushDummyState = () => {
      window.history.pushState(null, '', location.pathname)
    }

    // Handle browser back/forward button
    const handlePopState = (event) => {
      if (shouldPrevent) {
        // Prevent the back navigation
        event.preventDefault()
        
        // Push the current state again
        window.history.pushState(null, '', location.pathname)
        
        // Optionally redirect to a specific page
        if (redirectTo) {
          navigate(redirectTo, { replace: true })
        }
      }
    }

    // Handle page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldPrevent) {
        pushDummyState()
      }
    }

    // Handle beforeunload to prevent navigation
    const handleBeforeUnload = (event) => {
      if (shouldPrevent) {
        pushDummyState()
      }
    }

    // Initial setup
    pushDummyState()

    // Add event listeners
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [shouldPrevent, redirectTo, navigate, location.pathname])
}

export default usePreventBackNavigation
