import { Router } from "express";
import { q } from "../db";
import { enqueueTransmit } from "../services/queue";

export const efile = Router();

efile.post("/v1/transmit", async (req, res) => {
  const { submissionId, clientId, taxYear } = req.body;
  if (!submissionId || !clientId || !taxYear) return res.status(400).json({ error: "missing fields" });
  await q(
    `INSERT INTO submissions(id, clientId, taxYear, status, createdAt, updatedAt)
     VALUES ($1,$2,$3,'QUEUED',NOW(),NOW())
     ON CONFLICT (id) DO NOTHING`,
    [submissionId, clientId, taxYear]
  );
  await enqueueTransmit(submissionId);
  res.status(202).json({ ok: true, submissionId });
});

efile.get("/v1/status/:id", async (req, res) => {
  const { rows } = await q("SELECT * FROM submissions WHERE id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});
