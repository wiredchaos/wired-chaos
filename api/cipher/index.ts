import express from "express";
import crypto from "crypto";

const router = express.Router();

router.post("/decode", express.json(), (req, res) => {
  const { payload, scheme = "wc-v1" } = req.body || {};
  // stub: swap with real decoder in Phase B
  const hash = crypto.createHash("sha256").update(`${scheme}:${payload || ""}`).digest("hex");
  return res.json({ scheme, preview: hash.slice(0, 16), status: "stub_ok" });
});

router.post("/encode", express.json(), (req, res) => {
  const { message, scheme = "wc-v1" } = req.body || {};
  const cipher = Buffer.from(`${scheme}:${message || ""}`).toString("base64url");
  return res.json({ scheme, cipher, status: "stub_ok" });
});

export default router;
