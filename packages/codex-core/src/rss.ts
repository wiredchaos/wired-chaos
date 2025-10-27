import Parser from 'rss-parser';
import fetch from 'node-fetch';

export type FeedItem = {
  title: string;
  link: string;
  isoDate?: string;
  contentSnippet?: string;
  author?: string;
  categories?: string[];
};

export type Drill = {
  hook: string;          // short teaser
  gist: string;          // 1–2 sentence summary
  prompts: string[];     // WIRED CHAOS prompt-drills
  source: { title: string; link: string; isoDate?: string };
};

/**
 * Fetch from a FreshRSS "Google Reader compatible" endpoint.
 * Requires env: FRESHRSS_URL, FRESHRSS_TOKEN
 */
export async function fetchFreshRSS(limit = envLimit()): Promise<FeedItem[]> {
  const url = process.env.FRESHRSS_URL;
  const token = process.env.FRESHRSS_TOKEN;
  if (!url || !token) return [];
  const u = new URL(url);
  u.searchParams.set('n', String(limit));
  const res = await fetch(u.toString(), {
    headers: { Authorization: `GoogleLogin auth=${token}` }
  });
  if (!res.ok) return [];
  const json: any = await res.json();
  // Adapt Google Reader JSON → items
  const items: FeedItem[] = (json.items || []).map((it: any) => ({
    title: it.title,
    link: it.alternate?.[0]?.href ?? it.originId ?? '',
    isoDate: it.published ? new Date(it.published).toISOString() : undefined,
    contentSnippet: it.summary ?? it.content ?? '',
    author: it.author,
    categories: it.categories
  }));
  return items;
}

/**
 * Parse any public RSS/Atom feed (fallback).
 */
export async function parseRss(url: string, limit = 20): Promise<FeedItem[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(url);
  return (feed.items || []).slice(0, limit).map(i => ({
    title: i.title ?? '',
    link: i.link ?? '',
    isoDate: i.isoDate,
    contentSnippet: i.contentSnippet ?? '',
    author: (i as any).author ?? '',
    categories: (i.categories as string[]) ?? []
  }));
}

/**
 * Convert feed items → WIRED CHAOS prompt drills.
 * Tuned for short, punchy, neon-cyan style hooks.
 */
export function toPromptDrills(items: FeedItem[]): Drill[] {
  return items.map((it) => {
    const hook = neuroHook(it);
    const gist = conciseGist(it);
    const prompts = [
      `Write a 90s CRT-style GM tease in WIRED CHAOS voice about: "${it.title}". Include 1 line hook, 3 rhythm beats, CTA.`,
      `Create an AI Prompt Drill: beginner → intermediate → expert tasks based on "${it.title}".`,
      `Extract 5 viral thread starters (no punctuation, emojis allowed) referencing "${it.title}".`,
      `Draft an X Space 15-min segment outline using this article as the seed.`
    ];
    return { hook, gist, prompts, source: { title: it.title, link: it.link, isoDate: it.isoDate } };
  });
}

export function summarize(item: FeedItem) {
  return `【CODΞX】 ${item.title} → ${item.link}`;
}

function neuroHook(it: FeedItem): string {
  const base = it.title?.slice(0, 72) ?? 'fresh signal';
  return `signal spike ${base} ▷ tap in`;
}

function conciseGist(it: FeedItem): string {
  const s = it.contentSnippet?.replace(/\s+/g, ' ').trim() ?? '';
  return s.length > 160 ? s.slice(0, 157) + '...' : s;
}

function envLimit(): number {
  const n = Number(process.env.FRESHRSS_LIMIT || 25);
  return Number.isFinite(n) && n > 0 ? n : 25;
}
