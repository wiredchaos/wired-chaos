import * as ed from "@noble/ed25519";
import * as jose from "jose";
import sodium from "libsodium-wrappers";
import crypto from "crypto";

export type Scheme = "wc-v1" | "wc-v2";
const enc = new TextEncoder();
const dec = new TextDecoder();

export async function initKeys(seedHex: string) {
  await sodium.ready;
  const seed = Buffer.from(seedHex, "hex");
  const kp = sodium.crypto_sign_seed_keypair(seed);
  return { pub: Buffer.from(kp.publicKey), priv: Buffer.from(kp.privateKey) };
}

export function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/** wc-v1: AES-256-GCM symm crypto + HMAC tag (fast, server-side) */
export function wcV1Encrypt(message: string, secret: string) {
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(message, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, ct]).toString("base64url");
  const mac = crypto.createHmac("sha256", key).update(payload).digest("base64url");
  return { cipher: payload, mac };
}

export function wcV1Decrypt(cipherB64: string, mac: string, secret: string) {
  const key = crypto.createHash("sha256").update(secret).digest();
  const expected = crypto.createHmac("sha256", key).update(cipherB64).digest("base64url");
  if (expected !== mac) throw new Error("MAC_BAD");
  const buf = Buffer.from(cipherB64, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const deciph = crypto.createDecipheriv("aes-256-gcm", key, iv);
  deciph.setAuthTag(tag);
  return deciph.update(ct, undefined, "utf8") + deciph.final("utf8");
}

/** wc-v2: libsodium sealed box (asymmetric) */
export async function wcV2Encrypt(msg: string, recipientPub: Uint8Array) {
  await sodium.ready;
  const cipher = sodium.crypto_box_seal(enc.encode(msg), recipientPub);
  return Buffer.from(cipher).toString("base64url");
}
export async function wcV2Decrypt(cipherB64: string, pub: Uint8Array, priv: Uint8Array) {
  await sodium.ready;
  const plain = sodium.crypto_box_seal_open(Buffer.from(cipherB64, "base64url"), pub, priv);
  return dec.decode(plain);
}

/** Ed25519 signatures */
export async function sign(data: string, privHex: string) {
  const sig = await ed.sign(sha256Hex(data), privHex);
  return Buffer.from(sig).toString("base64url");
}
export async function verify(data: string, sigB64: string, pubHex: string) {
  return ed.verify(
    Buffer.from(sha256Hex(data)),
    Buffer.from(pubHex, "hex"),
    Buffer.from(sigB64, "base64url")
  );
}
