"""
SEO Brief Generator
Generates SEO-optimized briefs for pages, blogs, and threads
"""

from typing import List, Dict


def generate_seo_brief(keywords: List[Dict], content_type: str = "page") -> str:
    """
    Generate SEO brief based on keywords
    
    Args:
        keywords: List of keyword dictionaries with 'term' and 'weight'
        content_type: Type of content (page, blog, thread)
    
    Returns:
        Markdown-formatted SEO brief
    """
    brief = f"# SEO Brief - {content_type.upper()}\n\n"
    brief += "## Primary Keywords\n\n"
    
    # Extract top 5 keywords
    top_keywords = keywords[:5] if len(keywords) >= 5 else keywords
    for i, kw in enumerate(top_keywords, 1):
        term = kw.get('term', '')
        weight = kw.get('weight', 0)
        brief += f"{i}. **{term}** (weight: {weight:.3f})\n"
    
    brief += "\n## Content Outline\n\n"
    
    if content_type == "page":
        brief += "### Hero Section\n"
        brief += "- Headline incorporating primary keyword\n"
        brief += "- Subheadline with secondary keywords\n"
        brief += "- CTA button with action-oriented text\n\n"
        
        brief += "### Features Section\n"
        brief += "- 3-4 key features highlighting benefits\n"
        brief += "- Use keywords naturally in descriptions\n\n"
        
        brief += "### Social Proof\n"
        brief += "- Testimonials or case studies\n"
        brief += "- Trust indicators\n\n"
        
        brief += "### Final CTA\n"
        brief += "- Strong closing with primary keyword\n\n"
    
    elif content_type == "blog":
        brief += "### Introduction (150-200 words)\n"
        brief += "- Hook with primary keyword in first paragraph\n"
        brief += "- Preview what readers will learn\n\n"
        
        brief += "### Main Content (800-1200 words)\n"
        brief += "- 3-5 H2 sections using secondary keywords\n"
        brief += "- Bullet points and numbered lists\n"
        brief += "- Examples and case studies\n\n"
        
        brief += "### Conclusion (100-150 words)\n"
        brief += "- Summarize key points\n"
        brief += "- CTA with next steps\n\n"
    
    elif content_type == "thread":
        brief += "### Thread Structure (8-12 tweets)\n\n"
        brief += "1. **Hook Tweet**: Start with attention-grabbing statement using primary keyword\n"
        brief += "2. **Problem Statement**: Define the challenge or question\n"
        brief += "3-8. **Value Tweets**: Share insights, tips, or steps\n"
        brief += "9-10. **Supporting Evidence**: Data, examples, or case studies\n"
        brief += "11. **Summary**: Recap key points\n"
        brief += "12. **CTA**: Encourage engagement (like, RT, follow)\n\n"
    
    brief += "## SEO Optimization Tips\n\n"
    brief += "- **Keyword Density**: 1-2% for primary keyword\n"
    brief += "- **Meta Title**: 50-60 characters, include primary keyword\n"
    brief += "- **Meta Description**: 150-160 characters, include CTA\n"
    brief += "- **Headers**: Use H1 for main title, H2-H3 for sections\n"
    brief += "- **Internal Links**: 2-3 relevant internal links\n"
    brief += "- **External Links**: 1-2 authoritative sources\n"
    brief += "- **Images**: Alt text with keywords, compressed for speed\n\n"
    
    brief += "## WIRED CHAOS Brand Voice\n\n"
    brief += "- **Tone**: Bold, innovative, cyberpunk-inspired\n"
    brief += "- **Style**: Technical yet accessible, cutting-edge\n"
    brief += "- **Colors**: Neon (00FFFF, 39FF14, FF3131)\n"
    brief += "- **Themes**: Web3, AI, AR/VR, decentralization\n\n"
    
    return brief


def generate_multiple_briefs(keyword_clusters: Dict) -> str:
    """
    Generate multiple SEO briefs from keyword clusters
    
    Args:
        keyword_clusters: Dictionary with keyword clusters
    
    Returns:
        Combined SEO briefs in markdown format
    """
    all_briefs = "# WIRED CHAOS SEO Content Briefs\n\n"
    all_briefs += f"Generated: {keyword_clusters.get('generated_at', 'N/A')}\n\n"
    all_briefs += "---\n\n"
    
    content_types = ["page", "blog", "thread"]
    clusters = keyword_clusters.get('clusters', [])
    
    for i, cluster in enumerate(clusters[:3]):  # Use first 3 clusters
        keywords = cluster.get('keywords', [])
        content_type = content_types[i % len(content_types)]
        
        brief = generate_seo_brief(keywords, content_type)
        all_briefs += brief
        all_briefs += "\n---\n\n"
    
    return all_briefs
