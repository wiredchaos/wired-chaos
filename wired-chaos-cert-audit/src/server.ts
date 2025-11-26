import "dotenv/config";
import express from "express";
import { Verifier } from "./verifier.js";
import { DogeIndexerProvider } from "./providers/DogeIndexerProvider.js";
import { ExplorerProvider } from "./providers/ExplorerProvider.js";
import { MarketplaceProvider } from "./providers/MarketplaceProvider.js";
import { RpcRelayProvider } from "./providers/RpcRelayProvider.js";
import type { CertificateRow } from "./schema.js";
import { createLogger } from "./logger.js";

const app = express();
app.use(express.json());
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
  if (providers.length === 0) {
    throw new Error("No providers configured. Configure DOGE_INDEXER_BASE or other provider env vars.");
  }
  return providers;
}

const verifier = new Verifier(buildProviders(), {
  requireTxMatch: true,
  requireHashMatch: true,
  quorum: Number(process.env.VERIFIER_QUORUM ?? "1"),
});

app.post("/verify", async (req, res) => {
  const cert = req.body as CertificateRow;
  try {
    const verdict = await verifier.verifyCertificate(cert);
    res.json({ id: cert.id, verdict });
  } catch (err) {
    log.error({ err, id: cert?.id }, "verification_failure");
    res.status(500).json({ error: "verification_failed" });
  }
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  log.info(`Verifier API listening on :${port}`);
});
