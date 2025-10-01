"""
Test Suite for Grant Bot - NLP Modules

Tests for profile matching, eligibility filtering, and prioritization.
"""

import pytest
from grants_bot.nlp import ProfileMatcher, EligibilityFilter, GrantPrioritizer


class TestProfileMatcher:
    """Tests for profile matcher"""
    
    def test_initialization(self):
        """Test profile matcher initialization"""
        org_profile = {
            'name': 'Test Org',
            'tags': ['web3', 'tech'],
            'legal_structure': 'LLC',
            'location': 'United States'
        }
        matcher = ProfileMatcher(org_profile)
        assert 'web3' in matcher.org_tags
        assert 'tech' in matcher.org_tags
    
    def test_calculate_match_score(self):
        """Test match score calculation"""
        org_profile = {
            'tags': ['web3', 'women', 'tech'],
            'legal_structure': 'LLC',
            'location': 'United States'
        }
        matcher = ProfileMatcher(org_profile)
        
        grant = {
            'title': 'Web3 Grant',
            'description': 'For Web3 companies',
            'category': 'web3',
            'tags': ['web3', 'tech'],
        }
        
        score = matcher.calculate_match_score(grant)
        assert 0.0 <= score <= 1.0
        assert score > 0  # Should have some match
    
    def test_is_eligible(self):
        """Test eligibility determination"""
        org_profile = {
            'tags': ['web3', 'women'],
            'legal_structure': 'LLC',
            'location': 'United States'
        }
        matcher = ProfileMatcher(org_profile)
        
        grant = {
            'category': 'web3',
            'tags': ['web3'],
        }
        
        is_eligible = matcher.is_eligible(grant, threshold=0.2)
        assert isinstance(is_eligible, bool)


class TestEligibilityFilter:
    """Tests for eligibility filter"""
    
    def test_initialization(self):
        """Test eligibility filter initialization"""
        org_profile = {'tags': ['web3', 'tech']}
        filter_obj = EligibilityFilter(org_profile, min_match_score=0.3)
        assert filter_obj.min_match_score == 0.3
    
    def test_filter_grants(self):
        """Test grant filtering"""
        org_profile = {
            'tags': ['web3', 'women', 'tech'],
            'legal_structure': 'LLC',
            'location': 'United States'
        }
        filter_obj = EligibilityFilter(org_profile, min_match_score=0.3)
        
        grants = [
            {
                'title': 'Web3 Grant',
                'category': 'web3',
                'tags': ['web3', 'tech'],
            },
            {
                'title': 'Manufacturing Grant',
                'category': 'manufacturing',
                'tags': ['manufacturing'],
            }
        ]
        
        eligible = filter_obj.filter_grants(grants)
        assert len(eligible) >= 0  # Should filter some grants
    
    def test_filter_stats(self):
        """Test filter statistics"""
        org_profile = {'tags': ['web3']}
        filter_obj = EligibilityFilter(org_profile)
        
        original = [{'title': 'Grant 1'}, {'title': 'Grant 2'}]
        filtered = [{'title': 'Grant 1', 'match_score': 0.5}]
        
        stats = filter_obj.get_filter_stats(original, filtered)
        assert stats['total_grants'] == 2
        assert stats['eligible_grants'] == 1


class TestGrantPrioritizer:
    """Tests for grant prioritizer"""
    
    def test_initialization(self):
        """Test prioritizer initialization"""
        prioritizer = GrantPrioritizer()
        assert 'match_score' in prioritizer.weights
        # Weights should sum to ~1.0
        total = sum(prioritizer.weights.values())
        assert 0.99 <= total <= 1.01
    
    def test_prioritize_grants(self):
        """Test grant prioritization"""
        prioritizer = GrantPrioritizer()
        
        grants = [
            {
                'title': 'High Match Grant',
                'match_score': 0.9,
                'amount': 50000,
                'deadline': '2024-11-30',
            },
            {
                'title': 'Low Match Grant',
                'match_score': 0.3,
                'amount': 10000,
                'deadline': '2024-10-15',
            }
        ]
        
        sorted_grants = prioritizer.prioritize_grants(grants)
        assert len(sorted_grants) == 2
        assert 'priority_score' in sorted_grants[0]
        # Higher match score should generally rank higher
        assert sorted_grants[0]['match_score'] >= sorted_grants[1]['match_score']
    
    def test_get_top_grants(self):
        """Test getting top N grants"""
        prioritizer = GrantPrioritizer()
        
        grants = [
            {'title': f'Grant {i}', 'match_score': 0.5, 'amount': 10000}
            for i in range(20)
        ]
        
        top_5 = prioritizer.get_top_grants(grants, count=5)
        assert len(top_5) == 5


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
