import { PublishBody } from "./schema";
import { lateCreatePost, Env } from "./late";
import { corsHeaders } from "./cors";
import { json, backoff } from "./utils";
import { hmacVerify } from "./crypto";

export default {
  async handleRequest(request: Request, env: Env & Record<string, string>): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/healthz") {
      return json(200, { ok: true, service: "late-bus-worker" }, cors);
    }

    if (url.pathname === "/v1/publish" && request.method === "POST") {
      const auth = request.headers.get("Authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (!token || token !== env.APPROVER_TOKEN) {
        return json(401, { error: "unauthorized" }, cors);
      }

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return json(400, { error: "invalid-json" }, cors);
      }

      const parsed = PublishBody.safeParse(body);
      if (!parsed.success) {
        return json(422, { error: "validation", details: parsed.error.flatten() }, cors);
      }

      const payload = parsed.data;

      let resp;
      for (let i = 0; i < 3; i++) {
        try {
          resp = await lateCreatePost(env, payload);
          break;
        } catch (e) {
          if (i === 2) throw e;
          await new Promise((r) => setTimeout(r, backoff(i)));
        }
      }

      return json(200, { ok: true, late: resp }, cors);
    }

    if (url.pathname === "/v1/webhooks/late" && request.method === "POST") {
      const raw = await request.text();
      const sig = request.headers.get("x-late-signature");
      const ok = await hmacVerify(raw, sig, env.WEBHOOK_SECRET);
      if (!ok) return json(401, { error: "bad-signature" }, cors);

      const evt = JSON.parse(raw);
      console.log("late:webhook", JSON.stringify(evt));
      return json(200, { ok: true }, cors);
    }

    return json(404, { error: "not-found" }, cors);
  },
};
