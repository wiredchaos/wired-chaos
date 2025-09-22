/**
 * WIRED CHAOS - Feature Flags Configuration
 * Control system for experimental features and UI variants
 */

export const FEATURES = {
  motherboardUI: true,
  '3dRendering': false,
  seoBacklinks: true,
  useLegacyHub: true, // Keep legacy as default, can be toggled
  enablePanelChips: false,
  enableHologramEffects: false,
  enableCircuitAnimations: false,
  debugMode: process.env.NODE_ENV === 'development',
};

// Legacy compatibility - maintain existing structure
const defaultFlags = {
  // Motherboard UI - ENABLED for locked theme
  useMotherboardOS: FEATURES.motherboardUI,
  enable3DTransforms: FEATURES['3dRendering'],
  enableUniversalGrid: false,
  
  // Component Variants - LEGACY DEFAULT
  useLegacyHub: FEATURES.useLegacyHub,
  enablePanelChips: FEATURES.enablePanelChips,
  
  // Experimental Features - CONTROLLED
  enableHologramEffects: FEATURES.enableHologramEffects,
  enableCircuitAnimations: FEATURES.enableCircuitAnimations,
  
  // Development Controls
  debugMode: FEATURES.debugMode,
  showPerformanceMetrics: false,
};

// Feature flag override from environment or localStorage
const getFeatureFlags = () => {
  try {
    // Check localStorage for overrides (useful for testing)
    const stored = localStorage.getItem('wired-chaos-feature-flags');
    if (stored) {
      const overrides = JSON.parse(stored);
      return { ...defaultFlags, ...overrides };
    }
  } catch (error) {
    console.warn('Failed to parse feature flags from localStorage:', error);
  }
  
  return defaultFlags;
};

// Set feature flag overrides (for development/testing)
export const setFeatureFlag = (key, value) => {
  try {
    const current = getFeatureFlags();
    const updated = { ...current, [key]: value };
    localStorage.setItem('wired-chaos-feature-flags', JSON.stringify(updated));
    
    if (FEATURES.debugMode) {
      console.log(`Feature flag updated: ${key} = ${value}`);
    }
  } catch (error) {
    console.error('Failed to set feature flag:', error);
  }
};

// Reset all feature flags to defaults
export const resetFeatureFlags = () => {
  try {
    localStorage.removeItem('wired-chaos-feature-flags');
    console.log('Feature flags reset to defaults');
  } catch (error) {
    console.error('Failed to reset feature flags:', error);
  }
};

// Export the feature flags
export const featureFlags = getFeatureFlags();

// Development helper
if (FEATURES.debugMode) {
  console.log('WIRED CHAOS Feature Flags:', featureFlags);
  console.log('WIRED CHAOS FEATURES:', FEATURES);
  
  // Make flags available globally for easy testing
  if (typeof window !== 'undefined') {
    window.wireFlags = {
      get: getFeatureFlags,
      set: setFeatureFlag,
      reset: resetFeatureFlags,
      current: featureFlags,
      features: FEATURES
    };
  }
}

export default featureFlags;