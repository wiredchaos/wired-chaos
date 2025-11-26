import morgan from "morgan";
import { RequestHandler } from "express";
import { CONFIG } from "../config";

export const httpLogger: RequestHandler = morgan(
  CONFIG.nodeEnv === "production" ? "combined" : "dev"
);

export const log = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  debug: (...args: unknown[]) => {
    if (CONFIG.nodeEnv !== "production") {
      console.debug("[DEBUG]", ...args);
    }
  }
};
