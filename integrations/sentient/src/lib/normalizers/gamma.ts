export function normalizeGamma(input: any) {
  const meta = input?.meta ?? {};
  const blocks = input?.blocks ?? [];
  const title = meta?.deckTitle ?? "Gamma Deck Submission";
  const url = meta?.deckUrl ?? null;

  const summary = blocks
    .map((b: any) => (b?.text?.slice?.(0, 160) ?? JSON.stringify(b).slice(0, 160)))
    .join(" • ");

  return {
    source: "gamma",
    timestamp: new Date().toISOString(),
    tags: ["gamma", "deck", "wired-chaos"],
    title,
    summary,
    url,
    author: meta?.author ?? null,
    raw: input
  };
}
