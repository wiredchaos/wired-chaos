/**
 * SWARM Bot - Monitoring Configuration
 * Central configuration for all monitoring systems
 */

module.exports = {
  // General settings
  general: {
    monitoringInterval: 300000, // 5 minutes
    autoResolve: true,
    dryRun: process.env.SWARM_DRY_RUN === 'true',
    logLevel: process.env.SWARM_LOG_LEVEL || 'info'
  },

  // Endpoint monitoring
  endpoint: {
    timeout: 5000,
    retries: 3,
    endpoints: [
      {
        name: 'Main Health',
        url: 'https://www.wiredchaos.xyz/api/health',
        critical: true
      },
      {
        name: 'Suite Landing',
        url: 'https://www.wiredchaos.xyz/suite',
        critical: true
      },
      {
        name: 'Tax Suite',
        url: 'https://www.wiredchaos.xyz/tax',
        critical: false
      },
      {
        name: 'VSP',
        url: 'https://www.wiredchaos.xyz/vsp',
        critical: false
      },
      {
        name: 'Worker Health',
        url: 'https://www.wiredchaos.xyz/health',
        critical: true
      },
      {
        name: 'School Page',
        url: 'https://www.wiredchaos.xyz/school',
        critical: false
      }
    ]
  },

  // Build monitoring
  build: {
    owner: process.env.GITHUB_OWNER || 'wiredchaos',
    repo: process.env.GITHUB_REPO || 'wired-chaos',
    workflows: [
      'deploy-worker.yml',
      'deploy-frontend.yml',
      'edge-smoke.yml',
      'emergent-deploy.yml',
      'emergency-deploy.yml'
    ],
    lookbackHours: 24,
    githubToken: process.env.GITHUB_TOKEN
  },

  // Dependency monitoring
  dependency: {
    packageFiles: [
      'package.json',
      'frontend/package.json',
      'gamma-wix-automation/package.json',
      'wix-gamma-integration/package.json'
    ],
    checkVulnerabilities: true,
    checkOutdated: true
  },

  // Performance monitoring
  performance: {
    endpoints: [
      {
        name: 'Main Site',
        url: 'https://www.wiredchaos.xyz/',
        threshold: 2000
      },
      {
        name: 'API Health',
        url: 'https://www.wiredchaos.xyz/api/health',
        threshold: 1000
      },
      {
        name: 'Suite Landing',
        url: 'https://www.wiredchaos.xyz/suite',
        threshold: 2000
      }
    ],
    samples: 3,
    timeout: 10000
  },

  // Resolution settings
  resolution: {
    endpoint: {
      maxAttempts: 3,
      cooldown: 300000 // 5 minutes
    },
    build: {
      maxRetries: 2
    }
  },

  // Escalation settings
  escalation: {
    github: {
      enabled: true,
      owner: process.env.GITHUB_OWNER || 'wiredchaos',
      repo: process.env.GITHUB_REPO || 'wired-chaos',
      labels: ['swarm-bot', 'automated'],
      createIssues: true
    },
    discord: {
      enabled: process.env.DISCORD_WEBHOOK_URL ? true : false,
      webhookUrl: process.env.DISCORD_WEBHOOK_URL
    },
    email: {
      enabled: false,
      recipients: []
    }
  },

  // Health thresholds
  thresholds: {
    critical: 70,
    warning: 85,
    good: 95
  }
};
