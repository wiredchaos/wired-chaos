import { describe, it, expect } from 'vitest';
import { nonce, xor } from '../src/crypto';

describe('crypto helpers', () => {
  it('nonce returns uuid', () => {
    expect(nonce()).toMatch(/[0-9a-f-]{36}/);
  });

  it('xor same string -> null chars', () => {
    const out = xor('aa', 'aa');
    expect(out.charCodeAt(0)).toBe(0);
  });
});
