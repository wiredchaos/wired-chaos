#!/usr/bin/env python3
"""
WIRED CHAOS SWARM Orchestrator
Main pipeline script for transforming raw inputs into structured outputs
"""

import os
import json
import argparse
from datetime import datetime, timezone
from pathlib import Path

from swarm_orchestrator.monitor import PipelineMonitor
from swarm_orchestrator.project_scanner import scan_project_files, extract_text_content
from swarm_orchestrator.rss_fetcher import fetch_rss_feeds, summarize_rss_digest
from swarm_orchestrator.x_scraper import scrape_x_mentions, extract_top_posts, extract_themes
from swarm_orchestrator.keyword_extractor import KeywordExtractor, generate_keyword_clusters
from swarm_orchestrator.seo_generator import generate_multiple_briefs
from swarm_orchestrator.riddle_generator import generate_riddle_collection, format_riddles_markdown


def ensure_build_dir(build_dir: str = "build"):
    """Ensure build directory exists"""
    Path(build_dir).mkdir(parents=True, exist_ok=True)


def save_json(data: dict, filepath: str):
    """Save data as JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, indent=2, fp=f)
    print(f"✓ Saved: {filepath}")


def save_markdown(content: str, filepath: str):
    """Save content as Markdown"""
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ Saved: {filepath}")


def main():
    parser = argparse.ArgumentParser(
        description='WIRED CHAOS SWARM Orchestrator Pipeline'
    )
    parser.add_argument(
        '--project-dir',
        default='.',
        help='Project directory to scan (default: current directory)'
    )
    parser.add_argument(
        '--opml-file',
        default='feeds.opml',
        help='OPML file with RSS feeds (default: feeds.opml)'
    )
    parser.add_argument(
        '--x-query',
        default='wiredchaos OR @wiredchaos',
        help='X/Twitter search query'
    )
    parser.add_argument(
        '--max-tweets',
        type=int,
        default=50,
        help='Maximum tweets to scrape (default: 50)'
    )
    parser.add_argument(
        '--build-dir',
        default='build',
        help='Output directory for build files (default: build)'
    )
    parser.add_argument(
        '--skip-project',
        action='store_true',
        help='Skip project file scanning'
    )
    parser.add_argument(
        '--skip-rss',
        action='store_true',
        help='Skip RSS feed fetching'
    )
    parser.add_argument(
        '--skip-twitter',
        action='store_true',
        help='Skip X/Twitter scraping'
    )

    args = parser.parse_args()

    print("=" * 70)
    print("🚀 WIRED CHAOS SWARM Orchestrator Pipeline")
    print("=" * 70)
    print()
    
    # Ensure build directory exists
    ensure_build_dir(args.build_dir)

    monitor = PipelineMonitor()

    # Initialize keyword extractor
    stopwords_file = 'stopwords.txt'
    stopwords = set()
    if os.path.exists(stopwords_file):
        with open(stopwords_file, 'r') as f:
            stopwords = set(line.strip() for line in f if line.strip())

    extractor = KeywordExtractor(stopwords=stopwords if stopwords else None)
    
    all_text_content = []
    
    # Step 1: Scan project files
    if not args.skip_project:
        print("📁 Step 1: Scanning project files...")
        project_step = monitor.start_step(
            "project_scan",
            metadata={'project_dir': args.project_dir}
        )
        try:
            project_data = scan_project_files(args.project_dir)
            print(f"  - Scanned {project_data['stats']['total_files']} files")
            print(f"  - Total size: {project_data['stats']['total_size'] / 1024:.2f} KB")

            # Extract text content for keyword extraction
            text_content = extract_text_content(project_data)
            all_text_content.append(text_content)

            monitor.end_step(
                project_step,
                metadata={'total_files': project_data['stats']['total_files']},
                outputs=[os.path.join(args.build_dir, 'project_scan')]
            )

        except Exception as e:
            print(f"  ⚠️  Error scanning project: {e}")
            monitor.end_step(project_step, status='error', error=e)

    # Step 2: Fetch RSS feeds
    rss_data = None
    if not args.skip_rss and os.path.exists(args.opml_file):
        print("\n📰 Step 2: Fetching RSS feeds...")
        rss_step = monitor.start_step(
            "rss_fetch",
            metadata={'opml_file': args.opml_file}
        )
        try:
            rss_data = fetch_rss_feeds(args.opml_file)
            print(f"  - Fetched {rss_data['stats']['successful_feeds']} feeds")
            print(f"  - Total items: {rss_data['stats']['total_items']}")

            # Save RSS digest
            digest = summarize_rss_digest(rss_data)
            save_json(digest, os.path.join(args.build_dir, 'rss_digest.json'))
            
            # Extract text for keywords
            rss_text = " ".join([
                f"{item['title']} {item['summary']}"
                for item in digest
            ])
            all_text_content.append(rss_text)

            monitor.end_step(
                rss_step,
                metadata={
                    'successful_feeds': rss_data['stats']['successful_feeds'],
                    'total_items': rss_data['stats']['total_items']
                },
                outputs=[os.path.join(args.build_dir, 'rss_digest.json')]
            )

        except Exception as e:
            print(f"  ⚠️  Error fetching RSS: {e}")
            monitor.end_step(rss_step, status='error', error=e)
    elif not args.skip_rss:
        print(f"\n⚠️  OPML file not found: {args.opml_file}")
        monitor.skip_step(
            "rss_fetch",
            reason="opml_file_missing",
            metadata={'opml_file': args.opml_file}
        )

    # Step 3: Scrape X/Twitter mentions
    tweets_data = None
    if not args.skip_twitter:
        print("\n🐦 Step 3: Scraping X/Twitter mentions...")
        twitter_step = monitor.start_step(
            "twitter_scrape",
            metadata={'query': args.x_query, 'max_tweets': args.max_tweets}
        )
        try:
            tweets_data = scrape_x_mentions(args.x_query, args.max_tweets)
            print(f"  - Scraped {tweets_data['stats']['total_tweets']} tweets")
            print(f"  - Unique users: {tweets_data['stats']['unique_users']}")
            
            # Extract top posts and themes
            top_posts = extract_top_posts(tweets_data)
            themes = extract_themes(tweets_data)
            
            x_output = {
                'stats': tweets_data['stats'],
                'top_posts': top_posts,
                'themes': themes,
                'scraped_at': tweets_data['scraped_at']
            }
            save_json(x_output, os.path.join(args.build_dir, 'x_mentions.json'))

            # Extract text for keywords
            tweets_text = " ".join([t['content'] for t in tweets_data['tweets']])
            all_text_content.append(tweets_text)

            monitor.end_step(
                twitter_step,
                metadata={
                    'total_tweets': tweets_data['stats']['total_tweets'],
                    'unique_users': tweets_data['stats']['unique_users']
                },
                outputs=[os.path.join(args.build_dir, 'x_mentions.json')]
            )

        except Exception as e:
            print(f"  ⚠️  Error scraping X/Twitter: {e}")
            monitor.end_step(twitter_step, status='error', error=e)

    # Step 4: Extract keywords
    print("\n🔑 Step 4: Extracting keywords...")
    keyword_step = monitor.start_step("keyword_extraction")
    try:
        # Combine all text content
        combined_text = " ".join(all_text_content)

        # Extract keywords using TF-IDF
        documents = [content for content in all_text_content if content]
        tfidf_keywords = extractor.extract_tfidf(documents) if documents else []
        
        # Extract keywords using RAKE
        rake_keywords = extractor.extract_rake(combined_text) if combined_text else []
        
        # Generate keyword clusters
        all_keywords = list(set(tfidf_keywords + rake_keywords))
        clusters = generate_keyword_clusters(all_keywords)
        clusters['generated_at'] = datetime.now(timezone.utc).isoformat()
        
        print(f"  - Extracted {len(all_keywords)} unique keywords")
        print(f"  - Generated {len(clusters.get('clusters', []))} clusters")

        save_json(clusters, os.path.join(args.build_dir, 'keywords.json'))

        monitor.end_step(
            keyword_step,
            metadata={
                'keywords': len(all_keywords),
                'clusters': len(clusters.get('clusters', []))
            },
            outputs=[os.path.join(args.build_dir, 'keywords.json')]
        )

    except Exception as e:
        print(f"  ⚠️  Error extracting keywords: {e}")
        clusters = {'clusters': []}
        monitor.end_step(keyword_step, status='error', error=e)

    # Step 5: Generate SEO briefs
    print("\n📝 Step 5: Generating SEO briefs...")
    seo_step = monitor.start_step("seo_briefs")
    try:
        seo_briefs = generate_multiple_briefs(clusters)
        save_markdown(seo_briefs, os.path.join(args.build_dir, 'seo_briefs.md'))
        monitor.end_step(
            seo_step,
            outputs=[os.path.join(args.build_dir, 'seo_briefs.md')]
        )
    except Exception as e:
        print(f"  ⚠️  Error generating SEO briefs: {e}")
        monitor.end_step(seo_step, status='error', error=e)

    # Step 6: Generate 589-coded riddles
    print("\n🧩 Step 6: Generating 589-coded riddles...")
    riddles_step = monitor.start_step("lore_riddles")
    try:
        riddles = generate_riddle_collection(5)
        riddles_md = format_riddles_markdown(riddles)
        save_markdown(riddles_md, os.path.join(args.build_dir, 'lore_riddles.md'))
        monitor.end_step(
            riddles_step,
            outputs=[os.path.join(args.build_dir, 'lore_riddles.md')]
        )
    except Exception as e:
        print(f"  ⚠️  Error generating riddles: {e}")
        monitor.end_step(riddles_step, status='error', error=e)

    monitor.finalize()
    save_json(monitor.as_dict(), os.path.join(args.build_dir, 'pipeline_monitoring.json'))

    print("\n" + "=" * 70)
    print("✅ Pipeline completed successfully!")
    print(f"📂 Output directory: {args.build_dir}/")
    print("=" * 70)
    print()


if __name__ == '__main__':
    main()
