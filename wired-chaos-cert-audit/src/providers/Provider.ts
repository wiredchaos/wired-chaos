import type { CertificateRow } from "../schema.js";

export interface Provider {
  name(): string;
  resolve(cert: CertificateRow): Promise<{
    ok: boolean;
    inscriptionId?: string;
    txid?: string;
    contentHash?: string;
    raw?: unknown;
    reason?: string;
  }>;
}
