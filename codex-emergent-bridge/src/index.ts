import express, { Request, Response } from "express";
import helmet from "helmet";
import bodyParser from "body-parser";
import { CONFIG } from "./config";
import { httpLogger } from "./services/logger";
import { errorHandler } from "./services/errorHandler";

import healthRoute from "./routes/health";
import caffeineWebhookRoute from "./routes/caffeineWebhook";
import codexApiRoute from "./routes/codexApi";

const app = express();

app.use(
  bodyParser.json({
    verify: (req: Request & { rawBody?: string }, _res: Response, buf) => {
      req.rawBody = buf.toString("utf8");
    }
  })
);

app.use(helmet());
app.use(httpLogger);

app.use(healthRoute);
app.use(caffeineWebhookRoute);
app.use(codexApiRoute);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "NOT_FOUND" });
});

app.use(errorHandler);

app.listen(CONFIG.port, () => {
  console.log(
    `Codex Emergent Bridge listening on port ${CONFIG.port}, WIRED_CHAOS_ENABLED=${CONFIG.wiredChaosEnabled}`
  );
});
