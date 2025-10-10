/**
 * Resources Repository APIs
 * - User profiles
 * - Provider catalog with rankings
 * - Encrypted vault for API keys
 */

/**
 * AES-GCM Encryption utilities
 */
async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    hexToBuffer(key),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    cryptoKey,
    dataBuffer
  );
  
  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return bufferToHex(combined);
}

async function decryptData(encryptedHex, key) {
  const combined = hexToBuffer(encryptedHex);
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    hexToBuffer(key),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    cryptoKey,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Pre-seeded providers catalog
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

/**
 * Get user session from cookie
 */
function getUserSession(request, env) {
  const cookieName = env.SESSION_COOKIE_NAME || 'wc_session';
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Handle GET /api/profile
 */
async function getProfile(request, env) {
  const userId = getUserSession(request, env);
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const profile = await env.PROFILES.get(userId, { type: 'json' });
  
  if (!profile) {
    return new Response(JSON.stringify({ error: 'Profile not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify(profile), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle POST /api/profile
 */
async function createOrUpdateProfile(request, env) {
  const userId = getUserSession(request, env) || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await request.json();
    
    const profile = {
      userId,
      displayName: body.displayName,
      avatar: body.avatar || null,
      bio: body.bio || '',
      persona: body.persona || 'builder',
      weights: body.weights || {
        reliability: 8,
        freeQuota: 8,
        multiChain: 7,
        realTime: 7,
        docs: 8,
        community: 6,
        rateLimits: 6
      },
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await env.PROFILES.put(userId, JSON.stringify(profile));
    
    // Set session cookie
    const cookieName = env.SESSION_COOKIE_NAME || 'wc_session';
    
    return new Response(JSON.stringify(profile), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${cookieName}=${userId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle GET /api/providers
 */
async function getProviders(request, env) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'all';
  
  let providers = PROVIDERS_CATALOG;
  
  if (category !== 'all') {
    providers = providers.filter(p => p.category === category);
  }
  
  // Get user profile for personalized scores
  const userId = getUserSession(request, env);
  let userWeights = null;
  
  if (userId) {
    const profile = await env.PROFILES.get(userId, { type: 'json' });
    if (profile && profile.weights) {
      userWeights = profile.weights;
    }
  }
  
  // Calculate scores
  const providersWithScores = providers.map(provider => {
    const weights = userWeights || {
      reliability: 8,
      freeQuota: 7,
      multiChain: 7,
      realTime: 7,
      docs: 7,
      community: 6,
      rateLimits: 6
    };
    
    const score = calculateProviderScore(provider.criteria, weights);
    
    return {
      ...provider,
      score
    };
  });
  
  // Sort by score descending
  providersWithScores.sort((a, b) => b.score - a.score);
  
  return new Response(JSON.stringify({
    providers: providersWithScores,
    category,
    personalized: !!userWeights
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Calculate provider score based on weights
 */
function calculateProviderScore(criteria, weights) {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  
  let weightedSum = 0;
  for (const [key, value] of Object.entries(criteria)) {
    const weight = weights[key] || 5;
    weightedSum += value * weight;
  }
  
  // Normalize to 0-100
  const maxPossible = 10 * totalWeight;
  return Math.round((weightedSum / maxPossible) * 100);
}

/**
 * Handle POST /api/providers/:id/claim
 */
async function claimProvider(request, env) {
  const userId = getUserSession(request, env);
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const url = new URL(request.url);
  const providerId = url.pathname.split('/')[3];
  
  // Store claim status
  const claimKey = `claim_${userId}_${providerId}`;
  await env.PROVIDERS.put(claimKey, JSON.stringify({
    userId,
    providerId,
    claimedAt: new Date().toISOString(),
    status: 'claimed'
  }));
  
  return new Response(JSON.stringify({ success: true, providerId }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle GET /api/vault
 */
async function getVault(request, env) {
  const userId = getUserSession(request, env);
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const vaultData = await env.VAULT.get(userId, { type: 'json' });
  
  if (!vaultData) {
    return new Response(JSON.stringify({ keys: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return only aliases, not actual keys
  const aliases = vaultData.keys.map(k => ({
    id: k.id,
    alias: k.alias,
    provider: k.provider,
    createdAt: k.createdAt
  }));
  
  return new Response(JSON.stringify({ keys: aliases }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle POST /api/vault
 */
async function addToVault(request, env) {
  const userId = getUserSession(request, env);
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const kmsKey = env.VAULT_KMS_KEY;
  if (!kmsKey || kmsKey.length !== 64) { // 32 bytes = 64 hex chars
    return new Response(JSON.stringify({ error: 'Vault encryption not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await request.json();
    const { alias, provider, apiKey } = body;
    
    if (!alias || !provider || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Encrypt API key
    const encrypted = await encryptData(apiKey, kmsKey);
    
    // Get existing vault
    const vaultData = await env.VAULT.get(userId, { type: 'json' }) || { keys: [] };
    
    // Add new key
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    vaultData.keys.push({
      id: keyId,
      alias,
      provider,
      encrypted,
      createdAt: new Date().toISOString()
    });
    
    await env.VAULT.put(userId, JSON.stringify(vaultData));
    
    // Return alias only
    return new Response(JSON.stringify({
      success: true,
      key: {
        id: keyId,
        alias,
        provider,
        createdAt: vaultData.keys[vaultData.keys.length - 1].createdAt
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to store key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Main resources router
 */
export async function handleResources(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Cookie',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    let response;
    
    if (path === '/api/profile' && method === 'GET') {
      response = await getProfile(request, env);
    } else if (path === '/api/profile' && method === 'POST') {
      response = await createOrUpdateProfile(request, env);
    } else if (path === '/api/providers' && method === 'GET') {
      response = await getProviders(request, env);
    } else if (path.match(/^\/api\/providers\/[^/]+\/claim$/) && method === 'POST') {
      response = await claimProvider(request, env);
    } else if (path === '/api/vault' && method === 'GET') {
      response = await getVault(request, env);
    } else if (path === '/api/vault' && method === 'POST') {
      response = await addToVault(request, env);
    } else {
      response = new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  } catch (error) {
    console.error('Resources route error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
