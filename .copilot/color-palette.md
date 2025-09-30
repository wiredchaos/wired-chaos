# WIRED CHAOS Official Color Palette & Design System

## 🎨 Official Brand Colors

### Primary Palette

#### Black Base
- **Hex**: `#000000`
- **RGB**: `rgb(0, 0, 0)`
- **HSL**: `hsl(0, 0%, 0%)`
- **Usage**: Primary background, base layer for all interfaces
- **Tailwind**: `bg-black`, `text-black`

```css
.background {
  background-color: #000000;
}
```

#### Neon Cyan (Primary Accent)
- **Hex**: `#00FFFF`
- **RGB**: `rgb(0, 255, 255)`
- **HSL**: `hsl(180, 100%, 50%)`
- **Usage**: Primary highlights, interactive elements, borders, glow effects
- **Tailwind**: Custom class `text-cyan-neon`, `border-cyan-neon`

```css
.neon-cyan {
  color: #00FFFF;
  text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF;
}

.border-cyan-glow {
  border: 2px solid #00FFFF;
  box-shadow: 0 0 10px #00FFFF;
}
```

#### Glitch Red (Alerts & Errors)
- **Hex**: `#FF3131`
- **RGB**: `rgb(255, 49, 49)`
- **HSL**: `hsl(0, 100%, 60%)`
- **Usage**: Error states, warnings, critical alerts, danger buttons
- **Tailwind**: Custom class `text-glitch-red`, `bg-glitch-red`

```css
.error-state {
  color: #FF3131;
  background-color: rgba(255, 49, 49, 0.1);
  border-left: 4px solid #FF3131;
}

.glitch-effect {
  color: #FF3131;
  animation: glitch 1s infinite;
}

@keyframes glitch {
  0%, 100% { text-shadow: 0.05em 0 0 #FF3131; }
  25% { text-shadow: -0.05em -0.025em 0 #00FFFF; }
  50% { text-shadow: 0.025em 0.05em 0 #39FF14; }
  75% { text-shadow: -0.05em -0.05em 0 #FF00FF; }
}
```

#### Electric Green (Success States)
- **Hex**: `#39FF14`
- **RGB**: `rgb(57, 255, 20)`
- **HSL**: `hsl(111, 100%, 54%)`
- **Usage**: Success messages, active states, positive feedback
- **Tailwind**: Custom class `text-electric-green`, `bg-electric-green`

```css
.success-state {
  color: #39FF14;
  background-color: rgba(57, 255, 20, 0.1);
  border-left: 4px solid #39FF14;
}

.pulse-green {
  color: #39FF14;
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

#### Accent Pink (Highlights)
- **Hex**: `#FF00FF`
- **RGB**: `rgb(255, 0, 255)`
- **HSL**: `hsl(300, 100%, 50%)`
- **Usage**: Special highlights, premium features, accent borders
- **Tailwind**: Custom class `text-accent-pink`, `border-accent-pink`

```css
.premium-feature {
  border: 2px solid #FF00FF;
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), transparent);
}

.glow-pink {
  color: #FF00FF;
  text-shadow: 0 0 10px #FF00FF, 0 0 20px #FF00FF;
}
```

### Secondary Palette (Derived)

#### Dark Gray (Surfaces)
- **Hex**: `#1A1A1A`
- **RGB**: `rgb(26, 26, 26)`
- **Usage**: Elevated surfaces, cards, panels

#### Medium Gray (Borders)
- **Hex**: `#333333`
- **RGB**: `rgb(51, 51, 51)`
- **Usage**: Subtle borders, dividers

#### Light Gray (Text Secondary)
- **Hex**: `#CCCCCC`
- **RGB**: `rgb(204, 204, 204)`
- **Usage**: Secondary text, muted content

## 🎭 Color Usage Guidelines

### Backgrounds
```css
/* Primary background */
.app-background {
  background-color: #000000;
}

/* Elevated surfaces */
.card {
  background-color: #1A1A1A;
  border: 1px solid #333333;
}

/* Interactive surfaces (hover) */
.card:hover {
  background-color: rgba(0, 255, 255, 0.05);
  border-color: #00FFFF;
}
```

