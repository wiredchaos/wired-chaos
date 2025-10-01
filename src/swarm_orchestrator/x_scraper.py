"""
X/Twitter Scraper
Scrapes public X/Twitter mentions using snscrape (no API keys required)
"""

import subprocess
import json
from typing import List, Dict
from datetime import datetime, timedelta, timezone


def scrape_x_mentions(query: str, max_tweets: int = 50, days_back: int = 7) -> Dict:
    """
    Scrape X/Twitter mentions using snscrape
    
    Args:
        query: Search query (e.g., "wiredchaos OR @wiredchaos")
        max_tweets: Maximum number of tweets to fetch
        days_back: Number of days to look back
    
    Returns:
        Dictionary with tweet data
    """
    tweets_data = {
        'scraped_at': datetime.now(timezone.utc).isoformat(),
        'query': query,
        'tweets': [],
        'stats': {
            'total_tweets': 0,
            'unique_users': 0,
            'total_likes': 0,
            'total_retweets': 0
        }
    }
    
    try:
        # Calculate date range
        until_date = datetime.now(timezone.utc)
        since_date = until_date - timedelta(days=days_back)
        
        # Build snscrape command
        date_query = f"{query} since:{since_date.strftime('%Y-%m-%d')} until:{until_date.strftime('%Y-%m-%d')}"
        cmd = [
            'snscrape',
            '--jsonl',
            '--max-results', str(max_tweets),
            'twitter-search',
            date_query
        ]
        
        # Run snscrape
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Parse results
        unique_users = set()
        
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            
            try:
                tweet = json.loads(line)
                
                tweet_info = {
                    'id': tweet.get('id', ''),
                    'user': tweet.get('user', {}).get('username', ''),
                    'content': tweet.get('content', ''),
                    'date': tweet.get('date', ''),
                    'likes': tweet.get('likeCount', 0),
                    'retweets': tweet.get('retweetCount', 0),
                    'url': tweet.get('url', '')
                }
                
                tweets_data['tweets'].append(tweet_info)
                unique_users.add(tweet_info['user'])
                tweets_data['stats']['total_likes'] += tweet_info['likes']
                tweets_data['stats']['total_retweets'] += tweet_info['retweets']
                
            except json.JSONDecodeError:
                continue
        
        tweets_data['stats']['total_tweets'] = len(tweets_data['tweets'])
        tweets_data['stats']['unique_users'] = len(unique_users)
        
    except subprocess.TimeoutExpired:
        print("X/Twitter scraping timed out")
    except FileNotFoundError:
        print("snscrape not found. Install with: pip install snscrape")
    except Exception as e:
        print(f"Error scraping X/Twitter: {e}")
    
    return tweets_data


def extract_top_posts(tweets_data: Dict, top_n: int = 10) -> List[Dict]:
    """
    Extract top posts by engagement (likes + retweets)
    
    Args:
        tweets_data: Output from scrape_x_mentions
        top_n: Number of top posts to extract
    
    Returns:
        List of top posts
    """
    tweets = tweets_data.get('tweets', [])
    
    # Sort by engagement
    sorted_tweets = sorted(
        tweets,
        key=lambda t: t['likes'] + t['retweets'],
        reverse=True
    )
    
    return sorted_tweets[:top_n]


def extract_themes(tweets_data: Dict) -> List[str]:
    """
    Extract common themes from tweets
    
    Args:
        tweets_data: Output from scrape_x_mentions
    
    Returns:
        List of common themes/topics
    """
    # This is a simple implementation - could be enhanced with NLP
    themes = []
    content_all = " ".join([t['content'] for t in tweets_data.get('tweets', [])])
    
    # Simple keyword extraction (could be replaced with more sophisticated NLP)
    words = content_all.lower().split()
    word_freq = {}
    
    for word in words:
        if len(word) > 3:  # Skip short words
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Get top themes
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    themes = [word for word, freq in sorted_words[:10]]
    
    return themes
