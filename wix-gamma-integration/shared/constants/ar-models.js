/**
 * WIRED CHAOS - AR Models Catalog
 * Metadata for 3D models available for AR/VR viewing
 */

export const AR_MODELS = [
  {
    id: 'wc-logo-3d',
    name: 'WIRED CHAOS Logo 3D',
    description: 'Animated 3D logo with neon effects',
    formats: {
      glb: 'ar-models/wc-logo-3d.glb',
      usdz: 'ar-models/wc-logo-3d.usdz'
    },
    thumbnail: 'ar-models/thumbnails/wc-logo-3d.png',
    size: 2.5 * 1024 * 1024, // 2.5 MB
    dimensions: {
      width: 1.0,
      height: 1.0,
      depth: 0.5,
      unit: 'meters'
    },
    animations: ['rotate', 'pulse', 'glow'],
    tags: ['logo', 'branding', 'animated'],
    featured: true,
    createdAt: '2025-09-30T21:39:32Z'
  },
  {
    id: 'cyber-brain',
    name: 'Cyber Brain Assistant',
    description: '3D brain with neural network visualization',
    formats: {
      glb: 'ar-models/cyber-brain.glb',
      usdz: 'ar-models/cyber-brain.usdz'
    },
    thumbnail: 'ar-models/thumbnails/cyber-brain.png',
    size: 5.2 * 1024 * 1024, // 5.2 MB
    dimensions: {
      width: 0.8,
      height: 0.8,
      depth: 0.8,
      unit: 'meters'
    },
    animations: ['neural_pulse', 'synaptic_fire'],
    tags: ['brain', 'ai', 'neural'],
    featured: true,
    createdAt: '2025-09-30T21:39:32Z'
  },
  {
    id: 'blockchain-cube',
    name: 'Blockchain Cube',
    description: 'Animated blockchain visualization',
    formats: {
      glb: 'ar-models/blockchain-cube.glb',
      usdz: 'ar-models/blockchain-cube.usdz'
    },
    thumbnail: 'ar-models/thumbnails/blockchain-cube.png',
    size: 3.8 * 1024 * 1024, // 3.8 MB
    dimensions: {
      width: 1.2,
      height: 1.2,
      depth: 1.2,
      unit: 'meters'
    },
    animations: ['spin', 'data_flow'],
    tags: ['blockchain', 'crypto', 'data'],
    featured: true,
    createdAt: '2025-09-30T21:39:32Z'
  },
  {
    id: 'nft-certificate',
    name: 'NFT Certificate',
    description: '3D certificate with holographic effects',
    formats: {
      glb: 'ar-models/nft-certificate.glb',
      usdz: 'ar-models/nft-certificate.usdz'
    },
    thumbnail: 'ar-models/thumbnails/nft-certificate.png',
    size: 1.9 * 1024 * 1024, // 1.9 MB
    dimensions: {
      width: 0.6,
      height: 0.8,
      depth: 0.05,
      unit: 'meters'
    },
    animations: ['shimmer', 'float'],
    tags: ['nft', 'certificate', 'hologram'],
    featured: false,
    createdAt: '2025-09-30T21:39:32Z'
  },
  {
    id: 'cyber-key',
    name: 'Cyber Security Key',
    description: 'Futuristic digital key',
    formats: {
      glb: 'ar-models/cyber-key.glb',
      usdz: 'ar-models/cyber-key.usdz'
    },
    thumbnail: 'ar-models/thumbnails/cyber-key.png',
    size: 1.2 * 1024 * 1024, // 1.2 MB
    dimensions: {
      width: 0.3,
      height: 0.8,
      depth: 0.1,
      unit: 'meters'
    },
    animations: ['glow', 'rotate'],
    tags: ['security', 'key', 'cyber'],
    featured: false,
    createdAt: '2025-09-30T21:39:32Z'
  },
  {
    id: 'motherboard-ui',
    name: 'Motherboard UI',
    description: 'Interactive motherboard visualization',
    formats: {
      glb: 'ar-models/motherboard-ui.glb',
      usdz: 'ar-models/motherboard-ui.usdz'
    },
    thumbnail: 'ar-models/thumbnails/motherboard-ui.png',
    size: 8.5 * 1024 * 1024, // 8.5 MB
    dimensions: {
      width: 1.5,
      height: 1.5,
      depth: 0.2,
      unit: 'meters'
    },
    animations: ['circuit_flow', 'data_pulse'],
    tags: ['motherboard', 'circuit', 'tech'],
    featured: true,
    createdAt: '2025-09-30T21:39:32Z'
  }
];

/**
 * Get model by ID
 */
export function getModelById(id) {
  return AR_MODELS.find(model => model.id === id);
}

/**
 * Get featured models
 */
export function getFeaturedModels() {
  return AR_MODELS.filter(model => model.featured);
}

/**
 * Get models by tag
 */
export function getModelsByTag(tag) {
  return AR_MODELS.filter(model => model.tags.includes(tag));
}

/**
 * Get all tags
 */
export function getAllTags() {
  const tags = new Set();
  AR_MODELS.forEach(model => {
    model.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Format file size for display
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get model URL for specific format
 */
export function getModelURL(modelId, format = 'glb', baseUrl = '') {
  const model = getModelById(modelId);
  if (!model) return null;
  
  const path = model.formats[format];
  if (!path) return null;
  
  return `${baseUrl}${baseUrl ? '/' : ''}${path}`;
}

export default {
  AR_MODELS,
  getModelById,
  getFeaturedModels,
  getModelsByTag,
  getAllTags,
  formatSize,
  getModelURL
};
