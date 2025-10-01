/**
 * WIRED CHAOS - WIX Velo Integration Library
 * Client-side library for WIX websites to integrate with WIRED CHAOS
 */

// Configuration
const CONFIG = {
  apiBase: 'https://wired-chaos-worker.workers.dev',
  apiKey: '', // Set via initialize()
  analyticsEnabled: true,
  arEnabled: true
};

/**
 * Initialize WIRED CHAOS integration
 * Call this in $w.onReady()
 */
export function initialize(config = {}) {
  CONFIG.apiBase = config.apiBase || CONFIG.apiBase;
  CONFIG.apiKey = config.apiKey || CONFIG.apiKey;
  CONFIG.analyticsEnabled = config.analyticsEnabled !== false;
  CONFIG.arEnabled = config.arEnabled !== false;

  console.log('🔌 WIRED CHAOS Integration Initialized');

  // Track page view
  if (CONFIG.analyticsEnabled) {
    trackEvent('page_view', {
      url: window.location.href,
      title: document.title
    });
  }

  // Initialize AR viewer if enabled
  if (CONFIG.arEnabled) {
    initializeARViewer();
  }

  return {
    trackEvent,
    loadARModel,
    submitForm,
    getContent,
    syncToGamma
  };
}

/**
 * Track analytics event
 */
export async function trackEvent(eventType, data = {}) {
  if (!CONFIG.analyticsEnabled) return;

  try {
    const response = await fetch(`${CONFIG.apiBase}/api/wix/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        eventType: `wix.${eventType}`,
        timestamp: Date.now(),
        sessionId: getSessionId(),
        data
      })
    });

    if (!response.ok) {
      console.error('Failed to track event:', await response.text());
    }
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

/**
 * Load AR model into model-viewer component
 */
export async function loadARModel(modelId, elementId = '#arViewer') {
  if (!CONFIG.arEnabled) return;

  try {
    const element = $w(elementId);
    const modelUrl = `${CONFIG.apiBase}/api/wix/ar-model/${modelId}`;

    // Set model-viewer attributes
    element.src = modelUrl;
    element.alt = 'WIRED CHAOS 3D Model';
    element.ar = true;
    element['ar-modes'] = 'webxr scene-viewer quick-look';
    element['camera-controls'] = true;
    element['auto-rotate'] = true;

    // Track AR view
    trackEvent('ar_view', { modelId });

    console.log('✨ AR Model loaded:', modelId);
    return true;
  } catch (error) {
    console.error('Failed to load AR model:', error);
    return false;
  }
}

/**
 * Submit form data with validation
 */
export async function submitForm(formData, formId) {
  try {
    // Basic validation
    if (!formData || typeof formData !== 'object') {
      throw new Error('Invalid form data');
    }

    // Track form submission
    trackEvent('form_submit', { formId });

    const response = await fetch(`${CONFIG.apiBase}/api/wix/form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        formId,
        data: formData,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    const result = await response.json();
    console.log('✅ Form submitted successfully');
    return result;
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

/**
 * Get dynamic content from WIX Data
 */
export async function getContent(collectionId, filter = {}) {
  try {
    const queryParams = new URLSearchParams({
      collection: collectionId,
      ...filter
    });

    const response = await fetch(
      `${CONFIG.apiBase}/api/wix/content?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Content fetch error:', error);
    return [];
  }
}

/**
 * Sync WIX content to GAMMA presentation
 */
export async function syncToGamma(contentId, presentationTitle) {
  try {
    trackEvent('sync_to_gamma', { contentId, presentationTitle });

    const response = await fetch(`${CONFIG.apiBase}/api/sync/wix-to-gamma`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        contentId,
        presentationTitle,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }

    const result = await response.json();
    console.log('🔄 Content synced to GAMMA');
    return result;
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

/**
 * Initialize AR viewer
 */
function initializeARViewer() {
  // Check if model-viewer script is loaded
  if (!customElements.get('model-viewer')) {
    // Load model-viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
    document.head.appendChild(script);
  }
}

/**
 * Get or create session ID
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('wc_session_id');
  if (!sessionId) {
    sessionId = `wc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('wc_session_id', sessionId);
  }
  return sessionId;
}

/**
 * WIX-specific helpers
 */
export const WixHelpers = {
  /**
   * Setup repeater with data
   */
  setupRepeater(repeaterId, data, onItemReady) {
    const repeater = $w(repeaterId);
    repeater.data = data;
    repeater.onItemReady(($item, itemData, index) => {
      onItemReady($item, itemData, index);
    });
  },

  /**
   * Setup button click with analytics
   */
  setupButton(buttonId, onClick, eventName) {
    $w(buttonId).onClick(() => {
      trackEvent(eventName || `button_${buttonId}_click`);
      onClick();
    });
  },

  /**
   * Show loading state
   */
  showLoading(elementId) {
    $w(elementId).show();
  },

  /**
   * Hide loading state
   */
  hideLoading(elementId) {
    $w(elementId).hide();
  },

  /**
   * Display error message
   */
  showError(message, elementId = '#errorText') {
    $w(elementId).text = message;
    $w(elementId).show();
  },

  /**
   * Display success message
   */
  showSuccess(message, elementId = '#successText') {
    $w(elementId).text = message;
    $w(elementId).show();
  }
};

/**
 * WIRED CHAOS branding utilities
 */
export const Branding = {
  colors: {
    black: '#000000',
    neonCyan: '#00FFFF',
    glitchRed: '#FF3131',
    electricGreen: '#39FF14',
    accentPink: '#FF00FF'
  },

  /**
   * Apply WIRED CHAOS style to element
   */
  applyStyle(elementId, style = 'cyber') {
    const element = $w(elementId);
    
    if (style === 'cyber') {
      element.style.backgroundColor = this.colors.black;
      element.style.color = this.colors.neonCyan;
      element.style.borderColor = this.colors.neonCyan;
      element.style.borderWidth = '2px';
    } else if (style === 'glitch') {
      element.style.backgroundColor = this.colors.black;
      element.style.color = this.colors.glitchRed;
      element.style.borderColor = this.colors.glitchRed;
      element.style.borderWidth = '2px';
    }
  },

  /**
   * Create glitch effect animation
   */
  applyGlitchEffect(elementId) {
    const element = $w(elementId);
    // Apply CSS animation class
    element.customClassList.add('wc-glitch');
  }
};

// Export default integration object
export default {
  initialize,
  trackEvent,
  loadARModel,
  submitForm,
  getContent,
  syncToGamma,
  WixHelpers,
  Branding
};
