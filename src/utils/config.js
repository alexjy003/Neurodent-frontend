/**
 * Configuration utility for environment-based API URLs
 */

/**
 * Get the API base URL based on environment variables
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  // Check for explicit API base URL first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Production environment: use relative path
  if (import.meta.env.PROD) {
    console.warn('⚠️ VITE_API_BASE_URL not set in production environment, using relative path');
    return '/api';
  }

  // Development environment: use localhost
  return 'http://localhost:5000/api';
};

/**
 * Get the frontend base URL for redirects and links
 * @returns {string} The frontend base URL
 */
export const getFrontendBaseUrl = () => {
  // Use the same frontend URL variable, fallback to current origin in production
  return import.meta.env.VITE_FRONTEND_URL || 
         (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
};

// Export the configured URLs for immediate use
export const API_BASE_URL = getApiBaseUrl();
export const FRONTEND_BASE_URL = getFrontendBaseUrl();

console.log('🔧 Configuration loaded:', {
  API_BASE_URL,
  FRONTEND_BASE_URL,
  NODE_ENV: import.meta.env.MODE,
  PROD: import.meta.env.PROD
});