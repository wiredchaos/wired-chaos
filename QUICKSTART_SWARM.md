# WIRED CHAOS SWARM Orchestrator - Quick Start Guide

## 🚀 Installation (5 minutes)

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `feedparser` - For RSS feed parsing
- `snscrape` - For X/Twitter scraping (no API keys required)

### Step 2: Verify Installation

```bash
python src/orchestrator.py --help
```

You should see the help menu with all available options.

## 🎯 Basic Usage

### Run the Full Pipeline

```bash
# Basic run (scans current directory, fetches RSS, skips Twitter)
python src/orchestrator.py --skip-twitter

# Scan a specific project directory
python src/orchestrator.py --skip-twitter --project-dir backend

# Use custom build directory
python src/orchestrator.py --skip-twitter --build-dir output
```

### Run with Twitter Scraping (Optional)

```bash
# Scrape Twitter mentions (requires snscrape)
python src/orchestrator.py --x-query "wiredchaos OR @wiredchaos"

# Limit number of tweets
python src/orchestrator.py --max-tweets 20
```

### Customize RSS Feeds

**Option 1: Use default (no external network required)**
```bash
# Uses placeholder feeds - works offline
python src/orchestrator.py --skip-twitter
```

**Option 2: Add your own feeds**
1. Create a custom OPML file with your RSS feeds:
   ```bash
   cp feeds.opml.example my-feeds.opml
   # Edit my-feeds.opml with your feed URLs
   ```

2. Run with your custom feeds:
   ```bash
   python src/orchestrator.py --opml-file my-feeds.opml
   ```

**Note:** The default `feeds.opml` uses placeholder URLs that won't cause network issues. This allows the pipeline to work without external dependencies.

## 📊 Output Files

After running, check the `build/` directory:

```bash
ls -lh build/

# View generated files
cat build/keywords.json       # Weighted keyword clusters
cat build/seo_briefs.md       # SEO content outlines
cat build/lore_riddles.md     # 589-coded riddles
cat build/rss_digest.json     # RSS feed summaries
cat build/x_mentions.json     # Twitter data (if enabled)
```

## 🔧 Configuration

### Environment Variables (Optional)

```bash
# Copy example configuration
cp .env.example .env

# Edit with your preferences
nano .env
```

### Customize Stopwords

Edit `stopwords.txt` to add words to filter from keyword extraction:

```bash
echo "custom" >> stopwords.txt
echo "filter" >> stopwords.txt
echo "words" >> stopwords.txt
```

## 📚 Examples

### Run Usage Examples

```bash
python examples.py
```

This demonstrates:
- Project file scanning
- Keyword extraction
- SEO brief generation
- Riddle generation

### Run Demo Script

```bash
./demo_swarm.sh
```

Interactive demo showing the full pipeline in action.

## 🎨 Advanced Usage

### Use Individual Components

```python
from swarm_orchestrator.keyword_extractor import KeywordExtractor

# Extract keywords
extractor = KeywordExtractor()
keywords = extractor.extract_tfidf(['document1', 'document2'])
print(keywords)
```

### Custom Pipeline

```python
from swarm_orchestrator.project_scanner import scan_project_files
from swarm_orchestrator.keyword_extractor import KeywordExtractor

# Scan your project
files = scan_project_files('.')

# Extract keywords
extractor = KeywordExtractor()
keywords = extractor.extract_rake(' '.join([f['content'] for f in files['files']]))

print(f"Found {len(keywords)} keywords")
```

## 🐛 Troubleshooting

### Dependencies Not Found

```bash
pip install feedparser snscrape
```

### Permission Errors

```bash
chmod 755 build/
chmod +x demo_swarm.sh
```

### OPML Parse Errors

Ensure your `feeds.opml` file is valid XML. Use `&amp;` instead of `&` in text attributes.

### No Keywords Generated

- Ensure input files exist (project files, RSS feeds, etc.)
- Try running with `--skip-rss --skip-twitter` to isolate the issue
- Check that input files contain actual text content

## 🔗 Next Steps

1. **Read the full documentation**: [SWARM_ORCHESTRATOR_README.md](SWARM_ORCHESTRATOR_README.md)
2. **Customize feeds.opml**: Add your favorite RSS sources
3. **Run on your project**: `python src/orchestrator.py --project-dir /path/to/project`
4. **Integrate outputs**: Use generated briefs and keywords in your content strategy

## 💡 Tips

- Use `--skip-twitter` to avoid rate limits during development
- Run on small directories first to test performance
- Generated keywords are best for content planning, not direct copy-paste
- 589 riddles are for WIRED CHAOS lore and gamification
- SEO briefs follow WIRED CHAOS brand voice (cyberpunk, innovative)

## 📞 Support

- **Issues**: https://github.com/wiredchaos/wired-chaos/issues
- **Docs**: See main README and module docstrings
- **Examples**: Run `python examples.py` for interactive demos

---

**Happy orchestrating!** 🚀
