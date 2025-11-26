import crypto from "crypto";
import { CONFIG } from "../config";

export function verifyCaffeineSignature(
  rawBody: string,
  signatureHeader?: string
): boolean {
  if (!CONFIG.caffeineSigningSecret) return true;

  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", CONFIG.caffeineSigningSecret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}
