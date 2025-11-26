import { Router, Request, Response } from "express";
import { TaskEnvelope } from "../types/common";
import { routeToSwarm } from "../services/swarmRouter";
import { log } from "../services/logger";

const router = Router();

router.post("/codex/ask", async (req: Request, res: Response) => {
  const {
    userId,
    sessionId,
    namespace = "ARG",
    channel = "story",
    intent = "CODEX_QUERY",
    payload
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "MISSING_USER_ID" });
  }

  const task: TaskEnvelope = {
    id: `codex-${Date.now()}`,
    source: "caffeine",
    userId,
    sessionId,
    channel,
    namespace,
    intent,
    payload,
    metadata: {},
    createdAt: new Date().toISOString()
  };

  log.info("Direct Codex ask received", task.id, "intent", intent);

  const response = await routeToSwarm(task);
  return res.status(200).json(response);
});

export default router;
