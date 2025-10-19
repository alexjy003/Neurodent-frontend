// Navigation guard utilities to prevent unauthorized back navigation and cross-user-type access

export const getUserType = () => {
  const adminAuth = localStorage.getItem('adminAuth');
  const adminToken = localStorage.getItem('adminToken');
  const doctorToken = localStorage.getItem('doctorToken');
  const pharmacistToken = localStorage.getItem('pharmacistToken');
  const patientToken = localStorage.getItem('token');
  
  // Check admin first
  if (adminAuth && adminToken) {
    return 'admin';
  }
  
  // Check doctor - be more lenient, token is enough if doctorInfo will be set
  if (doctorToken) {
    return 'doctor';
  }
  
  // Check pharmacist - be more lenient, token is enough if pharmacistData will be set
  if (pharmacistToken) {
    return 'pharmacist';
  }
  
  // Check patient - be more lenient, token is enough if user will be set
  if (patientToken) {
    return 'patient';
  }
  
  return null;
};

export const getCorrectDashboardRoute = (userType = null) => {
  const type = userType || getUserType();
  
  switch (type) {
    case 'admin':
      return '/admin/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'pharmacist':
      return '/pharmacist/dashboard';
    case 'patient':
    default:
      return '/patient/dashboard';
  }
};

export const isAuthorizedForRoute = (currentPath, userType = null) => {
  const type = userType || getUserType();
  
  if (!type) return false;
  
  // Check if user is trying to access the correct user type routes
  if (currentPath.startsWith('/admin') && type !== 'admin') {
    return false;
  }
  
  if (currentPath.startsWith('/doctor') && type !== 'doctor') {
    return false;
  }
  
  if (currentPath.startsWith('/pharmacist') && type !== 'pharmacist') {
    return false;
  }
  
  if (currentPath.startsWith('/patient') && type !== 'patient') {
    return false;
  }
  
  return true;
};

export const redirectToCorrectDashboard = (navigate) => {
  const userType = getUserType();
  const correctRoute = getCorrectDashboardRoute(userType);
  
  console.log(`🔄 Redirecting ${userType} user to:`, correctRoute);
  
  // Use replace to prevent back navigation to unauthorized route
  navigate(correctRoute, { replace: true });
};

export const validateUserAccess = (requiredUserType, currentUserType = null) => {
  const type = currentUserType || getUserType();
  
  if (!type) {
    console.warn('🚫 No user type detected, access denied');
    return false;
  }
  
  if (requiredUserType && type !== requiredUserType) {
    console.warn(`🚫 Access denied: Required ${requiredUserType}, but user is ${type}`);
    return false;
  }
  
  return true;
};

export const preventBackNavigation = () => {
  // Push multiple states to make it harder to go back
  window.history.pushState(null, '', window.location.pathname)
  window.history.pushState(null, '', window.location.pathname)
  window.history.pushState(null, '', window.location.pathname)
}

export const setupNavigationGuard = (isAuthenticated, redirectTo = '/login') => {
  const handlePopState = (event) => {
    if (!isAuthenticated) {
      // Prevent back navigation
      event.preventDefault()
      
      // Push states again
      preventBackNavigation()
      
      // Force redirect
      window.location.replace(redirectTo)
    }
  }

  const handleBeforeUnload = (event) => {
    if (!isAuthenticated) {
      preventBackNavigation()
    }
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !isAuthenticated) {
      preventBackNavigation()
      window.location.replace(redirectTo)
    }
  }

  // Add event listeners
  window.addEventListener('popstate', handlePopState)
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Initial setup
  if (!isAuthenticated) {
    preventBackNavigation()
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

export const clearBrowserHistory = () => {
  // Clear browser history by replacing current state multiple times
  window.history.replaceState(null, '', '/login')
  window.history.pushState(null, '', '/login')
  window.history.pushState(null, '', '/login')
  window.history.back()
  
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name)
      })
    })
  }
}
