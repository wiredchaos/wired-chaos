export interface Env {
  LATE_API_BASE: string;
  LATE_API_KEY: string;
  LOG_LEVEL?: string;
}

type LateCreatePostResponse = {
  id: string;
  status: string;
  platforms?: Array<{ platform: string; externalId?: string; status: string }>;
};

export async function lateCreatePost(env: Env, payload: unknown, attempt = 0): Promise<LateCreatePostResponse> {
  const url = `${env.LATE_API_BASE || "https://getlate.dev/api"}/v1/posts`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LATE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status >= 500 && res.status < 600 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    return lateCreatePost(env, payload, attempt + 1);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Late error ${res.status}: ${text}`);
  }
  return res.json<LateCreatePostResponse>();
}
