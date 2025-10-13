export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/reward" || request.method !== "POST") {
      return new Response("Not Found", { status: 404 });
    }
    const auth = request.headers.get("authorization") || "";
    if (!auth.endsWith(env.AUTH_TOKEN)) {
      return new Response("unauthorized", { status: 401 });
    }
    try {
      const body = await request.json();
      const stamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
      const line = JSON.stringify(body) + "\n";
      // Durable Object / KV would be better; keep file-free minimal by posting to Logtail-like sinks.
      // For pilot, echo back payload for the aggregator to scrape from analytics or use a webhook relay.
      return new Response(line, { status: 200, headers: { "content-type":"application/json" }});
    } catch (e) {
      return new Response(`bad payload: ${e}`, { status: 400 });
    }
  }
}
