# 🤖 SWARM Bot - Deployment Blocker Automation

Intelligent automation system for monitoring deployment health and automatically resolving common issues.

## Quick Start

### Run Demo

```bash
node swarm-bot/demo.js
```

### Run Monitoring

```bash
node swarm-bot/workflows/monitor.js
```

### Use as Library

```javascript
const SwarmBot = require('./swarm-bot/src/swarm-bot');
const config = require('./swarm-bot/config/monitoring-config');

const bot = new SwarmBot(config);
await bot.start();
```

## Features

- 🔍 **Automated Monitoring**: Endpoints, builds, dependencies, performance
- 🔧 **Auto-Resolution**: Safe, non-breaking fixes with guardrails
- 📢 **Escalation**: GitHub issues, Discord alerts, email notifications
- 🤝 **Integration**: Works seamlessly with Health Triage Bot
- 📊 **Reporting**: Comprehensive diagnostic reports

## Documentation

- [Complete Documentation](docs/SWARM_BOT_README.md)
- [Integration Guide](docs/INTEGRATION_GUIDE.md)

## Configuration

Create `.env` with:

```bash
GITHUB_TOKEN=your_token
DISCORD_WEBHOOK_URL=your_webhook
SWARM_DRY_RUN=false
```

See [monitoring-config.js](config/monitoring-config.js) for full configuration.

## Project Structure

```
swarm-bot/
├── src/
│   ├── monitors/         # Health monitoring
│   ├── resolvers/        # Auto-resolution
│   ├── escalation/       # Alerting & reporting
│   └── swarm-bot.js     # Main orchestrator
├── config/              # Configuration
├── workflows/           # GitHub Actions scripts
├── docs/               # Documentation
└── tests/              # Tests
```

## License

MIT
