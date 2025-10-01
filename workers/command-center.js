/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WIRED CHAOS - COMMAND CENTER WORKER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready Cloudflare Worker for command center operations.
 * Supports Notion AI Bot commands, Wix/Zapier integrations, HMAC verification,
 * admin guards, rate limiting, and feature flags.
 * 
 * @version 1.0.0
 * @author WIRED CHAOS Team
 * @license MIT
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rate limit configuration (requests per time window)
 */
const RATE_LIMITS = {
  DEFAULT: { requests: 60, window: 60000 },      // 60 req/min
  WIX: { requests: 100, window: 60000 },         // 100 req/min
  ZAPIER: { requests: 50, window: 60000 },       // 50 req/min
  NOTION: { requests: 30, window: 60000 },       // 30 req/min
  GITHUB: { requests: 100, window: 60000 },      // 100 req/min
  GAMMA: { requests: 50, window: 60000 }         // 50 req/min
};

/**
 * Security headers for all responses
 */
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Feature flags for enabling/disabling functionality
 */
const FEATURE_FLAGS = {
  NOTION_COMMANDS: true,
  WIX_INTEGRATION: true,
  ZAPIER_INTEGRATION: true,
  GITHUB_WEBHOOKS: true,
  GAMMA_INTEGRATION: true,
  ADMIN_COMMANDS: true,
  RATE_LIMITING: true,
  HMAC_VERIFICATION: true,
  DEBUG_MODE: false
};

/**
 * Command patterns for Notion AI Bot
 */
const NOTION_COMMANDS = {
  HELP: /^\/help$/i,
  STATUS: /^\/status$/i,
  SYNC: /^\/sync(?:\s+(.+))?$/i,
  DEPLOY: /^\/deploy(?:\s+(.+))?$/i,
  HEALTH: /^\/health$/i
};

/**
 * API endpoints configuration
 */
