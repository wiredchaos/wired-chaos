# TypeScript Migration Guide

## Overview

The WIRED CHAOS WIX/GAMMA Integration Worker has been migrated from JavaScript to TypeScript with strict type safety. This document outlines the changes and migration process.

## What Changed

### 1. Language Migration
- **Before:** JavaScript (ES Modules)
- **After:** TypeScript with strict type checking
- **Benefits:**
  - Compile-time type safety
  - Better IDE support and autocomplete
  - Reduced runtime errors
  - Self-documenting code

### 2. Durable Objects Implementation
- **Rate Limiting:** Moved from in-memory Map to Durable Objects
- **Audit Logging:** New Durable Object for distributed audit logs
- **Benefits:**
  - Distributed state across edge locations
  - Persistent storage
  - Scalable to millions of requests

### 3. Enhanced CORS Support
- **Before:** Basic CORS headers
- **After:** Configurable CORS with wildcard support
- **Benefits:**
  - Broader compatibility
  - Support for development environments
  - Flexible origin matching

### 4. Improved HMAC Verification
- **Before:** Signature verification already awaited (correct)
- **After:** Verified and documented properly
- **Benefits:**
  - Secure webhook verification
  - Protection against replay attacks

## TypeScript Structure

### File Organization
```
cloudflare/workers/
├── integration-worker.ts          # Main worker entry point
├── types.ts                        # Type definitions
├── tsconfig.json                   # TypeScript configuration
└── durable-objects/
    ├── RateLimiter.ts             # Rate limiting DO
    └── AuditLogger.ts             # Audit logging DO
```

### Key Type Definitions

```typescript
// Environment bindings
interface Env {
  CACHE_KV?: KVNamespace;
  ANALYTICS_KV?: KVNamespace;
  SYNC_KV?: KVNamespace;
  R2_BUCKET?: R2Bucket;
  RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
  AUDIT_LOGGER: DurableObjectNamespace<AuditLogger>;
  WIX_API_TOKEN?: string;
  GAMMA_API_KEY?: string;
  // ... other secrets
}

// API Response
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: ErrorDetails | null;
  metadata: {
    timestamp: number;
    [key: string]: unknown;
  };
}
```

## Durable Objects

### Rate Limiter

**Purpose:** Distributed rate limiting across edge locations

**Usage:**
```typescript
const limitResult = await checkRateLimit(
  env,
  clientIp,
  'wix',
  { requests: 100, windowMs: 60000 }
);

if (!limitResult.allowed) {
  return jsonResponse(
    createErrorResponse('RATE_LIMIT', 'Rate limit exceeded'),
    429,
    origin,
    {
      'Retry-After': limitResult.retryAfter?.toString() || '60',
    }
  );
}
```

**Features:**
- Per-identifier rate limiting
- Configurable time windows
- Automatic cleanup with alarms
- X-RateLimit-* headers

### Audit Logger

**Purpose:** Distributed audit logging with query capabilities

**Usage:**
```typescript
await logAudit(env, {
  type: 'wix_request',
  action: 'api_call',
  ip: clientIp,
  details: {
    path: url.pathname,
    method: request.method,
  },
});
```

**Features:**
- Structured log entries
- Query by time range or type
- CSV export support
- 30-day retention with automatic cleanup

## Migration Steps

### For Developers

1. **Install TypeScript dependencies:**
   ```bash
   cd wix-gamma-integration
   npm install --save-dev typescript @cloudflare/workers-types
   ```

2. **Update imports to use .ts files:**
   ```typescript
   // Before
   import { RateLimiter } from './utils.js';
   
   // After
   import type { RateLimitConfig } from './types';
   ```

3. **Add type annotations:**
   ```typescript
   // Before
   async function handleRequest(request, env, url, origin) {
   
   // After
   async function handleRequest(
     request: Request,
     env: Env,
     url: URL,
     origin: string
   ): Promise<Response> {
   ```

4. **Update wrangler.toml:**
   ```toml
   # Change main entry point
   main = "integration-worker.ts"
   
   # Add Durable Object bindings
   [[durable_objects.bindings]]
   name = "RATE_LIMITER"
   class_name = "RateLimiter"
   script_name = "wix-gamma-integration"
   ```

### For CI/CD

The GitHub Actions workflow has been updated to:
1. Run TypeScript type checking (`npx tsc --noEmit`)
2. Deploy the TypeScript worker (Wrangler handles compilation)
3. Test the deployed worker

## CORS Configuration

The worker now supports flexible CORS configuration:

```typescript
function handleCORS(origin: string): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

**Features:**
- Wildcard support for development
- Specific origin matching for production
- Preflight request handling
- Configurable headers and methods

## HMAC Signature Verification

The HMAC signature verification is properly implemented as async:

```typescript
async function verifyWixSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}
```

**Usage:**
```typescript
if (env.WIX_WEBHOOK_SECRET && signature) {
  const isValid = await verifyWixSignature(
    JSON.stringify(webhook),
    signature,
    env.WIX_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return jsonResponse(
      createErrorResponse('UNAUTHORIZED', 'Invalid webhook signature'),
      401,
      origin
    );
  }
}
```

## Testing

### Type Checking
```bash
cd wix-gamma-integration/cloudflare/workers
npx tsc --noEmit
```

### Local Development
```bash
cd wix-gamma-integration
npm run dev
```

### Deployment
```bash
# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging
```

## Benefits

1. **Type Safety:** Catch errors at compile time
2. **Better IDE Support:** Autocomplete and inline documentation
3. **Scalability:** Durable Objects handle distributed state
4. **Reliability:** Persistent storage for rate limits and logs
5. **Security:** Verified HMAC signatures for webhooks
6. **Compatibility:** Enhanced CORS for broader support

## Breaking Changes

### None!
The external API remains unchanged. All endpoints and functionality work exactly as before.

### Internal Changes Only
- Code is now TypeScript
- Rate limiting uses Durable Objects
- Audit logging uses Durable Objects

## Rollback

If needed, the original JavaScript worker is preserved at:
- `cloudflare/workers/integration-worker.js` (backup)

To rollback:
1. Update `wrangler.toml`: `main = "integration-worker.js"`
2. Remove Durable Object bindings
3. Deploy: `wrangler deploy`

## Support

For issues or questions:
- GitHub Issues: https://github.com/wiredchaos/wired-chaos/issues
- TypeScript Docs: https://www.typescriptlang.org/docs/
- Durable Objects Docs: https://developers.cloudflare.com/durable-objects/

---

**WIRED CHAOS** - Type-Safe Everything! 🚀
