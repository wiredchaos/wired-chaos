import { Router } from "express";
import { z } from "zod";

const GLYPH_MAP: Record<string, string> = {
  "◼︎△◻︎": "33.3",
  "◻︎◻︎◇": "589",
  "◎◆◎": "XRPL",
  "╳╳◇": "RED-FANG",
  "||•||": "AKIRA"
};

const r = Router();
r.post("/parse", (req, res) => {
  const { wall } = z.object({ wall: z.string() }).parse(req.body || {});
  const tokens = wall.match(/([◼︎△◻︎◎◆◇╳|•]+)/g) || [];
  const decoded = tokens.map((t) => ({ glyph: t, value: GLYPH_MAP[t] || null }));
  res.json({ ok: true, decoded, found: decoded.filter((d) => d.value) });
});
export default r;
