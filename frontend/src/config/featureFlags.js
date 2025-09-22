/**
 * WIRED CHAOS - Feature Flags Configuration
 * Control system for experimental features and UI variants
 */

export interface FeatureFlags {
  // Motherboard UI Controls
  useMotherboardOS: boolean;
  enable3DTransforms: boolean;
  enableUniversalGrid: boolean;
  
  // Component Variants
  useLegacyHub: boolean;
  enablePanelChips: boolean;
  
  // Experimental Features
  enableHologramEffects: boolean;
  enableCircuitAnimations: boolean;
  
  // Development Controls
  debugMode: boolean;
  showPerformanceMetrics: boolean;
}

// Default feature flag configuration - ROLLBACK TO STABLE
const defaultFlags: FeatureFlags = {
  // Motherboard UI - DISABLED for rollback
  useMotherboardOS: false,
  enable3DTransforms: false,
  enableUniversalGrid: false,
  
  // Component Variants - USE LEGACY
  useLegacyHub: true,
  enablePanelChips: false,
  
  // Experimental Features - DISABLED for stability
  enableHologramEffects: false,
  enableCircuitAnimations: false,
  
  // Development Controls
  debugMode: process.env.NODE_ENV === 'development',
  showPerformanceMetrics: false,
};

// Feature flag override from environment or localStorage
const getFeatureFlags = (): FeatureFlags => {
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
export const setFeatureFlag = (key: keyof FeatureFlags, value: boolean): void => {
  try {
    const current = getFeatureFlags();
    const updated = { ...current, [key]: value };
    localStorage.setItem('wired-chaos-feature-flags', JSON.stringify(updated));
    
    if (defaultFlags.debugMode) {
      console.log(`Feature flag updated: ${key} = ${value}`);
    }
  } catch (error) {
    console.error('Failed to set feature flag:', error);
  }
};

// Reset all feature flags to defaults
export const resetFeatureFlags = (): void => {
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
if (defaultFlags.debugMode) {
  console.log('WIRED CHAOS Feature Flags:', featureFlags);
  
  // Make flags available globally for easy testing
  (window as any).wireFlags = {
    get: getFeatureFlags,
    set: setFeatureFlag,
    reset: resetFeatureFlags,
    current: featureFlags
  };
}

export default featureFlags;