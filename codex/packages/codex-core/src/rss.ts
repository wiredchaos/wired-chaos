export type FeedItem = {
  title: string;
  link: string;
  isoDate?: string;
};

export function summarize(item: FeedItem) {
  return `【CODΞX】 ${item.title} → ${item.link}`;
}
