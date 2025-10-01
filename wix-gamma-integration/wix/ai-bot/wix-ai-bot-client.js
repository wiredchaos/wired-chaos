/**
 * Wix AI Bot API Client
 * Handles programmatic interaction with Wix AI Bot for automation
 * 
 * @module WixAIBotClient
 */

import crypto from 'crypto';

/**
 * Wix AI Bot Client for automation
 */
export class WixAIBotClient {
  /**
   * Create a new Wix AI Bot client
   * @param {Object} config - Configuration options
   * @param {string} config.apiToken - Wix API authentication token
   * @param {string} config.siteId - Wix site ID
   * @param {string} config.botUrl - Wix AI Bot URL (optional)
   * @param {string} config.webhookSecret - Webhook signature secret (optional)
   */
  constructor(config) {
    this.apiToken = config.apiToken;
    this.siteId = config.siteId;
    this.botUrl = config.botUrl || 'https://manage.wix.com/dashboard/7aa81323-433d-4763-b6dc-5d98d409c459/custom-agent';
    this.webhookSecret = config.webhookSecret;
    this.baseHeaders = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'WiredChaos-WixAIBot/1.0'
    };
  }

  /**
   * Update landing page content
   * @param {Object} data - Landing page data
   * @param {string} data.title - Page title
   * @param {string} data.content - Page content
   * @param {Object} data.metadata - Additional metadata
   * @returns {Promise<Object>} API response
   */
  async updateLandingPage(data) {
    const payload = {
      event_type: 'update_landing_page',
      site_id: this.siteId,
      action: 'update',
      data: {
        page_type: 'landing',
        title: data.title,
        content: data.content,
        metadata: data.metadata || {},
        updated_at: new Date().toISOString()
      }
    };

    return await this._makeRequest(payload, 3);
  }

  /**
   * Send notification via Wix AI Bot
   * @param {Object} notification - Notification data
   * @param {string} notification.message - Notification message
   * @param {string} notification.type - Notification type (info, success, warning, error)
   * @param {Object} notification.metadata - Additional metadata
   * @returns {Promise<Object>} API response
   */
  async sendNotification(notification) {
    const payload = {
      event_type: 'notification',
      site_id: this.siteId,
      action: 'send_notification',
      data: {
        message: notification.message,
        type: notification.type || 'info',
        metadata: notification.metadata || {},
        timestamp: new Date().toISOString()
      }
    };

    return await this._makeRequest(payload, 2);
  }

  /**
   * Sync content from GitHub to Wix
   * @param {Object} content - Content to sync
   * @param {string} content.source - Content source (github_pr, github_push, etc.)
   * @param {Object} content.data - Content data
   * @returns {Promise<Object>} API response
   */
  async syncContent(content) {
    const payload = {
      event_type: 'content_sync',
      site_id: this.siteId,
      action: 'sync_content',
      data: {
        source: content.source,
        content_data: content.data,
        sync_direction: 'github_to_wix',
        timestamp: new Date().toISOString()
      }
    };

    return await this._makeRequest(payload, 3);
  }

  /**
   * Create or update a page on Wix site
   * @param {Object} pageData - Page data
   * @param {string} pageData.pageId - Page ID (optional, creates new if not provided)
   * @param {string} pageData.title - Page title
   * @param {string} pageData.url - Page URL slug
   * @param {Array} pageData.sections - Page sections/components
   * @returns {Promise<Object>} API response
   */
  async managePage(pageData) {
    const payload = {
      event_type: 'page_management',
      site_id: this.siteId,
      action: pageData.pageId ? 'update_page' : 'create_page',
      data: {
        page_id: pageData.pageId,
        title: pageData.title,
        url: pageData.url,
        sections: pageData.sections || [],
        timestamp: new Date().toISOString()
      }
    };

    return await this._makeRequest(payload, 3);
  }

  /**
   * Trigger automated deployment notification
   * @param {Object} deployment - Deployment data
   * @param {string} deployment.environment - Deployment environment
   * @param {string} deployment.status - Deployment status
   * @param {Object} deployment.metadata - Additional metadata
   * @returns {Promise<Object>} API response
   */
  async notifyDeployment(deployment) {
    const payload = {
      event_type: 'deployment',
      site_id: this.siteId,
      action: 'deployment_notification',
      data: {
        environment: deployment.environment,
        status: deployment.status,
        metadata: deployment.metadata || {},
        timestamp: new Date().toISOString()
      }
    };

    return await this._makeRequest(payload, 2);
  }

  /**
   * Test connection to Wix AI Bot
   * @returns {Promise<Object>} API response
   */
  async testConnection() {
    const payload = {
      event_type: 'health_check',
      site_id: this.siteId,
      action: 'test_connection',
      data: {
        timestamp: new Date().toISOString()
      }
    };

    return await this._makeRequest(payload, 1);
  }

  /**
   * Make HTTP request to Wix AI Bot with retry logic
   * @private
   * @param {Object} payload - Request payload
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<Object>} API response
   */
  async _makeRequest(payload, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(this.botUrl, {
          method: 'POST',
          headers: this.baseHeaders,
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          return {
            success: true,
            status: response.status,
            data: data,
            attempt: attempt
          };
        }

        // Handle specific error cases
        if (response.status === 429) {
          // Rate limited - wait longer
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.warn(`Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await this._sleep(waitTime);
          continue;
        }

        if (response.status >= 500) {
          // Server error - retry
          console.warn(`Server error (${response.status}), retry ${attempt}/${maxRetries}`);
          await this._sleep(1000 * attempt);
          continue;
        }

        // Client error - don't retry
        return {
          success: false,
          status: response.status,
          error: data.error || 'Request failed',
          data: data,
          attempt: attempt
        };

      } catch (error) {
        lastError = error;
        console.error(`Request failed on attempt ${attempt}/${maxRetries}:`, error.message);
        
        if (attempt < maxRetries) {
          await this._sleep(1000 * attempt);
        }
      }
    }

    return {
      success: false,
      status: 0,
      error: lastError?.message || 'Request failed after retries',
      attempt: maxRetries
    };
  }

  /**
   * Sleep for specified milliseconds
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Raw request payload
   * @param {string} signature - Signature from X-Wix-Webhook-Signature header
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('Webhook secret not configured, skipping signature verification');
      return true;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Parse webhook event
   * @param {Object} event - Webhook event data
   * @returns {Object} Parsed event
   */
  parseWebhookEvent(event) {
    return {
      type: event.event_type || event.type,
      action: event.action,
      data: event.data || {},
      timestamp: event.timestamp || new Date().toISOString(),
      siteId: event.site_id || event.siteId
    };
  }
}

/**
 * Create a new Wix AI Bot client from environment variables
 * @param {Object} env - Environment variables
 * @returns {WixAIBotClient} Wix AI Bot client instance
 */
export function createWixAIBotClient(env) {
  return new WixAIBotClient({
    apiToken: env.WIX_API_TOKEN,
    siteId: env.WIX_SITE_ID,
    botUrl: env.WIX_AI_BOT_URL,
    webhookSecret: env.WIX_WEBHOOK_SECRET
  });
}

export default WixAIBotClient;
