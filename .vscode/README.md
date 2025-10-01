# Visual Studio Code Setup Guide

This directory contains recommended VS Code configurations for developing WIRED CHAOS.

## 🚀 Quick Start

1. **Open the workspace in VS Code**
   ```bash
   code .
   ```

2. **Install recommended extensions**
   - VS Code will prompt you to install recommended extensions
   - Click "Install All" or install individually from the Extensions panel

3. **Restart VS Code** to activate all settings

## 📁 Configuration Files

### `extensions.json`
Defines recommended extensions for:
- **JavaScript/TypeScript/React** - ESLint, Prettier, Tailwind CSS IntelliSense
- **Python** - Pylance, Black formatter, Flake8, pytest support
- **PowerShell** - PowerShell language support
- **Git** - GitHub PR integration, GitLens
- **Docker** - Docker support for vault33-gatekeeper
- **General** - Spell checker, TODO highlighting, Markdown support

### `settings.json`
Workspace settings that configure:
- **Code formatting** - Auto-format on save with Prettier (JS/TS) and Black (Python)
- **Linting** - ESLint for JavaScript, Flake8 for Python
- **File exclusions** - Hides `node_modules`, `__pycache__`, build artifacts
- **Language-specific settings** - Tab sizes, formatters for each language
- **Python** - Virtual environment detection, type checking, testing with pytest
- **Tailwind CSS** - IntelliSense for class names in React components

### `launch.json`
Debug configurations for:
- **Frontend** - Debug React app in Chrome or Edge
- **Backend** - Debug Python servers (main, brain assistant, cert API, HRM/VRG)
- **Vault33 Gatekeeper** - Debug API server, Discord bot, Telegram bot
- **Testing** - Run Python tests in debug mode
- **Compound** - Launch multiple services simultaneously

**Usage:** Press `F5` or select a configuration from the Debug panel

### `tasks.json`
Automated tasks for:
- **Frontend** - Install, start dev server, build, test, lint
- **Backend** - Install, start server, format, lint, test
- **Vault33 Gatekeeper** - Install, start services, Docker operations
- **PowerShell** - Run automation scripts
- **Utilities** - Install all dependencies, build/test/lint all projects

**Usage:** 
- Press `Ctrl+Shift+B` for default build task
- Press `Ctrl+Shift+P` → "Tasks: Run Task" to select any task

## 🎯 Common Workflows

### Starting Development

1. **Install all dependencies:**
   ```
   Ctrl+Shift+P → Tasks: Run Task → install:all-dependencies
   ```

2. **Start frontend dev server:**
   ```
   Ctrl+Shift+P → Tasks: Run Task → frontend:start
   ```
   Or press `F5` and select "Frontend: Chrome Debug"

3. **Start backend server:**
   ```
   Ctrl+Shift+P → Tasks: Run Task → backend:start
   ```
   Or press `F5` and select "Backend: Main Server"

### Full Stack Debugging

1. Press `F5`
2. Select "Full Stack: Frontend + Backend" from the dropdown
3. This launches both Chrome debugger and Python backend debugger

### Running Tests

- **All tests:** `Ctrl+Shift+P` → "Tasks: Run Task" → "test:all"
- **Current Python test:** Press `F5` → "Python: Current Test File"
- **Frontend tests:** `Ctrl+Shift+P` → "Tasks: Run Task" → "frontend:test"

### Code Formatting

- **Auto-format on save** - Already enabled in settings.json
- **Manual format all:** `Ctrl+Shift+P` → "Tasks: Run Task" → "format:all"
- **Frontend only:** `Ctrl+Shift+P` → "Tasks: Run Task" → "frontend:lint-fix"
- **Backend only:** `Ctrl+Shift+P` → "Tasks: Run Task" → "backend:format"

### Linting

- **Lint all:** `Ctrl+Shift+P` → "Tasks: Run Task" → "lint:all"
- **Frontend:** `Ctrl+Shift+P` → "Tasks: Run Task" → "frontend:lint"
- **Backend:** `Ctrl+Shift+P` → "Tasks: Run Task" → "backend:lint"

## 🔧 Customization

### Personal Settings

User-specific settings should go in your User Settings (not this workspace):
- `Ctrl+,` → Search for a setting → Change it
- These won't be committed to the repository

### Workspace Settings Override

To override a workspace setting locally:
1. Create `.vscode/settings.local.json` (this file is gitignored)
2. Add your overrides there

### Adding Custom Tasks

You can add project-specific tasks:
1. Edit `.vscode/tasks.json`
2. Add your task under the appropriate section
3. Commit if it's useful for the team, or keep it local

## 🐍 Python Development

### Virtual Environment

The workspace is configured to use `.venv/bin/python` as the default interpreter.

**Create a virtual environment:**
```bash
# At workspace root
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# Unix/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
pip install -r vault33-gatekeeper/requirements.txt
```

### Python Tools

- **Black** - Code formatter (line length 88)
- **isort** - Import sorting (configured for Black compatibility)
- **Flake8** - Linting
- **Pylance** - Type checking and IntelliSense
- **pytest** - Testing framework

## ⚛️ React/Frontend Development

### Node.js Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Start dev server
yarn start
```

### Frontend Tools

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS** - IntelliSense for utility classes
- **React** - Snippets and IntelliSense

## 🤖 Vault33 Gatekeeper

### Docker Development

```bash
cd vault33-gatekeeper

# Build and start with Docker Compose
docker-compose up --build
```

Or use VS Code tasks:
- `gatekeeper:docker-build`
- `gatekeeper:docker-up`

### Running Individual Services

- API Server: `F5` → "Gatekeeper: API Server"
- Discord Bot: `F5` → "Gatekeeper: Discord Bot"  
- Telegram Bot: `F5` → "Gatekeeper: Telegram Bot"

## 💡 Tips

1. **Multi-root Workspace** - If you primarily work on one component (frontend/backend/gatekeeper), you can open just that folder for faster performance.

2. **Integrated Terminal** - Use the built-in terminal (`Ctrl+``) which automatically uses the workspace settings.

3. **IntelliSense** - Hover over any function, variable, or import to see documentation and type information.

4. **Go to Definition** - `F12` on any symbol to jump to its definition, or `Ctrl+Click`.

5. **Find All References** - `Shift+F12` to find all usages of a symbol.

6. **Search Across Files** - `Ctrl+Shift+F` to search the entire workspace (excludes node_modules and build artifacts).

7. **Problems Panel** - `Ctrl+Shift+M` to see all linting errors and warnings across the workspace.

## 🆘 Troubleshooting

### Extensions Not Installing

1. Open Extensions panel (`Ctrl+Shift+X`)
2. Search for "@recommended"
3. Click "Install Workspace Recommended Extensions"

### Python Interpreter Not Found

1. `Ctrl+Shift+P` → "Python: Select Interpreter"
2. Choose your `.venv/bin/python` or system Python

### ESLint Not Working in Frontend

1. Make sure you're in the frontend directory or workspace root
2. Check that `node_modules` is installed: `cd frontend && yarn install`
3. Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"

### Tasks Failing

- Make sure all dependencies are installed (Node.js, Python, yarn)
- Check the task's working directory in `tasks.json`
- Run the command manually in the terminal to see detailed errors

## 📚 Additional Resources

- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [VS Code Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [Python in VS Code](https://code.visualstudio.com/docs/languages/python)
- [JavaScript in VS Code](https://code.visualstudio.com/docs/languages/javascript)

---

**Need help?** Check the [main README](../README.md) or open an issue on GitHub.
