import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import neurodentLogo from '../assets/images/neurodent-logo.png'
import apiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkAuthStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailVerificationStep, setEmailVerificationStep] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    agreeToTerms: false
  })

  // Handle Google OAuth errors from URL
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'google_signup_failed') {
      setError('Google signup failed. Please try again.')
    }
  }, [searchParams])

  // Check for stored email verification status
  useEffect(() => {
    if (formData.email) {
      const storedVerification = localStorage.getItem(`email_verified_${formData.email}`)
      if (storedVerification === 'true') {
        setEmailVerified(true)
        console.log('✅ Found stored email verification for:', formData.email)
      }
    }
  }, [formData.email])

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    // Allow various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)')
    }
    return errors
  }

  const validateName = (name, fieldName) => {
    const errors = []
    if (!name.trim()) {
      errors.push(`${fieldName} is required`)
    } else if (name.trim().length < 2) {
      errors.push(`${fieldName} must be at least 2 characters long`)
    } else if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      errors.push(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`)
    }
    return errors
  }

  const validateAge = (dateOfBirth) => {
    if (!dateOfBirth) return [] // Optional field

    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    const errors = []
    if (birthDate > today) {
      errors.push('Date of birth cannot be in the future')
    } else if (age < 13) {
      errors.push('You must be at least 13 years old to register')
    } else if (age > 120) {
      errors.push('Please enter a valid date of birth')
    }
    return errors
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    // Update form data first
    const updatedFormData = {
      ...formData,
      [name]: newValue
    }

    setFormData(updatedFormData)

    // Clear general error when user starts typing
    if (error) setError('')

    // Clear field-specific error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: []
      }))
    }

    // Clear email verification if email changes
    if (name === 'email' && emailVerified) {
      setEmailVerified(false)
      localStorage.removeItem(`email_verified_${formData.email}`)
      console.log('🔄 Email changed, clearing verification status')
    }

    // Real-time validation for better UX
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        setFieldErrors(prev => ({
          ...prev,
          email: ['Please enter a valid email address']
        }))
      }
    }

    // Fix: Use updatedFormData for real-time password confirmation validation
    if (name === 'confirmPassword' && value) {
      if (value !== updatedFormData.password) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: ['Passwords do not match']
        }))
      } else {
        // Clear the error if passwords now match
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: []
        }))
      }
    }

    // Also validate when password field changes and confirmPassword has a value
    if (name === 'password' && updatedFormData.confirmPassword) {
      if (value !== updatedFormData.confirmPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: ['Passwords do not match']
        }))
      } else {
        // Clear the error if passwords now match
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: []
        }))
      }
    }
  }

  const validateForm = () => {
    const errors = {}
    let isValid = true

    // Validate first name
    const firstNameErrors = validateName(formData.firstName, 'First name')
    if (firstNameErrors.length > 0) {
      errors.firstName = firstNameErrors
      isValid = false
    }

    // Validate last name
    const lastNameErrors = validateName(formData.lastName, 'Last name')
    if (lastNameErrors.length > 0) {
      errors.lastName = lastNameErrors
      isValid = false
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = ['Email is required']
      isValid = false
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = ['Please enter a valid email address']
      isValid = false
    }

    // Validate password
    if (!formData.password) {
      errors.password = ['Password is required']
      isValid = false
    } else {
      const passwordErrors = validatePassword(formData.password)
      if (passwordErrors.length > 0) {
        errors.password = passwordErrors
        isValid = false
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = ['Please confirm your password']
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match']
      isValid = false
    }

    // Validate phone (optional but if provided, must be valid)
    if (formData.phone.trim() && !validatePhone(formData.phone.trim())) {
      errors.phone = ['Please enter a valid phone number']
      isValid = false
    }

    // Validate date of birth (optional but if provided, must be valid)
    const ageErrors = validateAge(formData.dateOfBirth)
    if (ageErrors.length > 0) {
      errors.dateOfBirth = ageErrors
      isValid = false
    }

    // Validate email verification
    if (!emailVerified) {
      errors.email = ['Please verify your email address first']
      isValid = false
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = ['You must agree to the terms and conditions']
      isValid = false
    }

    // Set field errors
    setFieldErrors(errors)

    // Set general error message if validation fails
    if (!isValid) {
      setError('Please correct the errors below and try again.')
    }

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth || undefined,
        agreeToTerms: formData.agreeToTerms
      }

      console.log('📝 Attempting registration...')
      const response = await apiService.register(registrationData)

      console.log('✅ Registration successful:', response)

      // Success - token is automatically set by apiService
      // Trigger auth context to update immediately
      await checkAuthStatus()

      console.log('🔄 Redirecting to dashboard...')
      navigate('/patient/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    console.log('📝 Initiating Google signup...')

    // Use the specific signup URL that forces account selection
    const googleSignupUrl = apiService.getGoogleSignupUrl()
    console.log('🔗 Redirecting to:', googleSignupUrl)

    window.location.href = googleSignupUrl
  }

  const handleSendOTP = async () => {
    if (!formData.email.trim()) {
      setFieldErrors(prev => ({
        ...prev,
        email: ['Email is required to send verification code']
      }))
      return
    }

    if (!validateEmail(formData.email.trim())) {
      setFieldErrors(prev => ({
        ...prev,
        email: ['Please enter a valid email address']
      }))
      return
    }

    setOtpLoading(true)
    setError('')

    try {
      const response = await apiService.sendVerificationOTP(formData.email, formData.firstName)
      setOtpSent(true)
      setEmailVerificationStep(true)
      setError('')

      // In development, show preview URL if available
      if (response.previewUrl) {
        console.log('📧 Email preview URL:', response.previewUrl)
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    setOtpLoading(true)
    setError('')

    try {
      const response = await apiService.verifyEmailOTP(formData.email, otp)
      console.log('✅ OTP verification response:', response)

      setEmailVerified(true)
      setEmailVerificationStep(false)
      setOtp('')
      setError('')

      // Store verification status in localStorage as backup
      localStorage.setItem(`email_verified_${formData.email}`, 'true')

      console.log('✅ Email verified successfully, state updated')
    } catch (err) {
      console.error('❌ OTP verification failed:', err)
      setError(err.message || 'Invalid verification code. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOTP = async () => {
    await handleSendOTP()
  }

  // Helper function to render field errors
  const renderFieldError = (fieldName) => {
    if (fieldErrors[fieldName] && fieldErrors[fieldName].length > 0) {
      return (
        <div className="mt-1">
          {fieldErrors[fieldName].map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Helper function to get input class with error styling
  const getInputClassName = (fieldName, baseClassName) => {
    const hasError = fieldErrors[fieldName] && fieldErrors[fieldName].length > 0
    return `${baseClassName} ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-dental-primary focus:ring-dental-primary'}`
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
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your <span className="text-dental-primary">Neurodent</span> account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join thousands of satisfied patients
        </p>
      </div>

      {/* Registration Form */}
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

          {/* Google Signup Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
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
              <span className="text-gray-700">Sign up with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={getInputClassName('firstName', 'mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm')}
                  placeholder="Enter your first name"
                />
                {renderFieldError('firstName')}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={getInputClassName('lastName', 'mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm')}
                  placeholder="Enter your last name"
                />
                {renderFieldError('lastName')}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={emailVerified}
                  className={getInputClassName('email', `mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm ${emailVerified ? 'bg-green-50 border-green-300' : ''}`)}
                  placeholder="Enter your email address"
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpLoading || !formData.email.trim()}
                    className="mt-1 px-4 py-2 bg-dental-primary text-white text-sm font-medium rounded-md hover:bg-dental-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
                {emailVerified && (
                  <div className="mt-1 px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>
              {renderFieldError('email')}
            </div>

            {/* OTP Verification Modal */}
            {emailVerificationStep && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                  <div className="mt-3 text-center">
                    <h3 className="text-lg font-medium text-gray-900">Verify Your Email</h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500 mb-4">
                        We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                      </p>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-dental-primary"
                        maxLength="6"
                      />
                      {error && (
                        <p className="text-red-600 text-sm mt-2">{error}</p>
                      )}
                    </div>
                    <div className="flex gap-3 px-7 py-3">
                      <button
                        onClick={() => {
                          setEmailVerificationStep(false)
                          setOtp('')
                          setError('')
                        }}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.length !== 6}
                        className="flex-1 px-4 py-2 bg-dental-primary text-white text-sm font-medium rounded-md hover:bg-dental-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    <div className="px-7 py-3">
                      <button
                        onClick={handleResendOTP}
                        disabled={otpLoading}
                        className="text-sm text-dental-primary hover:text-dental-secondary disabled:opacity-50"
                      >
                        Didn't receive the code? Resend
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={getInputClassName('phone', 'mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm')}
                placeholder="+1 (555) 123-4567"
              />
              {renderFieldError('phone')}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={getInputClassName('dateOfBirth', 'mt-1 appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm')}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
              {renderFieldError('dateOfBirth')}
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getInputClassName('password', 'mt-1 appearance-none block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm')}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {renderFieldError('password')}
              <div className="mt-1 text-xs text-gray-500">
                Password must contain at least 8 characters with uppercase, lowercase, number, and special character
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={getInputClassName('confirmPassword', 'mt-1 appearance-none block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm')}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {renderFieldError('confirmPassword')}
            </div>

            {/* Terms Agreement */}
            <div>
              <div className="flex items-start">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={`h-4 w-4 text-dental-primary focus:ring-dental-primary border-gray-300 rounded mt-1 ${fieldErrors.agreeToTerms ? 'border-red-300' : ''}`}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  <span className="text-red-500">*</span> I agree to the{' '}
                  <Link to="/terms" className="text-dental-primary hover:text-dental-secondary underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-dental-primary hover:text-dental-secondary underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {renderFieldError('agreeToTerms')}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-dental-primary hover:bg-dental-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-dental-light group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                    </svg>
                  )}
                </span>
                {loading ? 'Creating account...' : 'Create your account'}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-dental-primary hover:text-dental-secondary transition-colors duration-200">
                  Sign in here
                </Link>
              </span>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link to="/" className="text-sm text-dental-primary hover:text-dental-secondary transition-colors duration-200">
                ← Back to Neurodent Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register