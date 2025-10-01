"""
Grant Prioritization

Prioritizes eligible grants based on multiple factors:
- Match score
- Grant amount
- Application deadline
- Strategic fit
- Success probability
"""

from datetime import datetime
from typing import Dict, List, Optional

from loguru import logger


class GrantPrioritizer:
    """Prioritize grants based on multiple factors"""
    
    def __init__(
        self,
        weights: Optional[Dict[str, float]] = None
    ):
        """
        Initialize grant prioritizer
        
        Args:
            weights: Custom weights for prioritization factors
        """
        # Default weights (must sum to 1.0)
        self.weights = weights or {
            'match_score': 0.35,      # Organization fit
            'grant_amount': 0.25,     # Funding amount
            'deadline_urgency': 0.20, # Time sensitivity
            'strategic_fit': 0.15,    # Strategic importance
            'success_probability': 0.05  # Likelihood of winning
        }
        
        # Validate weights
        total_weight = sum(self.weights.values())
        if abs(total_weight - 1.0) > 0.01:
            logger.warning(f"⚠️ Weights sum to {total_weight}, normalizing to 1.0")
            # Normalize
            for key in self.weights:
                self.weights[key] /= total_weight
        
        logger.info("🎯 Initialized GrantPrioritizer")
    
    def prioritize_grants(self, grants: List[Dict]) -> List[Dict]:
        """
        Prioritize grants and sort by priority score
        
        Args:
            grants: List of eligible grants
            
        Returns:
            Sorted list of grants with priority scores
        """
        logger.info(f"📊 Prioritizing {len(grants)} grants...")
        
        # Calculate priority score for each grant
        for grant in grants:
            grant['priority_score'] = self._calculate_priority_score(grant)
            grant['priority_breakdown'] = self._get_priority_breakdown(grant)
        
        # Sort by priority score (descending)
        sorted_grants = sorted(
            grants,
            key=lambda g: g['priority_score'],
            reverse=True
        )
        
        logger.info("✅ Grants prioritized successfully")
        
        return sorted_grants
    
    def _calculate_priority_score(self, grant: Dict) -> float:
        """
        Calculate overall priority score for a grant
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Priority score between 0.0 and 1.0
        """
        score = 0.0
        
        # Match score component
        match_score = grant.get('match_score', 0.5)
        score += match_score * self.weights['match_score']
        
        # Grant amount component
        amount_score = self._score_grant_amount(grant.get('amount', 0))
        score += amount_score * self.weights['grant_amount']
        
        # Deadline urgency component
        urgency_score = self._score_deadline_urgency(grant.get('deadline', ''))
        score += urgency_score * self.weights['deadline_urgency']
        
        # Strategic fit component
        strategic_score = self._score_strategic_fit(grant)
        score += strategic_score * self.weights['strategic_fit']
        
        # Success probability component
        success_score = self._score_success_probability(grant)
        score += success_score * self.weights['success_probability']
        
        return min(1.0, max(0.0, score))
    
    def _score_grant_amount(self, amount: float) -> float:
        """
        Score based on grant amount (higher is better, with diminishing returns)
        
        Args:
            amount: Grant amount in dollars
            
        Returns:
            Score between 0.0 and 1.0
        """
        if amount <= 0:
            return 0.5  # Unknown amount gets middle score
        
        # Use logarithmic scale to prevent huge grants from dominating
        # $10K = 0.5, $50K = 0.75, $100K+ = 1.0
        if amount >= 100000:
            return 1.0
        elif amount >= 50000:
            return 0.75
        elif amount >= 25000:
            return 0.6
        elif amount >= 10000:
            return 0.5
        else:
            return 0.3
    
    def _score_deadline_urgency(self, deadline_str: str) -> float:
        """
        Score based on deadline urgency (optimal window is 30-60 days)
        
        Args:
            deadline_str: Deadline date string
            
        Returns:
            Score between 0.0 and 1.0
        """
        if not deadline_str:
            return 0.5  # No deadline gets middle score
        
        try:
            # Parse deadline
            for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%m/%d/%Y']:
                try:
                    deadline = datetime.strptime(deadline_str.split('T')[0], fmt)
                    break
                except ValueError:
                    continue
            else:
                return 0.5  # Could not parse
            
            # Calculate days until deadline
            days_until = (deadline - datetime.utcnow()).days
            
            # Scoring:
            # < 7 days: 0.3 (too urgent)
            # 7-14 days: 0.6 (tight but doable)
            # 14-30 days: 0.8 (good window)
            # 30-60 days: 1.0 (optimal)
            # 60-90 days: 0.8 (still good)
            # > 90 days: 0.6 (less urgent)
            
            if days_until < 7:
                return 0.3
            elif days_until < 14:
                return 0.6
            elif days_until < 30:
                return 0.8
            elif days_until <= 60:
                return 1.0
            elif days_until <= 90:
                return 0.8
            else:
                return 0.6
                
        except Exception:
            return 0.5
    
    def _score_strategic_fit(self, grant: Dict) -> float:
        """
        Score based on strategic fit with organization goals
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Score between 0.0 and 1.0
        """
        score = 0.5  # Base score
        
        # High-value categories
        high_value_categories = ['web3', 'blockchain', 'ai', 'women_in_tech']
        category = grant.get('category', '').lower()
        
        if category in high_value_categories:
            score += 0.3
        
        # Prefer grants with specific focus areas
        match_details = grant.get('match_details', {})
        matching_tags = match_details.get('matching_tags', [])
        
        # Bonus for multiple matching tags
        if len(matching_tags) >= 3:
            score += 0.2
        
        return min(1.0, score)
    
    def _score_success_probability(self, grant: Dict) -> float:
        """
        Estimate probability of successfully winning grant
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Score between 0.0 and 1.0
        """
        # Base probability on match score
        match_score = grant.get('match_score', 0.5)
        
        # Higher match score = higher success probability
        probability = match_score
        
        # Adjust based on competitiveness indicators
        amount = grant.get('amount', 0)
        
        # Very large grants tend to be more competitive
        if amount > 500000:
            probability *= 0.7
        elif amount > 100000:
            probability *= 0.85
        
        return probability
    
    def _get_priority_breakdown(self, grant: Dict) -> Dict:
        """
        Get detailed breakdown of priority score components
        
        Args:
            grant: Grant opportunity dictionary
            
        Returns:
            Dictionary with score components
        """
        return {
            'match_score': grant.get('match_score', 0.5),
            'amount_score': self._score_grant_amount(grant.get('amount', 0)),
            'urgency_score': self._score_deadline_urgency(grant.get('deadline', '')),
            'strategic_score': self._score_strategic_fit(grant),
            'success_score': self._score_success_probability(grant),
        }
    
    def get_top_grants(self, grants: List[Dict], count: int = 10) -> List[Dict]:
        """
        Get top N prioritized grants
        
        Args:
            grants: List of grants
            count: Number of top grants to return
            
        Returns:
            Top N grants sorted by priority
        """
        prioritized = self.prioritize_grants(grants)
        return prioritized[:count]


# Example usage
def main():
    """Example usage of GrantPrioritizer"""
    
    # Sample eligible grants
    grants = [
        {
            'title': 'Web3 Women Founders Grant',
            'category': 'web3',
            'amount': 50000,
            'deadline': '2024-11-30',
            'match_score': 0.85,
        },
        {
            'title': 'Small Tech Grant',
            'category': 'tech',
            'amount': 10000,
            'deadline': '2024-10-15',
            'match_score': 0.65,
        },
        {
            'title': 'Large Research Grant',
            'category': 'research',
            'amount': 500000,
            'deadline': '2025-06-30',
            'match_score': 0.45,
        },
    ]
    
    # Prioritize grants
    prioritizer = GrantPrioritizer()
    sorted_grants = prioritizer.prioritize_grants(grants)
    
    # Print results
    print("\n🏆 Prioritized Grants:")
    for i, grant in enumerate(sorted_grants, 1):
        print(f"\n{i}. {grant['title']}")
        print(f"   Priority Score: {grant['priority_score']:.2f}")
        print(f"   Amount: ${grant['amount']:,}")
        print(f"   Match Score: {grant['match_score']:.2f}")


if __name__ == "__main__":
    main()
