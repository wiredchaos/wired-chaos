#!/usr/bin/env python3
"""
WIRED CHAOS SWARM Orchestrator - Validation Test
Verifies that all components are working correctly
"""

import os
import sys
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing module imports...")
    try:
        from swarm_orchestrator import project_scanner
        from swarm_orchestrator import rss_fetcher
        from swarm_orchestrator import x_scraper
        from swarm_orchestrator import keyword_extractor
        from swarm_orchestrator import seo_generator
        from swarm_orchestrator import riddle_generator
        print("✓ All modules imported successfully")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_project_scanner():
    """Test project scanner"""
    print("\nTesting project scanner...")
    try:
        from swarm_orchestrator.project_scanner import scan_project_files
        data = scan_project_files('backend', max_file_size=50*1024)
        assert 'stats' in data
        assert data['stats']['total_files'] > 0
        print(f"✓ Scanned {data['stats']['total_files']} files")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_keyword_extraction():
    """Test keyword extraction"""
    print("\nTesting keyword extraction...")
    try:
        from swarm_orchestrator.keyword_extractor import KeywordExtractor
        extractor = KeywordExtractor()
        
        docs = ["WIRED CHAOS Web3 platform", "NFT certificates blockchain"]
        tfidf = extractor.extract_tfidf(docs, top_n=5)
        
        text = "WIRED CHAOS is a Web3 platform with NFT certificates"
        rake = extractor.extract_rake(text, top_n=5)
        
        assert len(tfidf) > 0
        assert len(rake) > 0
        print(f"✓ Extracted {len(tfidf)} TF-IDF and {len(rake)} RAKE keywords")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_seo_generator():
    """Test SEO brief generation"""
    print("\nTesting SEO generator...")
    try:
        from swarm_orchestrator.seo_generator import generate_seo_brief
        keywords = [
            {'term': 'web3', 'weight': 0.9},
            {'term': 'blockchain', 'weight': 0.8}
        ]
        brief = generate_seo_brief(keywords, 'blog')
        assert len(brief) > 100
        assert 'SEO Brief' in brief
        print(f"✓ Generated SEO brief ({len(brief)} characters)")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_riddle_generator():
    """Test riddle generation"""
    print("\nTesting riddle generator...")
    try:
        from swarm_orchestrator.riddle_generator import generate_riddle_collection
        riddles = generate_riddle_collection(3)
        assert len(riddles) == 3
        assert 'riddle' in riddles[0]
        assert 'encoded_answer' in riddles[0]
        print(f"✓ Generated {len(riddles)} riddles")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_rss_fetcher():
    """Test RSS fetcher (OPML parsing only)"""
    print("\nTesting RSS fetcher...")
    try:
        from swarm_orchestrator.rss_fetcher import parse_opml
        if os.path.exists('feeds.opml'):
            feeds = parse_opml('feeds.opml')
            assert len(feeds) > 0
            print(f"✓ Parsed {len(feeds)} feeds from OPML")
            return True
        else:
            print("⚠ feeds.opml not found, skipping")
            return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_build_outputs():
    """Test that build outputs exist"""
    print("\nTesting build outputs...")
    try:
        build_dir = Path('build')
        if not build_dir.exists():
            print("⚠ Build directory doesn't exist (run orchestrator first)")
            return True
        
        expected_files = [
            'keywords.json',
            'seo_briefs.md',
            'lore_riddles.md'
        ]
        
        found = 0
        for filename in expected_files:
            if (build_dir / filename).exists():
                found += 1
                
        print(f"✓ Found {found}/{len(expected_files)} expected output files")
        return found > 0
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("=" * 70)
    print("🧪 WIRED CHAOS SWARM Orchestrator - Validation Test")
    print("=" * 70)
    
    tests = [
        ("Module Imports", test_imports),
        ("Project Scanner", test_project_scanner),
        ("Keyword Extraction", test_keyword_extraction),
        ("SEO Generator", test_seo_generator),
        ("Riddle Generator", test_riddle_generator),
        ("RSS Fetcher", test_rss_fetcher),
        ("Build Outputs", test_build_outputs)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"✗ Test '{name}' failed with exception: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 70)
    print("📊 Test Results Summary")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:8} | {name}")
    
    print("=" * 70)
    print(f"Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
