import React, { useEffect } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requireAuth = true }) => {
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
    // Determine the correct dashboard based on user type
    const adminAuth = localStorage.getItem('adminAuth');
    const doctorToken = localStorage.getItem('doctorToken');
    const pharmacistToken = localStorage.getItem('pharmacistToken');
    
    if (adminAuth) {
      return <Navigate to="/admin/dashboard" replace />
    } else if (doctorToken) {
      return <Navigate to="/doctor/dashboard" replace />
    } else if (pharmacistToken) {
      return <Navigate to="/pharmacist/dashboard" replace />
    } else {
      return <Navigate to="/patient/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
