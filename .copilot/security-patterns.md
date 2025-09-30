# Security Implementation Patterns (NSA-Level)

Comprehensive security guidelines for the WIRED CHAOS platform.

## 🔐 Core Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimal access rights
3. **Zero Trust**: Verify everything, trust nothing
4. **Encryption Everywhere**: Data at rest and in transit
5. **Audit Everything**: Comprehensive logging

## 🎫 Bearer Token Authentication

### Implementation Pattern

#### Cloudflare Worker Authentication
```javascript
// Token verification middleware
function verifyBearerToken(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      valid: false,
      error: 'Missing Authorization header',
      status: 401
    };
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      error: 'Invalid Authorization format. Expected: Bearer <token>',
      status: 401
    };
  }
  
  const token = authHeader.substring(7).trim();
  
  if (!token) {
    return {
      valid: false,
      error: 'Empty token',
      status: 401
    };
  }
  
  // Verify against environment variable
  const validToken = env.API_TOKEN || '';
  
  if (!validToken) {
    console.error('API_TOKEN not configured in environment');
    return {
      valid: false,
      error: 'Server configuration error',
      status: 500
    };
  }
  
  // Constant-time comparison to prevent timing attacks
  if (!constantTimeCompare(token, validToken)) {
    return {
      valid: false,
      error: 'Invalid token',
      status: 403
    };
  }
  
  return { valid: true };
}

// Constant-time string comparison
function constantTimeCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Usage in worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Public endpoints (no auth required)
    const publicPaths = [
      '/api/health',
      '/api/public',
      '/api/status'
    ];
    
    const isPublic = publicPaths.some(path => url.pathname.startsWith(path));
    
    if (!isPublic) {
      const auth = verifyBearerToken(request, env);
      
      if (!auth.valid) {
        return new Response(
          JSON.stringify({ error: auth.error }),
          {
            status: auth.status,
            headers: {
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer realm="API"'
            }
          }
        );
      }
    }
    
    // Process authenticated request
    return handleRequest(request, env, ctx);
  }
};
```

#### Token Generation (Backend)
```python
import secrets
import hashlib
import hmac
from datetime import datetime, timedelta

class TokenManager:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode()
    
    def generate_token(self, user_id: str, expires_in: int = 3600) -> str:
        """Generate a secure bearer token"""
        # Create random token
        random_bytes = secrets.token_bytes(32)
        
        # Create expiration timestamp
        expiry = int((datetime.utcnow() + timedelta(seconds=expires_in)).timestamp())
        
        # Combine user_id, expiry, and random bytes
        payload = f"{user_id}:{expiry}:{random_bytes.hex()}"
        
        # Create HMAC signature
        signature = hmac.new(
            self.secret_key,
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Combine payload and signature
        token = f"{payload}.{signature}"
        
        # Base64 encode for safe transport
        import base64
        return base64.urlsafe_b64encode(token.encode()).decode()
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode token"""
        try:
            import base64
            # Decode base64
            decoded = base64.urlsafe_b64decode(token.encode()).decode()
            
            # Split payload and signature
            parts = decoded.rsplit('.', 1)
            if len(parts) != 2:
                return {'valid': False, 'error': 'Invalid token format'}
            
            payload, provided_signature = parts
            
            # Verify signature
            expected_signature = hmac.new(
                self.secret_key,
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(provided_signature, expected_signature):
                return {'valid': False, 'error': 'Invalid signature'}
            
            # Parse payload
            user_id, expiry, random_hex = payload.split(':', 2)
            expiry = int(expiry)
            
            # Check expiration
            if datetime.utcnow().timestamp() > expiry:
                return {'valid': False, 'error': 'Token expired'}
            
            return {
                'valid': True,
                'user_id': user_id,
                'expiry': expiry
            }
            
        except Exception as e:
            return {'valid': False, 'error': f'Token verification failed: {str(e)}'}

# Usage
token_manager = TokenManager(secret_key="your-secret-key")

# Generate
token = token_manager.generate_token("user123", expires_in=3600)

# Verify
result = token_manager.verify_token(token)
if result['valid']:
    print(f"User: {result['user_id']}")
```

