# 🔐 VAULT33 GATEKEEPER SYSTEM

The VAULT33 Gatekeeper is a comprehensive gamification system for whitelist management, mint/burn validation, and Merovingian fragment tracking across Discord, Telegram, and webhook APIs.

## 🎯 Features

- **Multi-Platform Bots**: Discord slash commands + Telegram inline commands
- **XRPL Integration**: Transaction validation for mints and burns
- **Gamification Engine**: Points, raffle tickets, role progression
- **Merovingian Path**: Hidden 5-fragment system with obfuscated clues
- **Webhook API**: HMAC-secured endpoints for external integrations
- **MongoDB Storage**: Scalable data persistence with proper indexing

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your bot tokens and configuration
nano .env
```

### 2. Required Environment Variables

```env
# Bot Tokens (get from Discord Developer Portal & BotFather)
DISCORD_BOT_TOKEN=your_discord_bot_token_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Discord Configuration
DISCORD_GUILD_ID=your_guild_id_here
DISCORD_LOG_CHANNEL_ID=your_log_channel_id_here
DISCORD_ACCESS_ROLE_ID=your_access_role_id_here
DISCORD_PATH_SEEKER_ROLE_ID=your_path_seeker_role_id_here

# Database
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=vault33_gatekeeper

# Security
WEBHOOK_SECRET=your_super_secret_webhook_key_here

# Admin Users (comma-separated Discord IDs)
ADMIN_DISCORD_IDS=123456789012345678,987654321098765432
```

### 3. Installation & Deployment

#### Option A: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f vault33-gatekeeper

# Stop services
docker-compose down
```

#### Option B: Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Start MongoDB (if not using Docker)
mongod --dbpath ./data/db

# Run the application
python main.py
```

## 🎮 Bot Commands

### Discord Slash Commands

- `/wl-claim <tier>` - Claim whitelist spot (tier1/tier2)
- `/wl-status` - Check VAULT33 status and fragment progress
- `/mint <tier> <token_id> <tx_hash>` - Register mint transaction
- `/burn <token_id> <tx_hash>` - Register burn transaction
- `/path-hint` - Get next Merovingian fragment clue
- `/track <token_id>` - Check token burn status
- `/admin-grant-points <user> <amount> [reason]` - Admin: Grant points

### Telegram Commands

- `/start` - Welcome message and inline keyboard
- `/claimwl <tier>` - Claim whitelist
- `/status` - Check status
- `/mint <tier> <token_id> <tx_hash>` - Register mint
- `/burn <token_id> <tx_hash>` - Register burn
- `/hint` - Get fragment hint
- `/track <token_id>` - Track token
- `/help` - Command reference

## 🔥 Gamification Rules

| Action | Points | Raffle Tickets | Special Rewards |
|--------|--------|----------------|-----------------|
| WL Claim | +10 | +1 | Access Pass role |
| Mint Tier1 | +20 | +1 | Token registration |
| Mint Tier2 | +40 | +2 | Token registration |
| Burn (any) | +50 | - | Path Seeker role (24h) |
| Burn (Merovingian recipe) | +250 | - | Fragment unlock + DM |
| Referral | +15 | - | - |

## 🧩 Merovingian Fragment System

The hidden path consists of 5 fragments unlocked through specific burn recipes:

1. **Fragment 1**: "Mask found — whisper ember at second dawn"
   - Recipe: Burn token with `red_tie` trait
2. **Fragment 2**: "Chalice hides beneath the third column"
   - Recipe: Burn descendant of token `82675`
3. **Fragment 3**: "Speak 'ember-sangréal-82675' where walls listen"
   - Recipe: Burn token from vault `layer 9`
4. **Fragment 4**: "When five burnings align, the key will hum"
   - Recipe: Special alignment condition
5. **Fragment 5**: "The Sangréal loop closes under 33·3"
   - Recipe: Burn token with `frequency 33.3`

**Sangréal Key**: Unlocked when all 5 fragments are collected.

## 📡 API Endpoints

### Webhook Endpoints
- `POST /xrpl/webhook` - HMAC-secured XRPL transaction webhooks

### User Endpoints
- `GET /user/{discord_id}/status` - Get user status
- `GET /user/{discord_id}/fragments` - Get fragment progress
- `GET /token/{token_id}` - Get token information

### Admin Endpoints
- `POST /admin/grant-points` - Grant points to user
- `GET /leaderboard` - Points leaderboard

### System Endpoints
- `GET /` - API health check
- `GET /health` - Detailed health status

## 🔒 Security Features

- **HMAC Webhook Verification**: All webhooks verified with SHA256 signatures
- **Admin Authentication**: Admin commands require Discord ID verification
- **Fragment Obfuscation**: Clues stored as base64-encoded strings
- **Rate Limiting**: Built-in protection against spam (configure as needed)
- **Input Validation**: Comprehensive Pydantic model validation

## 📊 Database Schema

### Collections

- **users**: Discord/Telegram user records with points and roles
- **tokens**: Registered tokens with burn status and metadata
- **tickets**: Raffle ticket records per user
- **fragments**: Unlocked fragment records with proof transactions
- **actions**: Audit trail of all user actions

### Indexes

Optimized indexes created automatically for:
- User lookups by Discord/Telegram ID
- Token queries by ID and owner
- Fragment progress tracking
- Action history and audit trails

## 🛠️ Development

### Project Structure

```
vault33-gatekeeper/
├── main.py                 # Application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container definition
├── docker-compose.yml     # Multi-service orchestration
├── .env.example          # Environment template
├── shared/               # Shared components
│   ├── config.py         # Configuration management
│   ├── database.py       # MongoDB operations
│   ├── gamification.py   # Game logic engine
│   ├── xrpl_validator.py # XRPL transaction validation
│   └── utils.py          # Utility functions
├── bots/                 # Bot implementations
│   ├── discord_bot.py    # Discord slash commands
│   └── telegram_bot.py   # Telegram command handlers
└── api/                  # FastAPI server
    └── server.py         # Webhook and REST endpoints
```

### Adding New Features

1. **New Commands**: Add to both `discord_bot.py` and `telegram_bot.py`
2. **Gamification Rules**: Modify `gamification.py` and update config
3. **Fragment Recipes**: Update `BURN_RECIPES` in `config.py`
4. **API Endpoints**: Add to `api/server.py` with proper validation

### Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:8080/xrpl/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=YOUR_HMAC_SIGNATURE" \
  -d '{"event":"token_burned","token_id":"12345","tx":"ABC123","discord_id":123456789012345678}'

# Test user status
curl http://localhost:8080/user/123456789012345678/status
```

## 🚨 Production Deployment

### Pre-deployment Checklist

- [ ] Set strong `WEBHOOK_SECRET` 
- [ ] Configure proper Discord permissions and roles
- [ ] Set up MongoDB with authentication
- [ ] Configure firewall rules for API port
- [ ] Set up SSL/TLS termination (nginx/traefik)
- [ ] Configure log rotation and monitoring
- [ ] Test webhook signature verification
- [ ] Verify XRPL RPC endpoint connectivity

### Monitoring

Monitor the following:
- Database connection health (`/health` endpoint)
- Webhook processing success rates
- Bot command response times
- Fragment unlock frequency
- User point accumulation patterns

## 📝 License

This project is part of the WIRED CHAOS ecosystem. All rights reserved.

## 🤝 Support

For issues and questions:
1. Check the logs: `docker-compose logs vault33-gatekeeper`
2. Verify environment variables are set correctly
3. Test database connectivity
4. Check Discord/Telegram bot permissions

---

**The Vault watches... 🕯️**