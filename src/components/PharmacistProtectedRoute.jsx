import React from 'react'
import { Navigate } from 'react-router-dom'

const PharmacistProtectedRoute = ({ children }) => {
  // For now, we'll use a simple check. In a real app, this would check for pharmacist authentication
  const isPharmacistAuthenticated = localStorage.getItem('pharmacistToken') || 
                                   localStorage.getItem('userRole') === 'pharmacist' ||
                                   true // For demo purposes, always allow access

  if (!isPharmacistAuthenticated) {
    return <Navigate to="/login/pharmacist" replace />
  }

  return children
}

export default PharmacistProtectedRoute
