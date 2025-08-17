import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const usePreventBackNavigation = (shouldPrevent = true, redirectTo = '/login') => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!shouldPrevent) {
      console.log('🔓 Back navigation allowed')
      return
    }

    console.log('🔒 Setting up back navigation prevention')

    // Push a dummy state to prevent back navigation
    const pushDummyState = () => {
      window.history.pushState(null, '', redirectTo)
    }

    // Handle browser back/forward button
    const handlePopState = (event) => {
      if (shouldPrevent) {
        console.log('🚫 Preventing back navigation, redirecting to:', redirectTo)

        // Prevent the back navigation
        event.preventDefault()

        // Push multiple states to make it harder to go back
        window.history.pushState(null, '', redirectTo)
        window.history.pushState(null, '', redirectTo)

        // Force redirect to the specified page
        if (redirectTo) {
          window.location.replace(redirectTo)
        }
      }
    }

    // Handle page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && shouldPrevent) {
        console.log('👁️ Page became visible, checking navigation prevention')
        pushDummyState()
        // If user shouldn't be here, redirect them
        if (redirectTo && window.location.pathname !== redirectTo) {
          window.location.replace(redirectTo)
        }
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
      console.log('🧹 Cleaning up navigation prevention')
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [shouldPrevent, redirectTo, navigate, location.pathname])
}

export default usePreventBackNavigation
