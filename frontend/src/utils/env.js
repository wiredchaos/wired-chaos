/**
 * Bundler-safe environment variable resolver
 * Supports both Create React App (REACT_APP_*) and Vite (VITE_*)
 */

let suiteUrlWarned = false;

/**
 * Get Suite URL from environment variables
 * Supports both CRA (REACT_APP_SUITE_URL) and Vite (VITE_SUITE_URL) prefixes
 * @returns {string} The Suite URL or empty string if not set
 */
export const getSuiteUrl = () => {
  // Check for CRA-style env var first
  if (typeof process !== 'undefined' && process.env?.REACT_APP_SUITE_URL) {
    return process.env.REACT_APP_SUITE_URL;
  }
  
  // Check for Vite-style env var
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUITE_URL) {
    return import.meta.env.VITE_SUITE_URL;
  }
  
  // Warn once in development if Suite URL is not set
  if (process.env.NODE_ENV !== 'production' && !suiteUrlWarned) {
    console.warn('Suite URL not set; set REACT_APP_SUITE_URL or VITE_SUITE_URL');
    suiteUrlWarned = true;
  }
  
  return '';
};

/**
 * Get backend URL from environment variables
 * @returns {string} The backend URL or default
 */
export const getBackendUrl = () => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  return 'http://localhost:8000';
};

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV !== undefined) {
    return import.meta.env.DEV;
  }
  
  return false;
};

export default {
  getSuiteUrl,
  getBackendUrl,
  isDevelopment
};
