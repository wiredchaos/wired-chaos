import type { CertificateRow } from "../schema.js";
import { fetchJson } from "../utils/fetcher.js";
import type { Provider } from "./Provider.js";

export class ExplorerProvider implements Provider {
  constructor(private base: string, private key?: string) {}

  name() {
    return "Explorer";
  }

  async resolve(cert: CertificateRow) {
    const url = `${this.base}/v1/inscriptions?id=${encodeURIComponent(cert.expected_inscription_id)}`;
    const headers = this.key ? { "X-API-Key": this.key } : undefined;
    const data = await fetchJson(url, { headers });

    if (!data || !(data as any).result) {
      return { ok: false, reason: "not_found", raw: data };
    }

    const result = (data as any).result;
    return {
      ok: true,
      inscriptionId: result.id,
      txid: result.txid,
      contentHash: result.sha256 ?? result.contentHash,
      raw: data,
    };
  }
}
