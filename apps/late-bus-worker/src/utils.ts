export const json = (status: number, data: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });

export const backoff = (attempt: number) => Math.min(1000 * 2 ** attempt, 15000);