### Token Storage (Client-Side)

```javascript
// Secure token storage in browser
class SecureTokenStorage {
  constructor() {
    this.tokenKey = '__wc_auth_token';
  }
  
  // Store token securely
  storeToken(token) {
    // Use sessionStorage for better security (cleared on tab close)
    sessionStorage.setItem(this.tokenKey, token);
    
    // Or localStorage for persistent sessions
    // localStorage.setItem(this.tokenKey, token);
  }
  
  // Retrieve token
  getToken() {
    return sessionStorage.getItem(this.tokenKey) || localStorage.getItem(this.tokenKey);
  }
  
  // Remove token
  clearToken() {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
  }
  
  // Make authenticated request
  async authenticatedFetch(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Handle token expiration
    if (response.status === 401) {
      this.clearToken();
      throw new Error('Authentication token expired');
    }
    
    return response;
  }
}

// Usage
const tokenStorage = new SecureTokenStorage();

// After login
tokenStorage.storeToken(receivedToken);

// Make authenticated request
try {
  const response = await tokenStorage.authenticatedFetch('/api/protected', {
    method: 'POST',
    body: JSON.stringify({ data: 'value' })
  });
  const data = await response.json();
} catch (error) {
  console.error('Request failed:', error);
  // Redirect to login
}
```

## 🌐 CORS Configuration

### Comprehensive CORS Handler

```javascript
class CORSManager {
  constructor(config = {}) {
    this.allowedOrigins = config.allowedOrigins || ['*'];
    this.allowedMethods = config.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    this.allowedHeaders = config.allowedHeaders || ['Content-Type', 'Authorization', 'X-Requested-With'];
    this.exposeHeaders = config.exposeHeaders || ['Content-Length', 'X-Request-ID'];
    this.maxAge = config.maxAge || 86400; // 24 hours
    this.credentials = config.credentials || false;
  }
  
  // Check if origin is allowed
  isOriginAllowed(origin) {
    if (this.allowedOrigins.includes('*')) {
      return true;
    }
    
    return this.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Wildcard matching (e.g., *.example.com)
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });
  }
  
  // Get CORS headers
  getCORSHeaders(request) {
    const origin = request.headers.get('Origin') || '*';
    
    const headers = {
      'Access-Control-Allow-Methods': this.allowedMethods.join(', '),
      'Access-Control-Allow-Headers': this.allowedHeaders.join(', '),
      'Access-Control-Expose-Headers': this.exposeHeaders.join(', '),
      'Access-Control-Max-Age': this.maxAge.toString()
    };
    
    // Set origin
    if (this.allowedOrigins.includes('*')) {
      headers['Access-Control-Allow-Origin'] = '*';
    } else if (this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Vary'] = 'Origin';
    }
    
    // Credentials
    if (this.credentials && headers['Access-Control-Allow-Origin'] !== '*') {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    return headers;
  }
  
  // Handle preflight request
  handlePreflight(request) {
    const headers = this.getCORSHeaders(request);
    
    return new Response(null, {
      status: 204,
      headers
    });
  }
  
  // Add CORS headers to response
  addCORSHeaders(request, response) {
    const corsHeaders = this.getCORSHeaders(request);
    const newHeaders = new Headers(response.headers);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
}

// Usage in Cloudflare Worker
const corsManager = new CORSManager({
  allowedOrigins: [
    'https://wired-chaos.pages.dev',
    'https://wired-chaos-preview.pages.dev',
    'https://*.wiredchaos.xyz'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
});

export default {
  async fetch(request, env, ctx) {
    // Handle preflight
    if (request.method === 'OPTIONS') {
      return corsManager.handlePreflight(request);
    }
    
    // Process request
    let response = await handleRequest(request, env);
    
    // Add CORS headers
    response = corsManager.addCORSHeaders(request, response);
    
    return response;
  }
};
```

