"""
RSS Feed Discovery and Ingestion

Auto-discovers and parses RSS feeds for grant opportunities.
Supports standard RSS 2.0 and Atom feeds.
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urlparse

import feedparser
import httpx
from bs4 import BeautifulSoup
from loguru import logger


class RSSDiscovery:
    """RSS feed discovery and parsing for grant opportunities"""
    
    def __init__(self, feeds: Optional[List[str]] = None):
        """
        Initialize RSS discovery
        
        Args:
            feeds: List of RSS feed URLs to monitor
        """
        self.feeds = feeds or []
        self.discovered_feeds: List[str] = []
        
    async def discover_feeds_from_url(self, url: str) -> List[str]:
        """
        Auto-discover RSS feeds from a webpage
        
        Args:
            url: Website URL to scan for RSS feeds
            
        Returns:
            List of discovered RSS feed URLs
        """
        discovered = []
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for RSS/Atom feed links in HTML head
                feed_links = soup.find_all('link', type=[
                    'application/rss+xml',
                    'application/atom+xml',
                    'application/rdf+xml'
                ])
                
                for link in feed_links:
                    feed_url = link.get('href')
                    if feed_url:
                        # Make absolute URL if relative
                        if not feed_url.startswith('http'):
                            parsed = urlparse(url)
                            base_url = f"{parsed.scheme}://{parsed.netloc}"
                            feed_url = base_url + feed_url
                        
                        discovered.append(feed_url)
                        logger.info(f"📡 Discovered RSS feed: {feed_url}")
                
                # Store discovered feeds
                self.discovered_feeds.extend(discovered)
                
        except Exception as e:
            logger.error(f"❌ Error discovering feeds from {url}: {e}")
            
        return discovered
    
    async def parse_feed(self, feed_url: str) -> List[Dict]:
        """
        Parse RSS feed and extract grant opportunities
        
        Args:
            feed_url: RSS feed URL
            
        Returns:
            List of grant opportunity dictionaries
        """
        grants = []
        
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(feed_url)
                response.raise_for_status()
                
                # Parse feed
                feed = feedparser.parse(response.content)
                
                if feed.bozo:
                    logger.warning(f"⚠️ Feed parsing issues for {feed_url}")
                
                # Extract entries
                for entry in feed.entries:
                    grant = {
                        'source': 'rss',
                        'feed_url': feed_url,
                        'title': entry.get('title', 'Untitled'),
                        'description': entry.get('summary', entry.get('description', '')),
                        'link': entry.get('link', ''),
                        'published': entry.get('published', entry.get('updated', '')),
                        'published_parsed': entry.get('published_parsed'),
                        'tags': [tag.term for tag in entry.get('tags', [])],
                        'author': entry.get('author', ''),
                        'discovered_at': datetime.utcnow().isoformat(),
                    }
                    
                    # Extract additional metadata
                    if hasattr(entry, 'content'):
                        grant['content'] = entry.content[0].value if entry.content else ''
                    
                    grants.append(grant)
                    
                logger.info(f"✅ Parsed {len(grants)} opportunities from {feed_url}")
                
        except Exception as e:
            logger.error(f"❌ Error parsing feed {feed_url}: {e}")
            
        return grants
    
    async def fetch_all_feeds(self) -> List[Dict]:
        """
        Fetch and parse all configured feeds
        
        Returns:
            List of all discovered grant opportunities
        """
        all_grants = []
        
        # Combine configured and discovered feeds
        all_feeds = list(set(self.feeds + self.discovered_feeds))
        
        if not all_feeds:
            logger.warning("⚠️ No RSS feeds configured")
            return all_grants
        
        # Parse all feeds concurrently
        tasks = [self.parse_feed(feed) for feed in all_feeds]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect results
        for result in results:
            if isinstance(result, list):
                all_grants.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"❌ Feed parsing failed: {result}")
        
        logger.info(f"🎯 Total grants discovered: {len(all_grants)}")
        return all_grants
    
    def add_feed(self, feed_url: str) -> None:
        """Add a new RSS feed to monitor"""
        if feed_url not in self.feeds:
            self.feeds.append(feed_url)
            logger.info(f"➕ Added RSS feed: {feed_url}")
    
    def remove_feed(self, feed_url: str) -> None:
        """Remove an RSS feed from monitoring"""
        if feed_url in self.feeds:
            self.feeds.remove(feed_url)
            logger.info(f"➖ Removed RSS feed: {feed_url}")
    
    def get_feeds(self) -> List[str]:
        """Get all configured feeds"""
        return self.feeds.copy()


# Example usage
async def main():
    """Example usage of RSSDiscovery"""
    discovery = RSSDiscovery([
        "https://example.com/grants.rss",
    ])
    
    # Auto-discover feeds
    await discovery.discover_feeds_from_url("https://www.grants.gov")
    
    # Fetch all grants
    grants = await discovery.fetch_all_feeds()
    
    print(f"Discovered {len(grants)} grant opportunities")
    for grant in grants[:5]:
        print(f"- {grant['title']}")


if __name__ == "__main__":
    asyncio.run(main())
