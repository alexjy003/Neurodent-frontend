import React, { useState, useEffect } from 'react'
import apiService from '../services/api'

const DashboardOverview = ({ user }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedTreatments: 0,
      missedAppointments: 0
    },
    nextAppointment: null,
    recentActivity: [],
    loading: true
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      console.log('🔍 Loading dashboard data for patient:', user?._id)

      // Fetch appointments data
      const appointmentsResponse = await apiService.get('/appointments/my-appointments?limit=50')
      console.log('📅 Dashboard appointments response:', appointmentsResponse)
      
      let appointments = []
      let nextAppointment = null
      let stats = {
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedTreatments: 0,
        missedAppointments: 0
      }

      if (appointmentsResponse && appointmentsResponse.success && appointmentsResponse.appointments) {
        appointments = appointmentsResponse.appointments
        stats.totalAppointments = appointments.length

        // Get current date for comparison
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        // Calculate stats and find next appointment
        appointments.forEach(apt => {
          const aptDate = new Date(apt.appointmentDate)
          aptDate.setHours(0, 0, 0, 0)

          if (apt.status === 'completed') {
            stats.completedTreatments++
          } else if (apt.status === 'cancelled') {
            stats.missedAppointments++
          } else if (aptDate >= now) {
            stats.upcomingAppointments++
            // Find the earliest upcoming appointment
            if (!nextAppointment || aptDate < new Date(nextAppointment.appointmentDate)) {
              nextAppointment = apt
            }
          }
        })

        console.log('📊 Calculated stats:', stats)
        console.log('📅 Next appointment:', nextAppointment)
      }

      // Create recent activity from appointments
      const recentActivity = appointments
        .filter(apt => apt.status === 'completed' || apt.status === 'confirmed')
        .slice(0, 3)
        .map(apt => ({
          date: formatDateForActivity(apt.appointmentDate),
          action: `Appointment ${apt.status === 'completed' ? 'completed' : 'booked'} with ${apt.doctorName || 'Doctor'}`,
          type: apt.status
        }))

      // Add some generic recent activity if we don't have enough
      if (recentActivity.length < 3) {
        recentActivity.push(
          { date: formatDateForActivity(new Date()), action: 'Medical records updated', type: 'update' }
        )
      }

      setDashboardData({
        stats,
        nextAppointment,
        recentActivity,
        loading: false
      })

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
      // Set default values on error
      setDashboardData({
        stats: {
          totalAppointments: 0,
          upcomingAppointments: 0,
          completedTreatments: 0,
          missedAppointments: 0
        },
        nextAppointment: null,
        recentActivity: [
          { date: formatDateForActivity(new Date()), action: 'Medical records updated', type: 'update' }
        ],
        loading: false
      })
    }
  }

  const formatDateForActivity = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (dashboardData.loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-3">Loading your dashboard...</h2>
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3">Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Patient'}! 👋</h2>
          <p className="text-blue-100 text-lg">Managing your dental health has never been easier.</p>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.upcomingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.completedTreatments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600">Missed</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.missedAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Appointment */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Next Appointment</h3>
              {dashboardData.nextAppointment && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-sm">
                  ✓ Confirmed
                </span>
              )}
            </div>
            
            {dashboardData.nextAppointment ? (
              <div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                    {formatAppointmentDate(dashboardData.nextAppointment.appointmentDate)} at {dashboardData.nextAppointment.timeRange || '10:00 AM'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {dashboardData.nextAppointment.doctorName || 'Doctor'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {dashboardData.nextAppointment.slotType || 'General Appointment'}
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    View Details
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Reschedule
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <button className="bg-dental-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-dental-accent transition-colors duration-200">
                  Book Appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-5">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200">
                  <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 shadow-sm ${
                    activity.type === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    activity.type === 'confirmed' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                    'bg-gradient-to-r from-purple-500 to-pink-600'
                  }`}></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors duration-200 flex items-center">
                View all activity 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview