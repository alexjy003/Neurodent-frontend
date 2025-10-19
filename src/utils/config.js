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

  // Production environment: use relative path or fallback
  if (import.meta.env.PROD) {
    console.warn('⚠️ VITE_API_BASE_URL not set in production environment');
    return import.meta.env.VITE_API_FALLBACK_URL || '/api';
  }

  // Development environment: use fallback or default localhost
  return import.meta.env.VITE_API_FALLBACK_URL || 'http://localhost:5000/api';
};

/**
 * Get the frontend base URL for redirects and links
 * @returns {string} The frontend base URL
 */
export const getFrontendBaseUrl = () => {
  if (import.meta.env.VITE_FRONTEND_URL) {
    return import.meta.env.VITE_FRONTEND_URL;
  }

  // Default based on environment
  if (import.meta.env.PROD) {
    return window.location.origin;
  }

  return import.meta.env.VITE_FRONTEND_FALLBACK_URL || 'http://localhost:3000';
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