import { Router } from "express";
import { z } from "zod";
import LoreFragment from "../models/LoreFragment";
import { sha256Hex, wcV1Encrypt } from "../core/cipherCore";

const r = Router();

r.post("/", async (req, res) => {
  const body = z
    .object({
      title: z.string(),
      slug: z.string(),
      module: z.string(),
      rarity: z.string(),
      plainGlyph: z.string(),
      media: z.object({ shot: z.string(), path: z.string(), metadataPath: z.string() }),
      timeline: z.object({ arc: z.string(), index: z.number() }).optional(),
      traits: z.record(z.any()).optional()
    })
    .parse(req.body || {});

  const { cipher, mac } = wcV1Encrypt(body.plainGlyph, process.env.WC_API_SECRET!);
  const checksum = sha256Hex(JSON.stringify({ slug: body.slug, cipher }));
  const doc = await LoreFragment.create({
    ...body,
    glyph: cipher,
    scheme: "wc-v1",
    proof: mac,
    checksum
  });
  res.json({ ok: true, slug: doc.slug, checksum });
});

r.get("/:slug", async (req, res) => {
  const doc = await LoreFragment.findOne({ slug: req.params.slug });
  res.json({ ok: !!doc, fragment: doc });
});

export default r;
