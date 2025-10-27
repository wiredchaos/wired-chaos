import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.SQS_URL;
if (!QUEUE_URL) {
  throw new Error("SQS_URL not configured");
}

export const enqueueTransmit = async (submissionId: string) => {
  await sqs.send(new SendMessageCommand({ QueueUrl: QUEUE_URL, MessageBody: JSON.stringify({ submissionId }) }));
};

export const drain = async (handler: (m: any) => Promise<void>) => {
  const resp = await sqs.send(new ReceiveMessageCommand({ QueueUrl: QUEUE_URL, MaxNumberOfMessages: 5, WaitTimeSeconds: 10 }));
  for (const msg of resp.Messages ?? []) {
    try {
      await handler(JSON.parse(msg.Body!));
      await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: msg.ReceiptHandle! }));
    } catch (e) {
      /* log and continue */
    }
  }
};
