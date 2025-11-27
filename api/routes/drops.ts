import { Router } from "express";
import { z } from "zod";
import Drop from "../models/Drop";
import { wcV1Encrypt, wcV1Decrypt } from "../core/cipherCore";
const r = Router();

r.post("/", async (req, res) => {
  const body = z
    .object({
      fragmentSlug: z.string(),
      note: z.string(),
      ttlMinutes: z.number().min(5).max(7 * 24 * 60).default(1440)
    })
    .parse(req.body || {});
  const { cipher, mac } = wcV1Encrypt(body.note, process.env.WC_API_SECRET!);
  const expiresAt = new Date(Date.now() + body.ttlMinutes * 60 * 1000);
  const doc = await Drop.create({ fragmentSlug: body.fragmentSlug, noteCipher: cipher, mac, expiresAt, scheme: "wc-v1" });
  res.json({ ok: true, id: doc._id });
});

r.post("/:id/claim", async (req, res) => {
  const body = z.object({ as: z.string().default("anon") }).parse(req.body || {});
  const doc = await Drop.findById(req.params.id);
  if (!doc) return res.status(404).json({ ok: false });
  if (doc.expiresAt < new Date()) return res.status(410).json({ ok: false, reason: "expired" });
  const note = wcV1Decrypt(doc.noteCipher, doc.mac!, process.env.WC_API_SECRET!);
  doc.claimedBy = body.as;
  await doc.save();
  res.json({ ok: true, note });
});

export default r;
