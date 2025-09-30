/**
 * Environment variable utilities for WIRED CHAOS
 * CRA/Vite/Next-safe resolution patterns with dev-only warnings
 */

// Track warnings to only show once per session
const warnedKeys = new Set();

/**
 * Safely get environment variable with dev-only warning
 * @param {string} key - Environment variable key (without REACT_APP_ prefix)
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value or default
 */
const getEnvVar = (key, defaultValue = '') => {
  // CRA pattern: REACT_APP_*
  const craKey = `REACT_APP_${key}`;
  let value = process.env[craKey];
  
  // Vite pattern: VITE_*
  if (!value && typeof import.meta !== 'undefined' && import.meta.env) {
    value = import.meta.env[`VITE_${key}`];
  }
  
  // Next.js pattern: NEXT_PUBLIC_*
  if (!value) {
    value = process.env[`NEXT_PUBLIC_${key}`];
  }
  
  // Warn once if missing (dev only)
  if (!value && process.env.NODE_ENV === 'development' && !warnedKeys.has(key)) {
    console.warn(`[env] ${key} not configured. Using default: "${defaultValue}"`);
    warnedKeys.add(key);
  }
  
  return value || defaultValue;
};

/**
 * Get Suite URL from environment
 * @returns {string} Suite URL or empty string
 */
export const getSuiteUrl = () => {
  return getEnvVar('SUITE_URL', '');
};

/**
 * Get Tax Suite URL from environment
 * @returns {string} Tax Suite URL or empty string
 */
export const getTaxSuiteUrl = () => {
  return getEnvVar('TAX_SUITE_URL', '');
};
