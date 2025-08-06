import React, { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 Checking auth status, token exists:', !!token)

      if (!token) {
        console.log('❌ No token found')
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      console.log('🔑 Verifying token with backend...')
      // Verify token with backend
      const response = await apiService.request('/auth/verify')
      if (response.valid) {
        console.log('✅ Token valid, user authenticated:', response.patient)
        setUser(response.patient)
        setIsAuthenticated(true)
      } else {
        console.log('❌ Token invalid, removing...')
        // Invalid token, remove it
        apiService.removeToken()
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      apiService.removeToken()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Logging in...')
      const response = await apiService.login(credentials)
      console.log('✅ AuthContext: Login successful, updating state...')
      setUser(response.patient)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('📝 AuthContext: Registering...')
      const response = await apiService.register(userData)
      console.log('✅ AuthContext: Registration successful, updating state...')
      setUser(response.patient)
      setIsAuthenticated(true)
      return response
    } catch (error) {
      console.error('❌ AuthContext: Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    apiService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
