/**
 * WIRED CHAOS - Feature Flags Configuration
 * Controls experimental features and rollback safety
 */

export const FeatureFlags = {
  use3D: false,                    // FORCE OFF - disable all 3D transforms
  useHologramGlass: true,          // Subtle frosted glass only
  enableBlogAutoFeed: true,        // Auto-pull from wiredchaos.xyz
  enableCSNLive: true,            // CSN integration
  enableMotherboardCity: true,     // Use motherboard city layout
  enableExperimentalUI: false,     // Disable experimental components  
  enableEnergyPulses: false,       // Disable energy animations
  enableVaultDashboard: true,      // Keep VAULT33 dashboard
  enableGhostSEO: true            // SEO optimization
};

// Make flags available globally for debugging
if (typeof window !== 'undefined') {
  window.__WIRED_FLAGS__ = FeatureFlags;
}