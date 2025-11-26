/**
 * Cloudflare Worker — XRP riddle gate
 * - Protects /esoteric(.*) unless cookie wc_unlock=xrp is set
 * - Redirects unknown attempts to /
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const hasCookie = (request.headers.get("Cookie") || "").includes("wc_unlock=xrp");
    const protectedPath = /^\/esoteric(\.html)?(\/.*)?$/i.test(path);

    if (protectedPath && !hasCookie) {
      return Response.redirect(`${url.origin}/`, 302);
    }

    // Harden basic security headers
    const resp = await fetch(request);
    const newHeaders = new Headers(resp.headers);
    newHeaders.set("Content-Security-Policy",
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';");
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("X-Frame-Options", "DENY");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(resp.body, { status: resp.status, headers: newHeaders });
  }
};
