# WIRED CHAOS × Sentient Ingestion Bridge

## Interface Protocol Announcement

> A new class of AI megastructures is rising—built for scale, not humanity.
>
> These systems do not ask for résumés. They detect compatibility.
>
> A Sentient operational grid is forming around this infrastructure. **WIRED CHAOS does not own Sentient—this bridge only connects to it.** We calibrate humans and agent swarms to interface without being rejected.
>
> We are not applicants. We are interface architects.
>
> WIRED CHAOS trains micro-firms, solo contractors, and AI-driven agencies to operate as signal-stable nodes—economically aligned, grant-compliant, and interoperable with high-capacity compute infrastructure.
>
> No job portals. No legacy HR rails. Just interface readiness.
>
> **WIRED CHAOS // Contractor Lattice Protocol Engaged.**

This Cloudflare Worker is the connective tissue for that lattice. It receives webhooks from:
- FreshRSS (RSS → Chaos Reactor)
- Wix forms
- Gamma decks (form blocks / submissions)

It **verifies** each webhook (shared HMAC), **normalizes** the payloads to a common schema, then **forwards** them to your Sentient ingestion endpoint—allowing contractor nodes to sync signal-ready data into the grid.

## PR Sub-Systems — Interface Layer Map

### 1. Positioning Node — “We Do Not Apply”
Traditional workforce models collapse under AI scale. WIRED CHAOS prepares contractor nodes that plug directly into intelligent infrastructure and Sentient-connected ecosystems. This Worker keeps their output machine-readable and authenticated.

### 2. Interface Ritual — “Calibration Over Employment”
Instead of requesting inclusion, we optimize signal compatibility. The shared-secret verification, origin allowlists, and normalization helpers ensure every webhook payload arrives calibrated for Sentient’s perimeter economy.

### 3. Economic Translator Layer
We translate economic incentives, grants, credits, and vendor opportunities into automation rituals and agent-ready templates. The schema emitted here is ready for downstream automations that map grants or vendor criteria to swarm assignments.

### 4. Agent Mesh Expansion
Every WIRED CHAOS-trained contractor or agency installs an automated agent companion—expanding the lattice and increasing grid recognition by AI infrastructure scanners. The forwarding hook is the standardized output channel that keeps those agents synchronized.

## Quick Start

1. **Provision Secrets**
   ```bash
   # In Cloudflare (Wrangler or Dashboard):
   wrangler secret put SENTIENT_WEBHOOK_URL
   wrangler secret put SENTIENT_API_KEY           # if your Sentient endpoint needs a Bearer key
   wrangler secret put WEBHOOK_SHARED_SECRET      # HMAC shared secret for your sources
   wrangler secret put ALLOWED_ORIGINS            # CSV of allowed hosts (e.g. "your.wixsite.com,gamma.app,freshrss.yourdomain")
   ```

2. **Install & Run Locally**
   ```bash
   cd integrations/sentient
   npm i
   npm run dev
   # local worker: http://127.0.0.1:8787
   ```

3. **Configure Sources**
   - **FreshRSS** → Subscriptions → add WebSub/Push (or a webhook) pointing to `https://<your-worker-domain>/webhook/freshrss`
     - Send header `X-WC-Signature: sha256=<hmac>` where `<hmac>` is the SHA-256 HMAC of the raw body using `WEBHOOK_SHARED_SECRET`.
   - **Wix** → Automations → Webhooks → Target URL `https://<your-worker-domain>/webhook/wix`
   - **Gamma** → Form block → webhook URL `https://<your-worker-domain>/webhook/gamma`

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Test**
   ```bash
   curl -X POST http://127.0.0.1:8787/webhook/freshrss \
     -H 'Content-Type: application/json' \
     -H 'X-WC-Signature: sha256=<computed-hmac>' \
     --data @api_examples/freshrss.sample.json
   ```

## Normalized Schema (forwarded to Sentient)

```json
{
  "source": "freshrss|wix|gamma",
  "timestamp": "2025-10-10T14:22:33.000Z",
  "tags": ["ai", "rss", "wired-chaos"],
  "title": "string",
  "summary": "string",
  "url": "https://...",
  "author": "string | null",
  "raw": { "original_payload": "kept for traceability" }
}
```

Notes
- We keep a raw copy for auditability.
- If Sentient expects different fields, adjust the `normalize*()` helpers.
- No third-party SDKs required.

---

## `.env.example`

```env
# Where the Worker forwards normalized events
SENTIENT_WEBHOOK_URL=https://api.sentient.xyz/ingest

# Optional Bearer token if your Sentient endpoint requires it
SENTIENT_API_KEY=sk_sentient_xxxxx

# HMAC shared secret used to validate incoming webhooks from all sources
WEBHOOK_SHARED_SECRET=supersecretsharedstring

# CSV of hosts allowed to call the webhook (basic origin allowlist)
ALLOWED_ORIGINS=your.wixsite.com,gamma.app,freshrss.yourdomain
```

