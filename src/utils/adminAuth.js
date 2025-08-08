// Admin authentication utilities

export const setAdminAuth = (user, token) => {
  localStorage.setItem('adminAuth', 'true')
  localStorage.setItem('adminUser', JSON.stringify(user))
  localStorage.setItem('adminToken', token)
  sessionStorage.setItem('adminSession', 'active')
  
  // Set session timeout (8 hours)
  const expirationTime = Date.now() + (8 * 60 * 60 * 1000)
  localStorage.setItem('adminTokenExpiry', expirationTime.toString())
}

export const clearAdminAuth = () => {
  // Clear all admin-related data
  localStorage.removeItem('adminAuth')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminTokenExpiry')
  sessionStorage.removeItem('adminSession')
  
  // Clear any other admin-related session data
  sessionStorage.clear()
}

export const isAdminAuthenticated = () => {
  const adminAuth = localStorage.getItem('adminAuth')
  const adminUser = localStorage.getItem('adminUser')
  const adminToken = localStorage.getItem('adminToken')
  const adminSession = sessionStorage.getItem('adminSession')
  const tokenExpiry = localStorage.getItem('adminTokenExpiry')
  
  // Check if all required data exists
  if (adminAuth !== 'true' || !adminUser || !adminToken || adminSession !== 'active') {
    return false
  }
  
  // Check token expiration
  if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
    clearAdminAuth()
    return false
  }
  
  try {
    const user = JSON.parse(adminUser)
    return user.role === 'admin' && user.email === 'admin@gmail.com'
  } catch (error) {
    clearAdminAuth()
    return false
  }
}

export const getAdminUser = () => {
  if (!isAdminAuthenticated()) {
    return null
  }
  
  try {
    return JSON.parse(localStorage.getItem('adminUser'))
  } catch (error) {
    clearAdminAuth()
    return null
  }
}

export const getAdminToken = () => {
  if (!isAdminAuthenticated()) {
    return null
  }
  
  return localStorage.getItem('adminToken')
}

export const adminLogout = () => {
  // Clear all authentication data
  clearAdminAuth()

  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name)
      })
    })
  }

  // Navigate to admin login (allow normal navigation)
  window.location.href = '/login/admin'
}


