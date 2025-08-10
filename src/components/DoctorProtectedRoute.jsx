import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

const DoctorProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('doctorToken')
      const doctorInfo = localStorage.getItem('doctorInfo')
      
      if (token && doctorInfo) {
        try {
          // Verify the doctor info can be parsed
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
    return <Navigate to="/doctor/login" replace />
  }

  return children
}

export default DoctorProtectedRoute
