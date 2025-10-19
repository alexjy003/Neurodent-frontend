// Universal logout utility for all user types
import { clearLoginForms } from './formCleaner'

export const universalLogout = () => {
  console.log('🚪 Universal logout initiated...')
  
  // Clear ALL possible authentication data and user info
  const itemsToRemove = [
    'token',
    'adminToken', 
    'doctorToken',
    'pharmacistToken',
    'user',
    'adminAuth',
    'adminUser', 
    'adminTokenExpiry',
    'doctorInfo',
    'pharmacistData',
    'patientInfo',
    'userRole'
  ]
  
  // Remove all localStorage items
  itemsToRemove.forEach(item => {
    localStorage.removeItem(item)
  })
  
  // Clear all sessionStorage
  sessionStorage.clear()
  
  // Clear any neurodent-related items that might have been missed
  const allKeys = Object.keys(localStorage)
  allKeys.forEach(key => {
    if (key.includes('neurodent') || key.includes('auth') || key.includes('token')) {
      localStorage.removeItem(key)
    }
  })
  
  // Clear browser form data and auto-fill to prevent credential persistence
  clearLoginForms()
  
  // Clear browser history state to prevent back navigation to authenticated pages
  if (typeof window !== 'undefined' && window.history) {
    window.history.replaceState(null, '', '/login')
  }
  
  // Clear browser cache if available
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name)
      })
    }).catch(err => {
      console.warn('Cache clearing failed:', err)
    })
  }
  
  console.log('✅ All authentication data and form data cleared')
  
  // Force redirect to login page and prevent back navigation
  // Using replace to prevent the current page from being in history
  // Add timestamp to prevent cached pages
  const timestamp = Date.now()
  window.location.replace(`/login?t=${timestamp}&logout=true`)
}

export default universalLogout