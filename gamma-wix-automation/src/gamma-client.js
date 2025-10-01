/**
 * GAMMA API Client for Node.js
 * Wrapper around GAMMA 3.0 API for presentation generation
 */

import fetch from 'node-fetch';
import { config } from '../config/gamma-config.js';

export class GammaClient {
  constructor(apiToken = config.gamma.apiToken, apiBase = config.gamma.apiBase) {
    this.apiToken = apiToken;
    this.apiBase = apiBase;
    this.branding = config.gamma.brandingSettings;
  }

  /**
   * Make API request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.apiBase}${endpoint}`;
    const maxRetries = config.automation.retryAttempts;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} - ${data.message || 'Unknown error'}`);
        }

        return {
          success: true,
          data
        };
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt < maxRetries) {
          const delay = config.automation.retryDelay * attempt;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError.message
    };
  }

  /**
   * Create a new presentation with WIRED CHAOS branding
   */
  async createPresentation(title, slides = [], metadata = {}) {
    console.log(`🎨 Creating presentation: ${title}`);

    const presentation = {
      title,
      slides: slides.map((slide, index) => ({
        id: `slide_${index}`,
        index,
        type: slide.type || 'content',
        title: slide.title || '',
        content: slide.content || '',
        layout: slide.layout || 'single',
        ...slide
      })),
      theme: this.createWiredChaosTheme(),
      branding: {
        logo: 'WIRED CHAOS',
        colors: this.branding,
        fonts: this.branding.fonts
      },
      metadata: {
        ...metadata,
        generatedBy: 'GAMMA-Wix Automation',
        createdAt: new Date().toISOString()
      }
    };

    const result = await this.request('/presentations', {
      method: 'POST',
      body: JSON.stringify(presentation)
    });

    if (result.success) {
      console.log(`✅ Presentation created: ${result.data.id}`);
    } else {
      console.error(`❌ Failed to create presentation: ${result.error}`);
    }

    return result;
  }

  /**
   * Create WIRED CHAOS themed presentation
   */
  createWiredChaosTheme() {
    return {
      id: 'wired-chaos-cyber',
      name: 'WIRED CHAOS Cyber',
      colors: {
        primary: this.branding.primaryColor,
        secondary: this.branding.secondaryColor,
        accent: this.branding.accentColor,
        background: this.branding.backgroundColor,
        text: this.branding.textColor
      },
      fonts: {
        heading: `${this.branding.fonts.primary}, sans-serif`,
        body: `${this.branding.fonts.secondary}, sans-serif`,
        code: `${this.branding.fonts.monospace}, monospace`
      },
      spacing: 'normal'
    };
  }

  /**
   * Get presentation by ID
   */
  async getPresentation(presentationId) {
    console.log(`📥 Fetching presentation: ${presentationId}`);
    return await this.request(`/presentations/${presentationId}`);
  }

  /**
   * Update presentation
   */
  async updatePresentation(presentationId, updates) {
    console.log(`🔄 Updating presentation: ${presentationId}`);
    return await this.request(`/presentations/${presentationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  /**
   * Add slide to presentation
   */
  async addSlide(presentationId, slide) {
    console.log(`➕ Adding slide to presentation: ${presentationId}`);
    return await this.request(`/presentations/${presentationId}/slides`, {
      method: 'POST',
      body: JSON.stringify(slide)
    });
  }

  /**
   * Export presentation to specified format
   */
  async exportPresentation(presentationId, format = 'pdf', options = {}) {
    console.log(`📤 Exporting presentation ${presentationId} as ${format}`);
    
    const exportOptions = {
      format,
      quality: options.quality || 'high',
      includeNotes: options.includeNotes || false,
      watermark: options.watermark || ''
    };

    return await this.request(`/presentations/${presentationId}/export`, {
      method: 'POST',
      body: JSON.stringify(exportOptions)
    });
  }

  /**
   * List all presentations
   */
  async listPresentations(filters = {}) {
    console.log('📋 Listing presentations');
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/presentations?${queryParams}` : '/presentations';
    return await this.request(endpoint);
  }

  /**
   * Delete presentation
   */
  async deletePresentation(presentationId) {
    console.log(`🗑️  Deleting presentation: ${presentationId}`);
    return await this.request(`/presentations/${presentationId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create presentation from template
   */
  async createFromTemplate(templateId, title, data = {}) {
    console.log(`📋 Creating presentation from template: ${templateId}`);
    return await this.request('/presentations/from-template', {
      method: 'POST',
      body: JSON.stringify({
        templateId,
        title,
        data
      })
    });
  }
}

export default GammaClient;
