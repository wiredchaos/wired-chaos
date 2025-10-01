/**
 * WIRED CHAOS - Suite Helper
 * Utilities for interacting with the management/admin suite
 */

import { SUITE_URL } from '../config/env';

/**
 * Check if Suite URL is configured
 * @returns {boolean} True if Suite URL is available
 */
export const isSuiteConfigured = () => {
  return Boolean(SUITE_URL && SUITE_URL.trim().length > 0);
};

/**
 * Open Suite in a new window
 * @param {string} path - Optional path to append to Suite URL
 */
export const openSuite = (path = '') => {
  if (!isSuiteConfigured()) {
    console.warn('Suite URL is not configured. Set REACT_APP_SUITE_URL environment variable.');
    return;
  }

  const fullUrl = path ? `${SUITE_URL}${path}` : SUITE_URL;
  
  try {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open Suite:', error);
  }
};

/**
 * Get the Suite URL
 * @returns {string} The configured Suite URL or empty string
 */
export const getSuiteUrl = () => {
  return SUITE_URL;
};

export default {
  isSuiteConfigured,
  openSuite,
  getSuiteUrl
};
