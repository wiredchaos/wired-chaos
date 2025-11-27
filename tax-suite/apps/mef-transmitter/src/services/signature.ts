import crypto from "crypto";

export function verifyDocuSignWebhook(body: string, signature: string, secret: string) {
  const h = crypto.createHmac("sha256", secret).update(body).digest("base64");
  const expected = Buffer.from(h);
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, actual);
}
