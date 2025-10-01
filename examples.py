#!/usr/bin/env python3
"""
WIRED CHAOS SWARM Orchestrator - Usage Examples
Demonstrates how to use individual components

Run from project root:
  PYTHONPATH=src python examples.py
"""

import sys
import os
# Add src to path if running from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import json
from swarm_orchestrator.project_scanner import scan_project_files
from swarm_orchestrator.keyword_extractor import KeywordExtractor, generate_keyword_clusters
from swarm_orchestrator.seo_generator import generate_seo_brief
from swarm_orchestrator.riddle_generator import generate_riddle_collection, format_riddles_markdown

def example_project_scanning():
    """Example: Scan project files"""
    print("=" * 70)
    print("Example 1: Project File Scanning")
    print("=" * 70)
    
    # Scan backend directory
    files_data = scan_project_files('backend', max_file_size=100*1024)
    
    print(f"Scanned: {files_data['stats']['total_files']} files")
    print(f"Total size: {files_data['stats']['total_size']} bytes")
    print(f"Extensions: {list(files_data['stats']['by_extension'].keys())}")
    print()

def example_keyword_extraction():
    """Example: Extract keywords from text"""
    print("=" * 70)
    print("Example 2: Keyword Extraction")
    print("=" * 70)
    
    # Sample documents
    documents = [
        "WIRED CHAOS is a Web3 platform with AR/VR integration and multi-chain NFT certificates.",
        "The platform includes Vault33 Gatekeeper for security and gamification.",
        "SWARM Orchestrator processes RSS feeds, Twitter mentions, and project files."
    ]
    
    # Initialize extractor
    extractor = KeywordExtractor()
    
    # Extract using TF-IDF
    tfidf_keywords = extractor.extract_tfidf(documents, top_n=10)
    print("Top TF-IDF Keywords:")
    for term, score in tfidf_keywords[:5]:
        print(f"  - {term}: {score:.3f}")
    
    # Extract using RAKE
    combined_text = " ".join(documents)
    rake_keywords = extractor.extract_rake(combined_text, top_n=10)
    print("\nTop RAKE Keywords:")
    for phrase, score in rake_keywords[:5]:
        print(f"  - {phrase}: {score:.3f}")
    
    # Generate clusters
    all_keywords = tfidf_keywords + rake_keywords
    clusters = generate_keyword_clusters(all_keywords, num_clusters=2)
    
    print(f"\nGenerated {len(clusters['clusters'])} clusters")
    print()

def example_seo_brief():
    """Example: Generate SEO brief"""
    print("=" * 70)
    print("Example 3: SEO Brief Generation")
    print("=" * 70)
    
    # Sample keywords
    keywords = [
        {'term': 'web3 platform', 'weight': 0.95},
        {'term': 'ar vr integration', 'weight': 0.87},
        {'term': 'nft certificates', 'weight': 0.78},
        {'term': 'blockchain', 'weight': 0.65},
        {'term': 'decentralized', 'weight': 0.52}
    ]
    
    # Generate brief
    brief = generate_seo_brief(keywords, content_type='blog')
    
    print(brief[:500] + "...\n")
    print()

def example_riddles():
    """Example: Generate 589-coded riddles"""
    print("=" * 70)
    print("Example 4: 589-Coded Riddles")
    print("=" * 70)
    
    # Generate riddles
    riddles = generate_riddle_collection(3)
    
    for riddle in riddles:
        print(f"\nRiddle #{riddle['id']} ({riddle['difficulty']}):")
        print(f"  {riddle['riddle']}")
        print(f"  Answer (589): {riddle['encoded_answer']}")
        print(f"  Hint: {riddle['hint']}")
    
    print()

def main():
    print("\n🚀 WIRED CHAOS SWARM Orchestrator - Usage Examples\n")
    
    example_project_scanning()
    example_keyword_extraction()
    example_seo_brief()
    example_riddles()
    
    print("=" * 70)
    print("✅ All examples completed!")
    print("=" * 70)
    print()

if __name__ == '__main__':
    main()
