import React, { createContext, useContext, useState, useEffect } from 'react'
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

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Refresh the token reference in case it was updated elsewhere
      apiService.token = apiService.getToken();
      
      // Check for any type of token using the API service method  
      const token = apiService.getToken();
      console.log('🔍 Checking auth status, token exists:', !!token);
      console.log('🔍 Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');

      if (!token) {
        console.log('❌ No token found');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      console.log('🔑 Verifying token with backend...');
      // Verify token with backend using the universal verify endpoint
      const response = await apiService.request('/auth/verify');
      if (response.valid && response.user) {
        console.log('✅ Token valid, user authenticated:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Token invalid, removing...');
        // Invalid token, remove it
        apiService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Only clear tokens if it's actually an auth error, not a network issue
      if (error.response?.status === 401 || error.response?.status === 403) {
        apiService.removeToken();
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // For network errors, keep existing auth state but still set loading to false
        console.log('🔍 Network error during auth check, keeping existing state');
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

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
