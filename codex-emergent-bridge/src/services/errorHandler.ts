import { Request, Response, NextFunction } from "express";
import { log } from "./logger";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  log.error("Unhandled error:", err);
  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR"
  });
}
