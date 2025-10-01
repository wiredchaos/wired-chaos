"""
Application Drafter

Auto-draft grant applications using LLM and template-based writing.
Supports both OpenAI API and local template systems.
"""

from datetime import datetime
from typing import Dict, List, Optional

from loguru import logger


class ApplicationDrafter:
    """Auto-draft grant applications using LLM/templates"""
    
    def __init__(
        self,
        org_profile: Dict,
        openai_api_key: Optional[str] = None,
        model: str = "gpt-4o-mini"
    ):
        """
        Initialize application drafter
        
        Args:
            org_profile: Organization profile dictionary
            openai_api_key: OpenAI API key (optional)
            model: LLM model to use
        """
        self.org_profile = org_profile
        self.openai_api_key = openai_api_key
        self.model = model
        
        logger.info("✍️ Initialized ApplicationDrafter")
    
    async def draft_application(
        self,
        grant: Dict,
        use_llm: bool = True
    ) -> Dict:
        """
        Draft a grant application
        
        Args:
            grant: Grant opportunity dictionary
            use_llm: Use LLM for drafting (vs templates)
            
        Returns:
            Dictionary with drafted application content
        """
        logger.info(f"✍️ Drafting application for: {grant.get('title')}")
        
        if use_llm and self.openai_api_key:
            return await self._draft_with_llm(grant)
        else:
            return self._draft_with_template(grant)
    
    async def _draft_with_llm(self, grant: Dict) -> Dict:
        """
        Draft application using OpenAI LLM
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Drafted application dictionary
        """
        # Stub implementation - would use OpenAI API
        logger.info("🤖 Drafting with LLM (stub implementation)")
        
        # Build prompt
        prompt = self._build_llm_prompt(grant)
        
        # In production, would call OpenAI API here
        # response = await openai.ChatCompletion.create(...)
        
        # Stub response
        application = {
            'grant_id': grant.get('grant_id', 'UNKNOWN'),
            'grant_title': grant.get('title', ''),
            'organization': self.org_profile.get('name', ''),
            'drafted_at': datetime.utcnow().isoformat(),
            'method': 'llm',
            'model': self.model,
            'sections': {
                'executive_summary': '[LLM STUB] Executive summary would be generated here',
                'organization_background': f"[LLM STUB] Background for {self.org_profile.get('name')}",
                'project_description': '[LLM STUB] Project description aligned with grant objectives',
                'budget_justification': '[LLM STUB] Budget breakdown and justification',
                'impact_statement': '[LLM STUB] Expected impact and outcomes',
                'sustainability_plan': '[LLM STUB] Long-term sustainability approach',
            },
            'metadata': {
                'word_count': 0,  # Would count actual words
                'estimated_completion_time': '2 hours',
                'requires_review': True,
            }
        }
        
        logger.info("✅ Application drafted with LLM")
        return application
    
    def _draft_with_template(self, grant: Dict) -> Dict:
        """
        Draft application using templates
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Drafted application dictionary
        """
        logger.info("📝 Drafting with template")
        
        org_name = self.org_profile.get('name', 'Organization')
        org_tags = ', '.join(self.org_profile.get('tags', []))
        grant_title = grant.get('title', 'Grant Opportunity')
        
        application = {
            'grant_id': grant.get('grant_id', 'UNKNOWN'),
            'grant_title': grant_title,
            'organization': org_name,
            'drafted_at': datetime.utcnow().isoformat(),
            'method': 'template',
            'sections': {
                'executive_summary': f"""
{org_name} is applying for the {grant_title}. Our organization focuses on {org_tags} 
and aligns perfectly with the grant's objectives. This application outlines our proposed 
project and demonstrates our capacity to deliver impactful results.
                """.strip(),
                
                'organization_background': f"""
{org_name} is a {self.org_profile.get('legal_structure', 'LLC')} based in 
{self.org_profile.get('location', 'United States')}. We specialize in {org_tags}.
Our mission is to drive innovation and create positive impact through technology.
                """.strip(),
                
                'project_description': f"""
[TEMPLATE] This section should describe the specific project being proposed for the grant.
Include objectives, methodology, timeline, and deliverables. Align with grant priorities.
                """.strip(),
                
                'budget_justification': f"""
[TEMPLATE] Detailed budget breakdown showing how grant funds will be allocated.
Include personnel, equipment, operational costs, and other expenses.
                """.strip(),
                
                'impact_statement': f"""
[TEMPLATE] Describe the expected impact of this project. Include measurable outcomes,
beneficiaries, and alignment with grant goals.
                """.strip(),
                
                'sustainability_plan': f"""
[TEMPLATE] Explain how the project will be sustained beyond the grant period.
Include revenue streams, partnerships, and long-term viability strategies.
                """.strip(),
            },
            'metadata': {
                'requires_customization': True,
                'template_version': 'v1.0',
                'requires_review': True,
            }
        }
        
        logger.info("✅ Application drafted with template")
        return application
    
    def _build_llm_prompt(self, grant: Dict) -> str:
        """
        Build prompt for LLM application drafting
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Formatted prompt string
        """
        org_name = self.org_profile.get('name', 'Organization')
        org_tags = ', '.join(self.org_profile.get('tags', []))
        
        prompt = f"""
You are a professional grant writer. Draft a compelling grant application with the following details:

ORGANIZATION:
- Name: {org_name}
- Legal Structure: {self.org_profile.get('legal_structure', 'LLC')}
- Location: {self.org_profile.get('location', 'United States')}
- Focus Areas: {org_tags}

GRANT OPPORTUNITY:
- Title: {grant.get('title', '')}
- Description: {grant.get('description', '')}
- Amount: ${grant.get('amount', 'N/A')}
- Deadline: {grant.get('deadline', 'N/A')}

Please write a complete application including:
1. Executive Summary (200-300 words)
2. Organization Background (300-400 words)
3. Project Description (500-700 words)
4. Budget Justification (300-400 words)
5. Impact Statement (300-400 words)
6. Sustainability Plan (200-300 words)

Make the application compelling, specific, and aligned with the grant's objectives.
"""
        
        return prompt.strip()
    
    def customize_section(
        self,
        application: Dict,
        section: str,
        content: str
    ) -> Dict:
        """
        Customize a specific section of the application
        
        Args:
            application: Application dictionary
            section: Section name to customize
            content: New content for section
            
        Returns:
            Updated application dictionary
        """
        if section in application['sections']:
            application['sections'][section] = content
            logger.info(f"✏️ Customized section: {section}")
        
        return application
    
    def export_to_docx(self, application: Dict, filepath: str) -> str:
        """
        Export application to DOCX format
        
        Args:
            application: Application dictionary
            filepath: Path to save DOCX file
            
        Returns:
            Path to saved file
        """
        # Stub implementation - would use python-docx
        logger.info(f"📄 Exporting to DOCX: {filepath} (stub)")
        
        # In production, would create actual DOCX file
        # from docx import Document
        # doc = Document()
        # ...
        
        return filepath
    
    def export_to_pdf(self, application: Dict, filepath: str) -> str:
        """
        Export application to PDF format
        
        Args:
            application: Application dictionary
            filepath: Path to save PDF file
            
        Returns:
            Path to saved file
        """
        # Stub implementation - would use reportlab or similar
        logger.info(f"📄 Exporting to PDF: {filepath} (stub)")
        
        return filepath


# Example usage
async def main():
    """Example usage of ApplicationDrafter"""
    
    org_profile = {
        'name': 'Wired Chaos',
        'tags': ['web3', 'women', 'woman-owned', 'tech', 'ai'],
        'legal_structure': 'LLC',
        'location': 'United States',
    }
    
    grant = {
        'title': 'Web3 Women Founders Grant',
        'description': 'Supporting women-led Web3 initiatives',
        'amount': 50000,
        'deadline': '2024-12-31',
    }
    
    drafter = ApplicationDrafter(org_profile)
    application = await drafter.draft_application(grant, use_llm=False)
    
    print(f"\n✅ Drafted Application for: {grant['title']}")
    print(f"\nExecutive Summary:\n{application['sections']['executive_summary']}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