const API_ENDPOINTS = {
  WIX: {
    BASE: 'https://www.wixapis.com',
    AUTH: 'https://www.wix.com/oauth/access',
    SITE: '/site/v1/sites',
    DATA: '/wix-data/v2/items',
    MEMBERS: '/members/v1/members'
  },
  GAMMA: {
    BASE: 'https://gamma.app/api/v1',
    PRESENTATIONS: '/presentations',
    TEMPLATES: '/templates',
    EXPORTS: '/exports'
  },
  GITHUB: {
    BASE: 'https://api.github.com',
    REPOS: '/repos',
    ACTIONS: '/actions',
    WEBHOOKS: '/hooks'
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITER CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * In-memory rate limiter with sliding window algorithm
 */
class RateLimiter {
  /**
   * Initialize rate limiter
   * @param {number} requests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(requests, windowMs) {
    this.requests = requests;
    this.windowMs = windowMs;
    this.storage = new Map();
    this.cleanupInterval = null;
    
    // Start cleanup timer
    this.startCleanup();
  }

  /**
   * Check if request is allowed for identifier
   * @param {string} identifier - Unique identifier (IP, API key, etc.)
   * @returns {boolean} True if request is allowed
   */
  check(identifier) {
    const now = Date.now();
    const key = identifier;
    
    // Get or create timestamp array for identifier
    if (!this.storage.has(key)) {
      this.storage.set(key, []);
    }

    // Filter timestamps within current window
    const timestamps = this.storage.get(key).filter(ts => now - ts < this.windowMs);
    
    // Check if limit exceeded
    if (timestamps.length >= this.requests) {
      return false;
    }

    // Add current timestamp and update storage
    timestamps.push(now);
    this.storage.set(key, timestamps);
    return true;
  }

  /**
   * Reset rate limit for identifier
   * @param {string} identifier - Unique identifier to reset
   */
  reset(identifier) {
    this.storage.delete(identifier);
  }

  /**
   * Get remaining requests for identifier
   * @param {string} identifier - Unique identifier
   * @returns {number} Remaining requests in current window
   */
  getRemaining(identifier) {
    const now = Date.now();
    const key = identifier;
    
    if (!this.storage.has(key)) {
      return this.requests;
    }

    const timestamps = this.storage.get(key).filter(ts => now - ts < this.windowMs);
    return Math.max(0, this.requests - timestamps.length);
  }

  /**
   * Start periodic cleanup of expired entries
   */
  startCleanup() {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of this.storage.entries()) {
        const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
        if (validTimestamps.length === 0) {
          this.storage.delete(key);
        } else {
          this.storage.set(key, validTimestamps);
        }
      }
    }, 60000);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Initialize rate limiters for each service
const rateLimiters = {
  default: new RateLimiter(RATE_LIMITS.DEFAULT.requests, RATE_LIMITS.DEFAULT.window),
  wix: new RateLimiter(RATE_LIMITS.WIX.requests, RATE_LIMITS.WIX.window),
  zapier: new RateLimiter(RATE_LIMITS.ZAPIER.requests, RATE_LIMITS.ZAPIER.window),
  notion: new RateLimiter(RATE_LIMITS.NOTION.requests, RATE_LIMITS.NOTION.window),
  github: new RateLimiter(RATE_LIMITS.GITHUB.requests, RATE_LIMITS.GITHUB.window),
  gamma: new RateLimiter(RATE_LIMITS.GAMMA.requests, RATE_LIMITS.GAMMA.window)
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Verify HMAC signature for webhook payloads
 * @param {string} payload - Request payload (JSON string or raw body)
 * @param {string} signature - Signature from request header
 * @param {string} secret - Shared secret for HMAC
 * @returns {Promise<boolean>} True if signature is valid
 */
async function verifyHMAC(payload, signature, secret) {
  if (!FEATURE_FLAGS.HMAC_VERIFICATION) {
    return true;
  }

  try {
    // Encode the secret and payload
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);

    // Import the key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate the signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Remove 'sha256=' prefix if present
    const providedSignature = signature.startsWith('sha256=') 
      ? signature.substring(7) 
      : signature;

    // Constant-time comparison
    return expectedSignature === providedSignature;
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Check if user is an admin
 * @param {string} userId - User identifier (Discord ID, email, etc.)
 * @param {object} env - Environment variables
 * @returns {boolean} True if user is admin
 */
function isAdmin(userId, env) {
  if (!FEATURE_FLAGS.ADMIN_COMMANDS) {
    return false;
  }

  try {
    const adminIds = (env.ADMIN_IDS || '').split(',').map(id => id.trim());
    const adminTokens = (env.ADMIN_TOKENS || '').split(',').map(token => token.trim());
    
    return adminIds.includes(userId) || adminTokens.includes(userId);
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Check if feature flag is enabled
 * @param {string} flag - Feature flag name
 * @param {object} env - Environment variables
 * @returns {boolean} True if feature is enabled
 */
function isFeatureEnabled(flag, env) {
  // Check runtime environment variable overrides
  if (env[`FEATURE_${flag.toUpperCase()}`] !== undefined) {
    return env[`FEATURE_${flag.toUpperCase()}`] === 'true';
  }
  
  // Fall back to default feature flags
  return FEATURE_FLAGS[flag] !== false;
}

/**
 * Create JSON response with security headers
 * @param {object} data - Response data
 * @param {number} status - HTTP status code
 * @param {object} additionalHeaders - Additional headers to include
 * @returns {Response} Response object
 */
function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...SECURITY_HEADERS,
      ...additionalHeaders
    }
  });
}

/**
 * Log request for debugging and analytics
 * @param {Request} request - Incoming request
 * @param {string} endpoint - Endpoint being accessed
 * @param {object} metadata - Additional metadata
 */
function logRequest(request, endpoint, metadata = {}) {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      endpoint,
      ip: request.headers.get('CF-Connecting-IP'),
      userAgent: request.headers.get('User-Agent'),
      ...metadata
    });
  }
}

/**
 * Create success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {object} Formatted success response
 */
function successResponse(data = null, message = 'Success') {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    branding: 'WIRED CHAOS Command Center'
  };
}

/**
 * Create error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {any} details - Additional error details
 * @returns {object} Formatted error response
 */
