import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Prevent back navigation to protected pages when not authenticated
    const handlePopState = (event) => {
      if (requireAuth && !isAuthenticated) {
        // Push current state again to prevent going back
        window.history.pushState(null, '', location.pathname)
        // Redirect to login
        window.location.replace('/login')
      }
    }

    // Add event listener for browser back/forward buttons
    window.addEventListener('popstate', handlePopState)

    // Push current state to prevent back navigation
    if (requireAuth && isAuthenticated) {
      window.history.pushState(null, '', location.pathname)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isAuthenticated, requireAuth, location.pathname])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dental-primary"></div>
      </div>
    )
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If route requires no authentication (like login/register) and user is authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/patient/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
