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
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center px-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="group relative bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 flex flex-col h-full w-full max-w-md"
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
            </div>
          ))}
        </div>
      </div>

      {/* Staff Access Information */}
      <div className="mt-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-teal-900 mb-2">
                  Medical Staff Access
                </h3>
                <p className="text-teal-700 text-sm leading-relaxed">
                  <strong>For Doctors, Pharmacists & Admin:</strong> All medical staff can access their respective dashboards using the universal login system. Simply use your assigned credentials to sign in and you'll be automatically redirected to your appropriate dashboard.
                </p>
                <div className="mt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors duration-200"
                  >
                    Staff Login
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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