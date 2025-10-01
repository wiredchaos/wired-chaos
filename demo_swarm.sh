#!/bin/bash
# WIRED CHAOS SWARM Orchestrator - Demo Script
# Demonstrates the pipeline functionality

echo "======================================================================="
echo "🚀 WIRED CHAOS SWARM Orchestrator - DEMO"
echo "======================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}This demo will run the SWARM Orchestrator pipeline with sample data.${NC}"
echo ""

# Step 1: Check dependencies
echo -e "${YELLOW}Step 1: Checking dependencies...${NC}"
python3 --version
pip3 show feedparser > /dev/null 2>&1 && echo "✓ feedparser installed" || echo "✗ feedparser missing - run: pip install feedparser"
pip3 show snscrape > /dev/null 2>&1 && echo "✓ snscrape installed" || echo "✗ snscrape missing - run: pip install snscrape"
echo ""

# Step 2: Clean previous build
echo -e "${YELLOW}Step 2: Cleaning previous build...${NC}"
rm -rf build/
echo "✓ Build directory cleaned"
echo ""

# Step 3: Run pipeline (skip Twitter to avoid rate limits)
echo -e "${YELLOW}Step 3: Running SWARM Orchestrator pipeline...${NC}"
python3 src/orchestrator.py --skip-twitter --project-dir src/swarm_orchestrator
echo ""

# Step 4: Display results
echo -e "${YELLOW}Step 4: Displaying results...${NC}"
echo ""

if [ -d "build" ]; then
    echo -e "${GREEN}✓ Build directory created successfully!${NC}"
    echo ""
    
    echo "📊 Output files:"
    ls -lh build/
    echo ""
    
    # Show sample from each output
    if [ -f "build/keywords.json" ]; then
        echo -e "${BLUE}📋 Sample from keywords.json:${NC}"
        head -20 build/keywords.json
        echo "..."
        echo ""
    fi
    
    if [ -f "build/lore_riddles.md" ]; then
        echo -e "${BLUE}🧩 Sample from lore_riddles.md:${NC}"
        head -25 build/lore_riddles.md
        echo "..."
        echo ""
    fi
    
    if [ -f "build/seo_briefs.md" ]; then
        echo -e "${BLUE}📝 Sample from seo_briefs.md:${NC}"
        head -30 build/seo_briefs.md
        echo "..."
        echo ""
    fi
else
    echo -e "${RED}✗ Build directory not found - pipeline may have failed${NC}"
fi

echo ""
echo "======================================================================="
echo -e "${GREEN}✅ Demo complete!${NC}"
echo "======================================================================="
echo ""
echo "Next steps:"
echo "  1. Review outputs in build/ directory"
echo "  2. Customize feeds.opml with your RSS sources"
echo "  3. Run full pipeline: python3 src/orchestrator.py"
echo ""
