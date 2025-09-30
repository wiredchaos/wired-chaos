/**
 * Environment utilities for WIRED CHAOS
 * Provides safe access to environment variables across different bundlers
 * (Create React App, Vite, Next.js)
 */

let hasWarned = false;

/**
 * Get environment variable safely across bundlers
 * @param {string} key - Environment variable name (without prefix)
 * @returns {string|undefined}
 */
function getEnv(key) {
  // Create React App (REACT_APP_ prefix)
  if (typeof process !== 'undefined' && process.env && process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`];
  }
  
  // Vite (VITE_ prefix)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`];
  }
  
  // Next.js (NEXT_PUBLIC_ prefix)
  if (typeof process !== 'undefined' && process.env && process.env[`NEXT_PUBLIC_${key}`]) {
    return process.env[`NEXT_PUBLIC_${key}`];
  }
  
  // Fallback to unprefixed
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return undefined;
}

/**
 * Warn once in development when environment variable is missing
 * @param {string} key - Environment variable name
 */
function warnOnce(key) {
  if (!hasWarned && process.env.NODE_ENV === 'development') {
    console.warn(`[env.js] Environment variable ${key} not found. Using fallback.`);
    hasWarned = true;
  }
}

/**
 * Get Suite URL from environment
 * @returns {string|null} - Suite URL or null if not configured
 */
export function getSuiteUrl() {
  const url = getEnv('SUITE_URL');
  if (!url) {
    warnOnce('SUITE_URL');
  }
  return url || null;
}

/**
 * Get Tax Suite URL from environment
 * @returns {string|null} - Tax Suite URL or null if not configured
 */
export function getTaxSuiteUrl() {
  const url = getEnv('TAX_SUITE_URL');
  if (!url) {
    warnOnce('TAX_SUITE_URL');
  }
  return url || null;
}

/**
 * Get Backend URL from environment
 * @returns {string} - Backend URL with fallback to current origin
 */
export function getBackendUrl() {
  const url = getEnv('BACKEND_URL');
  if (!url) {
    warnOnce('BACKEND_URL');
    // Fallback to current origin for local development
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  }
  return url;
}

/**
 * Get API base URL
 * @returns {string} - API base URL
 */
export function getApiUrl() {
  return `${getBackendUrl()}/api`;
}

/**
 * Check if running in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export default {
  getSuiteUrl,
  getTaxSuiteUrl,
  getBackendUrl,
  getApiUrl,
  isDevelopment,
  isProduction,
};
