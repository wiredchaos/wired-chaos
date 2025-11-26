import type { CertificateRow } from "../schema.js";
import { fetchJson } from "../utils/fetcher.js";
import type { Provider } from "./Provider.js";

export class MarketplaceProvider implements Provider {
  constructor(private base: string, private key?: string) {}

  name() {
    return "Marketplace";
  }

  async resolve(cert: CertificateRow) {
    const url = `${this.base}/api/inscriptions/${encodeURIComponent(cert.expected_inscription_id)}`;
    const headers = this.key ? { Authorization: `Bearer ${this.key}` } : undefined;
    const data = await fetchJson(url, { headers });

    if (!data || (data as any).status === 404) {
      return { ok: false, reason: "not_found", raw: data };
    }

    const inscription = (data as any).inscription ?? data;
    return {
      ok: true,
      inscriptionId: inscription?.id,
      txid: inscription?.txid,
      contentHash: inscription?.content_hash ?? inscription?.contentHash,
      raw: data,
    };
  }
}
