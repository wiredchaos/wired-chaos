// 🌍 Environment Utilities
// Shared environment variable and configuration functions

export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue
  
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`)
  }
  
  return value
}

export function isProdMode(envVar: string): boolean {
  return getEnvVar(envVar, 'false').toLowerCase() === 'true'
}

export function getConfig() {
  return {
    // Feature flags
    nftProdMode: isProdMode('NFT_PROD_MODE'),
    universityProdMode: isProdMode('UNIVERSITY_PROD_MODE'),
    storeProdMode: isProdMode('STORE_PROD_MODE'),
    procurementProdMode: isProdMode('PROCUREMENT_PROD_MODE'),
    emergentProdMode: isProdMode('EMERGENT_PROD_MODE'),
    
    // API endpoints
    neuroAdaptAPI: getEnvVar('NEURO_ADAPT_API_URL', 'https://neuro-adapt-ai.preview.emergentagent.com'),
    vrgResonanceURL: getEnvVar('VRG_RESONANCE_URL', 'https://vrg-33-589.wiredchaos.xyz'),
    certAPIURL: getEnvVar('CERT_API_URL', 'https://wired-chaos.pages.dev/api'),
    
    // Database
    databaseURL: getEnvVar('DATABASE_URL', ''),
    
    // External services
    stripeAPIKey: getEnvVar('STRIPE_API_KEY', ''),
    notionAPIKey: getEnvVar('NOTION_API_KEY', ''),
    wixAPIKey: getEnvVar('WIX_API_KEY', ''),
    
    // Blockchain
    ethereumRPC: getEnvVar('ETHEREUM_RPC_URL', ''),
    polygonRPC: getEnvVar('POLYGON_RPC_URL', ''),
    solanaRPC: getEnvVar('SOLANA_RPC_URL', ''),
    
    // Security
    jwtSecret: getEnvVar('JWT_SECRET', ''),
    apiKeys: {
      neuroAdapt: getEnvVar('NEURO_ADAPT_API_KEY', ''),
      vrg: getEnvVar('VRG_API_KEY', ''),
      stripe: getEnvVar('STRIPE_API_KEY', ''),
      notion: getEnvVar('NOTION_API_KEY', ''),
      wix: getEnvVar('WIX_API_KEY', '')
    }
  }
}

export function validateEnvironment(): { valid: boolean, errors: string[] } {
  const errors: string[] = []
  const config = getConfig()
  
  // Check critical production variables
  if (config.nftProdMode && !config.apiKeys.neuroAdapt) {
    errors.push('NEURO_ADAPT_API_KEY required when NFT_PROD_MODE is enabled')
  }
  
  if (config.universityProdMode && !config.databaseURL) {
    errors.push('DATABASE_URL required when UNIVERSITY_PROD_MODE is enabled')
  }
  
  if (config.storeProdMode && !config.apiKeys.stripe) {
    errors.push('STRIPE_API_KEY required when STORE_PROD_MODE is enabled')
  }
  
  if (config.procurementProdMode && (!config.apiKeys.notion || !config.apiKeys.wix)) {
    errors.push('NOTION_API_KEY and WIX_API_KEY required when PROCUREMENT_PROD_MODE is enabled')
  }
  
  if (config.emergentProdMode && (!config.apiKeys.neuroAdapt || !config.apiKeys.vrg)) {
    errors.push('NEURO_ADAPT_API_KEY and VRG_API_KEY required when EMERGENT_PROD_MODE is enabled')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function logEnvironmentStatus(): void {
  const config = getConfig()
  
  console.log('🚀 WIRED CHAOS Gamma Expansion - Environment Status')
  console.log('================================================')
  console.log(`🎨 NFT/Avatar System: ${config.nftProdMode ? '🟢 PRODUCTION' : '🟡 STUB MODE'}`)
  console.log(`🎓 University System: ${config.universityProdMode ? '🟢 PRODUCTION' : '🟡 STUB MODE'}`)
  console.log(`🛒 E-commerce System: ${config.storeProdMode ? '🟢 PRODUCTION' : '🟡 STUB MODE'}`)
  console.log(`📋 Procurement System: ${config.procurementProdMode ? '🟢 PRODUCTION' : '🟡 STUB MODE'}`)
  console.log(`🤖 Emergent AI System: ${config.emergentProdMode ? '🟢 PRODUCTION' : '🟡 STUB MODE'}`)
  console.log('================================================')
  
  const validation = validateEnvironment()
  if (!validation.valid) {
    console.warn('⚠️  Environment validation errors:')
    validation.errors.forEach(error => console.warn(`   - ${error}`))
  } else {
    console.log('✅ Environment validation passed')
  }
}