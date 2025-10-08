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
    const checkEmailVerificationStatus = async () => {
      if (formData.email) {
        const storedVerification = localStorage.getItem(`email_verified_${formData.email}`)
        if (storedVerification === 'true') {
          // Verify with backend that the patient still exists and is verified
          try {
            const response = await apiService.get(`/auth/check-email-verification?email=${encodeURIComponent(formData.email)}`)
            if (response.verified) {
              setEmailVerified(true)
              console.log('✅ Confirmed email verification with backend for:', formData.email)
            } else {
              // Patient doesn't exist or isn't verified anymore, clear localStorage
              localStorage.removeItem(`email_verified_${formData.email}`)
              setEmailVerified(false)
              console.log('❌ Email verification expired or patient deleted, cleared cache for:', formData.email)
            }
          } catch (error) {
            // If backend check fails, clear localStorage to be safe
            localStorage.removeItem(`email_verified_${formData.email}`)
            setEmailVerified(false)
            console.log('❌ Backend verification check failed, cleared cache for:', formData.email)
          }
        }
      }
    }

    checkEmailVerificationStatus()
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

    // Check if email is verified before proceeding
    if (!emailVerified) {
      setError('Please verify your email address before completing registration.')
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

    // Clear any existing verification status when sending new OTP
    localStorage.removeItem(`email_verified_${formData.email}`)
    setEmailVerified(false)

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

  // Function to clear verification cache (useful for testing)
  const clearVerificationCache = () => {
    if (formData.email) {
      localStorage.removeItem(`email_verified_${formData.email}`)
      setEmailVerified(false)
      setOtpSent(false)
      setEmailVerificationStep(false)
      setOtp('')
      console.log('🗑️ Cleared verification cache for:', formData.email)
    }
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
    <div className="min-h-screen hero-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-dental-accent opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-dental-primary opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center animate-fade-in">
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white transform hover:scale-110 transition-all duration-300">
                <img 
                  src={neurodentLogo} 
                  alt="Neurodent Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Glowing ring effect */}
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-dental-primary opacity-20 animate-ping"></div>
            </div>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl md:text-4xl font-bold text-gray-900 animate-slide-up">
          Create your <span className="text-dental-primary bg-gradient-to-r from-dental-primary to-dental-accent bg-clip-text text-transparent">Neurodent</span> account
        </h2>
        <p className="mt-3 text-center text-lg text-gray-600 animate-slide-up delay-100">
          Join thousands of satisfied patients for premium dental care
        </p>
      </div>

      {/* Registration Form */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-sm py-10 px-6 shadow-2xl sm:rounded-2xl sm:px-12 dental-shadow border border-white/20 animate-slide-up delay-200">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl animate-shake">
              <div className="flex">
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
          )}

          {/* Google Signup Button */}
          <div className="mb-8">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              {/* Official Google Logo SVG */}
              <svg className="h-5 w-5 mr-3 group-hover:animate-pulse" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 group-hover:text-gray-900">Sign up with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={getInputClassName('firstName', 'appearance-none block w-full px-4 py-3 pl-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md bg-white/80')}
                    placeholder="Enter your first name"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {renderFieldError('firstName')}
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={getInputClassName('lastName', 'appearance-none block w-full px-4 py-3 pl-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md bg-white/80')}
                    placeholder="Enter your last name"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {renderFieldError('lastName')}
              </div>
            </div>

            {/* Email Field */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={emailVerified}
                    className={getInputClassName('email', `appearance-none block w-full px-4 py-3 pl-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md ${emailVerified ? 'bg-green-50 border-green-300' : 'bg-white/80'}`)}
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpLoading || !formData.email.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-dental-primary to-dental-accent text-white text-sm font-semibold rounded-xl hover:from-dental-secondary hover:to-dental-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                )}
                {emailVerified && (
                  <div className="px-4 py-3 bg-green-100 text-green-800 text-sm font-semibold rounded-xl flex items-center shadow-lg">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md p-6 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20 animate-slide-up">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-dental-primary to-dental-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                    <div className="px-2 py-3">
                      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        We've sent a 6-digit verification code to <br/>
                        <strong className="text-dental-primary">{formData.email}</strong>
                      </p>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-dental-primary focus:border-dental-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        maxLength="6"
                      />
                      {error && (
                        <p className="text-red-600 text-sm mt-3 flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {error}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setEmailVerificationStep(false)
                          setOtp('')
                          setError('')
                        }}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.length !== 6}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-dental-primary to-dental-accent text-white text-sm font-semibold rounded-xl hover:from-dental-secondary hover:to-dental-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        {otpLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={handleResendOTP}
                        disabled={otpLoading}
                        className="text-sm text-dental-primary hover:text-dental-secondary disabled:opacity-50 font-medium transition-colors duration-300 transform hover:scale-105 inline-block"
                      >
                        Didn't receive the code? Resend
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phone Field */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={getInputClassName('phone', 'appearance-none block w-full px-4 py-3 pl-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md bg-white/80')}
                  placeholder="+1 (555) 123-4567"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              {renderFieldError('phone')}
            </div>

            {/* Date of Birth */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={getInputClassName('dateOfBirth', 'appearance-none block w-full px-4 py-3 pl-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md bg-white/80')}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 0h10a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                  </svg>
                </div>
              </div>
              {renderFieldError('dateOfBirth')}
            </div>

            {/* Password Fields */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getInputClassName('password', 'appearance-none block w-full px-4 py-3 pl-12 pr-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md bg-white/80')}
                  placeholder="Create a strong password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-dental-primary focus:outline-none focus:text-dental-primary transition-colors duration-300 transform hover:scale-110"
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
              {renderFieldError('password')}
              <div className="mt-2 text-xs text-gray-500 leading-relaxed">
                Password must contain at least 8 characters with uppercase, lowercase, number, and special character
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={getInputClassName('confirmPassword', 'appearance-none block w-full px-4 py-3 pl-12 pr-12 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm transition-all duration-300 group-hover:shadow-md bg-white/80')}
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-dental-primary transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-dental-primary focus:outline-none focus:text-dental-primary transition-colors duration-300 transform hover:scale-110"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
              {renderFieldError('confirmPassword')}
            </div>

            {/* Terms Agreement */}
            <div className="transform transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-start group">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={`h-4 w-4 text-dental-primary focus:ring-dental-primary border-gray-300 rounded mt-1 transition-all duration-300 ${fieldErrors.agreeToTerms ? 'border-red-300' : ''}`}
                />
                <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                  <span className="text-red-500">*</span> I agree to the{' '}
                  <Link to="/terms" className="text-dental-primary hover:text-dental-secondary underline font-medium transition-all duration-300 transform hover:scale-105 inline-block">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-dental-primary hover:text-dental-secondary underline font-medium transition-all duration-300 transform hover:scale-105 inline-block">
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
                disabled={loading || !emailVerified}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-dental-primary to-dental-accent hover:from-dental-secondary hover:to-dental-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dental-primary transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white group-hover:animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                    </svg>
                  )}
                </span>
                {loading ? 'Creating account...' : !emailVerified ? 'Please verify email first' : 'Create your account'}
              </button>
              {!emailVerified && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Please verify your email address to enable registration
                </p>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-8">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-dental-primary hover:text-dental-accent transition-all duration-300 transform hover:scale-105 inline-block">
                  Sign in here
                </Link>
              </span>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Link to="/" className="text-sm text-dental-primary hover:text-dental-accent transition-all duration-300 transform hover:scale-105 inline-block font-medium">
                ← Back to Neurodent Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 animate-slide-up delay-300">
          <h3 className="text-xl font-bold text-dental-secondary text-center mb-6 bg-gradient-to-r from-dental-secondary to-dental-primary bg-clip-text text-transparent">
            Why Choose Neurodent?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center group transform transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-dental-primary to-dental-accent rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:animate-bounce">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-semibold group-hover:text-dental-primary transition-colors duration-300">Trusted Care</p>
              <p className="text-xs text-gray-500 mt-1">Expert professionals</p>
            </div>
            <div className="flex flex-col items-center group transform transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-dental-primary to-dental-accent rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:animate-bounce delay-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-semibold group-hover:text-dental-primary transition-colors duration-300">24/7 Support</p>
              <p className="text-xs text-gray-500 mt-1">Always available</p>
            </div>
            <div className="flex flex-col items-center group transform transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-dental-primary to-dental-accent rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:animate-bounce delay-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-semibold group-hover:text-dental-primary transition-colors duration-300">Fast & Easy</p>
              <p className="text-xs text-gray-500 mt-1">Quick registration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register