# SWARM Grant Bot - API Documentation

## Base URL

```
http://localhost:8001
```

## Authentication

Currently no authentication required. In production, implement JWT tokens via `JWT_SECRET` environment variable.

## Endpoints

### Health Check

**GET** `/api/health`

Get API health status and statistics.

**Response:**
```json
{
  "status": "healthy",
  "tenant_id": "wired-chaos",
  "stats": {
    "sources": {
      "tenant_id": "wired-chaos",
      "rss_feeds": 1,
      "api_keys": 2,
      "cached_grants": 10
    },
    "submissions": {
      "total_submissions": 5,
      "successful_submissions": 5,
      "success_rate": 1.0
    }
  }
}
```

---

### Discover Grants

**POST** `/api/grants/discover`

Discover grants from all configured sources.

**Request Body:**
```json
{
  "use_cache": false
}
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "grants": [
    {
      "source": "swarm_rss",
      "title": "Web3 Development Grant",
      "description": "...",
      "amount": 50000,
      "deadline": "2024-12-31",
      "tags": ["web3", "blockchain"]
    }
  ]
}
```

---

### Get Eligible Grants

**POST** `/api/grants/eligible`

Get filtered and prioritized grants matching organization profile.

**Request Body:**
```json
{
  "min_match_score": 0.3,
  "categories": ["web3", "women_in_tech"]
}
```

**Response:**
```json
{
  "success": true,
  "total_discovered": 25,
  "eligible_count": 10,
  "grants": [
    {
      "title": "Web3 Women Founders Grant",
      "match_score": 0.85,
      "priority_score": 0.78,
      "amount": 50000,
      "deadline": "2024-11-30",
      "match_details": {
        "matching_tags": ["web3", "women", "tech"],
        "is_eligible": true
      }
    }
  ]
}
```

---

### Get Grant Details

**GET** `/api/grants/{grant_id}`

Get details for a specific grant.

**Parameters:**
- `grant_id` (path) - Grant identifier

**Response:**
```json
{
  "success": true,
  "grant": {
    "grant_id": "GRANT-001",
    "title": "Web3 Grant",
    "description": "...",
    "amount": 50000,
    "deadline": "2024-12-31"
  }
}
```

---

### Draft Application

**POST** `/api/applications/draft`

Draft grant application using LLM or templates.

**Request Body:**
```json
{
  "grant_id": "GRANT-001",
  "use_llm": false
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "grant_id": "GRANT-001",
    "organization": "Wired Chaos",
    "drafted_at": "2024-01-15T10:30:00Z",
    "method": "template",
    "sections": {
      "executive_summary": "...",
      "organization_background": "...",
      "project_description": "...",
      "budget_justification": "...",
      "impact_statement": "...",
      "sustainability_plan": "..."
    }
  }
}
```

---

### Submit Application

**POST** `/api/applications/submit`

Submit grant application.

**Request Body:**
```json
{
  "grant_id": "GRANT-001",
  "application_id": "APP-001",
  "method": "api"
}
```

**Methods:**
- `api` - Submit via API
- `email` - Submit via email
- `portal` - Submit via web portal (automated)
- `document` - Generate documents for manual submission

**Response:**
```json
{
  "success": true,
  "submission": {
    "submission_id": "SUB-12345",
    "submitted_at": "2024-01-15T10:30:00Z",
    "grant_id": "GRANT-001",
    "method": "api",
    "confirmation": "API-CONFIRMATION-12345"
  }
}
```

---

### Check Application Status

**GET** `/api/applications/status/{submission_id}`

Check status of submitted application.

**Parameters:**
- `submission_id` (path) - Submission identifier

**Response:**
```json
{
  "success": true,
  "status": {
    "submission_id": "SUB-12345",
    "grant_id": "GRANT-001",
    "status": "under_review",
    "tracked_since": "2024-01-15T10:30:00Z",
    "last_checked": "2024-01-15T14:00:00Z",
    "status_history": [
      {
        "status": "submitted",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "status": "under_review",
        "timestamp": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

---

### Get Statistics

**GET** `/api/stats`

Get comprehensive bot statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "sources": {
      "tenant_id": "wired-chaos",
      "rss_feeds": 3,
      "api_keys": 2,
      "cached_grants": 25
    },
    "submissions": {
      "total_submissions": 10,
      "successful_submissions": 9,
      "failed_submissions": 1,
      "success_rate": 0.9,
      "methods": {
        "api": 5,
        "email": 3,
        "document": 2
      }
    },
    "tracking": {
      "total_tracked": 10,
      "status_breakdown": {
        "submitted": 3,
        "under_review": 5,
        "awarded": 2
      }
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message"
}
```

**Status Codes:**
- `200` - Success
- `404` - Not Found
- `500` - Internal Server Error

---

## Usage Examples

### Python

```python
import httpx

async def discover_grants():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/api/grants/discover",
            json={"use_cache": False}
        )
        data = response.json()
        return data["grants"]
```

### JavaScript/TypeScript

```typescript
async function discoverGrants() {
  const response = await fetch('http://localhost:8001/api/grants/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ use_cache: false })
  });
  const data = await response.json();
  return data.grants;
}
```

### cURL

```bash
# Discover grants
curl -X POST http://localhost:8001/api/grants/discover \
  -H "Content-Type: application/json" \
  -d '{"use_cache": false}'

# Get eligible grants
curl -X POST http://localhost:8001/api/grants/eligible \
  -H "Content-Type: application/json" \
  -d '{"min_match_score": 0.3}'

# Check status
curl http://localhost:8001/api/applications/status/SUB-12345
```

---

## Rate Limiting

Currently no rate limiting. In production, implement rate limiting middleware.

## Webhooks

To receive status updates, configure `DISCORD_WEBHOOK_URL` or implement custom webhook endpoints.

## CORS

CORS is configured via `CORS_ORIGINS` environment variable. Default origins:
- `http://localhost:3000`
- `https://wired-chaos.pages.dev`

Add additional origins as needed:

```env
CORS_ORIGINS=http://localhost:3000,https://wired-chaos.pages.dev,https://example.com
```
