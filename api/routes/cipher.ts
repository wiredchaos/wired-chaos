import { Router } from "express";
import { z } from "zod";
import { wcV1Encrypt, wcV1Decrypt, wcV2Encrypt, wcV2Decrypt, initKeys } from "../core/cipherCore";

const r = Router();

r.post("/encode", async (req, res) => {
  const body = z
    .object({
      message: z.string(),
      scheme: z.enum(["wc-v1", "wc-v2"]).default("wc-v1"),
      recipientPubHex: z.string().optional()
    })
    .parse(req.body || {});

  if (body.scheme === "wc-v1") {
    const { cipher, mac } = wcV1Encrypt(body.message, process.env.WC_API_SECRET!);
    return res.json({ scheme: "wc-v1", cipher, mac });
  } else {
    const kp = await initKeys(process.env.WC_SODIUM_SEED!);
    const cipher = await wcV2Encrypt(body.message, kp.pub);
    return res.json({ scheme: "wc-v2", cipher, pubKeyHex: Buffer.from(kp.pub).toString("hex") });
  }
});

r.post("/decode", async (req, res) => {
  const body = z
    .object({
      scheme: z.enum(["wc-v1", "wc-v2"]).default("wc-v1"),
      cipher: z.string(),
      mac: z.string().optional()
    })
    .parse(req.body || {});

  if (body.scheme === "wc-v1") {
    const msg = wcV1Decrypt(body.cipher, body.mac!, process.env.WC_API_SECRET!);
    return res.json({ ok: true, message: msg });
  } else {
    const kp = await initKeys(process.env.WC_SODIUM_SEED!);
    const msg = await wcV2Decrypt(body.cipher, kp.pub, kp.priv);
    return res.json({ ok: true, message: msg });
  }
});

export default r;
