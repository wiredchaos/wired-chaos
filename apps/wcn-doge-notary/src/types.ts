export interface NotaryConfig {
  filePath: string;
  title: string;
  privacyMode: 'public' | 'encrypted';
  recipientKey?: string;
  maxInlineKB: number;
  chunkKB: number;
  namespace: string;
  author: string;
  timestamp: string;
  mimeType?: string;
  dryRun?: boolean;
}

export interface LoadedFile {
  buffer: Buffer;
  sizeBytes: number;
  mimeType: string;
}

export interface InscriptionResult {
  inscriptionId: string;
  txid?: string;
  costEstimateDoge?: number;
}

export interface ChunkInfo {
  index: number;
  buffer: Buffer;
  hash: string;
  inscription?: InscriptionResult;
}

export interface ManifestChunkEntry {
  i: number;
  bytes: number;
  hash: string;
  insc: string;
}

export interface ManifestDocument {
  wcn: string;
  doc: {
    title: string;
    mime: string;
    algo: 'sha256';
    doc_hash: string;
    bytes: number;
  };
  privacy: {
    mode: 'public' | 'encrypted';
    cipher: 'xchacha20poly1305' | null;
    recipient: string;
  };
  chunks: ManifestChunkEntry[];
  created_at: string;
  author: string;
  notes: string;
}

export interface AttestationPayload {
  p: string;
  op: 'attest';
  title: string;
  algo: 'sha256';
  doc_hash: string;
  file_insc?: string;
  manifest_insc?: string;
  author: string;
  ts: string;
}

export interface VerificationResult {
  verified: boolean;
  mode: 'full' | 'chunked';
  reason?: string;
  manifest?: ManifestDocument;
  attestation: AttestationPayload;
}

export interface InscriptionRequestOptions {
  mimeType: string;
  content: Buffer | string;
  label: string;
  dryRun?: boolean;
}

export interface DogeCredentials {
  walletMnemonic?: string;
  walletWif?: string;
  rpcUrl?: string;
  inscribeServiceUrl?: string;
}

export interface InscriptionPlannerDecision {
  mode: 'full' | 'chunked';
  sizeBytes: number;
  thresholdBytes: number;
}

export interface PlannerReport {
  decision: InscriptionPlannerDecision;
  docHash: string;
  chunks?: ManifestChunkEntry[];
  attestation: AttestationPayload;
  manifest?: ManifestDocument;
  results: {
    file?: InscriptionResult;
    manifest?: InscriptionResult;
    attestation: InscriptionResult;
    chunks: InscriptionResult[];
  };
}

