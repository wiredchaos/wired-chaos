/**
 * Environment Configuration Management
 * Handles environment-specific settings and secrets
 */

import { config } from './gamma-config.js';

/**
 * Environment presets for different deployment scenarios
 */
export const environments = {
  development: {
    name: 'development',
    gamma: {
      ...config.gamma,
      apiBase: 'https://gamma.app/api/v1'
    },
    wix: {
      ...config.wix
    },
    automation: {
      ...config.automation,
      enableLogging: true,
      enableNotifications: false
    }
  },
  staging: {
    name: 'staging',
    gamma: {
      ...config.gamma
    },
    wix: {
      ...config.wix
    },
    automation: {
      ...config.automation,
      enableLogging: true,
      enableNotifications: true
    }
  },
  production: {
    name: 'production',
    gamma: {
      ...config.gamma
    },
    wix: {
      ...config.wix
    },
    automation: {
      ...config.automation,
      enableLogging: true,
      enableNotifications: true
    }
  }
};

/**
 * Get current environment configuration
 */
export function getCurrentEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
}

/**
 * Check if required environment variables are set
 */
export function checkEnvironmentVariables() {
  const required = [
    'GAMMA_API_TOKEN',
    'WIX_API_TOKEN',
    'WIX_SITE_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    return false;
  }
  
  return true;
}

/**
 * Load environment from .env file if available
 */
export async function loadEnvironment() {
  try {
    // Try to import dotenv if available
    const dotenv = await import('dotenv');
    dotenv.config();
    console.log('✅ Environment loaded from .env file');
  } catch (error) {
    // dotenv not available, use system env vars
    console.log('ℹ️  Using system environment variables');
  }
}

export default {
  environments,
  getCurrentEnvironment,
  checkEnvironmentVariables,
  loadEnvironment
};
