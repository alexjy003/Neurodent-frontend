import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

const DoctorProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('doctorToken')
      const doctorInfo = localStorage.getItem('doctorInfo')
      
      // First check if we have a token
      if (token) {
        // If we have doctorInfo, try to parse it
        if (doctorInfo) {
          try {
            JSON.parse(doctorInfo)
            setIsAuthenticated(true)
          } catch (error) {
            console.error('Error parsing doctor info:', error)
            // Clear invalid data
            localStorage.removeItem('doctorToken')
            localStorage.removeItem('doctorInfo')
            setIsAuthenticated(false)
          }
        } else {
          // If we have token but no doctorInfo yet, wait a moment for it to be set
          setTimeout(() => {
            const doctorInfo = localStorage.getItem('doctorInfo')
            if (doctorInfo) {
              try {
                JSON.parse(doctorInfo)
                setIsAuthenticated(true)
              } catch (error) {
                console.error('Error parsing doctor info:', error)
                setIsAuthenticated(false)
              }
            } else {
              setIsAuthenticated(true) // Allow access with just token for now
            }
          }, 100)
          return // Don't set loading false yet
        }
      } else {
        setIsAuthenticated(false)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default DoctorProtectedRoute
