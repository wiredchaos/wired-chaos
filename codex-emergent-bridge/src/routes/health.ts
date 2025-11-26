import { Router, Request, Response } from "express";
import { CONFIG } from "../config";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    wiredChaosEnabled: CONFIG.wiredChaosEnabled,
    env: CONFIG.nodeEnv
  });
});

export default router;
