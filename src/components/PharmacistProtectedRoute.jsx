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
        // Check for pharmacist token and data directly from localStorage
        const pharmacistToken = localStorage.getItem('pharmacistToken');
        const pharmacistData = localStorage.getItem('pharmacistData');
        
        if (!pharmacistToken || !pharmacistData) {
          console.log('🔍 PharmacistProtectedRoute: No token or data found');
          setIsAuthenticated(false);
          return;
        }

        console.log('🔍 PharmacistProtectedRoute: Token and data found, verifying...');
        
        // Use the universal verify endpoint instead of pharmacist-specific one
        try {
          const response = await fetch('http://localhost:5000/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${pharmacistToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          const data = await response.json();
          console.log('🔍 PharmacistProtectedRoute: Verification response:', data);
          
          if (response.ok && data.valid && data.user && data.user.userType === 'pharmacist') {
            console.log('✅ PharmacistProtectedRoute: Authentication successful');
            setIsAuthenticated(true);
            // If the backend returned the user, they're already active (backend filters inactive users)
            setIsActive(true);
          } else {
            console.log('❌ PharmacistProtectedRoute: Verification failed:', data);
            setIsAuthenticated(false);
          }
        } catch (fetchError) {
          console.error('❌ PharmacistProtectedRoute: Fetch error:', fetchError);
          setIsAuthenticated(false);
        }
        
      } catch (error) {
        console.error('❌ PharmacistProtectedRoute: Auth check failed:', error);
        // Clear pharmacist data on error
        localStorage.removeItem('pharmacistToken');
        localStorage.removeItem('pharmacistData');
        setIsAuthenticated(false);
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
