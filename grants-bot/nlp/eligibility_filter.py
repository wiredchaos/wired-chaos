"""
Eligibility Filter

NLP-based filtering to identify grants the organization qualifies for.
Uses ProfileMatcher for scoring and applies configurable thresholds.
"""

from typing import Dict, List, Optional

from loguru import logger

from .profile_matcher import ProfileMatcher


class EligibilityFilter:
    """Filter grants based on organization eligibility"""
    
    def __init__(
        self,
        org_profile: Dict,
        min_match_score: float = 0.3,
        exclude_keywords: Optional[List[str]] = None
    ):
        """
        Initialize eligibility filter
        
        Args:
            org_profile: Organization profile dictionary
            min_match_score: Minimum match score for eligibility (0.0-1.0)
            exclude_keywords: Keywords that disqualify grants
        """
        self.matcher = ProfileMatcher(org_profile)
        self.min_match_score = min_match_score
        self.exclude_keywords = [kw.lower() for kw in (exclude_keywords or [])]
        
        logger.info(f"🔍 Initialized EligibilityFilter with threshold: {min_match_score}")
    
    def filter_grants(self, grants: List[Dict]) -> List[Dict]:
        """
        Filter grants for eligibility
        
        Args:
            grants: List of grant opportunities
            
        Returns:
            List of eligible grants with match scores
        """
        eligible_grants = []
        
        logger.info(f"🔍 Filtering {len(grants)} grants for eligibility...")
        
        for grant in grants:
            # Check for exclusions
            if self._is_excluded(grant):
                continue
            
            # Calculate match score
            match_details = self.matcher.get_match_details(grant)
            
            # Check eligibility
            if match_details['match_score'] >= self.min_match_score:
                # Add match details to grant
                grant['match_score'] = match_details['match_score']
                grant['match_details'] = match_details
                grant['is_eligible'] = True
                
                eligible_grants.append(grant)
        
        logger.info(f"✅ Found {len(eligible_grants)} eligible grants")
        
        return eligible_grants
    
    def _is_excluded(self, grant: Dict) -> bool:
        """
        Check if grant contains excluded keywords
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            True if grant should be excluded
        """
        if not self.exclude_keywords:
            return False
        
        # Check title and description
        text = (
            grant.get('title', '') + ' ' +
            grant.get('description', '')
        ).lower()
        
        for keyword in self.exclude_keywords:
            if keyword in text:
                logger.debug(f"❌ Excluded grant due to keyword '{keyword}': {grant.get('title')}")
                return True
        
        return False
    
    def filter_by_amount(
        self,
        grants: List[Dict],
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None
    ) -> List[Dict]:
        """
        Filter grants by funding amount
        
        Args:
            grants: List of grant opportunities
            min_amount: Minimum grant amount
            max_amount: Maximum grant amount
            
        Returns:
            Filtered list of grants
        """
        filtered = []
        
        for grant in grants:
            amount = grant.get('amount', 0)
            
            # Skip if amount is not specified
            if amount == 0:
                filtered.append(grant)
                continue
            
            # Check range
            if min_amount is not None and amount < min_amount:
                continue
            if max_amount is not None and amount > max_amount:
                continue
            
            filtered.append(grant)
        
        logger.info(f"💰 Filtered to {len(filtered)} grants by amount range")
        return filtered
    
    def filter_by_deadline(
        self,
        grants: List[Dict],
        days_minimum: Optional[int] = None
    ) -> List[Dict]:
        """
        Filter grants by application deadline
        
        Args:
            grants: List of grant opportunities
            days_minimum: Minimum days until deadline
            
        Returns:
            Filtered list of grants
        """
        from datetime import datetime, timedelta
        
        if days_minimum is None:
            return grants
        
        filtered = []
        cutoff_date = datetime.utcnow() + timedelta(days=days_minimum)
        
        for grant in grants:
            deadline_str = grant.get('deadline', '')
            
            if not deadline_str:
                # Include if no deadline specified
                filtered.append(grant)
                continue
            
            try:
                # Parse deadline (multiple formats)
                for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%m/%d/%Y']:
                    try:
                        deadline = datetime.strptime(deadline_str.split('T')[0], fmt)
                        break
                    except ValueError:
                        continue
                else:
                    # Could not parse, include anyway
                    filtered.append(grant)
                    continue
                
                # Check if deadline is far enough away
                if deadline >= cutoff_date:
                    filtered.append(grant)
                    
            except Exception as e:
                logger.debug(f"Could not parse deadline '{deadline_str}': {e}")
                filtered.append(grant)
        
        logger.info(f"📅 Filtered to {len(filtered)} grants by deadline")
        return filtered
    
    def filter_by_category(
        self,
        grants: List[Dict],
        categories: List[str]
    ) -> List[Dict]:
        """
        Filter grants by category
        
        Args:
            grants: List of grant opportunities
            categories: List of allowed categories
            
        Returns:
            Filtered list of grants
        """
        categories_lower = [cat.lower() for cat in categories]
        filtered = []
        
        for grant in grants:
            category = grant.get('category', '').lower()
            if category in categories_lower:
                filtered.append(grant)
        
        logger.info(f"🏷️ Filtered to {len(filtered)} grants by category")
        return filtered
    
    def get_filter_stats(self, original_grants: List[Dict], filtered_grants: List[Dict]) -> Dict:
        """
        Get statistics about filtering results
        
        Args:
            original_grants: Original list of grants
            filtered_grants: Filtered list of grants
            
        Returns:
            Dictionary with filtering statistics
        """
        total = len(original_grants)
        eligible = len(filtered_grants)
        excluded = total - eligible
        
        # Calculate average match score
        avg_score = 0.0
        if filtered_grants:
            scores = [g.get('match_score', 0) for g in filtered_grants]
            avg_score = sum(scores) / len(scores)
        
        return {
            'total_grants': total,
            'eligible_grants': eligible,
            'excluded_grants': excluded,
            'eligibility_rate': eligible / total if total > 0 else 0,
            'average_match_score': avg_score,
            'min_threshold': self.min_match_score,
        }


# Example usage
def main():
    """Example usage of EligibilityFilter"""
    
    # Organization profile
    org_profile = {
        'name': 'Wired Chaos',
        'tags': ['web3', 'women', 'woman-owned', 'tech', 'ai'],
        'legal_structure': 'LLC',
        'location': 'United States',
    }
    
    # Sample grants
    grants = [
        {
            'title': 'Web3 Women Founders Grant',
            'description': 'For women-led Web3 startups',
            'category': 'web3',
            'tags': ['web3', 'women'],
            'amount': 50000,
            'deadline': '2024-12-31',
        },
        {
            'title': 'Traditional Manufacturing Grant',
            'description': 'For manufacturing businesses',
            'category': 'manufacturing',
            'tags': ['manufacturing', 'industrial'],
            'amount': 100000,
        },
    ]
    
    # Filter grants
    filter_obj = EligibilityFilter(org_profile, min_match_score=0.3)
    eligible = filter_obj.filter_grants(grants)
    
    # Print results
    stats = filter_obj.get_filter_stats(grants, eligible)
    print(f"\n📊 Filtering Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print(f"\n✅ Eligible Grants:")
    for grant in eligible:
        print(f"  - {grant['title']} (score: {grant['match_score']:.2f})")


if __name__ == "__main__":
    main()
