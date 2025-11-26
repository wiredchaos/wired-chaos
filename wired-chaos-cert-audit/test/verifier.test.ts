import { describe, expect, it, vi } from "vitest";
import { Verifier } from "../src/verifier.js";
import type { Provider } from "../src/providers/Provider.js";
import type { CertificateRow } from "../src/schema.js";

vi.mock("../src/projectSource/db.js", () => ({
  auditInsert: vi.fn().mockResolvedValue(undefined),
}));

const goodProvider: Provider = {
  name: () => "MockGood",
  resolve: async (cert: CertificateRow) => ({
    ok: true,
    inscriptionId: cert.expected_inscription_id,
    txid: cert.expected_txid,
    contentHash: cert.expected_content_hash,
    raw: { mock: true },
  }),
};

const mismatchProvider: Provider = {
  name: () => "MockBad",
  resolve: async () => ({
    ok: true,
    inscriptionId: "different",
    raw: { mock: true },
  }),
};

describe("Verifier", () => {
  it("verifies with quorum=1", async () => {
    const verifier = new Verifier([goodProvider], {
      quorum: 1,
      requireHashMatch: true,
      requireTxMatch: true,
    });

    const cert: CertificateRow = {
      id: "CERT-1",
      expected_inscription_id: "inscription:abc",
      expected_content_hash: "deadbeef",
      expected_txid: "tx123",
    };

    const result = await verifier.verifyCertificate(cert);
    expect(result.status).toBe("verified");
    expect(result.verifiedMatches).toBe(1);
  });

  it("reports mismatch when quorum unmet", async () => {
    const verifier = new Verifier([goodProvider, mismatchProvider], {
      quorum: 2,
      requireHashMatch: false,
      requireTxMatch: false,
    });

    const cert: CertificateRow = {
      id: "CERT-2",
      expected_inscription_id: "inscription:abc",
      expected_content_hash: undefined,
      expected_txid: undefined,
    };

    const result = await verifier.verifyCertificate(cert);
    expect(result.status).toBe("mismatch");
    expect(result.verifiedMatches).toBe(1);
  });
});
