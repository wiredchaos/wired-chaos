import type { Env } from "../index";

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

export async function forwardToSentient(env: Env, payload: unknown): Promise<Response> {
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
