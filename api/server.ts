import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";
import mongoose from "mongoose";

import cipher from "./routes/cipher";
import fragments from "./routes/fragments";
import drops from "./routes/drops";
import decoder from "./routes/decoder";

const log = pino({ transport: { target: "pino-pretty" } });
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "rld", ts: Date.now() }));
app.use("/cipher", cipher);
app.use("/fragments", fragments);
app.use("/drops", drops);
app.use("/decoder", decoder);

const port = process.env.PORT || 8787;
(async () => {
  await mongoose.connect(process.env.MONGO_URL!);
  app.listen(port, () => log.info(`[RLD] listening :${port}`));
})();
