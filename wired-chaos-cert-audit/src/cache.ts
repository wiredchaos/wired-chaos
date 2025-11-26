import { promises as fs } from "fs";
import path from "path";
import { LRUCache } from "lru-cache";
import { createLogger } from "./logger.js";

const log = createLogger();

export type CacheOptions = {
  directory: string;
  max: number;
  ttlMs: number;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class DiskBackedCache<T> {
  private lru: LRUCache<string, CacheEntry<T>>;
  private ready: Promise<void>;

  constructor(private options: CacheOptions) {
    this.lru = new LRUCache({ max: options.max, ttl: options.ttlMs });
    this.ready = fs.mkdir(options.directory, { recursive: true }).then(() => undefined);
  }

  private fileFor(key: string) {
    return path.join(this.options.directory, `${encodeURIComponent(key)}.json`);
  }

  async get(key: string): Promise<T | undefined> {
    await this.ready;
    const inMemory = this.lru.get(key);
    if (inMemory && inMemory.expiresAt > Date.now()) {
      return inMemory.value;
    }

    try {
      const file = this.fileFor(key);
      const raw = await fs.readFile(file, "utf-8");
      const parsed = JSON.parse(raw) as CacheEntry<T>;
      if (parsed.expiresAt > Date.now()) {
        this.lru.set(key, parsed);
        return parsed.value;
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        log.warn({ err }, "cache_read_failed");
      }
    }
    return undefined;
  }

  async set(key: string, value: T) {
    await this.ready;
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + this.options.ttlMs,
    };
    this.lru.set(key, entry);
    const file = this.fileFor(key);
    await fs.writeFile(file, JSON.stringify(entry), "utf-8");
  }
}
