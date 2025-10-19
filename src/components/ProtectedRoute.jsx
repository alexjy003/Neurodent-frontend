import React, { useEffect } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getCorrectDashboardRoute, getUserType, isAuthorizedForRoute } from '../utils/navigationGuard'

const ProtectedRoute = ({ children, requireAuth = true, userType = null }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Prevent back navigation to protected pages when not authenticated
    const handlePopState = (event) => {
      if (requireAuth && !isAuthenticated && !loading) {
        console.log('🚫 Preventing back navigation to protected route')
        // Prevent the default back navigation
        event.preventDefault()

        // Push current state again to prevent going back
        window.history.pushState(null, '', '/login')
        window.history.pushState(null, '', '/login')

        // Force redirect to login
        window.location.replace('/login')
      }
    }

    // Handle page visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && requireAuth && !isAuthenticated && !loading) {
        console.log('🚫 Page became visible but user not authenticated, redirecting...')
        window.location.replace('/login')
      }
    }

    // Only add listeners when not loading
    if (!loading) {
      // Add event listener for browser back/forward buttons
      window.addEventListener('popstate', handlePopState)
      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Push current state to prevent back navigation when authenticated
      if (requireAuth && isAuthenticated) {
        window.history.pushState(null, '', location.pathname)
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, requireAuth, location.pathname, loading])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dental-primary"></div>
      </div>
    )
  }

  // Check if there's a token in the URL (for OAuth redirects)
  const urlToken = searchParams.get('token')

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Allow access if there's a token in the URL (OAuth redirect)
    if (urlToken) {
      console.log('🔑 ProtectedRoute: Token found in URL, allowing access to process authentication')
      return children
    }
    return <Navigate to="/login" replace />
  }

  // If route requires no authentication (like login/register) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    // Use the utility to determine the correct dashboard
    const dashboardRoute = getCorrectDashboardRoute();
    console.log('🔄 User already authenticated, redirecting to:', dashboardRoute);
    return <Navigate to={dashboardRoute} replace />
  }

  // If route requires authentication and user is authenticated
  if (requireAuth && isAuthenticated) {
    const currentUserType = getUserType();
    
    // If this is a patient dashboard route, verify user is actually a patient
    if (location.pathname.startsWith('/patient') && currentUserType !== 'patient') {
      console.log(`🚫 Non-patient user (${currentUserType}) attempting to access patient dashboard, redirecting...`);
      const correctRoute = getCorrectDashboardRoute(currentUserType);
      return <Navigate to={correctRoute} replace />
    }
    
    // General authorization check for the current route
    if (!isAuthorizedForRoute(location.pathname, currentUserType)) {
      console.log(`🚫 User type ${currentUserType} not authorized for route ${location.pathname}`);
      const correctRoute = getCorrectDashboardRoute(currentUserType);
      return <Navigate to={correctRoute} replace />
    }
  }

  return children
}

export default ProtectedRoute
