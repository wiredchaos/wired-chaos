import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";

type StreamLike = Readable | ReadableStream<Uint8Array>;

export async function readableStreamToString(stream: StreamLike) {
  if (stream instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk as Buffer);
    }
    return Buffer.concat(chunks).toString("utf8");
  }

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = new Uint8Array(chunks.reduce((a, b) => a + b.length, 0));
  let offset = 0;
  for (const c of chunks) {
    total.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(total);
}
