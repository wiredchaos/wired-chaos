"""
Executive Summary Generator using Gamma

Creates concise executive summaries for grant applications using Gamma.
Optimized for quick review and attachment to submissions.
"""

from datetime import datetime
from typing import Dict, Optional

from loguru import logger


class ExecutiveSummary:
    """Generate executive summaries using Gamma"""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        workspace_id: Optional[str] = None,
        template_id: Optional[str] = None
    ):
        """
        Initialize executive summary generator
        
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
            logger.info("📋 Initialized ExecutiveSummary with Gamma API")
        else:
            logger.info("📋 ExecutiveSummary in stub mode (missing API credentials)")
    
    async def generate_summary(
        self,
        grant: Dict,
        application: Dict,
        org_profile: Dict
    ) -> Dict:
        """
        Generate executive summary for grant application
        
        Args:
            grant: Grant opportunity dictionary
            application: Application dictionary
            org_profile: Organization profile
            
        Returns:
            Executive summary information
        """
        logger.info(f"📋 Generating executive summary for: {grant.get('title')}")
        
        # Build summary content
        content = self._build_summary_content(grant, application, org_profile)
        
        if not self.enabled:
            return self._generate_stub_summary(content, grant)
        
        # Create via Gamma API (stub)
        summary = await self._create_via_gamma_api(content)
        
        logger.info("✅ Executive summary generated")
        
        return summary
    
    def _build_summary_content(
        self,
        grant: Dict,
        application: Dict,
        org_profile: Dict
    ) -> Dict:
        """
        Build executive summary content
        
        Args:
            grant: Grant opportunity
            application: Application content
            org_profile: Organization profile
            
        Returns:
            Summary content dictionary
        """
        org_name = org_profile.get('name', 'Organization')
        grant_title = grant.get('title', 'Grant Opportunity')
        grant_amount = grant.get('amount', 'N/A')
        
        # Extract key points from application sections
        exec_summary = application['sections'].get('executive_summary', '')
        
        content = {
            'title': f'{org_name} - {grant_title}',
            'subtitle': f'Grant Request: ${grant_amount:,}' if isinstance(grant_amount, (int, float)) else f'Grant Request: {grant_amount}',
            'sections': [
                {
                    'heading': 'Organization',
                    'content': self._extract_key_points(
                        application['sections'].get('organization_background', ''),
                        max_words=100
                    )
                },
                {
                    'heading': 'Project Overview',
                    'content': self._extract_key_points(
                        application['sections'].get('project_description', ''),
                        max_words=150
                    )
                },
                {
                    'heading': 'Expected Impact',
                    'content': self._extract_key_points(
                        application['sections'].get('impact_statement', ''),
                        max_words=100
                    )
                },
                {
                    'heading': 'Budget Summary',
                    'content': self._extract_key_points(
                        application['sections'].get('budget_justification', ''),
                        max_words=75
                    )
                },
            ],
            'call_to_action': 'We respectfully request your consideration of our application.',
        }
        
        return content
    
    def _extract_key_points(self, text: str, max_words: int = 100) -> str:
        """
        Extract key points from text
        
        Args:
            text: Full text
            max_words: Maximum words to extract
            
        Returns:
            Shortened text
        """
        words = text.split()[:max_words]
        
        if len(words) < len(text.split()):
            return ' '.join(words) + '...'
        
        return ' '.join(words)
    
    async def _create_via_gamma_api(self, content: Dict) -> Dict:
        """
        Create executive summary via Gamma API
        
        Args:
            content: Summary content
            
        Returns:
            Summary information
        """
        # Stub implementation - would call Gamma API
        logger.info("📡 Calling Gamma API (stub)")
        
        summary = {
            'summary_id': f'SUMMARY-{datetime.utcnow().timestamp()}',
            'title': content['title'],
            'created_at': datetime.utcnow().isoformat(),
            'url': 'https://gamma.app/docs/stub-summary-id',
            'share_url': 'https://gamma.app/public/stub-summary-id',
            'pdf_url': 'https://gamma.app/download/stub-summary-id.pdf',
            'word_count': sum(len(s['content'].split()) for s in content['sections']),
        }
        
        return summary
    
    def _generate_stub_summary(self, content: Dict, grant: Dict) -> Dict:
        """
        Generate stub executive summary (no API)
        
        Args:
            content: Summary content
            grant: Grant opportunity
            
        Returns:
            Stub summary information
        """
        summary = {
            'summary_id': f'STUB-SUMMARY-{datetime.utcnow().timestamp()}',
            'title': content['title'],
            'created_at': datetime.utcnow().isoformat(),
            'status': 'stub',
            'content': content,
            'word_count': sum(len(s['content'].split()) for s in content['sections']),
            'note': 'Gamma API not configured - summary content generated but not published',
        }
        
        logger.info("📝 Generated stub executive summary")
        
        return summary
    
    def format_as_markdown(self, summary: Dict) -> str:
        """
        Format summary as Markdown
        
        Args:
            summary: Summary dictionary
            
        Returns:
            Markdown-formatted summary
        """
        content = summary.get('content', {})
        
        md = f"# {content.get('title', 'Executive Summary')}\n\n"
        md += f"**{content.get('subtitle', '')}**\n\n"
        
        for section in content.get('sections', []):
            md += f"## {section['heading']}\n\n"
            md += f"{section['content']}\n\n"
        
        md += f"---\n\n{content.get('call_to_action', '')}\n"
        
        return md
    
    async def export_to_pdf(self, summary_id: str, filepath: str) -> str:
        """
        Export summary to PDF
        
        Args:
            summary_id: Gamma summary ID
            filepath: Path to save PDF
            
        Returns:
            Path to saved file
        """
        logger.info(f"📄 Exporting summary to PDF: {filepath} (stub)")
        
        return filepath


# Example usage
async def main():
    """Example usage of ExecutiveSummary"""
    
    generator = ExecutiveSummary()  # Stub mode
    
    grant = {
        'title': 'Web3 Women Founders Grant',
        'amount': 50000,
    }
    
    application = {
        'sections': {
            'executive_summary': 'Brief overview...',
            'organization_background': 'Wired Chaos is a woman-owned tech company focused on Web3 innovation...',
            'project_description': 'Our project will develop a decentralized grant discovery platform...',
            'impact_statement': 'This project will help 10,000+ organizations find relevant grants...',
            'budget_justification': 'Total budget: $50,000. Personnel: $30,000, Technology: $15,000, Operations: $5,000',
        }
    }
    
    org_profile = {
        'name': 'Wired Chaos',
        'tags': ['web3', 'women', 'tech'],
    }
    
    summary = await generator.generate_summary(grant, application, org_profile)
    
    print(f"\n📋 Executive Summary Generated:")
    print(f"  ID: {summary['summary_id']}")
    print(f"  Words: {summary['word_count']}")
    
    if 'content' in summary:
        md = generator.format_as_markdown(summary)
        print(f"\n📝 Markdown Preview:\n{md[:500]}...")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
