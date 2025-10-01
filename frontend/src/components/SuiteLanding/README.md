# Suite Landing Page Component

## Overview

The Suite Landing Page is a dedicated landing component for WIRED CHAOS suite features, implemented in stub-first mode with cyberpunk neon styling.

## Features

- **Feature Flag Controlled**: Supports `stub`, `partial`, and `full` modes
- **WIRED CHAOS Design System**: Uses vault-ui.css neon-cyberpunk palette
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 480px
- **Accessibility**: ARIA labels, keyboard navigation, reduced-motion support
- **CSS Modules**: Scoped styling with `.module.css` approach

## Usage

### In React Application

```jsx
import SuiteLanding from './components/SuiteLanding';

// Component automatically checks feature flag from config
<Route path="/suite" element={<SuiteLanding />} />
```

### Feature Flag Configuration

Set the environment variable to control the mode:

```bash
# Stub mode (default) - Preview only
REACT_APP_ENABLE_SUITE_LANDING=stub

# Partial mode - Some features active
REACT_APP_ENABLE_SUITE_LANDING=partial

# Full mode - All features active
REACT_APP_ENABLE_SUITE_LANDING=full
```

### Suite URL Configuration

```bash
# Optional: Configure suite backend URL
REACT_APP_SUITE_URL=https://suite.wiredchaos.xyz
```

## Component Structure

### Files

```
SuiteLanding/
├── SuiteLanding.js          # Main component
├── SuiteLanding.module.css  # Scoped styles
├── index.js                 # Export module
└── README.md                # This file
```

### Props

The component doesn't accept props directly. Configuration is managed through:
- `FEATURES.enableSuiteLanding` from `config/featureFlags.js`
- `getSuiteUrl()` from `utils/env.js`

## Design System

### Color Palette

```css
--vault-ink: #0a0f13       /* Background */
--vault-cyan: #00fff0      /* Primary accent */
--vault-red: #ff2a2a       /* Secondary accent */
--vault-purple: #8000ff    /* Tertiary accent */
--vault-green: #39ff14     /* Success/Active */
--vault-white: #ffffff     /* Text */
```

### Typography

- Font Family: 'Orbitron', system-ui, sans-serif
- Neon text shadows for glow effects
- Responsive font sizes with clamp()

### Layout

- Flexbox container with centered content
- CSS Grid for feature cards (auto-fit, minmax(280px, 1fr))
- Mobile-first responsive breakpoints

## Feature Modes

### Stub Mode (Default)

- Shows preview of 3 basic features
- "Coming Soon" status for most cards
- Informational notice about stub mode
- No external links active

### Partial Mode

- 4 features active (Dashboard, Admin, Power Tools, API)
- Some cards clickable if Suite URL configured
- Reduced "coming soon" notices

### Full Mode

- All 6 features active
- Complete dashboard access
- All integrations enabled
- Full API access

## Accessibility

### ARIA Support

- `aria-label` on all interactive elements
- `role="button"` on clickable cards
- `role="alert"` on informational sections

### Keyboard Navigation

- All interactive elements focusable with Tab
- Enter and Space key support for card activation
- Visible focus indicators

### Motion Preferences

- Respects `prefers-reduced-motion`
- Disables animations for users who prefer reduced motion
- No transform animations in reduced motion mode

### High Contrast

- Enhanced border widths in high contrast mode
- Removed text-shadows for clarity
- Increased font weights for legibility

## Browser Support

- Modern browsers with CSS Grid support
- CSS Modules support
- ES6+ JavaScript
- Responsive design works on all viewport sizes

## Testing

Unit tests are available in the repository root under `workers/suite-landing/suite-landing.test.js`.

To run smoke tests:

```bash
# Manual testing
curl https://www.wiredchaos.xyz/suite
curl https://www.wiredchaos.xyz/suite?mode=stub
curl https://www.wiredchaos.xyz/suite?mode=partial
curl https://www.wiredchaos.xyz/suite?mode=full
```

## Cloudflare Worker Integration

The `/suite` endpoint is also handled by a Cloudflare Worker with feature flag support:

```javascript
// Query parameter
GET /suite?mode=stub

// HTTP Header
GET /suite
X-Suite-Mode: partial
```

Worker responds with:
- `X-Suite-Version: 1.0.0` header
- `X-Suite-Mode: <mode>` header
- Proper CORS headers

## Future Enhancements

- [ ] Add animation variants for different modes
- [ ] Implement feature-specific routing
- [ ] Add telemetry for feature usage
- [ ] Create admin panel integration
- [ ] Add WebSocket support for real-time updates
- [ ] Implement progressive enhancement for older browsers

## Contributing

When modifying this component:

1. Maintain the stub-first approach
2. Keep accessibility features intact
3. Test on mobile viewports
4. Verify feature flag behavior
5. Update smoke tests as needed
6. Keep CSS modules scoped

## License

Part of the WIRED CHAOS project.
