import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import type { LoadedFile } from './types.js';

const MIME_MAP: Record<string, string> = {
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function detectMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

async function loadRemoteFile(urlString: string): Promise<LoadedFile> {
  const url = new URL(urlString);
  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(url, (res) => {
      if (!res.statusCode || res.statusCode >= 400) {
        reject(new Error(`Failed to fetch ${urlString} – status ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] ?? 'application/octet-stream';
        resolve({ buffer, sizeBytes: buffer.length, mimeType: contentType });
      });
    });
    req.on('error', reject);
  });
}

async function loadLocalFile(filePath: string): Promise<LoadedFile> {
  const buffer = await fs.readFile(filePath);
  return {
    buffer,
    sizeBytes: buffer.length,
    mimeType: detectMimeType(filePath),
  };
}

export async function loadFile(filePathOrUrl: string): Promise<LoadedFile> {
  if (/^https?:\/\//i.test(filePathOrUrl)) {
    return loadRemoteFile(filePathOrUrl);
  }
  const resolvedPath = path.resolve(filePathOrUrl);
  return loadLocalFile(resolvedPath);
}

export function streamFile(filePathOrUrl: string) {
  if (/^https?:\/\//i.test(filePathOrUrl)) {
    throw new Error('Streaming remote files is not supported in this context.');
  }
  const resolvedPath = path.resolve(filePathOrUrl);
  return createReadStream(resolvedPath);
}
