# Durable Objects Guide

## Overview

This guide covers the Durable Objects implementation for the WIRED CHAOS WIX/GAMMA Integration Worker.

## What are Durable Objects?

Durable Objects are Cloudflare's solution for coordinating state across distributed systems. Each Durable Object:
- Runs in a single location globally
- Has exclusive access to its own storage
- Can be accessed from anywhere in the world
- Persists state across requests

## Our Durable Objects

### 1. Rate Limiter

**Purpose:** Distributed rate limiting with per-identifier tracking

**File:** `durable-objects/RateLimiter.ts`

#### Features
- Per-identifier rate limiting (by IP, user ID, API key, etc.)
- Configurable request limits and time windows
- Automatic cleanup with alarms
- Returns rate limit info (remaining, reset time)

#### Usage

```typescript
// Check rate limit
const limitResult = await checkRateLimit(
  env,
  clientIp,
  'wix',
  {
    requests: 100,      // Max requests
    windowMs: 60000,    // Time window (60 seconds)
  }
);

if (!limitResult.allowed) {
  // Rate limit exceeded
  return new Response('Rate limit exceeded', {
    status: 429,
    headers: {
      'Retry-After': limitResult.retryAfter?.toString() || '60',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
    },
  });
}

// Request allowed, add headers
response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString());
response.headers.set('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString());
```

#### API Endpoints

**POST /check** - Check rate limit
```json
Request:
{
  "identifier": "user-123",
  "config": {
    "requests": 100,
    "windowMs": 60000
  }
}

Response (200 OK):
{
  "allowed": true,
  "remaining": 95,
  "resetTime": 1634567890000
}

Response (429 Too Many Requests):
{
  "allowed": false,
  "remaining": 0,
  "resetTime": 1634567890000,
  "retryAfter": 45
}
```

**POST /reset** - Reset rate limit
```json
Request:
{
  "identifier": "user-123"
}

Response:
{
  "success": true
}
```

#### Configuration

Rate limits are configured in `shared/constants/index.js`:

```javascript
export const RATE_LIMITS = {
  WIX: {
    requests: 100,
    window: 60000 // 1 minute
  },
  GAMMA: {
    requests: 50,
    window: 60000
  }
};
```

#### Storage Structure

```
Key: ratelimit:{identifier}
Value: {
  count: number,
  windowStart: number (timestamp)
}
```

### 2. Audit Logger

**Purpose:** Distributed audit logging with query and export capabilities

**File:** `durable-objects/AuditLogger.ts`

#### Features
- Structured log entries
- Query by time range and type
- CSV export for compliance
- Automatic 30-day retention
- Alarm-based cleanup

#### Usage

```typescript
// Log an event
await logAudit(env, {
  type: 'wix_request',
  action: 'api_call',
  userId: 'user-123',
  ip: clientIp,
  details: {
    path: '/api/wix/content',
    method: 'POST',
    status: 200,
  },
});
```

#### API Endpoints

**POST /log** - Log an entry
```json
Request:
{
  "type": "wix_request",
  "action": "api_call",
  "userId": "user-123",
  "ip": "1.2.3.4",
  "details": {
    "path": "/api/wix/content",
    "method": "POST"
  }
}

Response:
{
  "success": true,
  "id": "abc123..."
}
```

**POST /query** - Query logs
```json
Request:
{
  "startTime": 1634567890000,
  "endTime": 1634654290000,
  "type": "wix_request",
  "limit": 100
}

Response:
{
  "entries": [
    {
      "id": "abc123...",
      "timestamp": 1634567890000,
      "type": "wix_request",
      "action": "api_call",
      "userId": "user-123",
      "ip": "1.2.3.4",
      "details": { ... }
    }
  ],
  "count": 1
}
```

**GET /export** - Export logs
```
GET /export?format=json
GET /export?format=csv

Response (JSON):
{
  "entries": [ ... ],
  "count": 100
}

Response (CSV):
id,timestamp,type,action,userId,ip,details
abc123,2021-10-18T12:00:00Z,wix_request,api_call,user-123,1.2.3.4,"{...}"
```

#### Storage Structure

```
Key: log:{timestamp}:{id}
Value: {
  id: string,
  timestamp: number,
  type: string,
  action: string,
  userId?: string,
  ip?: string,
  details: object
}
```

#### Retention Policy

Logs are automatically deleted after 30 days via the alarm mechanism.

## wrangler.toml Configuration

