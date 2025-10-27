import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'crypto';
import type { AttestationPayload } from './types.js';

const SIGMA = new Uint32Array([0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]);
const AUTH_TAG_LENGTH = 16;

function rotateLeft(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}

function readUint32LE(buffer: Uint8Array, offset: number): number {
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  ) >>> 0;
}

function writeUint32LE(value: number, buffer: Uint8Array, offset: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
}

function quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotateLeft(state[d] ^ state[a], 16);
  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotateLeft(state[b] ^ state[c], 12);
  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotateLeft(state[d] ^ state[a], 8);
  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotateLeft(state[b] ^ state[c], 7);
}

function hChaCha20(key: Uint8Array, nonce: Uint8Array): Uint8Array {
  const state = new Uint32Array(16);
  for (let i = 0; i < 4; i++) state[i] = SIGMA[i];
  for (let i = 0; i < 8; i++) state[i + 4] = readUint32LE(key, i * 4);
  for (let i = 0; i < 4; i++) state[i + 12] = readUint32LE(nonce, i * 4);

  for (let i = 0; i < 10; i++) {
    quarterRound(state, 0, 4, 8, 12);
    quarterRound(state, 1, 5, 9, 13);
    quarterRound(state, 2, 6, 10, 14);
    quarterRound(state, 3, 7, 11, 15);
    quarterRound(state, 0, 5, 10, 15);
    quarterRound(state, 1, 6, 11, 12);
    quarterRound(state, 2, 7, 8, 13);
    quarterRound(state, 3, 4, 9, 14);
  }

  const out = new Uint8Array(32);
  writeUint32LE(state[0], out, 0);
  writeUint32LE(state[1], out, 4);
  writeUint32LE(state[2], out, 8);
  writeUint32LE(state[3], out, 12);
  writeUint32LE(state[12], out, 16);
  writeUint32LE(state[13], out, 20);
  writeUint32LE(state[14], out, 24);
  writeUint32LE(state[15], out, 28);
  return out;
}

function deriveXChaChaKey(key: Buffer, nonce: Buffer): { subKey: Buffer; derivedNonce: Buffer } {
  const subKey = Buffer.from(hChaCha20(key, nonce.subarray(0, 16)));
  const derivedNonce = Buffer.alloc(12);
  // Counter = 0 (first four bytes)
  derivedNonce.set(nonce.subarray(16, 24), 4);
  return { subKey, derivedNonce };
}

export function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export interface EncryptionResult {
  cipherText: Buffer;
  nonce: Buffer;
  key: Buffer;
}

export function encryptXChaCha20Poly1305(buffer: Buffer, passphrase: string): EncryptionResult {
  const nonce = randomBytes(24);
  const key = scryptSync(passphrase, 'wcn-salt', 32);
  const { subKey, derivedNonce } = deriveXChaChaKey(key, nonce);
  const cipher = createCipheriv('chacha20-poly1305', subKey, derivedNonce, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([encrypted, authTag]);
  return {
    cipherText: payload,
    nonce,
    key,
  };
}

export function decryptXChaCha20Poly1305(cipherText: Buffer, nonce: Buffer, passphrase: string): Buffer {
  const key = scryptSync(passphrase, 'wcn-salt', 32);
  const { subKey, derivedNonce } = deriveXChaChaKey(key, nonce);
  const data = cipherText.subarray(0, cipherText.length - AUTH_TAG_LENGTH);
  const authTag = cipherText.subarray(cipherText.length - AUTH_TAG_LENGTH);
  const decipher = createDecipheriv('chacha20-poly1305', subKey, derivedNonce, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted;
}

export function buildAttestation(params: {
  namespace: string;
  title: string;
  docHash: string;
  timestamp: string;
  author: string;
  fileInscriptionId?: string;
  manifestInscriptionId?: string;
}): AttestationPayload {
  const attestation: AttestationPayload = {
    p: params.namespace,
    op: 'attest',
    title: params.title,
    algo: 'sha256',
    doc_hash: params.docHash,
    author: params.author,
    ts: params.timestamp,
  };

  if (params.fileInscriptionId) {
    attestation.file_insc = params.fileInscriptionId;
  }

  if (params.manifestInscriptionId) {
    attestation.manifest_insc = params.manifestInscriptionId;
  }

  return attestation;
}
