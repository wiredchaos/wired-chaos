# Video System with Optional Avatar Linking

## Quick Start

The WIRED CHAOS video system supports **optional avatar linking**. Videos work perfectly with or without avatars.

### Basic Usage

```jsx
import VideoPlayer from './components/VideoPlayer';

// Video with avatar
<VideoPlayer 
  video={{
    title: "My Video",
    url: "video.mp4",
    avatar: "https://example.com/avatar.jpg" // ✅ Avatar included
  }}
/>

// Video without avatar - works perfectly fine
<VideoPlayer 
  video={{
    title: "My Video",
    url: "video.mp4",
    avatar: null // ⚠️ No avatar - still works great
  }}
/>
```

## Key Principles

### ✅ Avatar is OPTIONAL
- Videos **do not require** an avatar
- Setting `avatar: null` or omitting the field entirely is fully supported
- All functionality works identically with or without avatars

### ✅ UI Adapts Automatically  
- Avatar overlay only shows when `avatar` field is populated
- No placeholder images or error states for missing avatars
- Clean, professional display in both scenarios

### ✅ Flexible Configuration
```jsx
config={{
  showAvatar: true,           // Default: true (shows if available)
  avatarPosition: 'top-right', // top-left, top-right, bottom-left, bottom-right
  avatarSize: 'medium'         // small, medium, large
}}
```

## Components

### VideoPlayer
Displays a single video with optional avatar overlay.

**Props:**
- `video` (required): Video object with optional `avatar` field
- `config` (optional): Display configuration
- `onVideoEnd` (optional): Callback when video ends
- `onViewCountUpdate` (optional): Callback when view is tracked

### VideoGrid
Displays multiple videos in a grid layout.

**Props:**
- `videos` (required): Array of video objects (mixed avatars supported)
- `showAvatars` (optional): Whether to show avatars if available (default: true)
- `onVideoClick` (optional): Callback when video is clicked

## API Endpoints

### List Videos
```bash
GET /api/videos
```

Returns videos with and without avatars:
```json
{
  "videos": [
    {
      "id": "1",
      "title": "Video with Avatar",
      "avatar": "https://example.com/avatar.jpg"
    },
    {
      "id": "2",
      "title": "Video without Avatar",
      "avatar": null
    }
  ]
}
```

### Create Video
```bash
POST /api/videos
Content-Type: application/json

{
  "title": "New Video",
  "url": "https://example.com/video.mp4",
  "avatar": null  // Optional - can be null or omitted
}
```

### Update Video
```bash
PUT /api/videos/{id}
Content-Type: application/json

{
  "avatar": null  // Can add, update, or remove avatar
}
```

## Examples

See `frontend/src/components/VideoPlayerExamples.js` for complete usage examples including:

1. Video with avatar
2. Video without avatar
3. Mixed video grid
4. Hiding avatars
5. Different avatar positions
6. API integration
7. Dynamic avatar add/remove
8. Creating new videos

## Testing

Run the video API tests:

```bash
python3 video_api_test.py
```

Tests cover:
- Creating videos with avatars
- Creating videos without avatars
- Updating videos to add avatars
- Updating videos to remove avatars
- Listing mixed videos
- View count tracking

## Documentation

See `VIDEO_AVATAR_DOCUMENTATION.md` for comprehensive documentation including:
- Data model definitions (TypeScript & Python)
- API endpoint details
- UI component specifications
- Testing scenarios
- Best practices

## Migration

**No migration needed!** The system is designed to support videos without avatars from the start. Existing videos with `avatar: null` will work perfectly.

To add avatars to existing videos:
```bash
curl -X PUT http://localhost:8080/api/videos/{id} \
  -H "Content-Type: application/json" \
  -d '{"avatar": "https://example.com/avatar.jpg"}'
```

To remove avatars from existing videos:
```bash
curl -X PUT http://localhost:8080/api/videos/{id} \
  -H "Content-Type: application/json" \
  -d '{"avatar": null}'
```

## Architecture

```
┌─────────────────────────────────────┐
│   Video Model (Backend/Frontend)    │
│                                     │
│  - id: string                       │
│  - title: string                    │
│  - url: string                      │
│  - avatar?: string | null ⚠️       │
│    (OPTIONAL - can be null)         │
│  - ...other fields                  │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│     VideoPlayer Component           │
│                                     │
│  Checks: video?.avatar              │
│  ✅ If exists → show avatar overlay │
│  ✅ If null → no overlay            │
└─────────────────────────────────────┘
```

## Summary

✅ **Videos work with or without avatars**  
✅ **UI adapts automatically**  
✅ **No migration needed**  
✅ **Avatars can be added/removed anytime**  
✅ **Clean, professional display in both modes**

For questions or issues, see the full documentation in `VIDEO_AVATAR_DOCUMENTATION.md`.