## 🔄 Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 60 seconds
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastError = null;
  }
  
  async execute(fn, fallback = null) {
    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        console.warn('Circuit breaker is OPEN, using fallback');
        return fallback ? fallback() : Promise.reject(this.lastError);
      }
      
      // Try transitioning to HALF_OPEN
      this.state = 'HALF_OPEN';
      this.successes = 0;
    }
    
    try {
      // Execute function with timeout
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        )
      ]);
      
      // Success
      this.onSuccess();
      return result;
      
    } catch (error) {
      // Failure
      this.onFailure(error);
      
      // Use fallback if available
      if (fallback) {
        return fallback();
      }
      
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      
      if (this.successes >= this.successThreshold) {
        this.state = 'CLOSED';
        console.log('Circuit breaker closed');
      }
    }
  }
  
  onFailure(error) {
    this.failures++;
    this.lastError = error;
    
    console.error(`Circuit breaker failure ${this.failures}/${this.failureThreshold}:`, error);
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      console.warn(`Circuit breaker opened until ${new Date(this.nextAttempt).toISOString()}`);
    }
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastError = null;
  }
  
  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      nextAttempt: new Date(this.nextAttempt).toISOString()
    };
  }
}

// Usage for external API calls
const notionBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 10000,
  resetTimeout: 60000
});

