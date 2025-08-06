import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import neurodentLogo from '../assets/images/neurodent-logo.png'
import apiService from '../services/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [step, setStep] = useState('email') // 'email', 'otp', 'reset'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await apiService.forgotPassword(email)
      setMessage(response.message)
      setEmailSent(true)
      setStep('otp')

      // In development, show preview URL if available
      if (response.previewUrl) {
        console.log('📧 Email preview URL:', response.previewUrl)
      }
    } catch (err) {
      setError(err.message || 'Failed to send password reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)

    try {
      const response = await apiService.verifyPasswordResetOTP(email, otp)
      setMessage(response.message)
      setOtpVerified(true)
      // Navigate to reset password page with email and OTP
      navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`)
    } catch (err) {
      setError(err.message || 'Invalid reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await apiService.forgotPassword(email)
      setMessage('Reset code sent again!')
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
    if (message) setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-4 border-dental-primary">
              <img 
                src={neurodentLogo} 
                alt="Neurodent Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {emailSent ? (
            'Check your email for reset instructions'
          ) : (
            <>
              Enter your email address and we'll send you a link to reset your password.
            </>
          )}
        </p>
      </div>

      {/* Form */}
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

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          {step === 'email' ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-dental-primary focus:border-dental-primary sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>

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
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    )}
                  </span>
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </div>
            </form>
          ) : step === 'otp' ? (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Reset Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-dental-primary focus:border-dental-primary sm:text-sm text-center text-lg font-mono tracking-widest"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the 6-digit code sent to your email address
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
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
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-dental-primary hover:text-dental-secondary disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setEmailSent(false)
                    setOtp('')
                    setError('')
                    setMessage('')
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back to email
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email sent!</h3>
              <p className="text-sm text-gray-600 mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500 mb-6">
                The link will expire in 10 minutes. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                  setMessage('')
                }}
                className="text-sm text-dental-primary hover:text-dental-secondary font-medium"
              >
                Send to a different email
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-dental-primary hover:text-dental-secondary font-medium flex items-center justify-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