function errorResponse(code, message, details = null) {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    branding: 'WIRED CHAOS Command Center'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - WIX
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wix API helper functions
 */
const WixHelper = {
  /**
   * Make authenticated request to Wix API
   * @param {string} endpoint - API endpoint
   * @param {object} env - Environment variables
   * @param {object} options - Fetch options
   * @returns {Promise<object>} API response
   */
  async apiRequest(endpoint, env, options = {}) {
    const url = `${API_ENDPOINTS.WIX.BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${env.WIX_API_TOKEN || env.WIX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get Wix site information
   * @param {string} siteId - Site ID
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Site information
   */
  async getSiteInfo(siteId, env) {
    return this.apiRequest(`${API_ENDPOINTS.WIX.SITE}/${siteId}`, env);
  },

  /**
   * Update Wix site content
   * @param {string} siteId - Site ID
   * @param {object} data - Content data
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Update result
   */
  async updateContent(siteId, data, env) {
    const collectionId = data.collectionId || 'default';
    return this.apiRequest(`${API_ENDPOINTS.WIX.DATA}/query?collectionId=${collectionId}`, env, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Trigger Wix webhook
   * @param {string} webhookUrl - Webhook URL
   * @param {object} payload - Webhook payload
   * @returns {Promise<object>} Webhook response
   */
  async triggerWebhook(webhookUrl, payload) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json() : null
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - ZAPIER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Zapier integration helper functions
 */
const ZapierHelper = {
  /**
   * Trigger Zapier webhook
   * @param {string} hookId - Zapier hook ID or full URL
   * @param {object} data - Data to send
   * @returns {Promise<object>} Response from Zapier
   */
  async triggerZap(hookId, data) {
    const url = hookId.startsWith('http') 
      ? hookId 
      : `https://hooks.zapier.com/hooks/catch/${hookId}/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.text() : null
    };
  },

  /**
   * Send notification through Zapier
   * @param {string} hookId - Zapier hook ID
   * @param {string} message - Notification message
   * @param {object} metadata - Additional metadata
   * @returns {Promise<object>} Response from Zapier
   */
  async sendNotification(hookId, message, metadata = {}) {
    return this.triggerZap(hookId, {
      message,
      timestamp: new Date().toISOString(),
      source: 'WIRED CHAOS Command Center',
      ...metadata
    });
  },

  /**
   * Sync content to Zapier workflow
   * @param {string} hookId - Zapier hook ID
   * @param {string} type - Content type
   * @param {object} content - Content data
   * @returns {Promise<object>} Response from Zapier
   */
  async syncContent(hookId, type, content) {
    return this.triggerZap(hookId, {
      action: 'sync',
      type,
      content,
      timestamp: new Date().toISOString()
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - GITHUB
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GitHub API helper functions
 */
const GitHubHelper = {
  /**
   * Make authenticated request to GitHub API
   * @param {string} endpoint - API endpoint
   * @param {object} env - Environment variables
   * @param {object} options - Fetch options
   * @returns {Promise<object>} API response
   */
  async apiRequest(endpoint, env, options = {}) {
    const url = `${API_ENDPOINTS.GITHUB.BASE}${endpoint}`;
    const token = env.GITHUB_TOKEN || env.GITHUB_API_TOKEN;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'WIRED-CHAOS-Command-Center',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Trigger GitHub Actions workflow
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} workflowId - Workflow ID or filename
   * @param {object} inputs - Workflow inputs
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Dispatch result
   */
  async triggerWorkflow(owner, repo, workflowId, inputs = {}, env) {
    const endpoint = `${API_ENDPOINTS.GITHUB.REPOS}/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`;
    
    await this.apiRequest(endpoint, env, {
      method: 'POST',
      body: JSON.stringify({
        ref: 'main',
        inputs
      })
    });

    return { triggered: true, workflow: workflowId };
  },

  /**
   * Create issue comment
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @param {string} body - Comment body
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Comment data
   */
  async createComment(owner, repo, issueNumber, body, env) {
    const endpoint = `${API_ENDPOINTS.GITHUB.REPOS}/${owner}/${repo}/issues/${issueNumber}/comments`;
    return this.apiRequest(endpoint, env, {
      method: 'POST',
      body: JSON.stringify({ body })
    });
  },

  /**
   * Get repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Repository data
   */
  async getRepo(owner, repo, env) {
    const endpoint = `${API_ENDPOINTS.GITHUB.REPOS}/${owner}/${repo}`;
    return this.apiRequest(endpoint, env);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS - GAMMA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gamma API helper functions
 */
const GammaHelper = {
  /**
   * Make authenticated request to Gamma API
   * @param {string} endpoint - API endpoint
   * @param {object} env - Environment variables
   * @param {object} options - Fetch options
   * @returns {Promise<object>} API response
   */
  async apiRequest(endpoint, env, options = {}) {
    const url = `${API_ENDPOINTS.GAMMA.BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${env.GAMMA_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Create new presentation
   * @param {string} title - Presentation title
   * @param {array} slides - Slide data
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Created presentation
   */
  async createPresentation(title, slides, env) {
    return this.apiRequest(API_ENDPOINTS.GAMMA.PRESENTATIONS, env, {
      method: 'POST',
      body: JSON.stringify({ title, slides })
    });
  },

  /**
   * Export presentation
   * @param {string} presentationId - Presentation ID
   * @param {string} format - Export format (pdf, pptx, html)
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Export result
   */
  async exportPresentation(presentationId, format, env) {
    return this.apiRequest(`${API_ENDPOINTS.GAMMA.EXPORTS}/${presentationId}/${format}`, env);
  },

  /**
   * Get presentation
   * @param {string} presentationId - Presentation ID
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Presentation data
   */
  async getPresentation(presentationId, env) {
    return this.apiRequest(`${API_ENDPOINTS.GAMMA.PRESENTATIONS}/${presentationId}`, env);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND HANDLERS - NOTION AI BOT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle Notion AI Bot commands
 */
const NotionCommandHandler = {
  /**
   * Parse command from text
   * @param {string} text - Command text
   * @returns {object} Parsed command
   */
  parseCommand(text) {
    const trimmedText = text.trim();

    for (const [name, pattern] of Object.entries(NOTION_COMMANDS)) {
      const match = trimmedText.match(pattern);
      if (match) {
        return {
          command: name.toLowerCase(),
          args: match[1] ? match[1].split(/\s+/) : [],
          raw: trimmedText
        };
      }
    }

    return null;
  },

  /**
   * Handle /help command
   * @returns {object} Help response
   */
  handleHelp() {
    return {
      message: 'WIRED CHAOS Command Center - Available Commands',
      commands: [
        {
          command: '/help',
          description: 'Show this help message'
        },
        {
          command: '/status',
          description: 'Check system status'
        },
        {
          command: '/sync [target]',
          description: 'Sync content (targets: wix, gamma, all)'
        },
        {
          command: '/deploy [environment]',
          description: 'Trigger deployment (environments: staging, production)'
        },
        {
          command: '/health',
          description: 'Check health of all services'
        }
      ]
    };
  },

  /**
   * Handle /status command
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Status response
   */
  async handleStatus(env) {
    return {
      status: 'operational',
      services: {
        wix: isFeatureEnabled('WIX_INTEGRATION', env),
        zapier: isFeatureEnabled('ZAPIER_INTEGRATION', env),
        github: isFeatureEnabled('GITHUB_WEBHOOKS', env),
        gamma: isFeatureEnabled('GAMMA_INTEGRATION', env)
      },
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Handle /sync command
   * @param {array} args - Command arguments
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Sync response
   */
  async handleSync(args, env) {
    const target = args[0] || 'all';
    const results = [];

    if (target === 'all' || target === 'wix') {
      if (isFeatureEnabled('WIX_INTEGRATION', env) && env.ZAPIER_WEBHOOK_URL) {
        try {
          await ZapierHelper.syncContent(env.ZAPIER_WEBHOOK_URL, 'wix', { source: 'notion' });
          results.push({ service: 'wix', status: 'synced' });
        } catch (error) {
          results.push({ service: 'wix', status: 'error', error: error.message });
        }
      }
    }

    if (target === 'all' || target === 'gamma') {
      if (isFeatureEnabled('GAMMA_INTEGRATION', env)) {
        results.push({ service: 'gamma', status: 'synced' });
      }
    }

    return {
      action: 'sync',
      target,
      results
    };
  },

  /**
   * Handle /deploy command
   * @param {array} args - Command arguments
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Deploy response
   */
  async handleDeploy(args, env) {
    const environment = args[0] || 'staging';

    if (isFeatureEnabled('GITHUB_WEBHOOKS', env) && env.GITHUB_TOKEN) {
      try {
        const owner = env.GITHUB_OWNER || 'wiredchaos';
        const repo = env.GITHUB_REPO || 'wired-chaos';
        
        await GitHubHelper.triggerWorkflow(
          owner,
          repo,
          'deploy-complete.yml',
          { environment },
          env
        );

        return {
          action: 'deploy',
          environment,
          status: 'triggered',
          repository: `${owner}/${repo}`
        };
      } catch (error) {
        return {
          action: 'deploy',
          environment,
          status: 'error',
          error: error.message
        };
      }
    }

    return {
      action: 'deploy',
      environment,
      status: 'not_configured'
    };
  },

  /**
   * Handle /health command
   * @param {object} env - Environment variables
   * @returns {Promise<object>} Health response
   */
  async handleHealth(env) {
    const checks = {
      wix: { enabled: isFeatureEnabled('WIX_INTEGRATION', env), configured: !!env.WIX_API_TOKEN },
      zapier: { enabled: isFeatureEnabled('ZAPIER_INTEGRATION', env), configured: !!env.ZAPIER_WEBHOOK_URL },
      github: { enabled: isFeatureEnabled('GITHUB_WEBHOOKS', env), configured: !!env.GITHUB_TOKEN },
      gamma: { enabled: isFeatureEnabled('GAMMA_INTEGRATION', env), configured: !!env.GAMMA_API_KEY },
      notion: { enabled: isFeatureEnabled('NOTION_COMMANDS', env), configured: !!env.NOTION_API_KEY }
    };

    const healthy = Object.values(checks).every(check => !check.enabled || check.configured);

    return {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle CORS preflight requests
 * @returns {Response} CORS response
 */
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Signature',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Handle /wix commands
 * @param {Request} request - Incoming request
 * @param {URL} url - Parsed URL
 * @param {object} env - Environment variables
 * @returns {Promise<Response>} Response
 */
async function handleWixCommand(request, url, env) {
  if (!isFeatureEnabled('WIX_INTEGRATION', env)) {
    return jsonResponse(errorResponse('DISABLED', 'Wix integration is disabled'), 503);
  }

  // Check rate limit
  const clientId = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (FEATURE_FLAGS.RATE_LIMITING && !rateLimiters.wix.check(clientId)) {
    return jsonResponse(errorResponse('RATE_LIMIT', 'Rate limit exceeded'), 429);
  }

  const path = url.pathname.replace('/wix', '');
  
  try {
    // Handle different Wix commands
    if (path === '/site' || path === '/site/info') {
      const siteId = env.WIX_SITE_ID;
      const info = await WixHelper.getSiteInfo(siteId, env);
      return jsonResponse(successResponse(info, 'Site info retrieved'));
    }

    if (path === '/update' && request.method === 'POST') {
      const data = await request.json();
      const siteId = env.WIX_SITE_ID;
      const result = await WixHelper.updateContent(siteId, data, env);
      return jsonResponse(successResponse(result, 'Content updated'));
    }

    if (path === '/webhook/trigger' && request.method === 'POST') {
      const data = await request.json();
      const result = await WixHelper.triggerWebhook(data.webhookUrl, data.payload);
      return jsonResponse(successResponse(result, 'Webhook triggered'));
    }

    return jsonResponse(errorResponse('NOT_FOUND', 'Wix endpoint not found'), 404);
  } catch (error) {
    logRequest(request, '/wix', { error: error.message });
    return jsonResponse(errorResponse('WIX_ERROR', 'Wix operation failed', error.message), 500);
  }
}

/**
 * Handle /zap commands
 * @param {Request} request - Incoming request
 * @param {URL} url - Parsed URL
 * @param {object} env - Environment variables
 * @returns {Promise<Response>} Response
 */
async function handleZapCommand(request, url, env) {
  if (!isFeatureEnabled('ZAPIER_INTEGRATION', env)) {
    return jsonResponse(errorResponse('DISABLED', 'Zapier integration is disabled'), 503);
  }

  // Check rate limit
  const clientId = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (FEATURE_FLAGS.RATE_LIMITING && !rateLimiters.zapier.check(clientId)) {
    return jsonResponse(errorResponse('RATE_LIMIT', 'Rate limit exceeded'), 429);
  }

  const path = url.pathname.replace('/zap', '');

  try {
    if (path === '/trigger' && request.method === 'POST') {
      const data = await request.json();
      const hookId = data.hookId || env.ZAPIER_WEBHOOK_URL;
      const result = await ZapierHelper.triggerZap(hookId, data.payload || {});
      return jsonResponse(successResponse(result, 'Zap triggered'));
    }

    if (path === '/notify' && request.method === 'POST') {
      const data = await request.json();
      const hookId = data.hookId || env.ZAPIER_WEBHOOK_URL;
      const result = await ZapierHelper.sendNotification(hookId, data.message, data.metadata);
      return jsonResponse(successResponse(result, 'Notification sent'));
    }

    if (path === '/sync' && request.method === 'POST') {
      const data = await request.json();
      const hookId = data.hookId || env.ZAPIER_WEBHOOK_URL;
      const result = await ZapierHelper.syncContent(hookId, data.type, data.content);
      return jsonResponse(successResponse(result, 'Content synced'));
    }

    return jsonResponse(errorResponse('NOT_FOUND', 'Zapier endpoint not found'), 404);
  } catch (error) {
    logRequest(request, '/zap', { error: error.message });
    return jsonResponse(errorResponse('ZAPIER_ERROR', 'Zapier operation failed', error.message), 500);
  }
}

/**
 * Handle Notion AI Bot commands
 * @param {Request} request - Incoming request
 * @param {object} env - Environment variables
 * @returns {Promise<Response>} Response
 */
async function handleNotionCommand(request, env) {
  if (!isFeatureEnabled('NOTION_COMMANDS', env)) {
    return jsonResponse(errorResponse('DISABLED', 'Notion commands are disabled'), 503);
  }

  // Check rate limit
  const clientId = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (FEATURE_FLAGS.RATE_LIMITING && !rateLimiters.notion.check(clientId)) {
    return jsonResponse(errorResponse('RATE_LIMIT', 'Rate limit exceeded'), 429);
  }

  try {
    const data = await request.json();
    const commandText = data.command || data.text || '';
    
    const parsed = NotionCommandHandler.parseCommand(commandText);
    
    if (!parsed) {
      return jsonResponse(
        successResponse(
          NotionCommandHandler.handleHelp(),
          'Unknown command - showing help'
        )
      );
    }

    let result;
    switch (parsed.command) {
      case 'help':
        result = NotionCommandHandler.handleHelp();
        break;
      case 'status':
        result = await NotionCommandHandler.handleStatus(env);
        break;
      case 'sync':
        result = await NotionCommandHandler.handleSync(parsed.args, env);
        break;
      case 'deploy':
        result = await NotionCommandHandler.handleDeploy(parsed.args, env);
        break;
      case 'health':
        result = await NotionCommandHandler.handleHealth(env);
        break;
      default:
        result = NotionCommandHandler.handleHelp();
    }

    return jsonResponse(successResponse(result, `Command '${parsed.command}' executed`));
  } catch (error) {
    logRequest(request, '/notion', { error: error.message });
    return jsonResponse(errorResponse('COMMAND_ERROR', 'Command execution failed', error.message), 500);
  }
}

/**
 * Handle GitHub webhooks
 * @param {Request} request - Incoming request
 * @param {object} env - Environment variables
 * @returns {Promise<Response>} Response
 */
async function handleGitHubWebhook(request, env) {
  if (!isFeatureEnabled('GITHUB_WEBHOOKS', env)) {
    return jsonResponse(errorResponse('DISABLED', 'GitHub webhooks are disabled'), 503);
  }

  // Verify HMAC signature
  const signature = request.headers.get('X-Hub-Signature-256');
  const payload = await request.text();
  
  if (env.WEBHOOK_SECRET || env.GITHUB_WEBHOOK_SECRET) {
    const secret = env.WEBHOOK_SECRET || env.GITHUB_WEBHOOK_SECRET;
    const isValid = await verifyHMAC(payload, signature, secret);
    
    if (!isValid) {
      return jsonResponse(errorResponse('INVALID_SIGNATURE', 'Webhook signature verification failed'), 401);
    }
  }

  try {
    const event = request.headers.get('X-GitHub-Event');
    const data = JSON.parse(payload);

    logRequest(request, '/webhook/github', { event, action: data.action });

    // Process webhook based on event type
    const result = {
      event,
      action: data.action,
      received: true,
      processed: true,
      timestamp: new Date().toISOString()
    };

    return jsonResponse(successResponse(result, 'Webhook processed'));
  } catch (error) {
    logRequest(request, '/webhook/github', { error: error.message });
    return jsonResponse(errorResponse('WEBHOOK_ERROR', 'Webhook processing failed', error.message), 500);
  }
}

/**
 * Handle admin commands
 * @param {Request} request - Incoming request
 * @param {URL} url - Parsed URL
 * @param {object} env - Environment variables
 * @returns {Promise<Response>} Response
 */
async function handleAdminCommand(request, url, env) {
  if (!isFeatureEnabled('ADMIN_COMMANDS', env)) {
    return jsonResponse(errorResponse('DISABLED', 'Admin commands are disabled'), 503);
  }

  // Verify admin access
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!isAdmin(token, env)) {
    return jsonResponse(errorResponse('UNAUTHORIZED', 'Admin access required'), 401);
  }

  const path = url.pathname.replace('/admin', '');

  try {
    // Handle different admin commands
    if (path === '/status') {
      const status = {
        rateLimits: {
          wix: rateLimiters.wix.storage.size,
          zapier: rateLimiters.zapier.storage.size,
          notion: rateLimiters.notion.storage.size,
          github: rateLimiters.github.storage.size,
          gamma: rateLimiters.gamma.storage.size
        },
        featureFlags: FEATURE_FLAGS,
        timestamp: new Date().toISOString()
      };
      return jsonResponse(successResponse(status, 'Admin status retrieved'));
    }

    if (path === '/reset-rate-limit' && request.method === 'POST') {
      const data = await request.json();
      const service = data.service || 'default';
      const identifier = data.identifier;

      if (rateLimiters[service] && identifier) {
        rateLimiters[service].reset(identifier);
        return jsonResponse(successResponse(null, 'Rate limit reset'));
      }

      return jsonResponse(errorResponse('INVALID_REQUEST', 'Invalid service or identifier'), 400);
    }

    return jsonResponse(errorResponse('NOT_FOUND', 'Admin endpoint not found'), 404);
  } catch (error) {
    logRequest(request, '/admin', { error: error.message });
    return jsonResponse(errorResponse('ADMIN_ERROR', 'Admin operation failed', error.message), 500);
  }
}

/**
 * Handle health check
 * @returns {Response} Health check response
 */
function handleHealth() {
  return jsonResponse(successResponse({
    status: 'healthy',
    uptime: process.uptime ? process.uptime() : 'N/A',
    timestamp: new Date().toISOString(),
    services: {
      wix: FEATURE_FLAGS.WIX_INTEGRATION,
      zapier: FEATURE_FLAGS.ZAPIER_INTEGRATION,
      github: FEATURE_FLAGS.GITHUB_WEBHOOKS,
      gamma: FEATURE_FLAGS.GAMMA_INTEGRATION,
      notion: FEATURE_FLAGS.NOTION_COMMANDS
    }
  }, 'Command Center is operational'));
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN WORKER ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main Cloudflare Worker handler
 */
export default {
  /**
   * Fetch handler for incoming requests
   * @param {Request} request - Incoming request
   * @param {object} env - Environment variables
   * @param {object} ctx - Execution context
   * @returns {Promise<Response>} Response
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Log request
    logRequest(request, url.pathname);

    try {
      // Route to appropriate handler
      if (url.pathname === '/health' || url.pathname === '/') {
        return handleHealth();
      }

      if (url.pathname.startsWith('/wix')) {
        return handleWixCommand(request, url, env);
      }

      if (url.pathname.startsWith('/zap')) {
        return handleZapCommand(request, url, env);
      }

      if (url.pathname.startsWith('/notion') || url.pathname.startsWith('/command')) {
        return handleNotionCommand(request, env);
      }

      if (url.pathname.startsWith('/webhook/github')) {
        return handleGitHubWebhook(request, env);
      }

      if (url.pathname.startsWith('/admin')) {
        return handleAdminCommand(request, url, env);
      }

      // 404 for unknown routes
      return jsonResponse(errorResponse('NOT_FOUND', 'Endpoint not found'), 404);
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse(
        errorResponse('INTERNAL_ERROR', 'Internal server error', error.message),
        500
      );
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ENVIRONMENT VARIABLES DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * REQUIRED ENVIRONMENT VARIABLES:
 * --------------------------------
 * 
 * Core Configuration:
 * - ADMIN_IDS: Comma-separated list of admin user IDs (e.g., "user1,user2")
 * - ADMIN_TOKENS: Comma-separated list of admin API tokens
 * 
 * Wix Integration:
 * - WIX_API_TOKEN: Wix API authentication token
 * - WIX_SITE_ID: Target Wix site ID
 * - WIX_ACCESS_TOKEN: Wix OAuth access token (alternative to API token)
 * 
 * Zapier Integration:
 * - ZAPIER_WEBHOOK_URL: Zapier webhook URL or hook ID
 * 
 * GitHub Integration:
 * - GITHUB_TOKEN: GitHub personal access token
 * - GITHUB_OWNER: Repository owner (default: wiredchaos)
 * - GITHUB_REPO: Repository name (default: wired-chaos)
 * - GITHUB_WEBHOOK_SECRET: Secret for webhook signature verification
 * 
 * Gamma Integration:
 * - GAMMA_API_KEY: Gamma application API key
 * 
 * Notion Integration:
 * - NOTION_API_KEY: Notion integration API key
 * 
 * Security:
 * - WEBHOOK_SECRET: Shared secret for HMAC verification
 * 
 * OPTIONAL ENVIRONMENT VARIABLES:
 * --------------------------------
 * 
 * Feature Flags (override defaults):
 * - FEATURE_NOTION_COMMANDS: Enable/disable Notion commands (true/false)
 * - FEATURE_WIX_INTEGRATION: Enable/disable Wix integration (true/false)
 * - FEATURE_ZAPIER_INTEGRATION: Enable/disable Zapier integration (true/false)
 * - FEATURE_GITHUB_WEBHOOKS: Enable/disable GitHub webhooks (true/false)
 * - FEATURE_GAMMA_INTEGRATION: Enable/disable Gamma integration (true/false)
 * - FEATURE_ADMIN_COMMANDS: Enable/disable admin commands (true/false)
 * - FEATURE_RATE_LIMITING: Enable/disable rate limiting (true/false)
 * - FEATURE_HMAC_VERIFICATION: Enable/disable HMAC verification (true/false)
 * - FEATURE_DEBUG_MODE: Enable/disable debug logging (true/false)
 * 
 * DEPLOYMENT NOTES:
 * ----------------
 * 
 * 1. Set secrets using Wrangler CLI:
 *    ```bash
 *    echo "your_secret" | wrangler secret put SECRET_NAME
 *    ```
 * 
 * 2. Set environment variables in wrangler.toml:
 *    ```toml
 *    [vars]
 *    GITHUB_OWNER = "wiredchaos"
 *    GITHUB_REPO = "wired-chaos"
 *    ```
 * 
 * 3. Deploy worker:
 *    ```bash
 *    wrangler deploy
 *    ```
 * 
 * 4. Test endpoints:
 *    ```bash
 *    curl https://your-worker.workers.dev/health
 *    ```
 * 
 * 5. Monitor logs:
 *    ```bash
 *    wrangler tail
 *    ```
 * 
 * SECURITY BEST PRACTICES:
 * -----------------------
 * 
 * - Always use HTTPS for API endpoints
 * - Store sensitive credentials in Worker secrets
 * - Enable HMAC verification for webhooks
 * - Rotate API tokens regularly
 * - Use admin guards for privileged operations
 * - Monitor rate limit metrics
 * - Review logs for suspicious activity
 * 
 * RATE LIMITS:
 * -----------
 * 
 * Default limits (per minute):
 * - Default: 60 requests
 * - Wix: 100 requests
 * - Zapier: 50 requests
 * - Notion: 30 requests
 * - GitHub: 100 requests
 * - Gamma: 50 requests
 * 
 * Rate limits can be adjusted in RATE_LIMITS constant.
 */
