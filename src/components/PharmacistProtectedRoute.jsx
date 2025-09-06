import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import pharmacistAPI from '../services/pharmacistAPI'
import toast from 'react-hot-toast'

const PharmacistProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = checking, true = authenticated, false = not authenticated
  const [isActive, setIsActive] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!pharmacistAPI.isAuthenticated()) {
          setIsAuthenticated(false)
          return
        }

        // Verify token with backend
        const response = await pharmacistAPI.getProfile()
        if (response.success) {
          setIsAuthenticated(true)
          setIsActive(response.data.pharmacist.availability === 'Active')
          
          if (response.data.pharmacist.availability !== 'Active') {
            toast.error('Your account has been deactivated. Please contact your administrator.')
            pharmacistAPI.logout()
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (error.response?.status === 401) {
          toast.error('Your session has expired. Please login again.')
        }
        pharmacistAPI.logout()
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [location.pathname])

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C33764] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login/pharmacist" state={{ from: location }} replace />
  }

  // Redirect to login if account is inactive
  if (isActive === false) {
    return <Navigate to="/login/pharmacist" state={{ from: location }} replace />
  }

  // Render protected content
  return children
}

export default PharmacistProtectedRoute
