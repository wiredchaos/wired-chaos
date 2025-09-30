# WIRED CHAOS

A full-stack Web3 application featuring NFT certificates, AI brain assistant, and multi-chain blockchain integration.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **yarn**
- **Python** 3.11+
- **Git**
- **Visual Studio Code** (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/wiredchaos/wired-chaos.git
cd wired-chaos

# Install frontend dependencies
cd frontend
yarn install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Install vault33-gatekeeper dependencies (optional)
cd ../vault33-gatekeeper
pip install -r requirements.txt
```

### Running the Application

#### Frontend (React)
```bash
cd frontend
yarn start
# Access at http://localhost:3000
```

#### Backend (FastAPI)
```bash
cd backend
python server.py
# Access at http://localhost:8080
```

## 🛠️ Development with Visual Studio Code

This repository includes comprehensive VS Code configurations for an optimal development experience.

### Setup

1. **Open in VS Code:**
   ```bash
   code .
   ```

2. **Install Recommended Extensions:**
   - VS Code will prompt to install recommended extensions
   - Click "Install All" or review individually in the Extensions panel

3. **Restart VS Code** to activate all settings

### Features

- **IntelliSense** for JavaScript/TypeScript, Python, and PowerShell
- **Debugging configurations** for all services (Frontend, Backend, Vault33 Gatekeeper)
- **Automated tasks** for building, testing, and linting
- **Code formatting** on save (Prettier for JS/TS, Black for Python)
- **Integrated linting** (ESLint, Flake8)
- **Multi-language support** with optimized settings for each tech stack

📚 **[Complete VS Code Guide](.vscode/README.md)** - Detailed documentation on debugging, tasks, and workflows

## 📦 Project Structure

```
wired-chaos/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── cert/          # Certificate integrations
│   │   └── ...
│   └── package.json
├── backend/               # FastAPI backend services
│   ├── server.py          # Main API server
│   ├── brain_assistant_api.py
│   ├── cert_api.py
│   ├── hrm_vrg_system.py
│   └── requirements.txt
├── vault33-gatekeeper/    # Discord/Telegram bot system
│   ├── api/               # REST API
│   ├── bots/              # Bot implementations
│   └── shared/            # Shared utilities
├── .vscode/               # VS Code workspace configuration
│   ├── extensions.json    # Recommended extensions
│   ├── settings.json      # Workspace settings
│   ├── launch.json        # Debug configurations
│   ├── tasks.json         # Build tasks
│   └── README.md          # VS Code setup guide
└── ...
```

## 🎯 Key Features

- **NFT Certificate Minting** - Multi-chain support (Ethereum, Solana, XRPL, Dogecoin, Hedera)
- **AI Brain Assistant** - 3D interactive AI helper
- **Cloudflare Integration** - Pages and Workers deployment
- **Automation Scripts** - PowerShell automation for deployment
- **Vault33 Gatekeeper** - Discord and Telegram bot for community management
- **Web3 Integration** - Blockchain interactions and wallet connectivity

## 🧪 Testing

```bash
# Frontend tests
cd frontend
yarn test

# Backend tests
cd backend
pytest tests/ -v

# Or use VS Code tasks:
# Ctrl+Shift+P → Tasks: Run Task → test:all
```

## 🎨 Code Formatting & Linting

Code formatting happens automatically on save when using VS Code. To manually format:

```bash
# Frontend
cd frontend
npx eslint src/ --fix

# Backend
cd backend
black .
isort .
flake8 .

# Or use VS Code task:
# Ctrl+Shift+P → Tasks: Run Task → format:all
```

## 🔧 Available Scripts

### Frontend (in `frontend/` directory)
- `yarn start` - Start development server
- `yarn build` - Build for production
- `yarn test` - Run tests

### Backend (in `backend/` directory)
- `python server.py` - Start FastAPI server
- `black .` - Format Python code
- `pytest tests/` - Run tests

### Automation Scripts (Windows)
- `LAUNCH_VS_STUDIO_BOT.bat` - Run VS Studio Bot automation
- `AUTO_RUN.bat` - Quick deployment automation
- `setup-wired-chaos.ps1` - Complete setup automation

## 📚 Documentation

- [VS Code Setup Guide](.vscode/README.md) - Complete VS Code configuration documentation
- [Automation Guide](AUTOMATION.md) - PR automation and workflow triggers
- [Security Analysis](SECURITY_ANALYSIS.md) - Security audit and recommendations
- [VS Studio Bot](VS_STUDIO_BOT_README.md) - Automated deployment setup
- [Integration Setup](INTEGRATION_SETUP.md) - Third-party integration configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Use VS Code's integrated tools for formatting and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🔐 Security

See [SECURITY.md](SECURITY.md) for security policies and vulnerability reporting.

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/wiredchaos/wired-chaos/issues)
- **Documentation**: Check the docs in each directory
- **VS Code Help**: See [.vscode/README.md](.vscode/README.md)

---

**Made with ❤️ by the WIRED CHAOS Team**

