# SWARM Grant Bot - Deployment Guide

## Deployment Options

### 1. Local Development

For testing and development:

```bash
cd grants-bot
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python server.py
```

Access at: `http://localhost:8001`

---

### 2. Production Server (VPS/Cloud)

#### Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Python 3.9+
- 2GB RAM minimum
- Port 8001 open (or configure custom port)

#### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos/grants-bot

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
nano .env  # Edit configuration

# 5. Test server
python server.py
```

#### Run as Service (systemd)

Create `/etc/systemd/system/grants-bot.service`:

```ini
[Unit]
Description=SWARM Grant Bot API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/wired-chaos/grants-bot
Environment="PATH=/home/ubuntu/wired-chaos/grants-bot/venv/bin"
ExecStart=/home/ubuntu/wired-chaos/grants-bot/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable grants-bot
sudo systemctl start grants-bot
sudo systemctl status grants-bot
```

View logs:

```bash
sudo journalctl -u grants-bot -f
```

---

### 3. Docker Deployment

#### Dockerfile

Create `grants-bot/Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8001

# Run server
CMD ["python", "server.py"]
```

#### Build and Run

```bash
cd grants-bot

# Build image
docker build -t grants-bot:latest .

# Run container
docker run -d \
  --name grants-bot \
  -p 8001:8001 \
  -e OPENAI_API_KEY=your_key \
  -e ORG_TAGS=web3,women,tech \
  grants-bot:latest

# View logs
docker logs -f grants-bot
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  grants-bot:
    build: ./grants-bot
    ports:
      - "8001:8001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ORG_TAGS=web3,women,woman-owned,tech,nonprofit
      - SWARM_RSS_FEED_URL=https://twitter.com/swarm/rss
      - DISCOVERY_INTERVAL_HOURS=24
      - TEST_MODE=false
    restart: unless-stopped
    volumes:
      - ./grants-bot/.env:/app/.env
```

Run:

```bash
docker-compose up -d
```

---

### 4. Cloudflare Workers (Backend)

For serverless deployment alongside existing Wired Chaos infrastructure:

#### Option A: Deploy as Python Worker

Use Cloudflare's Python Workers (beta):

```bash
cd grants-bot
wrangler deploy
```

Configure `wrangler.toml`:

```toml
name = "grants-bot"
main = "server.py"
compatibility_date = "2024-01-01"

