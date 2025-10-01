"""
API Integrations for Grant Databases

Connectors for various grant database APIs including:
- Grants.gov
- Foundation Center
- Web3 grant platforms
- Women in Tech grant databases
- Nonprofit grant sources
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional

import httpx
from loguru import logger


class APIIntegrations:
    """API integrations for grant database platforms"""
    
    def __init__(self, api_keys: Optional[Dict[str, str]] = None):
        """
        Initialize API integrations
        
        Args:
            api_keys: Dictionary of API keys by source name
        """
        self.api_keys = api_keys or {}
        
    async def fetch_grants_gov(self, api_key: Optional[str] = None) -> List[Dict]:
        """
        Fetch grants from Grants.gov API
        
        Args:
            api_key: Grants.gov API key
            
        Returns:
            List of grant opportunities
        """
        grants = []
        key = api_key or self.api_keys.get('grants_gov')
        
        if not key:
            logger.warning("⚠️ Grants.gov API key not configured")
            return grants
        
        try:
            # Grants.gov API endpoint (stub - real implementation needed)
            url = "https://www.grants.gov/grantsws/rest/opportunities/search"
            
            params = {
                'oppStatus': 'forecasted|posted',
                'rows': 100,
                'oppNum': '',
            }
            
            headers = {
                'Authorization': f'Bearer {key}',
                'Accept': 'application/json'
            }
            
            async with httpx.AsyncClient(timeout=30) as client:
                logger.info("📡 Fetching grants from Grants.gov")
                response = await client.get(url, params=params, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Parse response (structure depends on actual API)
                    for item in data.get('opportunities', []):
                        grant = {
                            'source': 'grants_gov',
                            'source_name': 'Grants.gov',
                            'category': 'government',
                            'grant_id': item.get('opportunityID', ''),
                            'title': item.get('opportunityTitle', ''),
                            'description': item.get('description', ''),
                            'agency': item.get('agencyName', ''),
                            'amount': item.get('awardCeiling', 0),
                            'deadline': item.get('closeDate', ''),
                            'link': item.get('opportunityURL', ''),
                            'eligibility': item.get('eligibility', []),
                            'discovered_at': datetime.utcnow().isoformat(),
                        }
                        grants.append(grant)
                    
                    logger.info(f"✅ Fetched {len(grants)} grants from Grants.gov")
                else:
                    logger.error(f"❌ Grants.gov API error: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"❌ Error fetching Grants.gov: {e}")
            
        return grants
    
    async def fetch_web3_grants(self, api_key: Optional[str] = None) -> List[Dict]:
        """
        Fetch Web3 grants from various platforms
        
        Args:
            api_key: API key for Web3 grant platforms
            
        Returns:
            List of Web3 grant opportunities
        """
        grants = []
        
        # Stub implementation - would integrate with:
        # - Gitcoin Grants API
        # - Ethereum Foundation grants
        # - Protocol Labs grants
        # - etc.
        
        logger.info("📡 Fetching Web3 grants (stub implementation)")
        
        # Example stub data
        stub_grants = [
            {
                'source': 'web3_platform',
                'source_name': 'Gitcoin',
                'category': 'web3',
                'title': '[STUB] Web3 Development Grant',
                'description': 'Stub grant for Web3 development projects',
                'amount': 50000,
                'deadline': '2024-12-31',
                'eligibility': ['web3', 'blockchain', 'open-source'],
                'discovered_at': datetime.utcnow().isoformat(),
            }
        ]
        
        grants.extend(stub_grants)
        logger.info(f"✅ Fetched {len(grants)} Web3 grants (stub)")
        
        return grants
    
    async def fetch_women_tech_grants(self, api_key: Optional[str] = None) -> List[Dict]:
        """
        Fetch Women in Tech grants
        
        Args:
            api_key: API key for Women in Tech platforms
            
        Returns:
            List of Women in Tech grant opportunities
        """
        grants = []
        
        # Stub implementation - would integrate with:
        # - Women Who Code grants
        # - AnitaB.org opportunities
        # - TechWomen programs
        # - etc.
        
        logger.info("📡 Fetching Women in Tech grants (stub implementation)")
        
        stub_grants = [
            {
                'source': 'women_tech',
                'source_name': 'Women Who Code',
                'category': 'women_in_tech',
                'title': '[STUB] Women in Tech Leadership Grant',
                'description': 'Stub grant for women-led tech initiatives',
                'amount': 25000,
                'deadline': '2024-12-31',
                'eligibility': ['women', 'woman-owned', 'tech'],
                'discovered_at': datetime.utcnow().isoformat(),
            }
        ]
        
        grants.extend(stub_grants)
        logger.info(f"✅ Fetched {len(grants)} Women in Tech grants (stub)")
        
        return grants
    
    async def fetch_nonprofit_grants(self, api_key: Optional[str] = None) -> List[Dict]:
        """
        Fetch nonprofit grants from various sources
        
        Args:
            api_key: API key for nonprofit grant platforms
            
        Returns:
            List of nonprofit grant opportunities
        """
        grants = []
        
        # Stub implementation - would integrate with:
        # - Foundation Center/Candid
        # - GrantStation
        # - etc.
        
        logger.info("📡 Fetching nonprofit grants (stub implementation)")
        
        stub_grants = [
            {
                'source': 'nonprofit_platform',
                'source_name': 'Foundation Center',
                'category': 'nonprofit',
                'title': '[STUB] Nonprofit Technology Grant',
                'description': 'Stub grant for nonprofit tech initiatives',
                'amount': 15000,
                'deadline': '2024-12-31',
                'eligibility': ['nonprofit', 'tech', '501c3'],
                'discovered_at': datetime.utcnow().isoformat(),
            }
        ]
        
        grants.extend(stub_grants)
        logger.info(f"✅ Fetched {len(grants)} nonprofit grants (stub)")
        
        return grants
    
    async def fetch_all_sources(self) -> List[Dict]:
        """
        Fetch grants from all configured API sources
        
        Returns:
            Combined list of all grant opportunities
        """
        all_grants = []
        
        # Fetch from all sources concurrently
        tasks = [
            self.fetch_web3_grants(),
            self.fetch_women_tech_grants(),
            self.fetch_nonprofit_grants(),
        ]
        
        # Only fetch Grants.gov if API key is configured
        if self.api_keys.get('grants_gov'):
            tasks.append(self.fetch_grants_gov())
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect results
        for result in results:
            if isinstance(result, list):
                all_grants.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"❌ API fetch failed: {result}")
        
        logger.info(f"🎯 Total grants from APIs: {len(all_grants)}")
        return all_grants
    
    def add_api_key(self, source: str, key: str) -> None:
        """Add API key for a source"""
        self.api_keys[source] = key
        logger.info(f"🔑 Added API key for {source}")
    
    def remove_api_key(self, source: str) -> None:
        """Remove API key for a source"""
        if source in self.api_keys:
            del self.api_keys[source]
            logger.info(f"🔑 Removed API key for {source}")


# Example usage
async def main():
    """Example usage of APIIntegrations"""
    integrations = APIIntegrations({
        'web3': 'stub_key',
        'women_tech': 'stub_key',
    })
    
    # Fetch all grants
    grants = await integrations.fetch_all_sources()
    
    print(f"Discovered {len(grants)} grant opportunities from APIs")
    for grant in grants:
        print(f"- [{grant['category']}] {grant['title']}")


if __name__ == "__main__":
    asyncio.run(main())
