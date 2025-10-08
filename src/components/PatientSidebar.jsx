import React from 'react'
import patientIcon from '../assets/images/p.png'

const PatientSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, user }) => {
  const navigation = [
    {
      name: 'Dashboard Overview',
      id: 'overview',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
        </svg>
      )
    },
    {
      name: 'My Profile',
      id: 'profile',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Find Doctors',
      id: 'doctors',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      name: 'My Appointments',
      id: 'appointments',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
        </svg>
      )
    },
    {
      name: 'Medical Records',
      id: 'records',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ]

  const handleNavClick = (tabId) => {
    setActiveTab(tabId)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white via-slate-50 to-blue-50 shadow-2xl transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col h-screen border-r border-slate-200/50`}>
      {/* Sidebar header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-2 ring-blue-100">
            <img 
              src={patientIcon} 
              alt="Patient Icon" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Neurodent</h2>
            <p className="text-sm font-medium text-slate-600">
              {user ? `Welcome, ${user.firstName}!` : 'Patient Portal'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="lg:hidden text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-8 px-4 overflow-hidden">
        <div className="space-y-3">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group w-full flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl transform scale-105'
                  : 'text-slate-700 hover:bg-white/80 hover:text-blue-600 hover:shadow-lg hover:scale-105'
              }`}
            >
              <div className={`w-6 h-6 mr-4 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
              }`}>
                {item.icon}
              </div>
              <span className="text-left flex-1 min-w-0">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Quick actions */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200/50 bg-white/60 backdrop-blur-sm">
        <div className="space-y-3">
          <button className="group w-full flex items-center px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-white/80 rounded-2xl transition-all duration-300 hover:shadow-md">
            <div className="w-5 h-5 mr-4 flex items-center justify-center flex-shrink-0 group-hover:text-blue-600 transition-colors duration-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-left flex-1 min-w-0">Help & Support</span>
          </button>
          <button className="group w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:shadow-md">
            <div className="w-5 h-5 mr-4 flex items-center justify-center flex-shrink-0 group-hover:text-red-700 transition-colors duration-300">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="text-left flex-1 min-w-0">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientSidebar