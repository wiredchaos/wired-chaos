import express from "express";
import bodyParser from "body-parser";
import { efile } from "./routes/efile";
import { ack } from "./routes/ack";
import { esign } from "./routes/esign";
import { drain } from "./services/queue";
import { q } from "./db";
import { transmit } from "./services/irsClient";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { readableStreamToString } from "./util";

const app = express();
app.use(bodyParser.json({
  limit: "5mb",
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf.toString("utf8");
  },
}));
const authToken = process.env.AUTH_TOKEN;
const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env.S3_BUCKET;

app.use((req, res, next) => {
  if (!authToken) {
    return res.status(500).json({ error: "AUTH_TOKEN not configured" });
  }
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ") || header.slice(7) !== authToken) {
    return res.status(401).json({ error: "unauthorized" });
  }
  return next();
});

app.use(efile);
app.use(ack);
app.use(esign);

// worker loop (SQS messages) — simple in-proc for Fargate task
async function loop() {
  try {
    await drain(async ({ submissionId }) => {
      // load XML from S3 (written by CI/gateway upload)
      if (!bucket) {
        throw new Error("S3_BUCKET not configured");
      }
      const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: `xml/${submissionId}.xml` }));
      const xml = await readableStreamToString(obj.Body as any);

      await q("UPDATE submissions SET status='SENT', updatedAt=NOW() WHERE id=$1", [submissionId]);
      const { status, data } = await transmit(xml);
      if (status >= 400) {
        await q("UPDATE submissions SET status='ERROR', ackMessage=$2, updatedAt=NOW() WHERE id=$1",
          [submissionId, `HTTP ${status}`]);
      } else {
        // IRS returns preliminary token/receipt id optionally
        await q("UPDATE submissions SET ackCode=$2, ackMessage=$3, updatedAt=NOW() WHERE id=$1",
          [submissionId, data?.receipt ?? null, "Submitted"]);
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("queue drain error", err);
  }
  setTimeout(loop, 2000);
}
void loop();

app.listen(process.env.PORT || 8080, async () => {
  await q(`CREATE TABLE IF NOT EXISTS submissions (
    id text primary key,
    clientId text not null,
    taxYear text not null,
    status text not null,
    ackCode text,
    ackMessage text,
    createdAt timestamptz not null,
    updatedAt timestamptz not null
  )`);
  // eslint-disable-next-line no-console
  console.log("mef-transmitter up");
});
