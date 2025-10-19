// Route-level protection utility for user type validation

import React from 'react'
import { Navigate } from 'react-router-dom'
import { getUserType, getCorrectDashboardRoute } from './navigationGuard'

/**
 * Route protector that ensures only specific user types can access certain routes
 * @param {string} allowedUserType - The user type allowed for this route
 * @param {React.Component} children - The component to render if authorized
 * @returns {React.Component} - Either the protected component or a redirect
 */
export const UserTypeProtectedRoute = ({ allowedUserType, children }) => {
  const currentUserType = getUserType()
  
  // If no user is logged in, redirect to login
  if (!currentUserType) {
    console.log('🚫 No user type detected, redirecting to login')
    return <Navigate to="/login" replace />
  }
  
  // If user type doesn't match allowed type, redirect to correct dashboard
  if (currentUserType !== allowedUserType) {
    console.warn(`🚫 User type ${currentUserType} attempted to access ${allowedUserType} route`)
    const correctRoute = getCorrectDashboardRoute(currentUserType)
    return <Navigate to={correctRoute} replace />
  }
  
  // User is authorized, render the protected component
  return children
}

/**
 * Higher-order component that wraps dashboard routes with user type protection
 */
export const withUserTypeProtection = (allowedUserType) => {
  return (Component) => {
    return (props) => (
      <UserTypeProtectedRoute allowedUserType={allowedUserType}>
        <Component {...props} />
      </UserTypeProtectedRoute>
    )
  }
}

/**
 * Validates if the current route matches the user's authorized routes
 * @param {string} pathname - Current route path
 * @returns {boolean} - Whether the user is authorized for this route
 */
export const validateRouteAccess = (pathname) => {
  const userType = getUserType()
  
  if (!userType) return false
  
  // Define route patterns for each user type
  const routePatterns = {
    admin: /^\/admin/,
    doctor: /^\/doctor/,
    pharmacist: /^\/pharmacist/,
    patient: /^\/patient/
  }
  
  const allowedPattern = routePatterns[userType]
  
  if (!allowedPattern) {
    console.warn(`Unknown user type: ${userType}`)
    return false
  }
  
  return allowedPattern.test(pathname)
}

/**
 * React hook for route protection in components
 * @param {string} requiredUserType - Required user type for the current component
 * @returns {object} - Object with authorization status and redirect function
 */
export const useRouteProtection = (requiredUserType) => {
  const currentUserType = getUserType()
  const isAuthorized = currentUserType === requiredUserType
  
  const redirectToCorrectDashboard = () => {
    if (currentUserType) {
      const correctRoute = getCorrectDashboardRoute(currentUserType)
      window.location.replace(correctRoute)
    } else {
      window.location.replace('/login')
    }
  }
  
  return {
    isAuthorized,
    currentUserType,
    redirectToCorrectDashboard
  }
}

export default UserTypeProtectedRoute