import React, { useState, useEffect } from 'react'
import { universalLogout } from '../../utils/universalLogout'
import { getUserType, redirectToCorrectDashboard } from '../../utils/navigationGuard'
import {
  Home,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  Clock,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const DoctorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [doctor, setDoctor] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: Home },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'Patient Records', href: '/doctor/patient-records', icon: Users },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
    { name: 'Schedule', href: '/doctor/schedule', icon: Clock },
    { name: 'Profile Settings', href: '/doctor/settings', icon: Settings },
  ]

  const isActive = (href) => location.pathname === href

  // Load doctor data from localStorage
  useEffect(() => {
    // Verify user is actually a doctor
    const userType = getUserType();
    if (userType && userType !== 'doctor') {
      console.warn(`🚫 Unauthorized access to doctor dashboard by ${userType} user`);
      redirectToCorrectDashboard(navigate);
      return;
    }

    const doctorInfo = localStorage.getItem('doctorInfo')
    if (doctorInfo) {
      try {
        const parsedDoctor = JSON.parse(doctorInfo)
        setDoctor(parsedDoctor)
      } catch (error) {
        console.error('Error parsing doctor info:', error)
      }
    }
  }, [])

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        setDoctor(event.detail)
      }
    }

    // Listen for custom profile update event
    window.addEventListener('doctorProfileUpdated', handleProfileUpdate)

    // Also listen for storage events (in case updated from another tab)
    const handleStorageChange = () => {
      const doctorInfo = localStorage.getItem('doctorInfo')
      if (doctorInfo) {
        try {
          const parsedDoctor = JSON.parse(doctorInfo)
          setDoctor(parsedDoctor)
        } catch (error) {
          console.error('Error parsing doctor info:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('doctorProfileUpdated', handleProfileUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    // Use universal logout for comprehensive cleanup including form clearing
    universalLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:flex lg:flex-col lg:w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Neurodent
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-400'
                  }`} />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Doctor Profile Card in Sidebar */}
        <div className="p-3 mt-auto">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3">
              {doctor?.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {doctor ? doctor.specialization : 'Dentistry'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:fixed lg:top-0 lg:right-0 lg:left-64 lg:z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigationItems.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {doctor?.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      Dr. {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doctor'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {doctor ? doctor.specialization : 'Dentistry'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/doctor/settings')
                        setProfileDropdownOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto lg:pt-16">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DoctorLayout
