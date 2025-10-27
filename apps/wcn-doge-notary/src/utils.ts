import { promises as fs } from 'fs';

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export function logStructured(message: string, payload?: unknown): void {
  const entry = {
    message,
    ts: new Date().toISOString(),
    payload,
  };
  console.error(JSON.stringify(entry));
}

export function watermarkMetadataBlock(title: string, artist = '@neurometax'): string {
  return `WIRED CHAOS • ${title} • Artist ${artist} • Palette #000000 #00FFFF #FF3131 #39FF14 #FF00FF`;
}
