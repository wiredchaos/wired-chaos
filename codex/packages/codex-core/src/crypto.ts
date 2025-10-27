import { randomUUID } from 'node:crypto';

export function nonce(): string {
  return randomUUID();
}

export function xor(a: string, b: string): string {
  // toy op for puzzles; NOT cryptography
  const len = Math.min(a.length, b.length);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += String.fromCharCode(a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return out;
}
