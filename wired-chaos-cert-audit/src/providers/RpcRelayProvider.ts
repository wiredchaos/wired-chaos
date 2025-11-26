import type { CertificateRow } from "../schema.js";
import { fetchJson } from "../utils/fetcher.js";
import type { Provider } from "./Provider.js";

export class RpcRelayProvider implements Provider {
  constructor(private base: string, private key?: string) {}

  name() {
    return "RpcRelay";
  }

  async resolve(cert: CertificateRow) {
    if (!cert.expected_txid) {
      return { ok: false, reason: "missing_expected_txid" };
    }

    const url = `${this.base}/tx/${encodeURIComponent(cert.expected_txid)}`;
    const headers = this.key ? { Authorization: `Bearer ${this.key}` } : undefined;
    const data = await fetchJson(url, { headers });

    if (!data || (data as any).status === 404) {
      return { ok: false, reason: "not_found", raw: data };
    }

    return {
      ok: true,
      txid: (data as any).txid ?? cert.expected_txid,
      raw: data,
    };
  }
}
