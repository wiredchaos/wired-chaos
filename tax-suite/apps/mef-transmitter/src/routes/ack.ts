import { Router } from "express";
import { pollPending } from "../services/ackPoller";

export const ack = Router();

ack.post("/v1/ack/poll", async (_req, res) => {
  await pollPending();
  res.json({ ok: true });
});
