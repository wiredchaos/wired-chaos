import { loadFile } from './file.js';
import { sha256 } from './crypto.js';
import type { AttestationPayload, ManifestDocument, VerificationResult } from './types.js';

export async function verifyDocument(
  filePath: string,
  attestation: AttestationPayload,
  manifest?: ManifestDocument
): Promise<VerificationResult> {
  const loaded = await loadFile(filePath);
  const docHash = sha256(loaded.buffer);

  if (manifest) {
    const expectedHash = manifest.doc.doc_hash;
    return {
      verified: expectedHash === docHash,
      mode: 'chunked',
      reason: expectedHash === docHash ? undefined : 'Document hash mismatch against manifest.',
      manifest,
      attestation,
    };
  }

  const verified = attestation.doc_hash === docHash;

  return {
    verified,
    mode: 'full',
    reason: verified ? undefined : 'Document hash mismatch against attestation.',
    attestation,
  };
}