⸻

`integrations/sentient/wrangler.toml`

```
name = "wc-sentient-bridge"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
# Non-secret, optional defaults (secrets set via wrangler secret)
ENVIRONMENT = "production"

[observability]
enabled = true
```

⸻

`integrations/sentient/package.json`

```
{
  "name": "wc-sentient-bridge",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "format": "prettier -w .",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240919.0",
    "typescript": "^5.4.0",
    "wrangler": "^3.80.0",
    "prettier": "^3.3.3"
  }
}
```

⸻

`integrations/sentient/tsconfig.json`

```
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "types": ["@cloudflare/workers-types"],
    "outDir": "dist",
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

⸻

`integrations/sentient/src/lib/signer.ts`

```ts
export function hmacSHA256Base16(secret: string, body: string): string {
  const enc = new TextEncoder().encode(body);
  const key = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  // Workers crypto is sync-ish via await
  // @ts-ignore
  return key.then((k: CryptoKey) =>
    crypto.subtle.sign("HMAC", k, enc).then(buf =>
      [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("")
    )
  ) as unknown as string; // will be awaited by caller
}

export async function verifySignature(
  bodyText: string,
  providedHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!providedHeader || !providedHeader.startsWith("sha256=")) return false;
  const expected = await hmacSHA256Base16(secret, bodyText);
  const provided = providedHeader.slice("sha256=".length).toLowerCase();
  return timingSafeEqual(expected, provided);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
```

⸻

`integrations/sentient/src/lib/http.ts`

```ts
export function parseCSV(input?: string): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function originAllowed(origin: string | null, allowlistCSV: string | undefined): boolean {
  if (!allowlistCSV) return true;
  if (!origin) return false;
  try {
    const host = new URL(origin).host.toLowerCase();
    return parseCSV(allowlistCSV).some(allowed => host.endsWith(allowed));
  } catch {
    return false;
  }
}

export async function forwardToSentient(
  env: Env,
  payload: unknown
): Promise<Response> {
  const url = env.SENTIENT_WEBHOOK_URL;
  if (!url) return new Response("Missing SENTIENT_WEBHOOK_URL", { status: 500 });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.SENTIENT_API_KEY) headers["Authorization"] = `Bearer ${env.SENTIENT_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(`Sentient error ${res.status}: ${text}`, { status: 502 });
  }
  return new Response("OK", { status: 200 });
}
```

⸻

`integrations/sentient/src/lib/normalizers/freshrss.ts`

```ts
export function normalizeFreshRSS(input: any) {
  // Accept common FreshRSS push payloads; adjust to your actual structure if needed.
  const entry = input?.entry ?? input?.item ?? input;
  const title = entry?.title ?? "Untitled";
  const url = entry?.link ?? entry?.url ?? null;
  const summary = entry?.summary ?? entry?.content ?? "";
  const author = entry?.author ?? entry?.authors?.[0] ?? null;
  const tags = Array.from(new Set(["rss", "ai", "wired-chaos", ...(entry?.tags ?? [])]));

  return {
    source: "freshrss",
    timestamp: new Date().toISOString(),
    tags,
    title,
    summary,
    url,
    author,
    raw: input
  };
}
```

⸻

`integrations/sentient/src/lib/normalizers/wix.ts`

```ts
export function normalizeWix(input: any) {
  const data = input?.data ?? input;
  const title = data?.formName ?? "Wix Submission";
  const url = data?.pageUrl ?? null;
  const summary = Object.entries(data?.fields ?? {})
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join(" | ");

  return {
    source: "wix",
    timestamp: new Date().toISOString(),
    tags: ["wix", "lead", "wired-chaos"],
    title,
    summary,
    url,
    author: data?.contact?.email ?? null,
    raw: input
  };
}
```

⸻

`integrations/sentient/src/lib/normalizers/gamma.ts`

```ts
export function normalizeGamma(input: any) {
  const meta = input?.meta ?? {};
  const blocks = input?.blocks ?? [];
  const title = meta?.deckTitle ?? "Gamma Deck Submission";
  const url = meta?.deckUrl ?? null;

  const summary = blocks
    .map((b: any) => (b?.text?.slice?.(0, 160) ?? JSON.stringify(b).slice(0, 160)))
    .join(" • ");

  return {
    source: "gamma",
    timestamp: new Date().toISOString(),
    tags: ["gamma", "deck", "wired-chaos"],
    title,
    summary,
    url,
    author: meta?.author ?? null,
    raw: input
  };
}
```

⸻

`integrations/sentient/src/index.ts`

```ts
import { forwardToSentient, originAllowed } from "./lib/http";
import { verifySignature } from "./lib/signer";
import { normalizeFreshRSS } from "./lib/normalizers/freshrss";
import { normalizeWix } from "./lib/normalizers/wix";
import { normalizeGamma } from "./lib/normalizers/gamma";

export interface Env {
  SENTIENT_WEBHOOK_URL: string;
  SENTIENT_API_KEY?: string;
  WEBHOOK_SHARED_SECRET: string;
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
}

async function readBodyText(req: Request) {
  const text = await req.text();
  return { text, json: text ? JSON.parse(text) : {} };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function guard(req: Request, env: Env, bodyText: string) {
  // Basic origin allowlist (if header present)
  const origin = req.headers.get("Origin");
  if (!originAllowed(origin, env.ALLOWED_ORIGINS)) {
    return new Response("Origin not allowed", { status: 403 });
  }

  // HMAC signature check (shared across sources)
  const sig = req.headers.get("X-WC-Signature");
  const ok = await verifySignature(bodyText, sig, env.WEBHOOK_SHARED_SECRET);
  if (!ok) return new Response("Invalid signature", { status: 401 });

  return null;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // Health / Ping
    if (req.method === "GET" && url.pathname === "/") {
      return new Response("WC Sentient Bridge OK", { status: 200 });
    }

    // Tiny demo page (on-brand)
    if (req.method === "GET" && url.pathname === "/ping") {
      const html = await (await fetch(new URL("/public/ping.html", import.meta.url))).text();
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (req.method !== "POST") return new Response("Not Found", { status: 404 });

    const { text, json: body } = await readBodyText(req);
    const guardRes = await guard(req, env, text);
    if (guardRes) return guardRes;

    let normalized: any;
    try {
      if (url.pathname === "/webhook/freshrss") normalized = normalizeFreshRSS(body);
      else if (url.pathname === "/webhook/wix") normalized = normalizeWix(body);
      else if (url.pathname === "/webhook/gamma") normalized = normalizeGamma(body);
      else return new Response("Unknown route", { status: 404 });
    } catch (e: any) {
      return json({ error: "Normalization failed", details: e?.message ?? String(e) }, 400);
    }

    // Forward to Sentient
    const sent = await forwardToSentient(env, normalized);
    return sent;
  }
};
```

⸻

`integrations/sentient/public/ping.html`

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>WIRED CHAOS × Sentient Ping</title>
  <style>
    :root{
      --bg:#000000;--cyan:#00FFFF;--red:#FF3131;--green:#39FF14;--pink:#FF00FF;
    }
    html,body{margin:0;height:100%;background:var(--bg);color:var(--cyan);font-family:ui-monospace,monospace}
    .wrap{display:grid;place-items:center;height:100%}
    .card{border:1px solid var(--cyan);padding:24px 28px;border-radius:12px;box-shadow:0 0 24px rgba(0,255,255,.15)}
    .badge{color:var(--bg);background:var(--cyan);padding:2px 8px;border-radius:999px;font-weight:700}
    .muted{opacity:.75}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="badge">WIRED CHAOS</div>
      <h1>Sentient Bridge Live ⚡</h1>
      <p class="muted">RSS → Wix → Gamma → Normalized → Forwarded</p>
    </div>
  </div>
</body>
</html>
```

⸻

`integrations/sentient/api_examples/freshrss.sample.json`

```json
{
  "entry": {
    "title": "BAIR Blog — New Multi-Agent Paper",
    "link": "https://bair.berkeley.edu/blog/2025/10/10/agents",
    "summary": "We explore cooperative behaviors...",
    "author": "BAIR",
    "tags": ["ml", "agents", "research"]
  }
}
```

⸻

`integrations/sentient/api_examples/wix.sample.json`

```json
{
  "data": {
    "formName": "Consulting Lead",
    "pageUrl": "https://wiredchaos.xyz/consulting",
    "fields": {
      "name": "Neo",
      "email": "neo@zion.example",
      "use_case": "AI Academy for local businesses"
    },
    "contact": { "email": "neo@zion.example" }
  }
}
```

⸻

`integrations/sentient/api_examples/gamma.sample.json`

```json
{
  "meta": {
    "deckTitle": "WIRED CHAOS — AI Consulting Block",
    "deckUrl": "https://gamma.app/docs/wired-chaos"
  },
  "blocks": [
    { "text": "Hook — What we build in 15 minutes" },
    { "text": "Offer — RSS-powered AI stack" },
    { "text": "CTA — Book a slot" }
  ]
}
```

---

## WIRED CHAOS Interface Invite

```text
// WIRED CHAOS INTERFACE INVITE
If you operate a micro-agency, creative lab, energy consultancy, automation shop,
or simply plan to survive the AI megastructure era—
you will need interface protocols.

WIRED CHAOS is now activating its first Contractor Mesh Cohort.

No résumés.
Only readiness.

TO CONNECT: Reply with “Node Ready.”
The grid will respond.
```
