import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import neurodentLogo from '../assets/images/neurodent-logo.png'
import apiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkAuthStatus } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Handle Google OAuth token from URL
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      apiService.setToken(token)
      navigate('/patient/dashboard', { replace: true })
    }

    const error = searchParams.get('error')
    const message = searchParams.get('message')

    if (error === 'google_auth_failed') {
      setError('Google authentication failed. Please try again.')
    } else if (error === 'account_not_found') {
      setError('No account found with this Google account. Please sign up first or use a different account.')
    }

    if (message === 'password_reset_success') {
      setSuccess('Password reset successful! You can now log in with your new password.')
    }
  }, [searchParams, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login...')
      const response = await apiService.login({
        email: formData.email,
        password: formData.password
      })

      console.log('✅ Login successful:', response)

      // Success - token is automatically set by apiService
      // Trigger auth context to update immediately
      await checkAuthStatus()

      console.log('🔄 Redirecting to dashboard...')
      navigate('/patient/dashboard', { replace: true })
    } catch (err) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log('🔐 Initiating Google login...')

    // Clear any existing Google session to force account selection
    // This helps ensure the user sees the account selection screen
    const googleAuthUrl = apiService.getGoogleAuthUrl()
    console.log('🔗 Redirecting to:', googleAuthUrl)

    window.location.href = googleAuthUrl
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-4 border-dental-primary">
            <img 
              src={neurodentLogo} 
              alt="Neurodent Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome back to <span className="text-dental-primary">Neurodent</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your patient account
        </p>
      </div>

      {/* Login Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 dental-shadow">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-dental-primary focus:border-dental-primary sm:text-sm"
                  placeholder="Enter your email address"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-dental-primary focus:border-dental-primary sm:text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-dental-primary focus:ring-dental-primary border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-dental-primary hover:text-dental-secondary transition-colors duration-200">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-dental-primary hover:bg-dental-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-dental-light group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {loading ? 'Signing in...' : 'Sign in to your account'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Official Google Logo SVG */}
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700">Continue with Google</span>
              </button>

              {/* Help text for Google account issues */}
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  Having trouble? Try{' '}
                  <button
                    type="button"
                    onClick={() => {
                      // Open Google logout first, then redirect to our OAuth
                      window.open('https://accounts.google.com/logout', '_blank', 'width=500,height=600');
                      setTimeout(() => {
                        handleGoogleLogin();
                      }, 2000);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    signing out of Google first
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-dental-primary hover:text-dental-accent transition-colors duration-200">
                  Sign up as a new patient
                </Link>
              </span>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Need help?</p>
              <div className="flex justify-center space-x-4 text-xs">
                <Link to="/contact" className="text-dental-primary hover:text-dental-accent transition-colors duration-200">
                  Contact Support
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/help" className="text-dental-primary hover:text-dental-accent transition-colors duration-200">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Benefits Section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-dental-light rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dental-secondary text-center mb-4">
            Patient Portal Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-dental-primary rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">Book Appointments</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-dental-primary rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">View Records</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-dental-primary rounded-full flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-medium">Message Doctors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login