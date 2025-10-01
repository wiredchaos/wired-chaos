# 🤖 SWARM Grant Bot - Next-Generation Grant Automation

> Auto-discover, match, draft, submit, and monitor grants with full-cycle automation and multi-tenant white-label support.

## 🎯 Features

### 1. **Auto-Discovery & Ingestion**
- RSS feed auto-discovery and parsing
- API integration for grant databases (Web2, Web3, Women in Tech, Nonprofit)
- X SWARM RSS FEED integration for Web3 grants
- Public directory scanning for new opportunities

### 2. **NLP-Based Eligibility Matching**
- Intelligent filtering based on organization profile
- Tag-based matching (web3, women, woman-owned, tech, nonprofit)
- Grant prioritization algorithm
- Automated eligibility assessment

### 3. **Full-Cycle Automation**
- Auto-draft grant applications using LLM/template-based writing
- Automated submission (API or document output)
- Status monitoring (portal, webhook, email scraping)
- Blockchain logging for audit and compliance

### 4. **Gamma Integration**
- Auto-generate tailored pitch decks
- Executive summary creation
- Attachment management for submissions
- Professional presentation output

### 5. **White-Label & Multi-Tenant**
- Per-tenant dashboards and configurations
- Custom branding and domains
- SSO integration support
- API integration framework
- Configurable grant sources per tenant

### 6. **Educational Course Module**
- `/university/edu/grants-for-founders` learning path
- Modular lessons: basics, eligibility, discovery, writing, submission, monitoring
- Case studies and real-world examples
- Upsell CTAs for 1:1 strategy, SWARM automation, enterprise WL solution

## 📁 Project Structure

```
grants-bot/
├── README.md                   # This file
├── config.py                   # Configuration management
├── requirements.txt            # Python dependencies
├── .env.example               # Environment template
├── sources/                    # Grant source discovery
│   ├── __init__.py
│   ├── rss_discovery.py       # RSS feed ingestion
│   ├── api_integrations.py    # API connectors
│   ├── swarm_feed.py          # X SWARM RSS FEED integration
│   └── source_manager.py      # Source configuration
├── nlp/                        # Eligibility matching
│   ├── __init__.py
│   ├── profile_matcher.py     # Organization profile matching
│   ├── eligibility_filter.py  # NLP-based filtering
│   └── prioritization.py      # Grant prioritization
├── automation/                 # Application automation
│   ├── __init__.py
│   ├── application_drafter.py # LLM/template-based drafting
│   ├── submission_handler.py  # Submission automation
│   ├── status_monitor.py      # Status tracking
│   └── blockchain_logger.py   # Audit trail logging
├── gamma/                      # Gamma integration
│   ├── __init__.py
│   ├── pitch_generator.py     # Pitch deck creation
│   └── executive_summary.py   # Executive summary
├── tenant/                     # Multi-tenant support
│   ├── __init__.py
│   ├── dashboard.py           # Dashboard scaffold
│   ├── config_manager.py      # Tenant configuration
│   └── auth.py                # SSO framework
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── test_sources.py
│   ├── test_nlp.py
│   ├── test_automation.py
│   └── test_gamma.py
└── docs/                       # Documentation
    ├── SETUP.md
    ├── API.md
    └── DEPLOYMENT.md
```

## 🚀 Quick Start

### Installation

```bash
cd grants-bot
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

### Basic Usage

```python
from grants_bot import GrantBot

# Initialize bot
bot = GrantBot(tenant_id="wired-chaos")

# Discover grants
grants = await bot.discover_grants()

# Filter for eligibility
eligible = await bot.filter_eligible(grants)

# Draft application
application = await bot.draft_application(grant_id="GRANT-001")

# Submit
result = await bot.submit_application(application)
```

## 🎓 Educational Module

Access the course at `/university/edu/grants-for-founders`:

- **Module 1**: Grant Basics & Fundamentals
- **Module 2**: Eligibility Assessment
- **Module 3**: Grant Discovery Strategies
- **Module 4**: Application Writing
- **Module 5**: Submission Best Practices
- **Module 6**: Status Monitoring & Follow-up
- **Module 7**: Case Studies & Success Stories

## 🔧 Configuration

### Environment Variables

```env
# Grant Sources
SWARM_RSS_FEED_URL=https://x.com/swarm/rss
GRANTS_API_KEYS={"web3": "key1", "women_tech": "key2"}

# NLP & LLM
OPENAI_API_KEY=sk-...
NLP_MODEL=gpt-4

# Blockchain
BLOCKCHAIN_NETWORK=ethereum
BLOCKCHAIN_RPC_URL=https://...

# Gamma
GAMMA_API_KEY=...

# Multi-tenant
TENANT_DATABASE_URL=mongodb://...
```

## 📊 API Endpoints

### Discovery
- `GET /api/grants/discover` - Discover new grants
- `GET /api/grants/sources` - List configured sources

### Matching
- `POST /api/grants/match` - Match grants to organization profile
- `GET /api/grants/eligible` - Get eligible grants

### Automation
- `POST /api/grants/draft` - Draft application
- `POST /api/grants/submit` - Submit application
- `GET /api/grants/status/:id` - Check application status

### Education
- `GET /university/edu/grants-for-founders` - Course home
- `GET /university/edu/grants-for-founders/module/:id` - Specific module

## 🔐 Security & Compliance

- All actions logged to blockchain for audit trail
- Encrypted credential storage
- Role-based access control (RBAC)
- SOC 2 compliant data handling

## 📈 Roadmap

- [x] Core infrastructure setup
- [ ] RSS feed discovery (MVP)
- [ ] NLP eligibility matching (MVP)
- [ ] Application drafting stub
- [ ] Gamma pitch generation stub
- [ ] Dashboard scaffold
- [ ] Educational course structure
- [ ] Full automation pipeline
- [ ] Multi-tenant white-label system

## 🤝 Contributing

See main repository [CONTRIBUTING.md](../CONTRIBUTING.md)

## 📝 License

MIT License - See [LICENSE](../LICENSE)

---

**Built with** ❤️ **by the WIRED CHAOS team**

**Part of the WIRED CHAOS ecosystem** - Web3 • AI • Automation • Education
