import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.S3_BUCKET;
if (!BUCKET) {
  throw new Error("S3_BUCKET not configured");
}

export async function storeAck(submissionId: string, payload: string) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `ack/${submissionId}.json`,
    ContentType: "application/json",
    Body: payload,
  }));
}
