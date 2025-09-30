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
    <div className="min-h-screen hero-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-dental-accent opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-dental-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>



      <div className="relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-down">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-dental-primary to-dental-accent rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl border-4 border-white group-hover:scale-110 transition-transform duration-300">
                  <img 
                    src={neurodentLogo} 
                    alt="Neurodent Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
          </div>
          <h2 className="mt-8 text-center text-4xl font-bold bg-gradient-to-r from-dental-primary to-dental-accent bg-clip-text text-transparent">
            Forgot your password?
          </h2>
          <p className="mt-4 text-center text-lg text-gray-600 max-w-md mx-auto">
            {emailSent ? (
              <span className="text-green-600 font-medium">Check your email for reset instructions</span>
            ) : (
              'Enter your email address and we\'ll send you a link to reset your password.'
            )}
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
          <div className="relative">
            {/* Glass morphism background */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>
            
            {/* Form Content */}
            <div className="relative bg-white/50 backdrop-blur-sm py-10 px-8 rounded-3xl shadow-xl border border-white/30">
              {error && (
                <div className="mb-6 animate-fade-in">
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <div className="mb-6 animate-fade-in">
                  <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700 px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'email' ? (
                <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-dental-primary to-dental-accent rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={handleInputChange}
                        className="relative w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dental-primary/50 focus:border-transparent transition-all duration-300 text-gray-800 shadow-lg hover:shadow-xl"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-4 px-4 text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-dental-primary to-dental-accent hover:from-dental-secondary hover:to-dental-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-2xl"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
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
                <form className="space-y-6 animate-fade-in" onSubmit={handleVerifyOTP}>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-gray-500 shadow-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                      Reset Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-dental-primary to-dental-accent rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="relative w-full px-4 py-4 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dental-primary/50 focus:border-transparent transition-all duration-300 text-center text-xl font-mono tracking-[0.5em] text-gray-800 shadow-lg hover:shadow-xl"
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                      />
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Enter the 6-digit code sent to your email address
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="group relative w-full flex justify-center py-4 px-4 text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-dental-primary to-dental-accent hover:from-dental-secondary hover:to-dental-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-2xl"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                        {loading ? (
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>

                  <div className="text-center space-y-3">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm font-medium text-dental-primary hover:text-dental-secondary disabled:opacity-50 transition-colors duration-300"
                    >
                      Didn't receive the code? Resend
                    </button>

                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email')
                          setEmailSent(false)
                          setOtp('')
                          setError('')
                          setMessage('')
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center transition-colors duration-300"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to email
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-dental-primary to-dental-accent mb-6 shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Email sent!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a password reset link to <strong className="text-dental-primary">{email}</strong>
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
                    className="text-sm font-medium text-dental-primary hover:text-dental-secondary transition-colors duration-300"
                  >
                    Send to a different email
                  </button>
                </div>
              )}

              {/* Back to Login */}
              <div className="mt-8 text-center border-t border-gray-200/50 pt-6">
                <Link 
                  to="/login" 
                  className="text-sm font-medium bg-gradient-to-r from-dental-primary to-dental-accent bg-clip-text text-transparent hover:from-dental-secondary hover:to-dental-primary transition-all duration-300 flex items-center justify-center group"
                >
                  <svg className="h-4 w-4 mr-2 text-dental-primary group-hover:text-dental-secondary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
