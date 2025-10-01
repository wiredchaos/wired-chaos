/**
 * GAMMA-Wix Automation Configuration
 * Centralized configuration for GAMMA and Wix integrations
 */

export const config = {
  gamma: {
    apiToken: process.env.GAMMA_API_TOKEN || '',
    apiBase: process.env.GAMMA_API_BASE || 'https://gamma.app/api/v1',
    templateIds: {
      component: process.env.GAMMA_TEMPLATE_COMPONENT || 'template-component-id',
      feature: process.env.GAMMA_TEMPLATE_FEATURE || 'template-feature-id',
      milestone: process.env.GAMMA_TEMPLATE_MILESTONE || 'template-milestone-id',
      api: process.env.GAMMA_TEMPLATE_API || 'template-api-id',
      onboarding: process.env.GAMMA_TEMPLATE_ONBOARDING || 'template-onboarding-id'
    },
    brandingSettings: {
      primaryColor: '#00fff0',      // Cyan
      secondaryColor: '#ff2a2a',    // Red
      accentColor: '#8000ff',       // Purple
      backgroundColor: '#000000',   // Black
      textColor: '#ffffff',         // White
      fonts: {
        primary: 'Orbitron',
        secondary: 'Rajdhani',
        monospace: 'Share Tech Mono'
      }
    }
  },
  wix: {
    siteId: process.env.WIX_SITE_ID || '7aa81323-433d-4763-b6dc-5d98d409c459',
    apiToken: process.env.WIX_API_TOKEN || '',
    apiBase: process.env.WIX_API_BASE || 'https://www.wixapis.com',
    galleryIds: {
      components: process.env.WIX_GALLERY_COMPONENTS || 'gallery-components-id',
      features: process.env.WIX_GALLERY_FEATURES || 'gallery-features-id',
      milestones: process.env.WIX_GALLERY_MILESTONES || 'gallery-milestones-id',
      api: process.env.WIX_GALLERY_API || 'gallery-api-id'
    }
  },
  automation: {
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '2000'),
    batchSize: parseInt(process.env.BATCH_SIZE || '5'),
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    enableLogging: process.env.ENABLE_LOGGING !== 'false'
  },
  notifications: {
    discord: {
      enabled: process.env.DISCORD_ENABLED === 'true',
      webhookUrl: process.env.DISCORD_WEBHOOK_URL || ''
    },
    telegram: {
      enabled: process.env.TELEGRAM_ENABLED === 'true',
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || ''
    }
  },
  github: {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || 'wiredchaos',
    repo: process.env.GITHUB_REPO || 'wired-chaos'
  }
};

/**
 * Validate configuration
 */
export function validateConfig() {
  const errors = [];
  
  if (!config.gamma.apiToken) {
    errors.push('GAMMA_API_TOKEN is required');
  }
  
  if (!config.wix.apiToken) {
    errors.push('WIX_API_TOKEN is required');
  }
  
  if (!config.wix.siteId) {
    errors.push('WIX_SITE_ID is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return true;
}

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    ...config,
    environment: env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test'
  };
}

export default config;
