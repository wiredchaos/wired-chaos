"""
Organization Profile Matcher

Matches organization profiles to grant opportunities using NLP and semantic similarity.
Tags: web3, women, woman-owned, tech, nonprofit, blockchain, ai
"""

from typing import Dict, List, Set

from loguru import logger


class ProfileMatcher:
    """Match organization profiles to grant eligibility criteria"""
    
    def __init__(self, org_profile: Dict):
        """
        Initialize profile matcher
        
        Args:
            org_profile: Organization profile with tags and metadata
        """
        self.org_profile = org_profile
        self.org_tags = set(org_profile.get('tags', []))
        
        logger.info(f"🎯 Initialized ProfileMatcher with tags: {self.org_tags}")
    
    def calculate_match_score(self, grant: Dict) -> float:
        """
        Calculate match score between organization and grant
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Match score between 0.0 and 1.0
        """
        score = 0.0
        max_score = 0.0
        
        # Extract grant tags/keywords
        grant_tags = self._extract_grant_tags(grant)
        
        # Tag overlap score (40% weight)
        tag_weight = 0.4
        if grant_tags:
            tag_overlap = len(self.org_tags & grant_tags)
            tag_score = tag_overlap / len(grant_tags)
            score += tag_score * tag_weight
        max_score += tag_weight
        
        # Category match (30% weight)
        category_weight = 0.3
        category = grant.get('category', '').lower()
        if self._category_matches(category):
            score += category_weight
        max_score += category_weight
        
        # Legal structure match (15% weight)
        legal_weight = 0.15
        if self._legal_structure_matches(grant):
            score += legal_weight
        max_score += legal_weight
        
        # Location match (15% weight)
        location_weight = 0.15
        if self._location_matches(grant):
            score += location_weight
        max_score += location_weight
        
        # Normalize score
        final_score = score / max_score if max_score > 0 else 0.0
        
        return final_score
    
    def _extract_grant_tags(self, grant: Dict) -> Set[str]:
        """Extract and normalize tags from grant"""
        tags = set()
        
        # From explicit tags field
        if 'tags' in grant:
            tags.update(tag.lower() for tag in grant['tags'])
        
        # From eligibility field
        if 'eligibility' in grant:
            eligibility = grant['eligibility']
            if isinstance(eligibility, list):
                tags.update(tag.lower() for tag in eligibility)
            elif isinstance(eligibility, str):
                tags.update(tag.lower() for tag in eligibility.split(','))
        
        # From category
        if 'category' in grant:
            tags.add(grant['category'].lower())
        
        # Extract from title and description using keywords
        text = (
            grant.get('title', '') + ' ' +
            grant.get('description', '')
        ).lower()
        
        keyword_mappings = {
            'web3': ['web3', 'web 3', 'decentralized'],
            'women': ['women', 'woman', 'female', 'ladies'],
            'woman-owned': ['woman-owned', 'women-owned', 'female-founded'],
            'tech': ['tech', 'technology', 'digital'],
            'nonprofit': ['nonprofit', 'non-profit', '501c3', 'ngo'],
            'blockchain': ['blockchain', 'crypto', 'distributed ledger'],
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
        }
        
        for tag, keywords in keyword_mappings.items():
            if any(keyword in text for keyword in keywords):
                tags.add(tag)
        
        return tags
    
    def _category_matches(self, category: str) -> bool:
        """Check if grant category matches organization"""
        matching_categories = {
            'web3', 'blockchain', 'crypto',
            'tech', 'technology', 'digital',
            'women', 'women_in_tech',
            'nonprofit', 'social_impact'
        }
        
        # Check if any org tag matches category
        if category in self.org_tags:
            return True
        
        # Check if category is in matching set
        return category in matching_categories
    
    def _legal_structure_matches(self, grant: Dict) -> bool:
        """Check if legal structure matches grant requirements"""
        org_structure = self.org_profile.get('legal_structure', '').lower()
        grant_requirements = grant.get('legal_requirements', [])
        
        if not grant_requirements:
            return True  # No specific requirement
        
        # Normalize requirements
        requirements = [req.lower() for req in grant_requirements]
        
        # Common structure aliases
        structure_map = {
            'llc': ['llc', 'limited liability company'],
            'nonprofit': ['nonprofit', 'non-profit', '501c3', 'ngo'],
            'corporation': ['corp', 'corporation', 'inc'],
        }
        
        for structure, aliases in structure_map.items():
            if org_structure in aliases:
                return any(alias in requirements for alias in aliases)
        
        return org_structure in requirements
    
    def _location_matches(self, grant: Dict) -> bool:
        """Check if location matches grant geographic restrictions"""
        org_location = self.org_profile.get('location', '').lower()
        grant_locations = grant.get('geographic_restrictions', [])
        
        if not grant_locations:
            return True  # No restriction
        
        # Normalize locations
        locations = [loc.lower() for loc in grant_locations]
        
        # Check for match
        return (
            org_location in locations or
            'united states' in locations or
            'global' in locations or
            'worldwide' in locations
        )
    
    def is_eligible(self, grant: Dict, threshold: float = 0.3) -> bool:
        """
        Determine if organization is eligible for grant
        
        Args:
            grant: Grant opportunity dictionary
            threshold: Minimum match score for eligibility (0.0-1.0)
            
        Returns:
            True if organization likely eligible
        """
        score = self.calculate_match_score(grant)
        return score >= threshold
    
    def get_match_details(self, grant: Dict) -> Dict:
        """
        Get detailed match information
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Dictionary with match score and details
        """
        score = self.calculate_match_score(grant)
        grant_tags = self._extract_grant_tags(grant)
        matching_tags = self.org_tags & grant_tags
        
        return {
            'match_score': score,
            'is_eligible': score >= 0.3,
            'org_tags': list(self.org_tags),
            'grant_tags': list(grant_tags),
            'matching_tags': list(matching_tags),
            'category_match': self._category_matches(grant.get('category', '')),
            'legal_match': self._legal_structure_matches(grant),
            'location_match': self._location_matches(grant),
        }


# Example usage
def main():
    """Example usage of ProfileMatcher"""
    
    # Wired Chaos organization profile
    org_profile = {
        'name': 'Wired Chaos',
        'tags': ['web3', 'women', 'woman-owned', 'tech', 'ai', 'blockchain'],
        'legal_structure': 'LLC',
        'location': 'United States',
        'size': 'small'
    }
    
    matcher = ProfileMatcher(org_profile)
    
    # Example grant
    grant = {
        'title': 'Web3 Women Founders Grant',
        'description': 'Grant for women-led Web3 startups',
        'category': 'web3',
        'tags': ['web3', 'women', 'blockchain'],
        'eligibility': ['woman-owned', 'tech'],
    }
    
    # Calculate match
    details = matcher.get_match_details(grant)
    
    print(f"Match Score: {details['match_score']:.2f}")
    print(f"Eligible: {details['is_eligible']}")
    print(f"Matching Tags: {details['matching_tags']}")


if __name__ == "__main__":
    main()
