export function hmacSHA256Base16(secret: string, body: string): string {
  const enc = new TextEncoder().encode(body);
  const key = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  // Workers crypto is sync-ish via await
  // @ts-ignore
  return key.then((k: CryptoKey) =>
    crypto.subtle.sign("HMAC", k, enc).then(buf =>
      [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("")
    )
  ) as unknown as string; // will be awaited by caller
}

export async function verifySignature(
  bodyText: string,
  providedHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!providedHeader || !providedHeader.startsWith("sha256=")) return false;
  const expected = await hmacSHA256Base16(secret, bodyText);
  const provided = providedHeader.slice("sha256=".length).toLowerCase();
  return timingSafeEqual(expected, provided);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
