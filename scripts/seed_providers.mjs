#!/usr/bin/env node
/**
 * Provider Catalog Seeding Script
 * Seeds the providers KV namespace with pre-configured providers
 */

const PROVIDERS_CATALOG = [
  {
    id: 'alchemy',
    name: 'Alchemy',
    category: 'rpc',
    description: 'RPC + Enhanced APIs',
    chains: ['ETH', 'ARB', 'OP', 'POL'],
    tier: 'free',
    website: 'https://www.alchemy.com/',
    signupUrl: 'https://dashboard.alchemy.com/signup',
    criteria: {
      reliability: 10,
      freeQuota: 9,
      multiChain: 9,
      realTime: 9,
      docs: 10,
      community: 9,
      rateLimits: 8
    }
  },
  {
    id: 'thegraph',
    name: 'The Graph',
    category: 'indexing',
    description: 'Indexing/Subgraphs',
    chains: ['Multi-chain'],
    tier: 'free',
    website: 'https://thegraph.com/',
    signupUrl: 'https://thegraph.com/studio/',
    criteria: {
      reliability: 9,
      freeQuota: 8,
      multiChain: 10,
      realTime: 7,
      docs: 9,
      community: 9,
      rateLimits: 7
    }
  },
  {
    id: 'bitquery',
    name: 'Bitquery',
    category: 'data',
    description: 'GraphQL On-chain Data',
    chains: ['10+ chains'],
    tier: 'free',
    website: 'https://bitquery.io/',
    signupUrl: 'https://bitquery.io/forms/api',
    criteria: {
      reliability: 8,
      freeQuota: 7,
      multiChain: 10,
      realTime: 8,
      docs: 8,
      community: 7,
      rateLimits: 7
    }
  },
  {
    id: 'coingecko',
    name: 'CoinGecko API',
    category: 'market',
    description: 'Market Data',
    chains: ['Universal'],
    tier: 'free',
    website: 'https://www.coingecko.com/en/api',
    signupUrl: 'https://www.coingecko.com/en/api/pricing',
    criteria: {
      reliability: 9,
      freeQuota: 9,
      multiChain: 8,
      realTime: 7,
      docs: 9,
      community: 8,
      rateLimits: 6
    }
  },
  {
    id: 'dappradar',
    name: 'DappRadar API',
    category: 'analytics',
    description: 'Dapp Analytics',
    chains: ['Multi-chain'],
    tier: 'free',
    website: 'https://dappradar.com/',
    signupUrl: 'https://dappradar.com/api',
    criteria: {
      reliability: 8,
      freeQuota: 7,
      multiChain: 9,
      realTime: 6,
      docs: 7,
      community: 8,
      rateLimits: 7
    }
  },
  {
    id: 'kaiko',
    name: 'Kaiko',
    category: 'market',
    description: 'Reference/DEX Pools',
    chains: ['EVM chains'],
    tier: 'free',
    website: 'https://www.kaiko.com/',
    signupUrl: 'https://www.kaiko.com/pages/free-trial',
    criteria: {
      reliability: 8,
      freeQuota: 6,
      multiChain: 7,
      realTime: 9,
      docs: 8,
      community: 6,
      rateLimits: 7
    }
  },
  {
    id: 'glassnode',
    name: 'Glassnode',
    category: 'analytics',
    description: 'On-chain Metrics',
    chains: ['BTC', 'ETH'],
    tier: 'free',
    website: 'https://glassnode.com/',
    signupUrl: 'https://studio.glassnode.com/signup',
    criteria: {
      reliability: 9,
      freeQuota: 6,
      multiChain: 5,
      realTime: 7,
      docs: 8,
      community: 8,
      rateLimits: 6
    }
  }
];

// ANSI colors
const colors = {
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function seedProviders() {
  log('\n========================================', 'cyan');
  log('Provider Catalog Seeding', 'cyan');
  log('========================================\n', 'cyan');
  
  log(`Seeding ${PROVIDERS_CATALOG.length} providers...`, 'cyan');
  
  for (const provider of PROVIDERS_CATALOG) {
    // Calculate default score (using Builder persona)
    const builderWeights = {
      reliability: 10,
      freeQuota: 8,
      multiChain: 8,
      realTime: 6,
      docs: 9,
      community: 7,
      rateLimits: 6
    };
    
    const totalWeight = Object.values(builderWeights).reduce((sum, w) => sum + w, 0);
    let weightedSum = 0;
    
    for (const [key, value] of Object.entries(provider.criteria)) {
      const weight = builderWeights[key] || 5;
      weightedSum += value * weight;
    }
    
    const score = Math.round((weightedSum / (10 * totalWeight)) * 100);
    
    log(`✅ ${provider.name} (${provider.category}) - Score: ${score}/100`, 'green');
    log(`   Chains: ${provider.chains.join(', ')}`);
    log(`   Website: ${provider.website}`);
  }
  
  log('\n========================================', 'cyan');
  log('Seeding Complete', 'cyan');
  log('========================================\n', 'cyan');
  
  log(`Total providers: ${PROVIDERS_CATALOG.length}`, 'green');
  log(`Categories: ${[...new Set(PROVIDERS_CATALOG.map(p => p.category))].join(', ')}`, 'cyan');
  
  log('\nℹ️  Note: Providers are hard-coded in the worker.', 'yellow');
  log('   No database seeding required.', 'yellow');
  log('   KV storage will be used for user claims and preferences.\n', 'yellow');
}

// Run seeding
seedProviders().catch(error => {
  console.error(`❌ Seeding failed: ${error.message}`);
  process.exit(1);
});
