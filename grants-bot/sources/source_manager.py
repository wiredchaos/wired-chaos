"""
Source Manager - Unified Grant Source Discovery

Manages all grant sources (RSS, APIs, SWARM feed) and provides
unified interface for grant discovery with per-tenant configuration.
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional

from loguru import logger

from .rss_discovery import RSSDiscovery
from .api_integrations import APIIntegrations
from .swarm_feed import SwarmFeed


class SourceManager:
    """Unified manager for all grant sources"""
    
    def __init__(
        self,
        rss_feeds: Optional[List[str]] = None,
        api_keys: Optional[Dict[str, str]] = None,
        swarm_feed_url: Optional[str] = None,
        tenant_id: Optional[str] = None
    ):
        """
        Initialize source manager
        
        Args:
            rss_feeds: List of RSS feed URLs
            api_keys: Dictionary of API keys by source
            swarm_feed_url: X SWARM RSS feed URL
            tenant_id: Tenant identifier for configuration
        """
        self.tenant_id = tenant_id or "default"
        
        # Initialize source modules
        self.rss_discovery = RSSDiscovery(feeds=rss_feeds or [])
        self.api_integrations = APIIntegrations(api_keys=api_keys or {})
        self.swarm_feed = SwarmFeed(feed_url=swarm_feed_url)
        
        # Discovery cache
        self.last_discovery: Optional[datetime] = None
        self.cached_grants: List[Dict] = []
        
    async def discover_all_grants(self, use_cache: bool = False) -> List[Dict]:
        """
        Discover grants from all sources
        
        Args:
            use_cache: Return cached grants if available
            
        Returns:
            Combined list of all discovered grants
        """
        if use_cache and self.cached_grants:
            logger.info(f"📦 Returning {len(self.cached_grants)} cached grants")
            return self.cached_grants
        
        all_grants = []
        
        logger.info(f"🔍 Discovering grants for tenant: {self.tenant_id}")
        
        # Fetch from all sources concurrently
        tasks = [
            self.rss_discovery.fetch_all_feeds(),
            self.api_integrations.fetch_all_sources(),
            self.swarm_feed.fetch_swarm_grants(),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect and deduplicate results
        seen_titles = set()
        
        for result in results:
            if isinstance(result, list):
                for grant in result:
                    # Simple deduplication by title
                    title = grant.get('title', '')
                    if title and title not in seen_titles:
                        seen_titles.add(title)
                        # Add tenant metadata
                        grant['tenant_id'] = self.tenant_id
                        all_grants.append(grant)
            elif isinstance(result, Exception):
                logger.error(f"❌ Source discovery failed: {result}")
        
        # Update cache
        self.cached_grants = all_grants
        self.last_discovery = datetime.utcnow()
        
        logger.info(f"✅ Discovered {len(all_grants)} total grants (deduplicated)")
        
        # Log breakdown by source
        sources = {}
        for grant in all_grants:
            source = grant.get('source', 'unknown')
            sources[source] = sources.get(source, 0) + 1
        
        logger.info("📊 Grants by source:")
        for source, count in sources.items():
            logger.info(f"  - {source}: {count}")
        
        return all_grants
    
    def add_rss_feed(self, feed_url: str) -> None:
        """Add RSS feed to tenant configuration"""
        self.rss_discovery.add_feed(feed_url)
        logger.info(f"➕ Added RSS feed for tenant {self.tenant_id}: {feed_url}")
    
    def add_api_key(self, source: str, key: str) -> None:
        """Add API key for tenant configuration"""
        self.api_integrations.add_api_key(source, key)
        logger.info(f"🔑 Added API key for tenant {self.tenant_id}: {source}")
    
    def get_cached_grants(self) -> List[Dict]:
        """Get cached grants"""
        return self.cached_grants.copy()
    
    def get_last_discovery_time(self) -> Optional[datetime]:
        """Get timestamp of last discovery"""
        return self.last_discovery
    
    def get_source_stats(self) -> Dict:
        """Get statistics about configured sources"""
        return {
            'tenant_id': self.tenant_id,
            'rss_feeds': len(self.rss_discovery.get_feeds()),
            'api_keys': len(self.api_integrations.api_keys),
            'swarm_feed_enabled': bool(self.swarm_feed.feed_url),
            'last_discovery': self.last_discovery.isoformat() if self.last_discovery else None,
            'cached_grants': len(self.cached_grants),
        }


# Example usage
async def main():
    """Example usage of SourceManager"""
    
    # Initialize source manager
    manager = SourceManager(
        rss_feeds=["https://example.com/grants.rss"],
        api_keys={'web3': 'stub_key'},
        tenant_id="wired-chaos"
    )
    
    # Discover grants
    grants = await manager.discover_all_grants()
    
    print(f"\n🎯 Discovered {len(grants)} total grants")
    print(f"\n📊 Source Statistics:")
    stats = manager.get_source_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print(f"\n📝 Sample Grants:")
    for grant in grants[:5]:
        print(f"  - [{grant.get('source')}] {grant['title']}")


if __name__ == "__main__":
    asyncio.run(main())
