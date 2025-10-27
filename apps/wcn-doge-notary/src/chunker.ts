import type { ChunkInfo } from './types.js';
import { sha256 } from './crypto.js';

export function splitBuffer(buffer: Buffer, sizeKb: number): ChunkInfo[] {
  const chunkSize = sizeKb * 1024;
  if (chunkSize <= 0) {
    throw new Error('Chunk size must be greater than zero.');
  }
  const chunks: ChunkInfo[] = [];
  let offset = 0;
  let index = 0;
  while (offset < buffer.length) {
    const end = Math.min(offset + chunkSize, buffer.length);
    const slice = buffer.subarray(offset, end);
    chunks.push({
      index,
      buffer: slice,
      hash: sha256(slice),
    });
    offset = end;
    index += 1;
  }
  return chunks;
}
