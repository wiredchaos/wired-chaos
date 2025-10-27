import { sha256, buildAttestation } from './crypto.js';
import type {
  AttestationPayload,
  ChunkInfo,
  ManifestChunkEntry,
  ManifestDocument,
  NotaryConfig,
} from './types.js';

const GROK_NOTES = 'GROK: Artist @neurometax • © WIRED CHAOS / 33.3FM DOGECHAIN • Palette #000000 #00FFFF #FF3131 #39FF14 #FF00FF';

export function buildManifest(config: NotaryConfig, docHash: string, chunks: ChunkInfo[]): ManifestDocument {
  const manifestChunks: ManifestChunkEntry[] = chunks.map((chunk) => ({
    i: chunk.index,
    bytes: chunk.buffer.length,
    hash: chunk.hash,
    insc: chunk.inscription?.inscriptionId ?? 'pending',
  }));

  return {
    wcn: 'ins-1',
    doc: {
      title: config.title,
      mime: config.mimeType ?? 'application/octet-stream',
      algo: 'sha256',
      doc_hash: docHash,
      bytes: chunks.reduce((sum, chunk) => sum + chunk.buffer.length, 0),
    },
    privacy: {
      mode: config.privacyMode,
      cipher: config.privacyMode === 'encrypted' ? 'xchacha20poly1305' : null,
      recipient: config.recipientKey ?? 'public',
    },
    chunks: manifestChunks,
    created_at: config.timestamp,
    author: config.author,
    notes: GROK_NOTES,
  };
}

export function finalizeManifestWithInscriptionIds(
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

export function buildAttestationForMode(
  config: NotaryConfig,
  docHash: string,
  fileInscriptionId?: string,
  manifestInscriptionId?: string
): AttestationPayload {
  return buildAttestation({
    namespace: `${config.namespace}`,
    title: config.title,
    docHash,
    timestamp: config.timestamp,
    author: config.author,
    fileInscriptionId,
    manifestInscriptionId,
  });
}

export function deriveDocumentHash(buffer: Buffer): string {
  return sha256(buffer);
}
