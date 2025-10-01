/**
 * WIRED CHAOS - Wix Velo Backend API Client
 * Client for interacting with the Cloudflare Worker API from Wix backend code
 */

import { fetch } from 'wix-fetch';

// Configuration - Update these values
const WORKER_BASE_URL = 'https://wix-gamma-integration-prod.YOUR-ACCOUNT.workers.dev';
const API_TOKEN = 'YOUR_API_TOKEN'; // Store in Wix Secrets Manager

/**
 * Make authenticated request to worker
 */
async function workerRequest(endpoint, options = {}) {
  const url = `${WORKER_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Worker API Error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch WIX site data
 */
export async function getWixSiteData() {
  try {
    const data = await workerRequest('/api/wix/site', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Error fetching WIX site data:', error);
    throw error;
  }
}

/**
 * Update WIX content
 */
export async function updateWixContent(contentId, updates) {
  try {
    const data = await workerRequest(`/api/wix/content/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data;
  } catch (error) {
    console.error('Error updating WIX content:', error);
    throw error;
  }
}

/**
 * Fetch GAMMA presentations
 */
export async function getGammaPresentations(limit = 10) {
  try {
    const data = await workerRequest(`/api/gamma/presentations?limit=${limit}`, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Error fetching GAMMA presentations:', error);
    throw error;
  }
}

/**
 * Create GAMMA presentation
 */
export async function createGammaPresentation(presentationData) {
  try {
    const data = await workerRequest('/api/gamma/presentations', {
      method: 'POST',
      body: JSON.stringify(presentationData),
    });
    return data;
  } catch (error) {
    console.error('Error creating GAMMA presentation:', error);
    throw error;
  }
}

/**
 * Sync WIX content to GAMMA
 */
export async function syncWixToGamma(syncData) {
  try {
    const data = await workerRequest('/api/sync/wix-to-gamma', {
      method: 'POST',
      body: JSON.stringify(syncData),
    });
    return data;
  } catch (error) {
    console.error('Error syncing WIX to GAMMA:', error);
    throw error;
  }
}

/**
 * Sync GAMMA to WIX
 */
export async function syncGammaToWix(syncData) {
  try {
    const data = await workerRequest('/api/sync/gamma-to-wix', {
      method: 'POST',
      body: JSON.stringify(syncData),
    });
    return data;
  } catch (error) {
    console.error('Error syncing GAMMA to WIX:', error);
    throw error;
  }
}

/**
 * Upload AR model
 */
export async function uploadARModel(modelData) {
  try {
    const data = await workerRequest('/api/wix/ar-model', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
    return data;
  } catch (error) {
    console.error('Error uploading AR model:', error);
    throw error;
  }
}

/**
 * Track analytics event
 */
export async function trackAnalytics(eventData) {
  try {
    const data = await workerRequest('/api/wix/analytics', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return data;
  } catch (error) {
    console.error('Error tracking analytics:', error);
    throw error;
  }
}

/**
 * Check worker health
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${WORKER_BASE_URL}/api/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking worker health:', error);
    throw error;
  }
}
