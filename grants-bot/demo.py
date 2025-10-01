#!/usr/bin/env python3
"""
SWARM Grant Bot - Demo Script

Demonstrates the full grant automation workflow.
"""

import asyncio
from grants_bot import GrantBot


async def main():
    """Run full grant bot demo"""
    
    print("=" * 60)
    print("🤖 SWARM GRANT BOT - DEMO")
    print("=" * 60)
    print()
    
    # Initialize bot
    print("📦 Initializing Grant Bot...")
    bot = GrantBot(tenant_id="wired-chaos")
    print("✅ Bot initialized for tenant: wired-chaos")
    print()
    
    # Step 1: Discover Grants
    print("=" * 60)
    print("STEP 1: DISCOVER GRANTS")
    print("=" * 60)
    print()
    print("🔍 Discovering grants from all sources...")
    grants = await bot.discover_grants()
    print(f"✅ Discovered {len(grants)} grant opportunities")
    print()
    
    # Show grant breakdown
    sources = {}
    for grant in grants:
        source = grant.get('source', 'unknown')
        sources[source] = sources.get(source, 0) + 1
    
    print("📊 Grants by source:")
    for source, count in sources.items():
        print(f"  - {source}: {count}")
    print()
    
    # Step 2: Filter for Eligibility
    print("=" * 60)
    print("STEP 2: FILTER FOR ELIGIBILITY")
    print("=" * 60)
    print()
    print("🎯 Filtering for eligible grants...")
    eligible = await bot.filter_eligible(grants)
    print(f"✅ {len(eligible)} grants match your profile")
    print()
    
    if eligible:
        avg_score = sum(g['match_score'] for g in eligible) / len(eligible)
        print(f"📈 Average match score: {avg_score:.2f}")
        print()
    
    # Step 3: Prioritize
    print("=" * 60)
    print("STEP 3: PRIORITIZE GRANTS")
    print("=" * 60)
    print()
    print("📊 Prioritizing grants...")
    prioritized = await bot.prioritize_grants(eligible)
    print(f"✅ Grants prioritized and sorted")
    print()
    
    # Show top 5
    print("🏆 TOP 5 PRIORITY GRANTS:")
    print()
    for i, grant in enumerate(prioritized[:5], 1):
        print(f"{i}. {grant['title']}")
        print(f"   Priority Score: {grant['priority_score']:.2f}")
        print(f"   Match Score: {grant['match_score']:.2f}")
        print(f"   Category: {grant.get('category', 'N/A')}")
        print(f"   Amount: ${grant.get('amount', 'N/A')}")
        print(f"   Source: {grant.get('source_name', grant.get('source', 'N/A'))}")
        print()
    
    # Step 4: Draft Application (for top grant)
    if prioritized:
        top_grant = prioritized[0]
        
        print("=" * 60)
        print("STEP 4: DRAFT APPLICATION")
        print("=" * 60)
        print()
        print(f"✍️ Drafting application for: {top_grant['title']}")
        
        application = await bot.draft_application(top_grant, use_llm=False)
        
        print(f"✅ Application drafted using {application['method']}")
        print()
        print("📋 Application sections:")
        for section, content in application['sections'].items():
            preview = content[:100] + "..." if len(content) > 100 else content
            print(f"  - {section}: {preview}")
        print()
        
        # Step 5: Generate Pitch Deck
        print("=" * 60)
        print("STEP 5: GENERATE PITCH DECK")
        print("=" * 60)
        print()
        print("🎨 Generating pitch deck...")
        
        pitch_deck = await bot.generate_pitch_deck(top_grant, application)
        
        print(f"✅ Pitch deck generated")
        print(f"   Deck ID: {pitch_deck['deck_id']}")
        print(f"   Slides: {pitch_deck['slides_count']}")
        if 'url' in pitch_deck:
            print(f"   URL: {pitch_deck['url']}")
        print()
        
        # Step 6: Submit Application
        print("=" * 60)
        print("STEP 6: SUBMIT APPLICATION")
        print("=" * 60)
        print()
        print("📤 Submitting application...")
        print("   (Test mode - no actual submission)")
        
        result = await bot.submit_application(top_grant, application, method="api")
        
        print(f"✅ Submission successful")
        print(f"   Submission ID: {result['submission_id']}")
        print(f"   Method: {result['method']}")
        print(f"   Confirmation: {result['confirmation']}")
        print()
        
        # Step 7: Monitor Status
        print("=" * 60)
        print("STEP 7: MONITOR STATUS")
        print("=" * 60)
        print()
        print("👁️ Checking application status...")
        
        status = await bot.check_status(result['submission_id'])
        
        print(f"✅ Status retrieved")
        print(f"   Current Status: {status['status']}")
        print(f"   Tracked Since: {status['tracked_since']}")
        print(f"   Last Checked: {status['last_checked']}")
        print()
    
    # Final Statistics
    print("=" * 60)
    print("FINAL STATISTICS")
    print("=" * 60)
    print()
    
    stats = bot.get_stats()
    
    print("📊 Overall Stats:")
    print(f"  Sources configured: {stats['sources']['rss_feeds']} RSS, {stats['sources']['api_keys']} APIs")
    print(f"  Grants discovered: {len(grants)}")
    print(f"  Eligible grants: {len(eligible)}")
    print(f"  Applications submitted: {stats['submissions']['total_submissions']}")
    print(f"  Success rate: {stats['submissions']['success_rate'] * 100:.0f}%")
    print()
    
    print("=" * 60)
    print("✅ DEMO COMPLETE")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Configure your .env file with real API keys")
    print("  2. Add more grant sources (RSS feeds, APIs)")
    print("  3. Customize application templates")
    print("  4. Set up automated scheduling")
    print("  5. Deploy the API server")
    print()
    print("For more information, see:")
    print("  - docs/SETUP.md")
    print("  - docs/API.md")
    print("  - docs/DEPLOYMENT.md")
    print()


if __name__ == "__main__":
    asyncio.run(main())
