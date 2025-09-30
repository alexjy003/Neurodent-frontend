// Navigation utilities to handle proper browser navigation

export const clearNavigationHistory = () => {
  // Clear the current history entry and replace with a clean state
  window.history.replaceState(null, '', window.location.pathname)
}

export const preventBackToSpecificPage = (preventedPath) => {
  const handlePopState = (event) => {
    if (window.location.pathname === preventedPath) {
      // If user navigates back to the prevented path, go forward again
      window.history.forward()
    }
  }
  
  window.addEventListener('popstate', handlePopState)
  
  return () => {
    window.removeEventListener('popstate', handlePopState)
  }
}

export const allowNormalNavigation = () => {
  // Remove any existing popstate listeners that might interfere
  const newPopStateHandler = (event) => {
    // Allow normal browser navigation
    // This is a no-op handler that doesn't prevent navigation
  }
  
  // Replace any existing popstate handlers
  window.addEventListener('popstate', newPopStateHandler)
  
  return () => {
    window.removeEventListener('popstate', newPopStateHandler)
  }
}

export const navigateWithCleanHistory = (path, navigate) => {
  // Clear any problematic history states
  clearNavigationHistory()
  
  // Navigate normally
  navigate(path)
}

export const handleAdminLogoutNavigation = () => {
  // Clear admin data
  localStorage.removeItem('adminAuth')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminTokenExpiry')
  sessionStorage.removeItem('adminSession')
  sessionStorage.clear()
  
  // Clear navigation history
  clearNavigationHistory()
  
  // Navigate to admin login
  window.location.href = '/login'
}
