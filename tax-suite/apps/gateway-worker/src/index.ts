import type { ExportedHandler, R2Bucket } from "@cloudflare/workers-types";

export interface Env {
  TAX_EFILE_ENABLED: string;
  TRANSMITTER_BASE_URL: string; // private ALB URL
  AUTH_TOKEN: string;           // shared HMAC or JWT signer
  R2_XML: R2Bucket;
  R2_ACK: R2Bucket;
}

const ok = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" }, ...init });

const bad = (msg: string, code = 400) =>
  new Response(JSON.stringify({ error: msg }), { status: code, headers: { "content-type": "application/json" } });

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const enabled = env.TAX_EFILE_ENABLED === "true";
    if (!enabled) return bad("E-file disabled", 403);

    // simple bearer check (replace with HMAC/JWT as needed)
    const auth = req.headers.get("authorization") || "";
    if (!auth.startsWith("Bearer ")) return bad("Unauthorized", 401);
    if (auth.slice(7) !== env.AUTH_TOKEN) return bad("Unauthorized", 401);

    if (req.method === "POST" && url.pathname === "/efile/return") {
      const body = await req.json<{ submissionId: string; xml: string; clientId: string; taxYear: string }>();
      // store raw XML in R2 (immutable audit)
      await env.R2_XML.put(`${body.submissionId}.xml`, body.xml, { httpMetadata: { contentType: "application/xml" } });

      // forward metadata to transmitter
      const r = await fetch(`${env.TRANSMITTER_BASE_URL}/v1/transmit`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${env.AUTH_TOKEN}` },
        body: JSON.stringify(body),
      });
      return ok(await r.json(), { status: r.status });
    }

    if (req.method === "GET" && url.pathname.startsWith("/efile/status/")) {
      const id = url.pathname.split("/").pop();
      const r = await fetch(`${env.TRANSMITTER_BASE_URL}/v1/status/${id}`, {
        headers: { authorization: `Bearer ${env.AUTH_TOKEN}` },
      });
      const payload = await r.json();
      if (r.ok && payload?.ackCode) {
        await env.R2_ACK.put(`${id}.json`, JSON.stringify(payload), {
          httpMetadata: { contentType: "application/json" },
        });
      }
      return ok(payload, { status: r.status });
    }

    if (req.method === "POST" && url.pathname === "/esign/8879/webhook") {
      const evt = await req.json<any>();
      // passthrough to transmitter for signature verification + persistence
      const r = await fetch(`${env.TRANSMITTER_BASE_URL}/v1/esign/webhook`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${env.AUTH_TOKEN}` },
        body: JSON.stringify(evt),
      });
      return ok(await r.json(), { status: r.status });
    }

    return bad("Not found", 404);
  },
} satisfies ExportedHandler<Env>;
