import { sha256 } from './crypto.js';
import { splitBuffer } from './chunker.js';
import { buildManifest, buildAttestationForMode } from './wcn.js';
import { encryptXChaCha20Poly1305 } from './crypto.js';
import type {
  AttestationPayload,
  ChunkInfo,
  ManifestDocument,
  NotaryConfig,
  InscriptionResult,
} from './types.js';

export interface PlanningOutcome {
  mode: 'full' | 'chunked';
  payload: Buffer;
  docHash: string;
  chunks: ChunkInfo[];
  manifestTemplate?: ManifestDocument;
}

export function planInscription(config: NotaryConfig, fileBuffer: Buffer): PlanningOutcome {
  let workingBuffer = fileBuffer;

  if (config.privacyMode === 'encrypted') {
    if (!config.recipientKey) {
      throw new Error('RECIPIENT_KEY required when PRIVACY_MODE is encrypted.');
    }
    const encrypted = encryptXChaCha20Poly1305(fileBuffer, config.recipientKey);
    workingBuffer = Buffer.concat([encrypted.nonce, encrypted.cipherText]);
  }

  const docHash = sha256(workingBuffer);
  const thresholdBytes = config.maxInlineKB * 1024;
  const mode: 'full' | 'chunked' = workingBuffer.length <= thresholdBytes ? 'full' : 'chunked';

  let chunks: ChunkInfo[];
  if (mode === 'full') {
    chunks = [
      {
        index: 0,
        buffer: workingBuffer,
        hash: docHash,
      },
    ];
  } else {
    chunks = splitBuffer(workingBuffer, config.chunkKB);
  }

  const manifestTemplate = mode === 'chunked'
    ? buildManifest(config, docHash, chunks)
    : undefined;

  return {
    mode,
    payload: workingBuffer,
    docHash,
    chunks,
    manifestTemplate,
  };
}

export function buildAttestationAfterInscribe(
  config: NotaryConfig,
  docHash: string,
  results: {
    file?: InscriptionResult;
    manifest?: InscriptionResult;
  }
): AttestationPayload {
  return buildAttestationForMode(
    config,
    docHash,
    results.file?.inscriptionId,
    results.manifest?.inscriptionId
  );
}

export function finalizeManifest(
  manifest: ManifestDocument,
  chunks: ChunkInfo[]
): ManifestDocument {
  manifest.chunks = chunks.map((chunk) => ({
    i: chunk.index,
    bytes: chunk.buffer.length,
    hash: chunk.hash,
    insc: chunk.inscription?.inscriptionId ?? 'pending',
  }));
  return manifest;
}
