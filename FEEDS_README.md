# RSS Feeds Configuration

## Overview

The SWARM Orchestrator uses OPML files to manage RSS feed sources. The default `feeds.opml` file contains placeholder feeds that allow the pipeline to run without external network dependencies.

## Files

- **feeds.opml** - Default configuration with placeholder feeds (no network required)
- **feeds.opml.example** - Template with example feed structure for production use

## Usage

### For Local Testing (No External Dependencies)

The default `feeds.opml` uses placeholder URLs that won't require external network access:

```bash
python src/orchestrator.py --skip-twitter
```

The pipeline will attempt to fetch these feeds but will gracefully handle failures, allowing you to test the entire pipeline offline.

### For Production with Real RSS Feeds

1. **Create your custom feed configuration:**
   ```bash
   cp feeds.opml.example my-feeds.opml
   ```

2. **Edit the file to add your RSS feed URLs:**
   ```xml
   <outline type="rss" 
            text="Your Feed Name" 
            xmlUrl="https://yoursite.com/feed.xml" 
            htmlUrl="https://yoursite.com/"/>
   ```

3. **Run the orchestrator with your custom file:**
   ```bash
   python src/orchestrator.py --opml-file my-feeds.opml
   ```

## OPML Format

The OPML format allows you to organize feeds into categories:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>My RSS Feeds</title>
    <dateCreated>2024-01-01T00:00:00Z</dateCreated>
  </head>
  <body>
    <outline text="Category Name" title="Category Name">
      <outline type="rss" 
               text="Feed Name" 
               xmlUrl="https://example.com/feed.xml" 
               htmlUrl="https://example.com/"/>
      <outline type="rss" 
               text="Another Feed" 
               xmlUrl="https://example.org/rss" 
               htmlUrl="https://example.org/"/>
    </outline>
  </body>
</opml>
```

## Common RSS Feed Sources

You can add RSS feeds from:
- Tech blogs and news sites
- Industry publications
- Company blogs
- Podcast feeds
- YouTube channels (via RSS)
- Reddit subreddits (via RSS)

## Firewall and Network Restrictions

**Important:** Some RSS feed URLs may be blocked by firewalls or restricted in certain environments (e.g., CI/CD systems, corporate networks).

The SWARM Orchestrator handles this gracefully:
- Failed feeds are skipped with a warning message
- The pipeline continues processing other components
- No errors are thrown for inaccessible feeds

If you're working in a restricted environment:
1. Use the default `feeds.opml` with placeholder URLs
2. Or configure only feeds that are accessible in your environment
3. The pipeline will work even with 0 successful feed fetches

## Testing

Test your OPML configuration:

```bash
# Dry run to see which feeds are accessible
python src/orchestrator.py --opml-file my-feeds.opml --skip-project --skip-twitter
```

Check the output for any feed errors and adjust your configuration accordingly.