### Text Hierarchy
```css
/* Primary text */
.text-primary {
  color: #00FFFF; /* Neon Cyan */
}

/* Secondary text */
.text-secondary {
  color: #CCCCCC;
}

/* Muted text */
.text-muted {
  color: #666666;
}

/* Headings */
h1, h2, h3 {
  color: #00FFFF;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

### Interactive Elements
```css
/* Primary button */
.btn-primary {
  background-color: #00FFFF;
  color: #000000;
  border: 2px solid #00FFFF;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.btn-primary:hover {
  background-color: transparent;
  color: #00FFFF;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

/* Danger button */
.btn-danger {
  background-color: transparent;
  color: #FF3131;
  border: 2px solid #FF3131;
}

.btn-danger:hover {
  background-color: #FF3131;
  color: #000000;
}

/* Success button */
.btn-success {
  background-color: transparent;
  color: #39FF14;
  border: 2px solid #39FF14;
}

.btn-success:hover {
  background-color: #39FF14;
  color: #000000;
}
```

### Status Indicators
```css
/* Success status */
.status-success {
  color: #39FF14;
  background-color: rgba(57, 255, 20, 0.1);
}

/* Error status */
.status-error {
  color: #FF3131;
  background-color: rgba(255, 49, 49, 0.1);
}

/* Warning status */
.status-warning {
  color: #FFAA00;
  background-color: rgba(255, 170, 0, 0.1);
}

/* Info status */
.status-info {
  color: #00FFFF;
  background-color: rgba(0, 255, 255, 0.1);
}
```

## ✨ Glow Effects

### Neon Glow Pattern
```css
.neon-glow {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 40px currentColor;
}

/* Cyan glow */
.cyan-glow {
  color: #00FFFF;
  text-shadow: 
    0 0 5px #00FFFF,
    0 0 10px #00FFFF,
    0 0 20px #00FFFF,
    0 0 40px #00FFFF;
}

/* Pink glow */
.pink-glow {
  color: #FF00FF;
  text-shadow: 
    0 0 5px #FF00FF,
    0 0 10px #FF00FF,
    0 0 20px #FF00FF,
    0 0 40px #FF00FF;
}

/* Green glow */
.green-glow {
  color: #39FF14;
  text-shadow: 
    0 0 5px #39FF14,
    0 0 10px #39FF14,
    0 0 20px #39FF14,
    0 0 40px #39FF14;
}
```

### Box Shadow Glow
```css
.box-glow-cyan {
  box-shadow: 
    0 0 10px rgba(0, 255, 255, 0.5),
    0 0 20px rgba(0, 255, 255, 0.3),
    0 0 30px rgba(0, 255, 255, 0.2);
}

.box-glow-pink {
  box-shadow: 
    0 0 10px rgba(255, 0, 255, 0.5),
    0 0 20px rgba(255, 0, 255, 0.3),
    0 0 30px rgba(255, 0, 255, 0.2);
}
```

## 🌈 Gradient Patterns

### Cyber Gradient
```css
.gradient-cyber {
  background: linear-gradient(
    135deg,
    #00FFFF 0%,
    #FF00FF 50%,
    #39FF14 100%
  );
}

.gradient-cyber-overlay {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.2) 0%,
    rgba(255, 0, 255, 0.2) 50%,
    rgba(57, 255, 20, 0.2) 100%
  );
}
```

### Glitch Gradient
```css
.gradient-glitch {
  background: linear-gradient(
    90deg,
    #FF3131 0%,
    #00FFFF 50%,
    #FF3131 100%
  );
  background-size: 200% 100%;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

## 🎬 Animations

### Pulse Animation
```css
@keyframes pulse-cyan {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.8);
  }
}

.pulse-cyan {
  animation: pulse-cyan 2s ease-in-out infinite;
}
```

### Glitch Animation
```css
@keyframes glitch {
  0%, 100% {
    text-shadow: 0.05em 0 0 #FF3131, -0.025em -0.05em 0 #00FFFF;
  }
  14% {
    text-shadow: 0.05em 0 0 #FF3131, -0.025em -0.05em 0 #00FFFF;
  }
  15% {
    text-shadow: -0.05em -0.025em 0 #00FFFF, 0.025em 0.025em 0 #FF3131;
  }
  49% {
    text-shadow: -0.05em -0.025em 0 #00FFFF, 0.025em 0.025em 0 #FF3131;
  }
  50% {
    text-shadow: 0.025em 0.05em 0 #FF00FF, 0.05em 0 0 #39FF14;
  }
  99% {
    text-shadow: 0.025em 0.05em 0 #FF00FF, 0.05em 0 0 #39FF14;
  }
}

.text-glitch {
  animation: glitch 1s infinite;
}
```

### Scan Line Animation
```css
@keyframes scan {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}

.scan-lines {
  position: relative;
  overflow: hidden;
}

.scan-lines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 255, 255, 0.1) 0px,
    transparent 1px,
    transparent 2px,
    rgba(0, 255, 255, 0.1) 3px
  );
  animation: scan 8s linear infinite;
  pointer-events: none;
}
```

## 🎯 Tailwind Configuration

Add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'black-base': '#000000',
        'cyan-neon': '#00FFFF',
        'glitch-red': '#FF3131',
        'electric-green': '#39FF14',
        'accent-pink': '#FF00FF',
        'dark-surface': '#1A1A1A',
        'medium-border': '#333333',
        'light-text': '#CCCCCC'
      },
      boxShadow: {
        'glow-cyan': '0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)',
        'glow-pink': '0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
        'glow-green': '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)',
        'glow-red': '0 0 10px rgba(255, 49, 49, 0.5), 0 0 20px rgba(255, 49, 49, 0.3)'
      },
      textShadow: {
        'glow-cyan': '0 0 10px #00FFFF, 0 0 20px #00FFFF',
        'glow-pink': '0 0 10px #FF00FF, 0 0 20px #FF00FF',
        'glow-green': '0 0 10px #39FF14, 0 0 20px #39FF14',
        'glow-red': '0 0 10px #FF3131, 0 0 20px #FF3131'
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #00FFFF 0%, #FF00FF 50%, #39FF14 100%)',
        'gradient-glitch': 'linear-gradient(90deg, #FF3131 0%, #00FFFF 50%, #FF3131 100%)'
      },
      animation: {
        'pulse-cyan': 'pulse-cyan 2s ease-in-out infinite',
        'glitch': 'glitch 1s infinite',
        'scan': 'scan 8s linear infinite'
      },
      keyframes: {
        'pulse-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.8)' }
        },
        'glitch': {
          '0%, 100%': { textShadow: '0.05em 0 0 #FF3131, -0.025em -0.05em 0 #00FFFF' },
          '15%': { textShadow: '-0.05em -0.025em 0 #00FFFF, 0.025em 0.025em 0 #FF3131' },
          '50%': { textShadow: '0.025em 0.05em 0 #FF00FF, 0.05em 0 0 #39FF14' }
        },
        'scan': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' }
        }
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-glow-cyan': {
          textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF'
        },
        '.text-shadow-glow-pink': {
          textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF'
        },
        '.text-shadow-glow-green': {
          textShadow: '0 0 10px #39FF14, 0 0 20px #39FF14'
        }
      }
      addUtilities(newUtilities)
    }
  ]
}
```

## 📱 Component Examples

### Neon Button
```jsx
<button className="
  px-6 py-3
  bg-transparent
  text-cyan-neon
  border-2 border-cyan-neon
  hover:bg-cyan-neon hover:text-black-base
  shadow-glow-cyan
  transition-all duration-300
  uppercase tracking-wider
  font-bold
">
  Enter the Chaos
</button>
```

### Glitch Card
```jsx
<div className="
  bg-dark-surface
  border border-medium-border
  hover:border-cyan-neon
  p-6
  transition-all duration-300
  relative
  overflow-hidden
">
  <div className="scan-lines absolute inset-0 pointer-events-none" />
  <h3 className="text-cyan-neon text-shadow-glow-cyan uppercase">
    Card Title
  </h3>
  <p className="text-light-text mt-2">
    Card content goes here
  </p>
</div>
```

### Success Alert
```jsx
<div className="
  bg-electric-green bg-opacity-10
  border-l-4 border-electric-green
  p-4
  flex items-center gap-3
">
  <svg className="w-6 h-6 text-electric-green">
    {/* Check icon */}
  </svg>
  <span className="text-electric-green">
    Operation completed successfully!
  </span>
</div>
```

---

**Last Updated**: 2024
**Maintained By**: WIRED CHAOS Design Team
