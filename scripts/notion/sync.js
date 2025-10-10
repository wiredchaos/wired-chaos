#!/usr/bin/env node
// scripts/notion/sync.js
// Automated Notion → WIX content sync for WIRED CHAOS

const { Client } = require("@notionhq/client");
const fetch = require("node-fetch");
const fs = require("fs");

const notionToken = process.env.NOTION_API_TOKEN;
const notionDbId = process.env.NOTION_DATABASE_ID;
const wixSyncEndpoint = process.env.WIX_SYNC_ENDPOINT;

if (!notionToken || !notionDbId || !wixSyncEndpoint) {
  console.error(
    "Missing required environment variables: NOTION_API_TOKEN, NOTION_DATABASE_ID, WIX_SYNC_ENDPOINT"
  );
  process.exit(1);
}

const notion = new Client({ auth: notionToken });

async function fetchNotionContent() {
  const pages = await notion.databases.query({ database_id: notionDbId });
  return pages.results.map((page) => ({
    id: page.id,
    title: page.properties.Name?.title?.[0]?.plain_text || "Untitled",
    content: page.properties.Content?.rich_text?.[0]?.plain_text || "",
    updated: page.last_edited_time,
  }));
}

async function syncToWix(content) {
  const res = await fetch(wixSyncEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: content }),
  });
  if (!res.ok) {
    console.error("WIX sync failed:", await res.text());
    process.exit(1);
  }
  console.log("WIX sync successful:", await res.json());
}

(async () => {
  try {
    const content = await fetchNotionContent();
    fs.writeFileSync("artifacts/notion-content.json", JSON.stringify(content, null, 2));
    await syncToWix(content);
    console.log("Notion → WIX sync complete.");
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
})();
