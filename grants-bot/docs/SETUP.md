# SWARM Grant Bot - Setup Guide

## Prerequisites

- Python 3.9+
- pip package manager
- (Optional) OpenAI API key for LLM-based drafting
- (Optional) Gamma API credentials
- (Optional) Blockchain RPC access for audit logging

## Installation

### 1. Install Dependencies

```bash
cd grants-bot
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Required
ORG_TAGS=web3,women,woman-owned,tech,nonprofit

# Recommended
OPENAI_API_KEY=your_key_here
SWARM_RSS_FEED_URL=https://twitter.com/swarm/rss

# Optional
GAMMA_API_KEY=your_gamma_key
BLOCKCHAIN_RPC_URL=your_rpc_url
```

### 3. Test Installation

```bash
python -c "from grants_bot import GrantBot; print('✅ Installation successful')"
```

## Basic Usage

### Command Line

```python
import asyncio
from grants_bot import GrantBot

async def main():
    # Initialize bot
    bot = GrantBot(tenant_id="wired-chaos")
    
    # Discover grants
    print("🔍 Discovering grants...")
    grants = await bot.discover_grants()
    print(f"✅ Found {len(grants)} grants")
    
    # Filter for eligibility
    print("🎯 Filtering for eligibility...")
    eligible = await bot.filter_eligible(grants)
    print(f"✅ {len(eligible)} grants match your profile")
    
    # Prioritize
    print("📊 Prioritizing grants...")
    prioritized = await bot.prioritize_grants(eligible)
    
    # Show top 5
    print("\n🏆 Top 5 Grants:")
    for i, grant in enumerate(prioritized[:5], 1):
        print(f"{i}. {grant['title']}")
        print(f"   Score: {grant['priority_score']:.2f}")
        print(f"   Match: {grant['match_score']:.2f}")
        print()

if __name__ == "__main__":
    asyncio.run(main())
```

### Web Server (FastAPI)

```python
from fastapi import FastAPI
from grants_bot import GrantBot

app = FastAPI()
bot = GrantBot(tenant_id="wired-chaos")

@app.get("/api/grants/discover")
async def discover():
    grants = await bot.discover_grants()
    return {"grants": grants}

@app.get("/api/grants/eligible")
async def eligible():
    grants = await bot.discover_grants(use_cache=True)
    eligible = await bot.filter_eligible(grants)
    prioritized = await bot.prioritize_grants(eligible)
    return {"grants": prioritized}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

## Configuration Options

### Organization Profile

Set these in `.env` or environment variables:

```env
ORG_TAGS=web3,women,woman-owned,tech,nonprofit,blockchain,ai
ORG_LEGAL_STRUCTURE=LLC
ORG_SIZE=small
ORG_LOCATION=United States
```

### Grant Sources

#### RSS Feeds

```env
GRANT_RSS_FEEDS=https://example.com/feed1.rss,https://example.com/feed2.rss
```

#### API Keys

```env
GRANTS_API_KEYS={"grants_gov": "key123", "web3_platform": "key456"}
```

#### SWARM Feed

```env
SWARM_RSS_FEED_URL=https://twitter.com/swarm/rss
```

### Automation Settings

```env
# Auto-discovery interval (hours)
DISCOVERY_INTERVAL_HOURS=24

# Auto-submit (use with caution!)
AUTO_SUBMIT_ENABLED=false

# Notifications
NOTIFICATION_EMAIL=team@example.com
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### LLM Configuration

```env
OPENAI_API_KEY=sk-...
NLP_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
```

### Gamma Integration

```env
GAMMA_API_KEY=your_key
GAMMA_WORKSPACE_ID=workspace_id
GAMMA_PITCH_TEMPLATE_ID=template_id
```

### Blockchain Logging

```env
BLOCKCHAIN_NETWORK=ethereum
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/...
BLOCKCHAIN_PRIVATE_KEY=0x...
AUDIT_CONTRACT_ADDRESS=0x...
```

## Multi-Tenant Setup

Each tenant can have their own configuration:

```python
# Tenant 1: Wired Chaos
bot1 = GrantBot(tenant_id="wired-chaos")

# Tenant 2: Another Organization
bot2 = GrantBot(tenant_id="another-org")

# Configure tenant-specific sources
bot1.source_manager.add_rss_feed("https://wiredchaos.xyz/grants.rss")
bot2.source_manager.add_rss_feed("https://another-org.com/grants.rss")
```

## Testing

Run the test suite:

```bash
cd grants-bot
pytest tests/ -v
```

Run specific test:

```bash
pytest tests/test_sources.py -v
pytest tests/test_nlp.py -v
```

## Troubleshooting

### Issue: No grants discovered

**Solution**: Check your RSS feeds and API keys are configured correctly.

```python
bot = GrantBot(tenant_id="test")
stats = bot.source_manager.get_source_stats()
print(stats)  # Check configured sources
```

### Issue: Low match scores

**Solution**: Review and update your organization tags to better match grant opportunities.

```env
ORG_TAGS=web3,women,woman-owned,tech,nonprofit,blockchain,ai,defi,nft
```

### Issue: Application drafting fails

**Solution**: Ensure OpenAI API key is configured, or use template-based drafting:

```python
application = await bot.draft_application(grant, use_llm=False)
```

## Next Steps

1. **Customize Templates**: Edit application templates in `automation/application_drafter.py`
2. **Add Sources**: Configure additional RSS feeds and API integrations
3. **Enable Automation**: Set up scheduled discovery and submission workflows
4. **Deploy**: Use the provided FastAPI server or integrate into your existing system

## Support

- Documentation: See `/docs` directory
- Issues: GitHub Issues
- Email: support@wiredchaos.xyz
