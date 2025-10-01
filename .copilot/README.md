# WIRED CHAOS Copilot Configuration System

This directory contains the comprehensive configuration system that provides VS Code Copilot with complete context about the WIRED CHAOS V3 Studio Bot infrastructure.

## 📋 Overview

This configuration system enables GitHub Copilot to act as an NSA-level auto-fixer that understands the entire WIRED CHAOS ecosystem and can provide contextual assistance without requiring repeated explanations of the architecture.

## 📁 Configuration Files

### Core Configuration

- **`context.md`** - Complete project context including:
  - Core stack architecture (Cloudflare Workers, Pages, KV, R2)
  - Deployment requirements and zero-downtime principles
  - Event system and gamification patterns
  - AR/VR technical specifications
  - Coding standards and best practices

- **`autofix-patterns.md`** - Common patterns for automatic fixes:
  - JSX nesting error corrections
  - Environment variable handling (universal safe checks)
  - AR/VR CORS and MIME type configurations
  - Cloudflare Worker routing and headers
  - Build error diagnostics and resolution

- **`color-palette.md`** - Official design system:
  - Brand colors (#000000, #00FFFF, #FF3131, #39FF14, #FF00FF)
  - Usage guidelines
  - Tailwind configuration
  - Component examples

- **`ar-vr-config.md`** - AR/VR merch store specifications:
  - Model viewer integration patterns
  - Required headers for GLB/USDZ files
  - Cloudflare Pages `_headers` configuration
  - Worker MIME type overrides
  - XR permissions for iframe embeds

- **`security-patterns.md`** - NSA-level security implementation:
  - Bearer token authentication
  - CORS configuration
  - Circuit breaker patterns
  - Wallet gating systems
  - NDA digital signature integration

- **`infrastructure.md`** - Infrastructure standards:
  - Global edge deployment patterns
  - Auto-scaling configurations
  - Health monitoring endpoints
  - KV storage patterns
  - Real-time event bus implementation

## 🚀 Getting Started

### 1. VS Code Setup

The VS Code configuration is automatically loaded when you open this repository in VS Code. The settings include:

- Copilot-specific prompts with full project context
- File exclusions for better performance
- Formatter configurations (Prettier for JS, Black for Python)
- Linting settings

### 2. Using Copilot with Full Context

When you ask Copilot for help, it will have access to:

- Full stack architecture documentation
- Deployment and security requirements
- Common error patterns and fixes
- Best practices and coding standards

**Example Prompts:**

```
"Create a new Cloudflare Worker endpoint with Bearer token authentication"
"Fix JSX nesting errors in this component"
"Add AR/VR support for this 3D model component"
"Implement a circuit breaker for this API call"
"Create a health check endpoint following our standards"
```

### 3. Running Sanity Checks

Before starting development, run the sanity check script:

```bash
# Make script executable (first time only)
chmod +x scripts/sanity-check.sh

# Run sanity check
./scripts/sanity-check.sh
```

This validates:
- System requirements (Node.js, Python, Git)
- Project files and structure
- Dependencies installation
- Configuration files
- Build tools

## 🎯 Key Features

### Automatic Context Loading

Copilot automatically has access to:

- **Architecture Knowledge**: Understands the full stack (React, FastAPI, Cloudflare Workers)
- **Security Patterns**: Implements NSA-level security by default
- **Error Fixing**: Can automatically fix common JSX, CORS, and environment variable issues
- **Code Generation**: Generates code following WIRED CHAOS standards
- **Deployment Awareness**: Understands Cloudflare deployment patterns

### Smart Auto-Fixes

Copilot can automatically detect and fix:

1. **JSX Nesting Errors**
   - Invalid DOM parent-child relationships
   - Nested interactive elements

2. **Environment Variables**
   - Universal safe checks that work in Workers, Node.js, and browser
   - Proper fallback patterns

3. **CORS Issues**
   - Correct CORS headers for AR/VR assets
   - Proper MIME types for 3D models

4. **Worker Patterns**
   - Proper Response object formatting
   - Authentication middleware
   - Error handling

## 📚 Documentation Structure

```
.copilot/
├── context.md              # Main project context
├── autofix-patterns.md     # Auto-fix patterns library
├── color-palette.md        # Design system
├── ar-vr-config.md        # AR/VR specifications
├── security-patterns.md    # Security implementation
└── infrastructure.md       # Infrastructure patterns

.vscode/
└── settings.json          # VS Code + Copilot configuration

scripts/
└── sanity-check.sh        # System validation script
```

## 🔧 Customization

### Adding New Patterns

To add new auto-fix patterns:

1. Open `.copilot/autofix-patterns.md`
2. Add a new section with:
   - Problem description
   - Detection pattern
   - Auto-fix example
   - Code snippet

### Updating Context

To update project context:

1. Open `.copilot/context.md`
2. Update relevant sections
3. Copilot will use the updated context immediately

### Modifying VS Code Settings

To modify Copilot behavior:

1. Open `.vscode/settings.json`
2. Update `github.copilot.chat.codeGeneration.instructions`
3. Reload VS Code for changes to take effect

## 🎨 Color Palette Quick Reference

```javascript
// Tailwind classes (after configuration)
className="bg-black-base text-cyan-neon border-accent-pink"

// CSS variables
:root {
  --black-base: #000000;
  --cyan-neon: #00FFFF;
  --glitch-red: #FF3131;
  --electric-green: #39FF14;
  --accent-pink: #FF00FF;
}
```

## 🔒 Security Standards

All code generated by Copilot should follow:

1. **Bearer Token Auth**: Use for API endpoints
2. **CORS**: Explicit configuration required
3. **Environment Variables**: Universal safe checks
4. **Circuit Breakers**: For external API calls
5. **Audit Logging**: For security-sensitive operations

## 🚀 Deployment Patterns

Copilot understands these deployment patterns:

- **Zero-downtime**: Blue-green deployments
- **Health Checks**: `/api/health` endpoint
- **Auto-scaling**: Cloudflare Workers unlimited concurrency
- **Global Edge**: 200+ cities worldwide

## 📖 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Model Viewer](https://modelviewer.dev/)

## 🆘 Troubleshooting

### Copilot Not Using Context

1. Ensure VS Code is up to date
2. Reload window: `Cmd/Ctrl + Shift + P` → "Reload Window"
3. Check `.vscode/settings.json` is valid JSON

### Sanity Check Fails

1. Run `./scripts/sanity-check.sh` to see specific failures
2. Fix missing dependencies
3. Ensure all required files exist

### Auto-Fixes Not Working

1. Check that `.copilot/autofix-patterns.md` exists
2. Ensure pattern descriptions are clear
3. Try being more specific in your prompts

## 🤝 Contributing

To add new patterns or improve the configuration:

1. Update relevant `.copilot/*.md` files
2. Test with Copilot to ensure it understands
3. Update this README if adding new files
4. Run sanity check to validate changes

## 📝 Version History

- **v1.0.0** (2024) - Initial configuration system
  - Complete project context
  - Auto-fix patterns library
  - Security and infrastructure documentation
  - VS Code integration
  - Sanity check script

---

**Maintained By**: WIRED CHAOS Development Team
**Last Updated**: 2024

For questions or issues, please refer to the main project documentation or open an issue on GitHub.
