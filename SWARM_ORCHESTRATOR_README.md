# WIRED CHAOS SWARM Orchestrator 🚀

> Transform raw inputs (project files, RSS feeds, X/Twitter mentions) into structured, SEO-optimized content and 589-coded riddles.

## 🎯 Overview

The WIRED CHAOS SWARM Orchestrator is an automated pipeline that processes multiple data sources to generate:
- **Keyword maps** with weighted clusters
- **SEO-optimized briefs** for pages, blogs, and threads
- **589-coded riddles** for WIRED CHAOS lore
- **RSS feed digests** from OPML sources
- **X/Twitter mention analysis** (without API keys)

## 📁 Project Structure

```
wired-chaos/
├── src/
│   ├── orchestrator.py              # Main pipeline script
│   └── swarm_orchestrator/
│       ├── __init__.py
│       ├── project_scanner.py       # Scans project files
│       ├── rss_fetcher.py          # Fetches RSS feeds via OPML
│       ├── x_scraper.py            # Scrapes X/Twitter (no API)
│       ├── keyword_extractor.py    # TF-IDF & RAKE algorithms
│       ├── seo_generator.py        # SEO brief generation
│       └── riddle_generator.py     # 589-coded riddles
├── build/                           # Output directory
│   ├── keywords.json               # Weighted keywords & clusters
│   ├── rss_digest.json             # Summarized feed items
│   ├── x_mentions.json             # Top posts & themes
│   ├── seo_briefs.md               # SEO content outlines
│   └── lore_riddles.md             # 589-coded riddles
├── contracts/                       # Smart contracts
├── cloudflare/                      # Cloudflare configurations
├── wix-snippets/                    # Wix integration code
├── notion/                          # Notion templates
├── stripe/                          # Stripe configurations
├── docs/                            # Documentation
├── feeds.opml                       # RSS feed sources (OPML)
├── stopwords.txt                    # Keyword filtering
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/wiredchaos/wired-chaos.git
   cd wired-chaos
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your preferences
   ```

### Running the Pipeline

#### Basic Usage

```bash
python src/orchestrator.py
```

This will:
- Scan the current project directory
- Fetch RSS feeds from `feeds.opml`
- Scrape X/Twitter mentions for "wiredchaos"
- Generate all outputs in the `build/` directory

#### Advanced Usage

```bash
# Scan a specific project directory
python src/orchestrator.py --project-dir /path/to/project

# Use custom OPML file
python src/orchestrator.py --opml-file custom-feeds.opml

# Custom X/Twitter query
python src/orchestrator.py --x-query "web3 OR blockchain"

# Specify output directory
python src/orchestrator.py --build-dir output

# Skip specific steps
python src/orchestrator.py --skip-project  # Skip project scanning
python src/orchestrator.py --skip-rss      # Skip RSS feeds
python src/orchestrator.py --skip-twitter  # Skip X/Twitter
```

#### Help

```bash
python src/orchestrator.py --help
```

## 📊 Output Files

### 1. `build/keywords.json`

Weighted keywords organized into clusters:

```json
{
  "generated_at": "2024-01-01T00:00:00Z",
  "clusters": [
    {
      "cluster_id": 1,
      "keywords": [
        {"term": "blockchain", "weight": 0.856},
        {"term": "web3", "weight": 0.743}
      ]
    }
  ]
}
```

### 2. `build/rss_digest.json`

Summarized RSS feed items:

```json
[
  {
    "feed": "TechCrunch",
    "title": "Article Title",
    "link": "https://...",
    "published": "2024-01-01",
    "summary": "Article summary..."
  }
]
```

### 3. `build/x_mentions.json`

Top X/Twitter posts and themes:

```json
{
  "stats": {
    "total_tweets": 50,
    "unique_users": 25,
    "total_likes": 1234,
    "total_retweets": 567
  },
  "top_posts": [...],
  "themes": ["web3", "nft", "crypto"]
}
```

### 4. `build/seo_briefs.md`

SEO-optimized content outlines:

```markdown
# SEO Brief - PAGE

## Primary Keywords
1. **blockchain** (weight: 0.856)
2. **web3** (weight: 0.743)

## Content Outline
### Hero Section
- Headline incorporating primary keyword
...
```

### 5. `build/lore_riddles.md`

589-coded riddles for WIRED CHAOS lore:

```markdown
# WIRED CHAOS - 589-Coded Lore Riddles

## Riddle #1 - Expert
**Riddle:**
> Where nexus meets chaos, the key awaits the worthy.

**589-Encoded Answer:** `955-89-895-895-859`
...
```

## 🔧 Configuration

### Environment Variables

Edit `.env` to customize pipeline behavior:

```bash
# Project Configuration
PROJECT_DIR=.
BUILD_DIR=build

# RSS Configuration
OPML_FILE=feeds.opml
MAX_RSS_ITEMS=10

# X/Twitter Configuration
X_QUERY=wiredchaos OR @wiredchaos
MAX_TWEETS=50
DAYS_BACK=7

# Keyword Extraction
STOPWORDS_FILE=stopwords.txt
TOP_KEYWORDS=50
```

### Customizing RSS Feeds

The default `feeds.opml` file contains placeholder feeds that won't cause network issues:

```xml
<outline type="rss" 
         text="Feed Name" 
         xmlUrl="https://example.com/feed.xml" 
         htmlUrl="https://example.com/"/>
```

**For local testing (no external dependencies):**
- Use the default `feeds.opml` with placeholder URLs
- The pipeline will gracefully handle feeds that don't load
- No network access required for testing

