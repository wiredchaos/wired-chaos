export function corsHeaders(origin: string | null, allowed: string) {
  const ok = !!origin && origin === allowed;
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "null",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
