import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PatientSidebar from '../components/PatientSidebar'
import DashboardOverview from '../components/DashboardOverview'
import ProfileManagement from '../components/ProfileManagement'
import DoctorSearch from '../components/DoctorSearch'
import AppointmentManagement from '../components/AppointmentManagement'
import MedicalRecords from '../components/MedicalRecords'
import usePreventBackNavigation from '../hooks/usePreventBackNavigation'
import { getUserType, redirectToCorrectDashboard, validateUserAccess } from '../utils/navigationGuard'
import apiService from '../services/api'

const PatientDashboard = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated, loading, checkAuthStatus, logout } = useAuth()

  // Verify user is actually a patient and redirect if not
  useEffect(() => {
    // Only check if we're not loading and have checked authentication
    if (!loading) {
      const userType = getUserType();
      
      if (!validateUserAccess('patient', userType)) {
        console.warn(`🚫 Unauthorized access to patient dashboard by ${userType} user`);
        redirectToCorrectDashboard(navigate);
        return;
      }
    }
  }, [loading, navigate]);

  // Debug: Log user data to see profile picture status
  useEffect(() => {
    console.log('🔍 PatientDashboard user debug:', {
      user: user,
      hasProfilePicture: !!user?.profilePicture,
      profilePictureValue: user?.profilePicture,
      userFullData: JSON.stringify(user, null, 2)
    });
  }, [user]);

  // Prevent back navigation to dashboard after logout
  usePreventBackNavigation(!isAuthenticated, '/login')
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Handle Google OAuth token from URL
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      const handleTokenAuthentication = async () => {
        try {
          // Set token in apiService
          apiService.setToken(token)
          
          // Small delay to ensure token is properly persisted
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Trigger auth context to check the token
          await checkAuthStatus()
          
          // Clean up URL without refreshing
          window.history.replaceState({}, document.title, '/patient/dashboard')
        } catch (error) {
          console.error('❌ Error handling OAuth token:', error)
          // If there's an error with the token, redirect to login
          navigate('/login?error=invalid_token')
        }
      }
      
      handleTokenAuthentication()
    }
  }, [searchParams, navigate]) // Removed checkAuthStatus from dependencies

  // Redirect to login if not authenticated (but not while loading or if we just got a token)
  useEffect(() => {
    const hasToken = searchParams.get('token')
    const hasStoredToken = localStorage.getItem('token')

    // Don't redirect if we're still loading, just got a token, or are already authenticated
    if (!loading && !isAuthenticated && !hasToken && !hasStoredToken) {
      navigate('/login')
    }
  }, [loading, isAuthenticated, navigate, searchParams, user])

  // Prevent navigation back to auth pages when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Replace current history entry to prevent back navigation to auth pages
      window.history.replaceState(null, '', '/patient/dashboard')
    }
  }, [isAuthenticated, user])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-dental-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview user={user} />
      case 'profile':
        return <ProfileManagement user={user} />
      case 'doctors':
        return <DoctorSearch user={user} />
      case 'appointments':
        return <AppointmentManagement user={user} />
      case 'records':
        return <MedicalRecords user={user} />
      default:
        return <DashboardOverview user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <PatientSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />

      {/* Main content */}
      <div className="flex-1 lg:pl-64 min-h-screen overflow-y-auto">
        {/* Top navigation - Fixed */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-10 bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200/50">
          <div className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700 lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 ease-in-out"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent lg:ml-0 tracking-tight">
                Patient Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-5">
              {/* Notifications */}
              <button className="text-slate-400 hover:text-blue-600 relative p-2.5 rounded-xl hover:bg-blue-50 transition-all duration-200 ease-in-out transform hover:scale-105">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-lg animate-pulse"></span>
              </button>
              
              {/* User menu */}
              <div className="relative user-menu">
                <button
                  className="flex items-center text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-lg transition-all duration-200 ease-in-out p-1"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 overflow-hidden">
                    {user && user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'P'}
                      </span>
                    )}
                  </div>
                  <span className="ml-3 text-slate-700 hidden sm:block font-medium">
                    {user ? `${user.firstName} ${user.lastName}` : 'Patient'}
                  </span>
                  <svg className="ml-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">
                        {user ? `${user.firstName} ${user.lastName}` : 'Patient'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {user ? user.email : 'patient@example.com'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile')
                          setUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                      >
                        <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          // Close the user menu first
                          setUserMenuOpen(false)

                          // Clear browser history to prevent back navigation
                          window.history.pushState(null, '', '/login')
                          window.history.pushState(null, '', '/login')
                          window.history.pushState(null, '', '/login')

                          // Logout and clear all session data
                          logout()

                          // Force navigation to login with replace to prevent back navigation
                          navigate('/login', { replace: true })

                          // Additional security: reload the page to clear any cached state
                          setTimeout(() => {
                            window.location.replace('/login')
                          }, 100)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content - Added top padding to account for fixed header */}
        <main className="pt-24 pb-8">
          <div className="px-4 sm:px-6 lg:px-8 h-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 min-h-[calc(100vh-8rem)] transition-all duration-300">
              <div className="p-6 lg:p-8">
                {renderActiveComponent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PatientDashboard