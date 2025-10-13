export function normalizeFreshRSS(input: any) {
  // Accept common FreshRSS push payloads; adjust to your actual structure if needed.
  const entry = input?.entry ?? input?.item ?? input;
  const title = entry?.title ?? "Untitled";
  const url = entry?.link ?? entry?.url ?? null;
  const summary = entry?.summary ?? entry?.content ?? "";
  const author = entry?.author ?? entry?.authors?.[0] ?? null;
  const tags = Array.from(new Set(["rss", "ai", "wired-chaos", ...(entry?.tags ?? [])]));

  return {
    source: "freshrss",
    timestamp: new Date().toISOString(),
    tags,
    title,
    summary,
    url,
    author,
    raw: input
  };
}
