import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'
import universalLogout from '../utils/universalLogout'

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

  const checkAuthStatus = useCallback(async () => {
    try {
      // Refresh the token reference in case it was updated elsewhere
      apiService.token = apiService.getToken();
      
      // Check for any type of token using the API service method  
      const token = apiService.getToken();

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      // Verify token with backend using the universal verify endpoint
      const response = await apiService.request('/auth/verify');
      if (response.valid && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        // Invalid token, remove it
        apiService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Only clear tokens if it's actually an auth error, not a network issue
      if (error.response?.status === 401 || error.response?.status === 403) {
        apiService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // For network errors, keep existing auth state but still set loading to false
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

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
    console.log('🚪 AuthContext logout called...')
    
    // Use universal logout for comprehensive cleanup
    universalLogout()
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
