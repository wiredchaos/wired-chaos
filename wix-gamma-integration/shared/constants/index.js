/**
 * WIRED CHAOS - WIX/GAMMA Integration Constants
 * Unified constants for the integration system
 */

// WIRED CHAOS Brand Colors
export const COLORS = {
  BLACK: '#000000',
  NEON_CYAN: '#00FFFF',
  GLITCH_RED: '#FF3131',
  ELECTRIC_GREEN: '#39FF14',
  ACCENT_PINK: '#FF00FF',
  DARK_GRAY: '#1a1a1a',
  MID_GRAY: '#333333'
};

// Security Headers
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// Content Security Policy
export const CSP = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.wix.com', 'https://static.wixstatic.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://cdn.wix.com', 'https://static.wixstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.wix.com', 'https://*.gamma.app', 'https://*.cloudflare.com'],
  'frame-src': ["'self'", 'https://*.wix.com', 'https://*.gamma.app'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'", 'https://*.wix.com']
};

// CORS Configuration
export const CORS_CONFIG = {
  allowedOrigins: [
    'https://*.wix.com',
    'https://*.wixsite.com',
    'https://*.gamma.app',
    'https://*.pages.dev'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  maxAge: 86400
};

// API Endpoints
export const API_ENDPOINTS = {
  WIX: {
    AUTH: 'https://www.wix.com/oauth/access',
    API_BASE: 'https://www.wixapis.com',
    SITE: '/site/v1/sites',
    DATA: '/wix-data/v2/items',
    MEMBERS: '/members/v1/members'
  },
  GAMMA: {
    AUTH: 'https://gamma.app/api/auth',
    API_BASE: 'https://gamma.app/api/v1',
    PRESENTATIONS: '/presentations',
    TEMPLATES: '/templates',
    EXPORTS: '/exports'
  }
};

// Rate Limiting
export const RATE_LIMITS = {
  WIX: {
    requests: 100,
    window: 60000 // 1 minute
  },
  GAMMA: {
    requests: 50,
    window: 60000
  }
};

// Event Types for Analytics
export const EVENT_TYPES = {
  WIX: {
    PAGE_VIEW: 'wix.page.view',
    FORM_SUBMIT: 'wix.form.submit',
    AR_VIEW: 'wix.ar.view',
    MODEL_LOAD: 'wix.model.load'
  },
  GAMMA: {
    PRESENTATION_CREATE: 'gamma.presentation.create',
    PRESENTATION_VIEW: 'gamma.presentation.view',
    SLIDE_EDIT: 'gamma.slide.edit',
    EXPORT: 'gamma.export'
  }
};

// Cache Configuration
export const CACHE_CONFIG = {
  WIX_CONTENT: 300, // 5 minutes
  GAMMA_PRESENTATIONS: 600, // 10 minutes
  STATIC_ASSETS: 86400, // 24 hours
  API_RESPONSES: 60 // 1 minute
};

// XR Configuration
export const XR_CONFIG = {
  supportedFormats: ['glb', 'usdz', 'gltf'],
  maxModelSize: 50 * 1024 * 1024, // 50MB
  lazyLoadThreshold: 0.5,
  qualityLevels: ['low', 'medium', 'high']
};
