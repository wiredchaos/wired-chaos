import { Router } from "express";
import { verifyDocuSignWebhook } from "../services/signature";
import { q } from "../db";

export const esign = Router();

esign.post("/v1/esign/webhook", async (req, res) => {
  const sig = (req.headers["x-docusign-signature-1"] as string) || "";
  const raw = (req as any).rawBody ?? JSON.stringify(req.body);
  const ok = verifyDocuSignWebhook(raw, sig, process.env.DOCUSIGN_SECRET!);
  if (!ok) return res.status(401).json({ error: "bad signature" });

  const { submissionId, signed8879Url } = req.body;
  if (!submissionId || !signed8879Url) return res.status(400).json({ error: "missing fields" });

  await q("UPDATE submissions SET updatedAt=NOW(), ackMessage=$2 WHERE id=$1",
    [submissionId, `8879 signed: ${signed8879Url}`]);

  res.json({ ok: true });
});
