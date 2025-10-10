export function normalizeWix(input: any) {
  const data = input?.data ?? input;
  const title = data?.formName ?? "Wix Submission";
  const url = data?.pageUrl ?? null;
  const summary = Object.entries(data?.fields ?? {})
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join(" | ");

  return {
    source: "wix",
    timestamp: new Date().toISOString(),
    tags: ["wix", "lead", "wired-chaos"],
    title,
    summary,
    url,
    author: data?.contact?.email ?? null,
    raw: input
  };
}
