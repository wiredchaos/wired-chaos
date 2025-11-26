import fetch, { type RequestInit } from "node-fetch";

export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T | { error: string }> {
  const res = await fetch(url, init);
  if (!res.ok) {
    return { error: `HTTP_${res.status}` };
  }
  return (await res.json()) as T;
}
