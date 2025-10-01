"""
X SWARM RSS Feed Integration

Specialized integration for X SWARM RSS feed to discover Web3 grant opportunities.
Includes enhanced parsing for Web3-specific metadata.
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional

import feedparser
import httpx
from loguru import logger


class SwarmFeed:
    """X SWARM RSS feed integration for Web3 grants"""
    
    def __init__(self, feed_url: Optional[str] = None):
        """
        Initialize SWARM feed integration
        
        Args:
            feed_url: X SWARM RSS feed URL (defaults to configured value)
        """
        self.feed_url = feed_url or "https://twitter.com/swarm/rss"
        self.last_fetch: Optional[datetime] = None
        self.cache: List[Dict] = []
        
    async def fetch_swarm_grants(self) -> List[Dict]:
        """
        Fetch and parse SWARM RSS feed for Web3 grant opportunities
        
        Returns:
            List of Web3 grant opportunities
        """
        grants = []
        
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                logger.info(f"📡 Fetching SWARM RSS feed from {self.feed_url}")
                response = await client.get(self.feed_url)
                response.raise_for_status()
                
                # Parse feed
                feed = feedparser.parse(response.content)
                
                if feed.bozo:
                    logger.warning(f"⚠️ Feed parsing issues for SWARM feed")
                
                # Extract grant opportunities
                for entry in feed.entries:
                    # Check if entry is grant-related
                    if self._is_grant_opportunity(entry):
                        grant = {
                            'source': 'swarm_rss',
                            'source_name': 'X SWARM',
                            'category': 'web3',
                            'feed_url': self.feed_url,
                            'title': entry.get('title', 'Untitled'),
                            'description': entry.get('summary', entry.get('description', '')),
                            'link': entry.get('link', ''),
                            'published': entry.get('published', entry.get('updated', '')),
                            'published_parsed': entry.get('published_parsed'),
                            'tags': self._extract_tags(entry),
                            'web3_metadata': self._extract_web3_metadata(entry),
                            'discovered_at': datetime.utcnow().isoformat(),
                        }
                        
                        grants.append(grant)
                
                self.cache = grants
                self.last_fetch = datetime.utcnow()
                
                logger.info(f"✅ Fetched {len(grants)} Web3 grants from SWARM feed")
                
        except Exception as e:
            logger.error(f"❌ Error fetching SWARM feed: {e}")
            
        return grants
    
    def _is_grant_opportunity(self, entry: Dict) -> bool:
        """
        Determine if feed entry is a grant opportunity
        
        Args:
            entry: Feed entry dictionary
            
        Returns:
            True if entry appears to be a grant opportunity
        """
        # Keywords that indicate grant opportunities
        grant_keywords = [
            'grant', 'funding', 'rfp', 'proposal',
            'application', 'opportunity', 'award',
            'bounty', 'prize', 'competition'
        ]
        
        # Check title and description
        text = (
            entry.get('title', '') + ' ' +
            entry.get('summary', '') + ' ' +
            entry.get('description', '')
        ).lower()
        
        return any(keyword in text for keyword in grant_keywords)
    
    def _extract_tags(self, entry: Dict) -> List[str]:
        """
        Extract and enhance tags from entry
        
        Args:
            entry: Feed entry dictionary
            
        Returns:
            List of tags
        """
        tags = [tag.term for tag in entry.get('tags', [])]
        
        # Add Web3-specific tags based on content
        text = (
            entry.get('title', '') + ' ' +
            entry.get('summary', '') + ' ' +
            entry.get('description', '')
        ).lower()
        
        web3_tags = {
            'web3': ['web3', 'web 3'],
            'blockchain': ['blockchain', 'chain'],
            'defi': ['defi', 'decentralized finance'],
            'nft': ['nft', 'non-fungible'],
            'dao': ['dao', 'decentralized autonomous'],
            'smart-contract': ['smart contract', 'solidity'],
            'ethereum': ['ethereum', 'eth'],
            'crypto': ['crypto', 'cryptocurrency'],
        }
        
        for tag, keywords in web3_tags.items():
            if any(keyword in text for keyword in keywords):
                if tag not in tags:
                    tags.append(tag)
        
        return tags
    
    def _extract_web3_metadata(self, entry: Dict) -> Dict:
        """
        Extract Web3-specific metadata from entry
        
        Args:
            entry: Feed entry dictionary
            
        Returns:
            Dictionary of Web3 metadata
        """
        metadata = {
            'blockchain_networks': [],
            'grant_type': 'unknown',
            'estimated_amount': None,
            'application_deadline': None,
        }
        
        text = (
            entry.get('title', '') + ' ' +
            entry.get('summary', '') + ' ' +
            entry.get('description', '')
        ).lower()
        
        # Detect blockchain networks
        networks = {
            'ethereum': ['ethereum', 'eth', 'evm'],
            'solana': ['solana', 'sol'],
            'polygon': ['polygon', 'matic'],
            'arbitrum': ['arbitrum'],
            'optimism': ['optimism'],
            'avalanche': ['avalanche', 'avax'],
            'cardano': ['cardano', 'ada'],
        }
        
        for network, keywords in networks.items():
            if any(keyword in text for keyword in keywords):
                metadata['blockchain_networks'].append(network)
        
        # Detect grant type
        if 'research' in text:
            metadata['grant_type'] = 'research'
        elif 'development' in text or 'builder' in text:
            metadata['grant_type'] = 'development'
        elif 'community' in text:
            metadata['grant_type'] = 'community'
        elif 'ecosystem' in text:
            metadata['grant_type'] = 'ecosystem'
        
        return metadata
    
    def get_cached_grants(self) -> List[Dict]:
        """Get cached grants from last fetch"""
        return self.cache.copy()
    
    def get_last_fetch_time(self) -> Optional[datetime]:
        """Get timestamp of last successful fetch"""
        return self.last_fetch


# Example usage
async def main():
    """Example usage of SwarmFeed"""
    swarm = SwarmFeed()
    
    # Fetch Web3 grants
    grants = await swarm.fetch_swarm_grants()
    
    print(f"Discovered {len(grants)} Web3 grant opportunities from SWARM")
    for grant in grants[:5]:
        print(f"\n- {grant['title']}")
        print(f"  Tags: {', '.join(grant['tags'])}")
        print(f"  Networks: {', '.join(grant['web3_metadata']['blockchain_networks'])}")


if __name__ == "__main__":
    asyncio.run(main())
