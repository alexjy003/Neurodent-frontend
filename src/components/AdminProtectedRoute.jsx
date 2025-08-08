import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isAdminAuthenticated, adminLogout, clearAdminAuth } from '../utils/adminAuth'

const AdminProtectedRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check admin authentication status
    const checkAuth = () => {
      const authStatus = isAdminAuthenticated()
      setAuthenticated(authStatus)
      setLoading(false)

      if (!authStatus) {
        // If not authenticated, force logout
        adminLogout()
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Only setup guards when authenticated and not loading
    if (!loading && authenticated) {
      // Simple navigation guard that only prevents access to admin pages when not authenticated
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && !isAdminAuthenticated()) {
          // Only redirect if we're on an admin page
          if (location.pathname.startsWith('/admin')) {
            adminLogout()
          }
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [authenticated, loading, location.pathname])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // If admin is not authenticated, redirect to admin login
  if (!authenticated) {
    return <Navigate to="/login/admin" replace />
  }

  return children
}

export default AdminProtectedRoute