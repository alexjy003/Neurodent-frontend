import React from 'react'

const DashboardOverview = ({ user }) => {
  // Use real user data or fallback to mock data
  const patientData = {
    name: user ? `${user.firstName} ${user.lastName}` : 'Patient',
    nextAppointment: {
      date: '2024-01-15',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      type: 'Regular Checkup'
    },
    recentActivity: [
      { date: '2024-01-10', action: 'Appointment booked with Dr. Sarah Johnson' },
      { date: '2024-01-08', action: 'Prescription received for teeth cleaning' },
      { date: '2024-01-05', action: 'Medical records updated' }
    ],
    stats: {
      totalAppointments: 12,
      upcomingAppointments: 2,
      completedTreatments: 8,
      missedAppointments: 1
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3">Welcome back, {patientData.name}! 👋</h2>
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
              <p className="text-3xl font-bold text-gray-900">{patientData.stats.totalAppointments}</p>
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
              <p className="text-3xl font-bold text-gray-900">{patientData.stats.upcomingAppointments}</p>
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
              <p className="text-3xl font-bold text-gray-900">{patientData.stats.completedTreatments}</p>
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
              <p className="text-3xl font-bold text-gray-900">{patientData.stats.missedAppointments}</p>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-sm">
                ✓ Confirmed
              </span>
            </div>
            
            {patientData.nextAppointment ? (
              <div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                    {patientData.nextAppointment.date} at {patientData.nextAppointment.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {patientData.nextAppointment.doctor}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {patientData.nextAppointment.type}
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
              {patientData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-200">
                  <div className="flex-shrink-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 shadow-sm"></div>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <button className="group flex flex-col items-center p-6 border-2 border-blue-100 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">Book Appointment</span>
          </button>

          <button className="group flex flex-col items-center p-6 border-2 border-emerald-100 rounded-2xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-900">Find Doctors</span>
          </button>

          <button className="group flex flex-col items-center p-6 border-2 border-purple-100 rounded-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-900">View Records</span>
          </button>

          <button className="group flex flex-col items-center p-6 border-2 border-pink-100 rounded-2xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 hover:border-pink-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-pink-900">Update Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview