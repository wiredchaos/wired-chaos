/**
 * WIRED CHAOS - Bundler-Safe Environment Helpers
 * 
 * Supports multiple bundler environments:
 * - Vite: import.meta.env.VITE_*
 * - Create React App: process.env.REACT_APP_*
 * - Next.js: process.env.NEXT_PUBLIC_*
 */

let suiteUrlWarned = false;
let taxSuiteUrlWarned = false;

/**
 * Get Suite URL in a bundler-safe way
 * Checks in order: Vite, CRA, Next.js
 * @returns {string} Trimmed Suite URL or empty string
 */
export function getSuiteUrl() {
  let url = '';
  
  // Check Vite first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    url = import.meta.env.VITE_SUITE_URL || import.meta.env.REACT_APP_SUITE_URL || '';
  }
  
  // Fallback to process.env for CRA/Next.js
  if (!url && typeof process !== 'undefined' && process.env) {
    url = process.env.REACT_APP_SUITE_URL || process.env.NEXT_PUBLIC_SUITE_URL || '';
  }
  
  const trimmedUrl = (url || '').trim();
  
  // Warn once in development if URL is empty
  if (!trimmedUrl && !suiteUrlWarned && process.env.NODE_ENV === 'development') {
    console.warn('[env] Suite URL not configured. Set REACT_APP_SUITE_URL, VITE_SUITE_URL, or NEXT_PUBLIC_SUITE_URL to enable the Suite button.');
    suiteUrlWarned = true;
  }
  
  return trimmedUrl;
}

/**
 * Get Tax Suite URL in a bundler-safe way
 * Checks in order: Vite (VITE_TAX_SUITE_URL or REACT_APP_TAX_SUITE_URL), Next.js
 * @returns {string} Trimmed Tax Suite URL or empty string
 */
export function getTaxSuiteUrl() {
  let url = '';
  
  // Check Vite first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    url = import.meta.env.VITE_TAX_SUITE_URL || import.meta.env.REACT_APP_TAX_SUITE_URL || '';
  }
  
  // Fallback to process.env for CRA/Next.js
  if (!url && typeof process !== 'undefined' && process.env) {
    url = process.env.REACT_APP_TAX_SUITE_URL || process.env.NEXT_PUBLIC_TAX_SUITE_URL || '';
  }
  
  const trimmedUrl = (url || '').trim();
  
  // Warn once in development if URL is empty
  if (!trimmedUrl && !taxSuiteUrlWarned && process.env.NODE_ENV === 'development') {
    console.warn('[env] Tax Suite URL not configured. Set REACT_APP_TAX_SUITE_URL, VITE_TAX_SUITE_URL, or NEXT_PUBLIC_TAX_SUITE_URL if needed.');
    taxSuiteUrlWarned = true;
  }
  
  return trimmedUrl;
}

export default {
  getSuiteUrl,
  getTaxSuiteUrl
};
