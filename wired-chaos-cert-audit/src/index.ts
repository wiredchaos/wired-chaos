#!/usr/bin/env node
import "dotenv/config";
import { getCertificates } from "./projectSource/db.js";
import { Verifier } from "./verifier.js";
import { DogeIndexerProvider } from "./providers/DogeIndexerProvider.js";
import { ExplorerProvider } from "./providers/ExplorerProvider.js";
import { MarketplaceProvider } from "./providers/MarketplaceProvider.js";
import { RpcRelayProvider } from "./providers/RpcRelayProvider.js";
import { createLogger } from "./logger.js";

const log = createLogger();

function buildProviders() {
  const providers = [];
  if (process.env.DOGE_INDEXER_BASE) {
    providers.push(new DogeIndexerProvider(process.env.DOGE_INDEXER_BASE, process.env.DOGE_INDEXER_KEY));
  }
  if (process.env.EXPLORER_BASE) {
    providers.push(new ExplorerProvider(process.env.EXPLORER_BASE, process.env.EXPLORER_KEY));
  }
  if (process.env.MARKET_BASE) {
    providers.push(new MarketplaceProvider(process.env.MARKET_BASE, process.env.MARKET_KEY));
  }
  if (process.env.DOGE_RPC_BASE) {
    providers.push(new RpcRelayProvider(process.env.DOGE_RPC_BASE, process.env.DOGE_RPC_KEY));
  }
  return providers;
}

async function main() {
  const providers = buildProviders();
  if (providers.length === 0) {
    throw new Error("No providers configured. Set DOGE_INDEXER_BASE or other provider env vars.");
  }

  const policy = {
    requireTxMatch: true,
    requireHashMatch: true,
    quorum: Number(process.env.VERIFIER_QUORUM ?? "1"),
  };

  const verifier = new Verifier(providers, policy);
  const limit = Number(process.env.VERIFIER_LIMIT ?? "5000");
  const certificates = await getCertificates(limit);

  let ok = 0;
  let bad = 0;
  for (const cert of certificates) {
    const verdict = await verifier.verifyCertificate(cert);
    if (verdict.status === "verified") {
      ok += 1;
    } else {
      bad += 1;
    }
    log.info({ id: cert.id, verdict: verdict.status }, "audit_result");
  }

  if (bad > 0) {
    log.error({ ok, bad }, "Some certificates failed verification");
    process.exit(2);
  }

  log.info({ ok, bad }, "All certificates verified on DOGE as inscriptions");
}

main().catch((err) => {
  log.error({ err }, "fatal_error");
  process.exit(1);
});
