"""
Test Suite for Grant Bot - Source Discovery

Tests for RSS discovery, API integrations, SWARM feed, and source manager.
"""

import pytest
from grants_bot.sources import RSSDiscovery, APIIntegrations, SwarmFeed, SourceManager


class TestRSSDiscovery:
    """Tests for RSS discovery module"""
    
    @pytest.mark.asyncio
    async def test_rss_initialization(self):
        """Test RSS discovery initialization"""
        discovery = RSSDiscovery(feeds=["https://example.com/grants.rss"])
        assert len(discovery.get_feeds()) == 1
    
    @pytest.mark.asyncio
    async def test_add_feed(self):
        """Test adding RSS feed"""
        discovery = RSSDiscovery()
        discovery.add_feed("https://example.com/grants.rss")
        assert "https://example.com/grants.rss" in discovery.get_feeds()
    
    @pytest.mark.asyncio
    async def test_parse_feed_stub(self):
        """Test feed parsing (stub)"""
        discovery = RSSDiscovery()
        # In real test, would use mock feed data
        # For now, just ensure it doesn't crash
        pass


class TestAPIIntegrations:
    """Tests for API integrations"""
    
    @pytest.mark.asyncio
    async def test_api_initialization(self):
        """Test API integrations initialization"""
        integrations = APIIntegrations(api_keys={'test': 'key123'})
        assert 'test' in integrations.api_keys
    
    @pytest.mark.asyncio
    async def test_web3_grants_stub(self):
        """Test Web3 grants fetching (stub)"""
        integrations = APIIntegrations()
        grants = await integrations.fetch_web3_grants()
        assert isinstance(grants, list)
    
    @pytest.mark.asyncio
    async def test_add_api_key(self):
        """Test adding API key"""
        integrations = APIIntegrations()
        integrations.add_api_key('new_source', 'key456')
        assert integrations.api_keys['new_source'] == 'key456'


class TestSwarmFeed:
    """Tests for SWARM feed integration"""
    
    @pytest.mark.asyncio
    async def test_swarm_initialization(self):
        """Test SWARM feed initialization"""
        swarm = SwarmFeed(feed_url="https://example.com/swarm.rss")
        assert swarm.feed_url == "https://example.com/swarm.rss"
    
    @pytest.mark.asyncio
    async def test_tag_extraction(self):
        """Test Web3 tag extraction"""
        swarm = SwarmFeed()
        entry = {
            'title': 'Web3 Grant Opportunity',
            'summary': 'Blockchain development grant for Ethereum projects'
        }
        tags = swarm._extract_tags(entry)
        assert 'web3' in tags or 'blockchain' in tags


class TestSourceManager:
    """Tests for source manager"""
    
    @pytest.mark.asyncio
    async def test_manager_initialization(self):
        """Test source manager initialization"""
        manager = SourceManager(
            rss_feeds=["https://example.com/grants.rss"],
            tenant_id="test-tenant"
        )
        assert manager.tenant_id == "test-tenant"
    
    @pytest.mark.asyncio
    async def test_get_source_stats(self):
        """Test getting source statistics"""
        manager = SourceManager(tenant_id="test")
        stats = manager.get_source_stats()
        assert 'tenant_id' in stats
        assert stats['tenant_id'] == "test"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
