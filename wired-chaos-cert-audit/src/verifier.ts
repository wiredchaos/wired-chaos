import type { CertificateRow } from "./schema.js";
import type { Provider } from "./providers/Provider.js";
import { createLogger } from "./logger.js";
import { backoff } from "./utils/backoff.js";
import { auditInsert } from "./projectSource/db.js";

const log = createLogger();

export type MatchPolicy = {
  requireTxMatch?: boolean;
  requireHashMatch?: boolean;
  quorum?: number;
};

type ProviderOutcome = {
  provider: string;
  result: Awaited<ReturnType<Provider["resolve"]>>;
};

export type VerificationResult = {
  status: "verified" | "mismatch" | "not_found" | "error";
  providersQueried: number;
  verifiedMatches: number;
};

export class Verifier {
  constructor(private providers: Provider[], private policy: MatchPolicy) {}

  async verifyCertificate(cert: CertificateRow): Promise<VerificationResult> {
    const outcomes: ProviderOutcome[] = [];

    for (const provider of this.providers) {
      try {
        const res = await backoff(() => provider.resolve(cert), {
          tries: 3,
          baseMs: 250,
          factor: 2,
        });
        outcomes.push({ provider: provider.name(), result: res });

        if ((this.policy.quorum ?? 1) <= 1 && res.ok) {
          const verdict = this.compare(cert, res);
          await auditInsert(cert.id, verdict.status as any, provider.name(), {
            ...res,
            verdict,
          });
          if (verdict.status === "verified") {
            return {
              status: "verified",
              providersQueried: outcomes.length,
              verifiedMatches: 1,
            };
          }
        }
      } catch (err) {
        log.warn({ err, provider: provider.name(), certId: cert.id }, "provider_failure");
        const failure = { ok: false as const, reason: "error", raw: { error: String(err) } };
        outcomes.push({ provider: provider.name(), result: failure });
      }
    }

    const verified = outcomes.filter(
      (outcome) => outcome.result.ok && this.compare(cert, outcome.result).status === "verified"
    );
    const quorum = this.policy.quorum ?? 1;
    const status: VerificationResult["status"] =
      verified.length >= quorum
        ? "verified"
        : outcomes.some((o) => o.result.ok)
        ? "mismatch"
        : outcomes.length > 0
        ? "not_found"
        : "error";

    for (const outcome of outcomes) {
      const res = outcome.result;
      const verdict = res.ok ? this.compare(cert, res) : { status: "error", reason: res.reason ?? "error" };
      await auditInsert(cert.id, verdict.status as any, outcome.provider, {
        ...res,
        verdict,
      });
    }

    return {
      status,
      providersQueried: outcomes.length,
      verifiedMatches: verified.length,
    };
  }

  private compare(cert: CertificateRow, res: Awaited<ReturnType<Provider["resolve"]>>) {
    if (!res.ok) {
      return { status: "error" as const, reason: res.reason ?? "unresolved" };
    }

    if (res.inscriptionId && res.inscriptionId !== cert.expected_inscription_id) {
      return { status: "mismatch" as const, reason: "inscriptionId_diff" };
    }

    if (this.policy.requireTxMatch && cert.expected_txid && res.txid && res.txid !== cert.expected_txid) {
      return { status: "mismatch" as const, reason: "txid_diff" };
    }

    if (this.policy.requireHashMatch && cert.expected_content_hash && res.contentHash) {
      const expected = cert.expected_content_hash.toLowerCase();
      const actual = res.contentHash.toLowerCase();
      if (expected !== actual) {
        return { status: "mismatch" as const, reason: "content_hash_diff" };
      }
    }

    return { status: "verified" as const };
  }
}