[env.production]
vars = { API_HOST = "0.0.0.0", API_PORT = 8001 }
```

#### Option B: Proxy via Existing Worker

Add to `src/index.js`:

```javascript
// Grant Bot proxy
if (url.pathname.startsWith('/api/grants/')) {
  const grantsApiUrl = env.GRANTS_BOT_API_URL || 'https://grants-bot.example.com';
  const proxyUrl = grantsApiUrl + url.pathname + url.search;
  
  return fetch(proxyUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
}
```

---

### 5. Integration with Existing Backend

Add to `backend/server.py`:

```python
from grants_bot import GrantBot

# Initialize grant bot
grant_bot = GrantBot(tenant_id="wired-chaos")

@app.get("/api/grants/discover")
async def discover_grants():
    """Proxy to grant bot"""
    grants = await grant_bot.discover_grants()
    return {"grants": grants}

@app.get("/api/grants/eligible")
async def get_eligible_grants():
    """Get eligible grants"""
    grants = await grant_bot.discover_grants(use_cache=True)
    eligible = await grant_bot.filter_eligible(grants)
    prioritized = await grant_bot.prioritize_grants(eligible)
    return {"grants": prioritized}
```

---

## Environment Configuration

### Production Environment Variables

```env
# Required
ORG_TAGS=web3,women,woman-owned,tech,nonprofit,blockchain,ai
ORG_LEGAL_STRUCTURE=LLC
ORG_LOCATION=United States

# API Keys
OPENAI_API_KEY=sk-proj-...
GAMMA_API_KEY=your_gamma_key

# Sources
SWARM_RSS_FEED_URL=https://twitter.com/swarm/rss
GRANT_RSS_FEEDS=https://example.com/feed1.rss,https://example.com/feed2.rss

# Automation
DISCOVERY_INTERVAL_HOURS=24
AUTO_SUBMIT_ENABLED=false
NOTIFICATION_EMAIL=team@wiredchaos.xyz
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# API Settings
API_HOST=0.0.0.0
API_PORT=8001
CORS_ORIGINS=https://wired-chaos.pages.dev,https://www.wiredchaos.xyz

# Security
JWT_SECRET=your_secure_secret_here

# Development
DEBUG=false
LOG_LEVEL=INFO
TEST_MODE=false
```

---

## Monitoring & Maintenance

### Health Checks

```bash
curl http://localhost:8001/api/health
```

### Logs

```bash
# Systemd
sudo journalctl -u grants-bot -f

# Docker
docker logs -f grants-bot

# Direct
tail -f /var/log/grants-bot/app.log
```

### Metrics

Use `/api/stats` endpoint for monitoring:

```bash
curl http://localhost:8001/api/stats | jq
```

### Backup

Backup configuration and cache:

```bash
# Backup .env
cp .env .env.backup

# Backup cached data (if using file storage)
tar -czf grants-bot-backup.tar.gz .env cache/
```

---

## Security Considerations

### 1. API Authentication

Implement JWT authentication:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

@app.get("/api/grants/discover")
async def discover_grants(token: str = Depends(security)):
    # Verify JWT token
    if not verify_jwt(token):
        raise HTTPException(status_code=401)
    ...
```

### 2. Rate Limiting

Add rate limiting middleware:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/grants/discover")
@limiter.limit("10/minute")
async def discover_grants(request: Request):
    ...
```

### 3. HTTPS

Use reverse proxy (nginx) with SSL:

```nginx
server {
    listen 443 ssl;
    server_name grants-bot.wiredchaos.xyz;

    ssl_certificate /etc/letsencrypt/live/grants-bot.wiredchaos.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grants-bot.wiredchaos.xyz/privkey.pem;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Secrets Management

Use environment-specific secrets:

```bash
# Development
export OPENAI_API_KEY=sk-dev-...

# Production (via systemd)
Environment="OPENAI_API_KEY=sk-prod-..."

# Docker secrets
docker secret create openai_key openai_key.txt
```

---

## Scaling

### Horizontal Scaling

Run multiple instances behind load balancer:

```nginx
upstream grants_bot {
    server 10.0.1.1:8001;
    server 10.0.1.2:8001;
    server 10.0.1.3:8001;
}

server {
    location / {
        proxy_pass http://grants_bot;
    }
}
```

### Caching

Use Redis for shared cache:

```python
import redis

redis_client = redis.Redis(host='localhost', port=6379)

@app.get("/api/grants/discover")
async def discover_grants():
    # Check cache
    cached = redis_client.get('grants:latest')
    if cached:
        return json.loads(cached)
    
    # Fetch and cache
    grants = await bot.discover_grants()
    redis_client.setex('grants:latest', 3600, json.dumps(grants))
    return grants
```

---

## Troubleshooting

### Issue: Server won't start

Check logs for errors:
```bash
python server.py
```

Common issues:
- Port 8001 already in use: Change `API_PORT` in `.env`
- Missing dependencies: `pip install -r requirements.txt`
- Invalid configuration: Check `.env` syntax

### Issue: No grants discovered

Check source configuration:
```python
from grants_bot import GrantBot
bot = GrantBot()
print(bot.source_manager.get_source_stats())
```

### Issue: High memory usage

Reduce cache size or implement pagination for large grant lists.

---

## Support

- Documentation: `/grants-bot/docs/`
- Issues: https://github.com/wiredchaos/wired-chaos/issues
- Email: support@wiredchaos.xyz
