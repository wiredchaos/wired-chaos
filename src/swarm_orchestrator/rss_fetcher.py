"""
RSS Feed Fetcher
Fetches and parses RSS feeds from OPML file
"""

import feedparser
import xml.etree.ElementTree as ET
from typing import List, Dict
from datetime import datetime, timezone


def parse_opml(opml_path: str) -> List[Dict]:
    """
    Parse OPML file and extract RSS feed URLs
    
    Args:
        opml_path: Path to OPML file
    
    Returns:
        List of feed information dictionaries
    """
    feeds = []
    
    try:
        tree = ET.parse(opml_path)
        root = tree.getroot()
        
        # Find all outline elements (RSS feeds)
        for outline in root.findall('.//outline[@type="rss"]'):
            feed_info = {
                'title': outline.get('text', 'Untitled'),
                'url': outline.get('xmlUrl', ''),
                'html_url': outline.get('htmlUrl', ''),
                'description': outline.get('description', '')
            }
            if feed_info['url']:
                feeds.append(feed_info)
                
    except Exception as e:
        print(f"Error parsing OPML: {e}")
    
    return feeds


def fetch_rss_feeds(opml_path: str, max_items_per_feed: int = 10) -> Dict:
    """
    Fetch RSS feeds from OPML file
    
    Args:
        opml_path: Path to OPML file
        max_items_per_feed: Maximum items to fetch per feed
    
    Returns:
        Dictionary with feed data
    """
    feeds_data = {
        'fetched_at': datetime.now(timezone.utc).isoformat(),
        'feeds': [],
        'stats': {
            'total_feeds': 0,
            'total_items': 0,
            'successful_feeds': 0,
            'failed_feeds': 0
        }
    }
    
    opml_feeds = parse_opml(opml_path)
    feeds_data['stats']['total_feeds'] = len(opml_feeds)
    
    for feed_info in opml_feeds:
        try:
            # Fetch and parse RSS feed
            feed = feedparser.parse(feed_info['url'])
            
            items = []
            for entry in feed.entries[:max_items_per_feed]:
                item = {
                    'title': getattr(entry, 'title', 'Untitled'),
                    'link': getattr(entry, 'link', ''),
                    'published': getattr(entry, 'published', ''),
                    'summary': getattr(entry, 'summary', '')[:500],  # Limit summary length
                    'author': getattr(entry, 'author', '')
                }
                items.append(item)
            
            feeds_data['feeds'].append({
                'feed_title': feed_info['title'],
                'feed_url': feed_info['url'],
                'html_url': feed_info['html_url'],
                'items': items,
                'item_count': len(items)
            })
            
            feeds_data['stats']['successful_feeds'] += 1
            feeds_data['stats']['total_items'] += len(items)
            
        except Exception as e:
            print(f"Error fetching feed {feed_info['title']}: {e}")
            feeds_data['stats']['failed_feeds'] += 1
    
    return feeds_data


def summarize_rss_digest(feeds_data: Dict) -> List[Dict]:
    """
    Create a summarized digest from RSS feed data
    
    Args:
        feeds_data: Output from fetch_rss_feeds
    
    Returns:
        List of summarized feed items
    """
    digest = []
    
    for feed in feeds_data.get('feeds', []):
        for item in feed.get('items', []):
            digest.append({
                'feed': feed['feed_title'],
                'title': item['title'],
                'link': item['link'],
                'published': item['published'],
                'summary': item['summary']
            })
    
    return digest