**For production use with real RSS feeds:**
1. Copy `feeds.opml.example` to create your custom configuration:
   ```bash
   cp feeds.opml.example my-feeds.opml
   ```

2. Edit the file to add your RSS feed URLs

3. Run with your custom file:
   ```bash
   python src/orchestrator.py --opml-file my-feeds.opml
   ```

**Note:** Some RSS feeds may be blocked by firewalls or require special network access. The pipeline will continue to work and skip any feeds that fail to load.

### Customizing Stopwords

Edit `stopwords.txt` to add words to filter from keyword extraction:

```
the
and
your
custom
words
```

## 🎨 Features

### 1. Project File Scanner
- Scans source files (Python, JavaScript, Solidity, Markdown, etc.)
- Ignores build artifacts and dependencies
- Extracts content for keyword analysis

### 2. RSS Feed Fetcher
- Parses OPML files for feed URLs
- Fetches and summarizes latest items
- Supports multiple feed formats

### 3. X/Twitter Scraper
- **No API keys required** - uses `snscrape`
- Scrapes public mentions and hashtags
- Extracts top posts by engagement
- Identifies trending themes

### 4. Keyword Extraction
- **TF-IDF** algorithm for term importance
- **RAKE** (Rapid Automatic Keyword Extraction)
- Generates weighted keyword clusters
- Filters common stopwords

### 5. SEO Brief Generator
- Creates content outlines for pages, blogs, threads
- Incorporates top keywords naturally
- Follows WIRED CHAOS brand voice
- Includes optimization tips

### 6. 589-Coded Riddle Generator
- Generates lore-based riddles
- Encodes answers using 589 cipher
- Difficulty levels: Easy, Medium, Hard, Expert
- Includes hints for seekers

## 🛠️ Development

### Project Modules

```python
# Import orchestrator modules
from swarm_orchestrator.project_scanner import scan_project_files
from swarm_orchestrator.rss_fetcher import fetch_rss_feeds
from swarm_orchestrator.x_scraper import scrape_x_mentions
from swarm_orchestrator.keyword_extractor import KeywordExtractor
from swarm_orchestrator.seo_generator import generate_seo_brief
from swarm_orchestrator.riddle_generator import generate_riddle_collection
```

### Running Individual Components

```python
# Scan project files
from swarm_orchestrator.project_scanner import scan_project_files
data = scan_project_files('.')

# Fetch RSS feeds
from swarm_orchestrator.rss_fetcher import fetch_rss_feeds
feeds = fetch_rss_feeds('feeds.opml')

# Extract keywords
from swarm_orchestrator.keyword_extractor import KeywordExtractor
extractor = KeywordExtractor()
keywords = extractor.extract_tfidf(['document1', 'document2'])
```

### Testing

```bash
# Test with minimal data
python src/orchestrator.py --max-tweets 10 --skip-project

# Test specific components
python -c "from swarm_orchestrator.riddle_generator import generate_riddle; print(generate_riddle())"
```

## 📚 Technical Details

### Algorithms Used

1. **TF-IDF (Term Frequency-Inverse Document Frequency)**
   - Measures keyword importance across documents
   - Formula: TF-IDF = TF × log(N / DF)

2. **RAKE (Rapid Automatic Keyword Extraction)**
   - Extracts multi-word phrases
   - Calculates word scores based on degree/frequency

3. **589 Cipher**
   - Custom encoding for WIRED CHAOS lore
   - Maps characters to numeric sequences
   - Used for riddle answers

### Dependencies

- **feedparser** (6.0.11): RSS/Atom feed parsing
- **snscrape** (0.7.0): X/Twitter scraping without API

## 🌟 WIRED CHAOS Integration

### Brand Voice
- **Tone**: Bold, innovative, cyberpunk-inspired
- **Style**: Technical yet accessible
- **Colors**: Neon cyan (#00FFFF), electric green (#39FF14), crimson (#FF3131)
- **Themes**: Web3, AI, AR/VR, decentralization

### Lore Elements
- **Vault33**: Central lore location
- **Merovingian**: Guardian figure
- **Sangréal**: Sacred artifact
- **589 Encoding**: Cipher system for secrets
- **Ember**: Guiding light/element

## 🔗 Related Projects

- **Frontend**: React application with AR/VR
- **Backend**: FastAPI server (`backend/server.py`)
- **Vault33 Gatekeeper**: Security and gamification
- **Cloudflare Workers**: Edge computing
- **Smart Contracts**: Multi-chain NFT certificates

## 🐛 Troubleshooting

### Common Issues

**snscrape not found:**
```bash
pip install snscrape
```

**OPML file not found:**
```bash
# Create or specify OPML file
python src/orchestrator.py --opml-file path/to/feeds.opml
# Or skip RSS processing
python src/orchestrator.py --skip-rss
```

**No output generated:**
- Check that input sources exist (project files, OPML, etc.)
- Run with individual skip flags to isolate issues
- Check console output for specific errors

**Permission errors:**
```bash
# Ensure build directory is writable
chmod 755 build
```

## 📖 Resources

- **Repository**: https://github.com/wiredchaos/wired-chaos
- **Issues**: https://github.com/wiredchaos/wired-chaos/issues
- **OPML Specification**: http://opml.org/
- **snscrape Documentation**: https://github.com/JustAnotherArchivist/snscrape

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

Part of the WIRED CHAOS ecosystem.

---

**Built with** ❤️ **by the WIRED CHAOS team**

**Powered by**: Python • TF-IDF • RAKE • snscrape • feedparser
