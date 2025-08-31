import React from 'react'
import { Link } from 'react-router-dom'
import neurodentLogo from '../assets/images/neurodent-logo.png'
import patientIcon from '../assets/images/p.png'
import doctorLogo from '../assets/images/doctor-logo.png'
import employeesLogo from '../assets/images/employees-logo.png'

const RoleSelection = () => {
  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      description: 'Book appointments, view medical records, and communicate with doctors',
      icon: (
        <img 
          src={patientIcon} 
          alt="Patient Icon" 
          className="w-12 h-12 object-cover"
        />
      ),
      color: 'dental-primary',
      bgGradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-700',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-700',
      registerPath: '/register',
      loginPath: '/login',
      hasRegister: true
    },
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Manage patients, create treatment plans, and view analytics',
      icon: (
        <img 
          src={doctorLogo} 
          alt="Doctor Logo" 
          className="w-12 h-12 object-cover rounded-full"
        />
      ),
      color: 'green-600',
      bgGradient: 'bg-gradient-to-br from-green-400 to-green-600',
      hoverGradient: 'hover:from-green-500 hover:to-green-700',
      buttonBg: 'bg-gradient-to-r from-green-500 to-green-600',
      buttonHover: 'hover:from-green-600 hover:to-green-700',
      loginPath: '/login/doctor',
      hasRegister: false
    },

    {
      id: 'pharmacist',
      title: 'Pharmacist',
      description: 'Pharmacist access for daily operations and medication management',
      icon: (
        <img 
          src={employeesLogo} 
          alt="Pharmacist Logo" 
          className="w-12 h-12 object-cover rounded-full"
        />
      ),
      color: 'yellow-600',
      bgGradient: 'bg-gradient-to-br from-yellow-400 to-yellow-700',
      hoverGradient: 'hover:from-yellow-500 hover:to-yellow-800',
      buttonBg: 'bg-gradient-to-r from-yellow-500 to-yellow-700',
      buttonHover: 'hover:from-yellow-600 hover:to-yellow-800',
      loginPath: '/login/pharmacist',
      hasRegister: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg">
            <img 
              src={neurodentLogo} 
              alt="Neurodent Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-center text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-dental-primary">Neurodent</span>
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Select your role to continue
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group relative bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 flex flex-col h-full"
            >
              <div className="p-8 text-center flex-1 flex flex-col">
                {/* Top Section */}
                <div className="flex-1">
                  {/* Icon */}
                  <div className={`mx-auto w-20 h-20 ${role.bgGradient} ${role.hoverGradient} rounded-full flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    {role.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {role.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed min-h-[3rem]">
                    {role.description}
                  </p>
                </div>
                
                {/* Action Buttons - Always at bottom */}
                <div className="space-y-3 mt-auto">
                  {role.hasRegister ? (
                    <>
                      <Link
                        to={role.registerPath}
                        className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white ${role.buttonBg} ${role.buttonHover} transition-all duration-300 shadow-md hover:shadow-lg`}
                      >
                        Create Account
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      
                      <Link
                        to={role.loginPath}
                        className={`w-full inline-flex items-center justify-center px-6 py-2 border-2 border-gray-300 text-sm font-medium rounded-md text-gray-600 bg-white hover:border-gray-400 hover:text-gray-700 transition-colors duration-300`}
                      >
                        Already have account?
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={role.loginPath}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white ${role.buttonBg} ${role.buttonHover} transition-all duration-300 shadow-md hover:shadow-lg`}
                    >
                      Login
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Role-specific badge */}
              {!role.hasRegister && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Staff Only
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-12 text-center">
        <Link to="/" className="text-dental-primary hover:text-dental-secondary font-medium">
          ← Back to Neurodent Home
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@neurodent.com" className="text-dental-primary hover:text-dental-secondary">
            support@neurodent.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default RoleSelection