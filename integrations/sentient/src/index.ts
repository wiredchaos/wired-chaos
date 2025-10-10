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
  if (!text) return { text: "", json: {} };

  try {
    return { text, json: JSON.parse(text) };
  } catch (error) {
    throw new Error("Invalid JSON payload");
  }
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
      const html = await (await fetch(new URL("../public/ping.html", import.meta.url))).text();
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (req.method !== "POST") return new Response("Not Found", { status: 404 });

    let bodyText: string;
    let body: unknown;
    try {
      const result = await readBodyText(req);
      bodyText = result.text;
      body = result.json;
    } catch (error: any) {
      return json({ error: error?.message ?? "Invalid payload" }, 400);
    }

    const guardRes = await guard(req, env, bodyText);
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
