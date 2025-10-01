/**
 * Wix API Client for Node.js
 * Wrapper around Wix REST API for content management
 */

import fetch from 'node-fetch';
import { config } from '../config/gamma-config.js';

export class WixClient {
  constructor(apiToken = config.wix.apiToken, siteId = config.wix.siteId) {
    this.apiToken = apiToken;
    this.siteId = siteId;
    this.apiBase = config.wix.apiBase;
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
            'Authorization': this.apiToken,
            'Content-Type': 'application/json',
            'wix-site-id': this.siteId,
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
   * Get site information
   */
  async getSiteInfo() {
    console.log('🌐 Fetching site info');
    return await this.request(`/v1/sites/${this.siteId}`);
  }

  /**
   * Get content from collection
   */
  async getContent(collectionId, filters = {}) {
    console.log(`📥 Fetching content from collection: ${collectionId}`);
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams 
      ? `/v1/sites/${this.siteId}/collections/${collectionId}/items?${queryParams}`
      : `/v1/sites/${this.siteId}/collections/${collectionId}/items`;
    return await this.request(endpoint);
  }

  /**
   * Create content item in collection
   */
  async createContent(collectionId, data) {
    console.log(`➕ Creating content in collection: ${collectionId}`);
    return await this.request(`/v1/sites/${this.siteId}/collections/${collectionId}/items`, {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  }

  /**
   * Update content item
   */
  async updateContent(collectionId, itemId, data) {
    console.log(`🔄 Updating content item: ${itemId}`);
    return await this.request(`/v1/sites/${this.siteId}/collections/${collectionId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ data })
    });
  }

  /**
   * Delete content item
   */
  async deleteContent(collectionId, itemId) {
    console.log(`🗑️  Deleting content item: ${itemId}`);
    return await this.request(`/v1/sites/${this.siteId}/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Upload file to media manager
   */
  async uploadFile(file, metadata = {}) {
    console.log(`📤 Uploading file: ${metadata.fileName || 'unnamed'}`);
    
    // For file uploads, we need multipart/form-data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return await this.request(`/v1/sites/${this.siteId}/media`, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let fetch set it with boundary
        'Content-Type': undefined
      }
    });
  }

  /**
   * Add presentation to gallery
   */
  async addToGallery(galleryId, presentation) {
    console.log(`🖼️  Adding presentation to gallery: ${galleryId}`);
    
    const galleryItem = {
      title: presentation.title,
      description: presentation.description || '',
      url: presentation.url || '',
      thumbnailUrl: presentation.thumbnailUrl || '',
      metadata: {
        presentationId: presentation.id,
        type: 'gamma-presentation',
        createdAt: new Date().toISOString(),
        ...presentation.metadata
      }
    };

    const targetGalleryId = config.wix.galleryIds[galleryId] || galleryId;
    return await this.createContent(targetGalleryId, galleryItem);
  }

  /**
   * Update gallery item
   */
  async updateGalleryItem(galleryId, itemId, updates) {
    console.log(`🔄 Updating gallery item: ${itemId}`);
    const targetGalleryId = config.wix.galleryIds[galleryId] || galleryId;
    return await this.updateContent(targetGalleryId, itemId, updates);
  }

  /**
   * Remove from gallery
   */
  async removeFromGallery(galleryId, itemId) {
    console.log(`🗑️  Removing item from gallery: ${itemId}`);
    const targetGalleryId = config.wix.galleryIds[galleryId] || galleryId;
    return await this.deleteContent(targetGalleryId, itemId);
  }

  /**
   * Update page content
   */
  async updatePage(pageId, content) {
    console.log(`📝 Updating page: ${pageId}`);
    return await this.request(`/v1/sites/${this.siteId}/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  }

  /**
   * Get all galleries
   */
  async listGalleries() {
    console.log('🖼️  Listing galleries');
    return await this.request(`/v1/sites/${this.siteId}/collections`);
  }
}

export default WixClient;
