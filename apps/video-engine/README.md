# 🎬 WIRED CHAOS Video Engine

Transform Gamma presentations into professional video content with AI-powered narration and cyberpunk branding.

## Features

- **Gamma Integration**: Seamless conversion of Gamma presentations to video
- **AI Narration**: Multiple persona-based voices (Builder, Analyst, Trader, Security, Custom)
- **Smart Rendering**: Queue-based video processing with priority support
- **Multi-Format Export**: YouTube, TikTok, LinkedIn, and platform-native formats
- **WIRED CHAOS Branding**: Automatic watermarks, logos, and visual effects
- **Background Music**: Curated soundtrack library
- **Transition Effects**: Minimal, Dynamic, Glitch, and Matrix styles

## Installation

```bash
cd apps/video-engine
npm install
```

## Usage

### Basic Video Conversion

```javascript
import { GammaVideoConverter } from './src/gamma-converter.js';

const converter = new GammaVideoConverter({
  apiKey: process.env.GAMMA_API_KEY
});

const result = await converter.convertToVideo('gamma-deck-id', {
  ai_narrator: 'builder',
  background_music: 'ambient',
  transition_style: 'dynamic',
  branding_level: 'prominent',
  output_formats: {
    youtube: true,
    platform_native: true
  },
  render_priority: 'normal'
});

console.log('Job ID:', result.jobId);
console.log('Status:', result.status);
```

### AI Narrator Usage

```javascript
import { AIeNarrator } from './src/ai-narrator.js';

const narrator = new AIeNarrator();

// Get available voices
const voices = narrator.getAvailableVoices();

// Generate narration
const script = {
  sections: [
    {
      slideId: 1,
      narration: 'Welcome to WIRED CHAOS',
      duration: 5
    }
  ]
};

const result = await narrator.generateNarration(script, 'builder');
```

## API Reference

### GammaVideoConverter

#### Constructor Options
- `apiKey`: Gamma API key
- `baseURL`: Gamma API base URL
- `watermark`: Custom watermark text
- `logo`: Logo image path

#### Methods

##### `convertToVideo(gammaDeckId, options)`
Convert a Gamma presentation to video.

**Parameters:**
- `gammaDeckId` (string): Gamma presentation ID
- `options` (object):
  - `ai_narrator`: Narrator persona (builder|analyst|trader|security|custom)
  - `background_music`: Music type (ambient|energetic|professional|none)
  - `transition_style`: Transition effect (minimal|dynamic|glitch|matrix)
  - `branding_level`: Branding intensity (subtle|prominent|branded)
  - `output_formats`: Object with format flags
  - `render_priority`: Processing priority (low|normal|high)

**Returns:** Promise resolving to job object

##### `getRenderQueueStatus()`
Get current render queue status.

**Returns:** Object with queue statistics

### AIeNarrator

#### Constructor Options
- `apiKey`: TTS API key
- `provider`: TTS provider (elevenlabs|openai|google)

#### Methods

##### `generateNarration(script, persona)`
Generate AI narration for script.

**Parameters:**
- `script` (object): Video script with sections
- `persona` (string): Narrator persona

**Returns:** Promise resolving to narration files

##### `getAvailableVoices()`
Get list of available narrator personas.

**Returns:** Array of voice objects

## Narrator Personas

- **Builder**: Technical, confident, implementation-focused
- **Analyst**: Analytical, data-driven, precise
- **Trader**: Strategic, market-focused, dynamic
- **Security**: Cautious, security-focused, authoritative
- **Custom**: Neutral, clear, educational

## Testing

```bash
npm test
```

## Integration

The video engine integrates with:
- Gamma API for presentation import
- TTS services for narration
- Cloud storage for video files
- CDN for video delivery

## License

MIT