async function fetchFromNotion(databaseId) {
  return notionBreaker.execute(
    // Primary function
    async () => {
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status}`);
      }
      
      return response.json();
    },
    // Fallback function (use cached data)
    async () => {
      console.log('Using cached Notion data');
      const cached = await KV.get(`notion:${databaseId}`);
      return cached ? JSON.parse(cached) : { results: [] };
    }
  );
}
```

## 💰 Wallet Gating System

### Multi-Chain Wallet Verification

```javascript
class WalletGate {
  constructor(config = {}) {
    this.chains = config.chains || ['ethereum', 'solana', 'xrpl', 'hedera'];
    this.requiredBalance = config.requiredBalance || 0;
    this.allowedContracts = config.allowedContracts || [];
  }
  
  // Verify wallet ownership via signature
  async verifyOwnership(chain, address, signature, message) {
    const verifiers = {
      ethereum: this.verifyEthereumSignature,
      solana: this.verifySolanaSignature,
      xrpl: this.verifyXRPLSignature,
      hedera: this.verifyHederaSignature
    };
    
    const verifier = verifiers[chain.toLowerCase()];
    
    if (!verifier) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    
    return await verifier.call(this, address, signature, message);
  }
  
  async verifyEthereumSignature(address, signature, message) {
    // Use ethers.js for verification
    try {
      const { ethers } = require('ethers');
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Ethereum signature verification failed:', error);
      return false;
    }
  }
  
  async verifySolanaSignature(address, signature, message) {
    // Use @solana/web3.js for verification
    try {
      const { PublicKey } = require('@solana/web3.js');
      const nacl = require('tweetnacl');
      
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = Buffer.from(signature, 'base64');
      const publicKeyBytes = new PublicKey(address).toBytes();
      
      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    } catch (error) {
      console.error('Solana signature verification failed:', error);
      return false;
    }
  }
  
  async verifyXRPLSignature(address, signature, message) {
    // XRPL signature verification
    try {
      const xrpl = require('xrpl');
      const verified = xrpl.verify(message, signature, address);
      return verified;
    } catch (error) {
      console.error('XRPL signature verification failed:', error);
      return false;
    }
  }
  
  async verifyHederaSignature(address, signature, message) {
    // Hedera signature verification
    // Implementation depends on Hedera SDK
    console.warn('Hedera verification not yet implemented');
    return false;
  }
  
  // Check if wallet holds required NFT
  async verifyNFTOwnership(chain, address, contractAddress, tokenId = null) {
    const checkers = {
      ethereum: this.checkEthereumNFT,
      solana: this.checkSolanaNFT
    };
    
    const checker = checkers[chain.toLowerCase()];
    
    if (!checker) {
      throw new Error(`NFT checking not supported for chain: ${chain}`);
    }
    
    return await checker.call(this, address, contractAddress, tokenId);
  }
  
  async checkEthereumNFT(address, contractAddress, tokenId) {
    // Check ERC-721 ownership
    const { ethers } = require('ethers');
    const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
    
    const abi = ['function ownerOf(uint256 tokenId) view returns (address)'];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
      if (tokenId) {
        const owner = await contract.ownerOf(tokenId);
        return owner.toLowerCase() === address.toLowerCase();
      } else {
        // Check balance instead
        const balanceAbi = ['function balanceOf(address owner) view returns (uint256)'];
        const balanceContract = new ethers.Contract(contractAddress, balanceAbi, provider);
        const balance = await balanceContract.balanceOf(address);
        return balance.gt(0);
      }
    } catch (error) {
      console.error('Ethereum NFT check failed:', error);
      return false;
    }
  }
}

// Usage in Cloudflare Worker
const walletGate = new WalletGate({
  chains: ['ethereum', 'solana', 'xrpl'],
  allowedContracts: [
    '0x...', // Ethereum NFT contract
    'So1...' // Solana NFT contract
  ]
});

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/protected')) {
      // Extract wallet info from request
      const { chain, address, signature, message } = await request.json();
      
      // Verify wallet ownership
      const isValid = await walletGate.verifyOwnership(chain, address, signature, message);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid wallet signature' }),
          { status: 403 }
        );
      }
      
      // Proceed with request
      return handleProtectedRequest(request, env, { chain, address });
    }
    
    return handleRequest(request, env);
  }
};
```

## ✍️ NDA Digital Signature Integration

```javascript
class NDASignatureManager {
  constructor(env) {
    this.env = env;
    this.kvNamespace = env.NDA_SIGNATURES; // KV namespace for storing signatures
  }
  
  // Generate NDA document hash
  async generateDocumentHash(ndaContent) {
    const encoder = new TextEncoder();
    const data = encoder.encode(ndaContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Create signature request
  async createSignatureRequest(documentHash, signerAddress, chain) {
    const timestamp = Date.now();
    const nonce = crypto.randomUUID();
    
    const message = [
      '=== WIRED CHAOS NDA Signature ===',
      `Document Hash: ${documentHash}`,
      `Signer Address: ${signerAddress}`,
      `Chain: ${chain}`,
      `Timestamp: ${timestamp}`,
      `Nonce: ${nonce}`,
      '',
      'By signing this message, you agree to the terms of the WIRED CHAOS NDA.',
      'This signature is legally binding.'
    ].join('\n');
    
    return {
      message,
      documentHash,
      signerAddress,
      chain,
      timestamp,
      nonce
    };
  }
  
  // Store signature
  async storeSignature(documentHash, signerAddress, signature, signatureRequest) {
    const key = `nda:${documentHash}:${signerAddress}`;
    
    const record = {
      documentHash,
      signerAddress,
      signature,
      chain: signatureRequest.chain,
      message: signatureRequest.message,
      timestamp: signatureRequest.timestamp,
      nonce: signatureRequest.nonce,
      signedAt: Date.now()
    };
    
    // Store in KV with 10-year expiration
    await this.kvNamespace.put(
      key,
      JSON.stringify(record),
      { expirationTtl: 315360000 } // 10 years
    );
    
    // Also store in index by signer
    const signerKey = `signer:${signerAddress}`;
    let signerDocs = await this.kvNamespace.get(signerKey);
    signerDocs = signerDocs ? JSON.parse(signerDocs) : [];
    signerDocs.push({ documentHash, signedAt: record.signedAt });
    
    await this.kvNamespace.put(
      signerKey,
      JSON.stringify(signerDocs),
      { expirationTtl: 315360000 }
    );
    
    return record;
  }
  
  // Verify signature
  async verifySignature(documentHash, signerAddress) {
    const key = `nda:${documentHash}:${signerAddress}`;
    const record = await this.kvNamespace.get(key);
    
    if (!record) {
      return { valid: false, error: 'No signature found' };
    }
    
    const data = JSON.parse(record);
    
    // Verify signature against stored message
    const walletGate = new WalletGate();
    const isValid = await walletGate.verifyOwnership(
      data.chain,
      data.signerAddress,
      data.signature,
      data.message
    );
    
    return {
      valid: isValid,
      record: data
    };
  }
  
  // Get all NDAs signed by address
  async getSignedNDAs(signerAddress) {
    const signerKey = `signer:${signerAddress}`;
    const docs = await this.kvNamespace.get(signerKey);
    
    return docs ? JSON.parse(docs) : [];
  }
}

// Usage in API endpoint
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ndaManager = new NDASignatureManager(env);
    
    if (url.pathname === '/api/nda/request-signature') {
      const { ndaContent, signerAddress, chain } = await request.json();
      
      // Generate document hash
      const documentHash = await ndaManager.generateDocumentHash(ndaContent);
      
      // Create signature request
      const signatureRequest = await ndaManager.createSignatureRequest(
        documentHash,
        signerAddress,
        chain
      );
      
      return new Response(JSON.stringify(signatureRequest), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/api/nda/submit-signature') {
      const { documentHash, signerAddress, signature, signatureRequest } = await request.json();
      
      // Store signature
      const record = await ndaManager.storeSignature(
        documentHash,
        signerAddress,
        signature,
        signatureRequest
      );
      
      return new Response(JSON.stringify({ success: true, record }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/api/nda/verify') {
      const { documentHash, signerAddress } = await request.json();
      
      // Verify signature
      const result = await ndaManager.verifySignature(documentHash, signerAddress);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

## 🔒 Secure Environment Variables

```javascript
// Safe environment variable access
function getEnv(key, defaultValue = '') {
  return env?.[key] || process?.env?.[key] || defaultValue;
}

// Validate required environment variables
function validateEnvironment(required = []) {
  const missing = [];
  
  for (const key of required) {
    if (!getEnv(key)) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Usage
const REQUIRED_VARS = [
  'API_TOKEN',
  'CLOUDFLARE_ACCOUNT_ID',
  'DATABASE_URL'
];

validateEnvironment(REQUIRED_VARS);
```

## 📊 Security Audit Logging

```javascript
class SecurityAuditLogger {
  constructor(env) {
    this.env = env;
    this.kvNamespace = env.AUDIT_LOGS;
  }
  
  async log(event) {
    const logEntry = {
      timestamp: Date.now(),
      type: event.type,
      severity: event.severity || 'INFO',
      userId: event.userId || 'anonymous',
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      action: event.action,
      resource: event.resource,
      result: event.result,
      metadata: event.metadata || {}
    };
    
    // Store in KV
    const key = `audit:${logEntry.timestamp}:${crypto.randomUUID()}`;
    await this.kvNamespace.put(key, JSON.stringify(logEntry), {
      expirationTtl: 7776000 // 90 days
    });
    
    // Also log to console for real-time monitoring
    console.log('AUDIT:', JSON.stringify(logEntry));
  }
}

// Usage
const auditLogger = new SecurityAuditLogger(env);

await auditLogger.log({
  type: 'AUTHENTICATION',
  severity: 'WARNING',
  userId: 'user123',
  ipAddress: request.headers.get('CF-Connecting-IP'),
  userAgent: request.headers.get('User-Agent'),
  action: 'LOGIN_FAILED',
  resource: '/api/auth',
  result: 'DENIED',
  metadata: { reason: 'Invalid credentials' }
});
```

---

**Last Updated**: 2024
**Maintained By**: WIRED CHAOS Security Team