```toml
# Durable Objects bindings
[[durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"
script_name = "wix-gamma-integration"

[[durable_objects.bindings]]
name = "AUDIT_LOGGER"
class_name = "AuditLogger"
script_name = "wix-gamma-integration"

# Migrations
[[migrations]]
tag = "v1"
new_classes = ["RateLimiter", "AuditLogger"]
```

### Per-Environment Configuration

```toml
[env.production]
# ...

[[env.production.durable_objects.bindings]]
name = "RATE_LIMITER"
class_name = "RateLimiter"
script_name = "wix-gamma-integration-prod"

[[env.production.durable_objects.bindings]]
name = "AUDIT_LOGGER"
class_name = "AuditLogger"
script_name = "wix-gamma-integration-prod"
```

## Naming Strategies

### Rate Limiter

Durable Object IDs are generated using `idFromName()` based on:
- Identifier type (wix, gamma, etc.)
- Actual identifier (IP, user ID, etc.)

```typescript
const id = env.RATE_LIMITER.idFromName(`${type}:${identifier}`);
```

**Examples:**
- `wix:192.168.1.1` - Rate limit for IP 192.168.1.1 on WIX endpoints
- `gamma:user-123` - Rate limit for user-123 on GAMMA endpoints

### Audit Logger

Durable Object IDs are generated using `idFromName()` based on date:
- One Durable Object per day
- Automatic sharding by date

```typescript
const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const id = env.AUDIT_LOGGER.idFromName(dateKey);
```

**Examples:**
- `2024-01-15` - All logs for January 15, 2024
- `2024-01-16` - All logs for January 16, 2024

## Best Practices

### 1. Error Handling

Always wrap Durable Object calls in try-catch:

```typescript
try {
  const result = await checkRateLimit(env, identifier, type, config);
  // Use result
} catch (error) {
  console.error('Rate limit check error:', error);
  // Fail open - allow request if rate limiter fails
  return { allowed: true, remaining: 0, resetTime: Date.now() + 60000 };
}
```

### 2. Graceful Degradation

If a Durable Object is unavailable:
- Rate limiter: Allow the request (fail open)
- Audit logger: Log to console only

### 3. Performance

- Use `waitUntil()` for non-critical operations
- Don't block requests on audit logging
- Consider batching for high-frequency operations

```typescript
ctx.waitUntil(
  logAudit(env, {
    type: 'analytics',
    action: 'page_view',
    details: { ... }
  })
);
```

### 4. Monitoring

Monitor Durable Objects in Cloudflare Dashboard:
- Request count
- Error rate
- Storage usage
- Alarm execution

## Debugging

### View Durable Object Logs

```bash
# Tail worker logs (includes DO logs)
wrangler tail --env production

# Filter for specific DO
wrangler tail --env production | grep "RateLimiter"
```

### Test Durable Objects Locally

```bash
# Start local dev server
npm run dev

# Durable Objects will use local storage
# Located in: .wrangler/state/
```

### Inspect Storage

Use Wrangler to inspect DO storage:

```bash
# List Durable Objects
wrangler durable-objects list --env production

# Get DO by ID
wrangler durable-objects get <id> --env production
```

## Limitations

1. **Single Location:** Each DO instance runs in one location
   - Fast for coordinated operations
   - May have higher latency for distant requests

2. **Storage Limits:**
   - Up to 128 MB per DO
   - Monitor storage usage

3. **Request Limits:**
   - Up to 1000 subrequests per request
   - Rate limit checks count as subrequests

## Migration from In-Memory

The old in-memory rate limiter:
```javascript
class RateLimiter {
  constructor(requests, windowMs) {
    this.storage = new Map(); // ❌ Lost on worker restart
  }
}
```

The new Durable Object rate limiter:
```typescript
class RateLimiter {
  private state: DurableObjectState;
  
  async checkLimit(...) {
    await this.state.storage.put(...); // ✅ Persisted
  }
}
```

**Benefits:**
- Persistent across worker restarts
- Distributed across edge locations
- Coordinated state globally

## Cost Considerations

Durable Objects pricing (as of 2024):
- $0.15 per million requests
- $0.20 per GB-hour of storage

**Optimization Tips:**
1. Use alarms for periodic cleanup
2. Set appropriate retention policies
3. Monitor storage usage
4. Consider request batching

## Resources

- [Cloudflare Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [Best Practices](https://developers.cloudflare.com/durable-objects/best-practices/)
- [Limits & Pricing](https://developers.cloudflare.com/durable-objects/platform/limits/)

---

**WIRED CHAOS** - Durable Everything! 🚀
