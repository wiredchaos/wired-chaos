"""
Pitch Deck Generator using Gamma

Auto-generates tailored pitch decks for grant applications using Gamma API.
Creates professional presentations aligned with grant requirements.
"""

from datetime import datetime
from typing import Dict, List, Optional

from loguru import logger


class PitchGenerator:
    """Generate pitch decks using Gamma"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        workspace_id: Optional[str] = None,
        template_id: Optional[str] = None
    ):
        """
        Initialize pitch generator
        
        Args:
            api_key: Gamma API key
            workspace_id: Gamma workspace ID
            template_id: Default template ID
        """
        self.api_key = api_key
        self.workspace_id = workspace_id
        self.template_id = template_id
        
        self.enabled = bool(api_key and workspace_id)
        
        if self.enabled:
            logger.info("🎨 Initialized PitchGenerator with Gamma API")
        else:
            logger.info("🎨 PitchGenerator in stub mode (missing API credentials)")
    
    async def generate_pitch_deck(
        self,
        grant: Dict,
        application: Dict,
        org_profile: Dict
    ) -> Dict:
        """
        Generate pitch deck for grant application
        
        Args:
            grant: Grant opportunity dictionary
            application: Application dictionary
            org_profile: Organization profile
            
        Returns:
            Pitch deck information
        """
        logger.info(f"🎨 Generating pitch deck for: {grant.get('title')}")
        
        if not self.enabled:
            return self._generate_stub_pitch(grant, application, org_profile)
        
        # Build slide content
        slides = self._build_slide_content(grant, application, org_profile)
        
        # Call Gamma API (stub)
        pitch_deck = await self._create_via_gamma_api(slides)
        
        logger.info("✅ Pitch deck generated")
        
        return pitch_deck
    
    def _build_slide_content(
        self,
        grant: Dict,
        application: Dict,
        org_profile: Dict
    ) -> List[Dict]:
        """
        Build content for pitch deck slides
        
        Args:
            grant: Grant opportunity
            application: Application content
            org_profile: Organization profile
            
        Returns:
            List of slide definitions
        """
        org_name = org_profile.get('name', 'Organization')
        grant_title = grant.get('title', 'Grant Opportunity')
        
        slides = [
            {
                'type': 'title',
                'title': grant_title,
                'subtitle': f'{org_name} Grant Application',
                'style': 'bold'
            },
            {
                'type': 'content',
                'title': 'Organization Overview',
                'content': application['sections'].get('organization_background', ''),
                'layout': 'text-image'
            },
            {
                'type': 'content',
                'title': 'Project Description',
                'content': application['sections'].get('project_description', ''),
                'layout': 'two-column'
            },
            {
                'type': 'content',
                'title': 'Impact & Outcomes',
                'content': application['sections'].get('impact_statement', ''),
                'layout': 'bullet-points'
            },
            {
                'type': 'content',
                'title': 'Budget Overview',
                'content': application['sections'].get('budget_justification', ''),
                'layout': 'chart'
            },
            {
                'type': 'content',
                'title': 'Sustainability Plan',
                'content': application['sections'].get('sustainability_plan', ''),
                'layout': 'timeline'
            },
            {
                'type': 'closing',
                'title': 'Thank You',
                'content': f'Questions? Contact {org_name}',
                'style': 'minimal'
            }
        ]
        
        return slides
    
    async def _create_via_gamma_api(self, slides: List[Dict]) -> Dict:
        """
        Create pitch deck via Gamma API
        
        Args:
            slides: Slide definitions
            
        Returns:
            Pitch deck information
        """
        # Stub implementation - would call Gamma API
        logger.info("📡 Calling Gamma API (stub)")
        
        # In production:
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(
        #         'https://api.gamma.app/v1/decks',
        #         headers={'Authorization': f'Bearer {self.api_key}'},
        #         json={
        #             'workspace_id': self.workspace_id,
        #             'template_id': self.template_id,
        #             'slides': slides
        #         }
        #     )
        #     return response.json()
        
        pitch_deck = {
            'deck_id': f'DECK-{datetime.utcnow().timestamp()}',
            'title': slides[0]['title'],
            'slides_count': len(slides),
            'created_at': datetime.utcnow().isoformat(),
            'url': 'https://gamma.app/docs/stub-deck-id',
            'share_url': 'https://gamma.app/public/stub-deck-id',
            'embed_url': 'https://gamma.app/embed/stub-deck-id',
            'pdf_url': 'https://gamma.app/download/stub-deck-id.pdf',
        }
        
        return pitch_deck
    
    def _generate_stub_pitch(
        self,
        grant: Dict,
        application: Dict,
        org_profile: Dict
    ) -> Dict:
        """
        Generate stub pitch deck (no API)
        
        Args:
            grant: Grant opportunity
            application: Application content
            org_profile: Organization profile
            
        Returns:
            Stub pitch deck information
        """
        slides = self._build_slide_content(grant, application, org_profile)
        
        pitch_deck = {
            'deck_id': f'STUB-DECK-{datetime.utcnow().timestamp()}',
            'title': slides[0]['title'],
            'slides_count': len(slides),
            'created_at': datetime.utcnow().isoformat(),
            'status': 'stub',
            'slides': slides,
            'note': 'Gamma API not configured - slide content generated but not published',
        }
        
        logger.info("📝 Generated stub pitch deck")
        
        return pitch_deck
    
    def customize_slide(
        self,
        pitch_deck: Dict,
        slide_index: int,
        content: str
    ) -> Dict:
        """
        Customize a specific slide
        
        Args:
            pitch_deck: Pitch deck dictionary
            slide_index: Index of slide to customize
            content: New content
            
        Returns:
            Updated pitch deck
        """
        if 'slides' in pitch_deck and slide_index < len(pitch_deck['slides']):
            pitch_deck['slides'][slide_index]['content'] = content
            logger.info(f"✏️ Customized slide {slide_index}")
        
        return pitch_deck
    
    async def export_to_pdf(self, deck_id: str, filepath: str) -> str:
        """
        Export pitch deck to PDF
        
        Args:
            deck_id: Gamma deck ID
            filepath: Path to save PDF
            
        Returns:
            Path to saved file
        """
        logger.info(f"📄 Exporting pitch deck to PDF: {filepath} (stub)")
        
        # In production, would download from Gamma
        # async with httpx.AsyncClient() as client:
        #     response = await client.get(pdf_url)
        #     with open(filepath, 'wb') as f:
        #         f.write(response.content)
        
        return filepath


# Example usage
async def main():
    """Example usage of PitchGenerator"""
    
    generator = PitchGenerator()  # Stub mode
    
    grant = {
        'title': 'Web3 Women Founders Grant',
        'amount': 50000,
    }
    
    application = {
        'sections': {
            'organization_background': 'Wired Chaos is a woman-owned tech company...',
            'project_description': 'Our project aims to...',
            'impact_statement': 'This will impact...',
            'budget_justification': 'Budget breakdown...',
            'sustainability_plan': 'Sustainability approach...',
        }
    }
    
    org_profile = {
        'name': 'Wired Chaos',
        'tags': ['web3', 'women', 'tech'],
    }
    
    pitch_deck = await generator.generate_pitch_deck(grant, application, org_profile)
    
    print(f"\n🎨 Pitch Deck Generated:")
    print(f"  ID: {pitch_deck['deck_id']}")
    print(f"  Slides: {pitch_deck['slides_count']}")
    if 'url' in pitch_deck:
        print(f"  URL: {pitch_deck['url']}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
