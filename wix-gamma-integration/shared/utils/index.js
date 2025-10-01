/**
 * WIRED CHAOS - Shared Utility Functions
 * Common utilities for WIX and GAMMA integration
 */

import { COLORS, CSP, CORS_CONFIG } from '../constants/index.js';

/**
 * Generate Content Security Policy header value
 */
export function generateCSP() {
  const directives = Object.entries(CSP)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  return directives;
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(headers = {}) {
  return {
    ...headers,
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': generateCSP(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
}

/**
 * Apply CORS headers to response
 */
export function applyCORSHeaders(origin, headers = {}) {
  const isAllowed = CORS_CONFIG.allowedOrigins.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(origin);
    }
    return pattern === origin;
  });

  if (!isAllowed) {
    return headers;
  }

  return {
    ...headers,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': CORS_CONFIG.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString()
  };
}

/**
 * Create API response with standard format
 */
export function createApiResponse(success, data = null, error = null, metadata = {}) {
  return {
    success,
    data,
    error,
    metadata: {
      timestamp: Date.now(),
      ...metadata
    }
  };
}

/**
 * Handle API error and create error response
 */
export function createErrorResponse(code, message, details = null) {
  return createApiResponse(false, null, {
    code,
    message,
    details
  });
}

/**
 * Validate bearer token
 */
export function validateBearerToken(authHeader, validToken) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === validToken;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token, expectedToken) {
  if (!token || !expectedToken) {
    return false;
  }
  return token === expectedToken;
}

/**
 * Rate limiting check
 */
export class RateLimiter {
  constructor(requests, windowMs) {
    this.requests = requests;
    this.windowMs = windowMs;
    this.storage = new Map();
  }

  check(identifier) {
    const now = Date.now();
    const key = identifier;
    
    if (!this.storage.has(key)) {
      this.storage.set(key, []);
    }

    const timestamps = this.storage.get(key).filter(ts => now - ts < this.windowMs);
    
    if (timestamps.length >= this.requests) {
      return false;
    }

    timestamps.push(now);
    this.storage.set(key, timestamps);
    return true;
  }

  reset(identifier) {
    this.storage.delete(identifier);
  }
}

/**
 * Apply WIRED CHAOS branding to object
 */
export function applyWiredChaosBranding() {
  return {
    logo: 'WIRED CHAOS',
    colors: {
      black: COLORS.BLACK,
      neonCyan: COLORS.NEON_CYAN,
      glitchRed: COLORS.GLITCH_RED,
      electricGreen: COLORS.ELECTRIC_GREEN,
      accentPink: COLORS.ACCENT_PINK
    },
    fonts: {
      primary: 'Orbitron, sans-serif',
      secondary: 'Rajdhani, sans-serif',
      monospace: 'Share Tech Mono, monospace'
    },
    assets: {
      logoUrl: '/assets/wired-chaos-logo.png',
      backgroundUrl: '/assets/cyber-bg.png',
      iconUrl: '/assets/wired-chaos-icon.png'
    }
  };
}

/**
 * Format timestamp to ISO string
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toISOString();
}

/**
 * Parse query string
 */
export function parseQueryString(search) {
  const params = new URLSearchParams(search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(params) {
  return new URLSearchParams(params).toString();
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return html.replace(/[&<>"'/]/g, char => map[char]);
}

/**
 * Generate unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}`;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Validate URL
 */
export function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Hash string using SHA-256
 */
export async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare two objects for equality
 */
export function objectsEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Merge objects deeply
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
