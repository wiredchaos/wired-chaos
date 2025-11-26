import { createHash } from "crypto";

export const sha256Hex = (input: Buffer | string) =>
  createHash("sha256").update(input).digest("hex");
