import type { CertificateRow } from "../schema.js";
import { fetchJson } from "../utils/fetcher.js";
import type { Provider } from "./Provider.js";

export class DogeIndexerProvider implements Provider {
  constructor(private base: string, private key?: string) {}

  name() {
    return "DogeIndexer";
  }

  async resolve(cert: CertificateRow) {
    const url = `${this.base}/inscription/${encodeURIComponent(cert.expected_inscription_id)}`;
    const headers = this.key ? { Authorization: `Bearer ${this.key}` } : undefined;
    const data = await fetchJson(url, { headers });

    if (!data || (typeof data === "object" && "error" in data)) {
      const reason = typeof data === "object" && data && "error" in data ? (data as any).error : "not_found";
      return { ok: false, reason, raw: data };
    }

    return {
      ok: true,
      inscriptionId: (data as any).inscriptionId,
      txid: (data as any).txid,
      contentHash: (data as any).contentHash,
      raw: data,
    };
  }
}
