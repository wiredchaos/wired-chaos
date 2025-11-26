# WIRED CHAOS — Late Bus Worker

## What it does
- Receives Swarm publish payloads → validates with Zod → creates a post on Late (`/v1/posts`).
- Handles Late status webhooks with HMAC verification.
- Strict CORS + approver token.
- Exponential backoff and structured logs.

## Run local
```bash
cd apps/late-bus-worker
npm i
wrangler dev
```

## Deploy
- Set secrets:

```
wrangler secret put LATE_API_KEY
wrangler secret put APPROVER_TOKEN
wrangler secret put ALLOWED_ORIGIN
wrangler secret put WEBHOOK_SECRET
wrangler secret put LOG_LEVEL
```

- `npm run deploy`

## Endpoints
- `GET /healthz`
- `POST /v1/publish` (Bearer `APPROVER_TOKEN`)
- `POST /v1/webhooks/late` (`x-late-signature` HMAC hex over raw body)

## Example curl

```bash
curl -X POST "$WORKER_URL/v1/publish" \
  -H "Authorization: Bearer $APPROVER_TOKEN" \
  -H "Content-Type: application/json" \
  --data @payload.json
```

## Notes
- Add media uploading upstream (R2/S3). Provide Late with public URLs or pre-upload to Late’s media endpoints if supported.
- Extend `src/late.ts` for batching or per-platform schedules.
