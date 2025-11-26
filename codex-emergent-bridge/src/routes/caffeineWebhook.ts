import { Router, Request, Response } from "express";
import { verifyCaffeineSignature } from "../services/caffeineVerifier";
import { CaffeineEvent } from "../types/caffeine";
import { TaskEnvelope } from "../types/common";
import { routeToSwarm } from "../services/swarmRouter";
import { log } from "../services/logger";

const router = Router();

router.post("/caffeine/webhook", async (req: Request, res: Response) => {
  const rawBody = (req as Request & { rawBody?: string }).rawBody || "";
  const signature = req.header("x-caffeine-signature") || "";

  if (!verifyCaffeineSignature(rawBody, signature)) {
    log.warn("Invalid Caffeine signature");
    return res.status(401).json({ error: "INVALID_SIGNATURE" });
  }

  const event = req.body as CaffeineEvent;

  log.info("Received Caffeine event:", event.type, event.id);

  const intent = deriveIntentFromCaffeineEvent(event);
  const namespace = deriveNamespaceFromEvent(event);

  const task: TaskEnvelope = {
    id: event.id,
    source: "caffeine",
    userId: event.userId,
    sessionId: event.sessionId,
    channel: "story",
    namespace,
    intent,
    payload: event,
    metadata: event.data?.metadata || {},
    createdAt: event.timestamp
  };

  const response = await routeToSwarm(task);

  return res.status(200).json(response);
});

function deriveIntentFromCaffeineEvent(event: CaffeineEvent): string {
  if (event.type === "message.created") {
    return "USER_MESSAGE";
  }
  if (event.type === "session.started") {
    return "SESSION_START";
  }
  if (event.type === "session.ended") {
    return "SESSION_END";
  }
  return "UNKNOWN_EVENT";
}

function deriveNamespaceFromEvent(event: CaffeineEvent): "BUSINESS" | "EDUCATION" | "ARG" {
  const ns = event.data?.metadata?.namespace;
  if (ns === "BUSINESS" || ns === "EDUCATION" || ns === "ARG") {
    return ns;
  }
  return "ARG";
}

export default router;
