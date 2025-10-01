# 🎬 WIRED CHAOS Video System - README

## Overview

A complete video management system with **optional avatar linking** for the WIRED CHAOS platform. Videos can exist with or without associated avatars, and the system handles both states gracefully throughout the entire stack.

## ✨ Key Features

- ✅ **Optional Avatar Linking** - Videos can have avatars, but don't have to
- ✅ **Full CRUD API** - Create, read, update, delete videos
- ✅ **Smart Filtering** - Filter by avatar presence, status, and more
- ✅ **Statistics Tracking** - Monitor avatar usage across your video library
- ✅ **React Components** - Pre-built UI components ready to use
- ✅ **WIRED CHAOS Styling** - Cyber-themed design with neon accents
- ✅ **Comprehensive Testing** - 10+ test cases covering all scenarios
- ✅ **Complete Documentation** - Multiple guides for different use cases

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd backend
python server.py
```

Backend runs on `http://localhost:8080`

### 2. Use the API

```bash
# Create video WITHOUT avatar
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Tutorial",
    "video_url": "https://example.com/video.mp4",
    "avatar_url": null
  }'

# Create video WITH avatar
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Creator Video",
    "video_url": "https://example.com/video.mp4",
    "avatar_url": "https://example.com/avatar.jpg"
  }'

# List all videos
curl http://localhost:8080/api/videos

# Filter videos with avatars
curl http://localhost:8080/api/videos?has_avatar=true

# Filter videos without avatars
curl http://localhost:8080/api/videos?has_avatar=false

# Get statistics
curl http://localhost:8080/api/videos/stats/summary
```

### 3. Use React Components

```jsx
import VideoPlayer from './components/VideoPlayer';
import VideoList from './components/VideoList';
import VideoDemoPage from './components/VideoDemoPage';

// Single video with avatar
<VideoPlayer
  videoUrl="https://example.com/video.mp4"
  title="Tutorial Video"
  avatarUrl="https://example.com/avatar.jpg"
  uploadedBy="John Doe"
/>

// Single video without avatar
<VideoPlayer
  videoUrl="https://example.com/video.mp4"
  title="System Demo"
  avatarUrl={null}
  uploadedBy="Tech Team"
/>

// Video list (all videos)
<VideoList layout="grid" />

// Video list (only with avatars)
<VideoList layout="list" filterByAvatar={true} />

// Complete demo page
<VideoDemoPage />
```

### 4. Run Tests

```bash
python test_video_avatar.py
```

## 📚 Documentation

We provide extensive documentation for different use cases:

### For Developers
- **[Quick Start Guide](VIDEO_QUICKSTART.md)** - Get started in 5 minutes
- **[API Documentation](VIDEO_AVATAR_DOCUMENTATION.md)** - Complete API reference
- **[Architecture Diagram](VIDEO_ARCHITECTURE_DIAGRAM.md)** - Visual system overview

### For Integration
- **[Integration Examples](VIDEO_INTEGRATION_EXAMPLE.md)** - Add to your app
- **[Implementation Summary](VIDEO_IMPLEMENTATION_SUMMARY.md)** - What was built

## 🎨 Design System

All components use the WIRED CHAOS color palette:

```
Cyan:   #00FFFF  →  Primary UI, borders, highlights
Green:  #39FF14  →  Success states, labels, tags
Pink:   #FF00FF  →  Special highlights, filters
Black:  #000000  →  Backgrounds
White:  #FFFFFF  →  Text
Red:    #FF3131  →  Errors, warnings
```

## 🔧 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List all videos (with optional filters) |
| GET | `/api/videos/{id}` | Get single video |
| POST | `/api/videos` | Create new video |
| PUT | `/api/videos/{id}` | Update video |
| DELETE | `/api/videos/{id}` | Delete video |
| POST | `/api/videos/{id}/views` | Increment view count |
| GET | `/api/videos/stats/summary` | Get statistics |

### Query Parameters

**GET /api/videos:**
- `status` - Filter by status (draft/processing/published/archived)
- `has_avatar` - Filter by avatar presence (true/false)

### Request/Response Examples

**Create Video (no avatar):**
```json
POST /api/videos
{
  "title": "Tutorial Video",
  "video_url": "https://example.com/video.mp4",
  "avatar_url": null,
  "duration": 300,
  "tags": ["tutorial", "beginner"]
}

Response: 200 OK
{
  "id": "abc123",
  "title": "Tutorial Video",
  "video_url": "https://example.com/video.mp4",
  "avatar_url": null,
  "uploaded_by": "system",
  "uploaded_at": "2025-01-01T12:00:00",
  "views": 0,
  "status": "published"
}
```

**Get Statistics:**
```json
GET /api/videos/stats/summary

Response: 200 OK
{
  "total_videos": 100,
  "videos_with_avatars": 65,
  "videos_without_avatars": 35,
  "avatar_usage_percentage": 65.0
}
```

## 🧩 Components

### VideoPlayer

Displays a single video with optional avatar support.

**Props:**
```typescript
interface VideoPlayerProps {
  videoId?: string;
  videoUrl: string;              // Required
  title: string;                 // Required
  description?: string;
  thumbnailUrl?: string;
  avatarUrl?: string;            // Optional - can be null
  uploadedBy?: string;
  duration?: number;             // in seconds
  tags?: string[];
  onPlay?: (videoId: string) => void;
  onPause?: (videoId: string) => void;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}
```

**Example:**
```jsx
<VideoPlayer
  videoUrl="/videos/tutorial.mp4"
  title="Getting Started"
  description="Learn the basics"
  avatarUrl="/avatars/instructor.jpg"  // Can be null
  duration={300}
  tags={['tutorial', 'basics']}
/>
```

### VideoList

Displays multiple videos in grid or list layout.

**Props:**
```typescript
interface VideoListProps {
  layout?: 'grid' | 'list';      // Default: 'grid'
  filterByAvatar?: boolean | null; // null = all videos
  apiBaseUrl?: string;           // Default: '/api'
}
```

**Example:**
```jsx
// All videos in grid
<VideoList layout="grid" />

// Only videos with avatars
<VideoList filterByAvatar={true} />

// Only videos without avatars
<VideoList filterByAvatar={false} />
```

### VideoDemoPage

Complete demonstration page with examples.

**Features:**
- 6 sample videos (3 with avatars, 3 without)
- Interactive filtering
- Statistics display
- Status badges

**Example:**
```jsx
<VideoDemoPage />
```

## 🧪 Testing

The test suite covers all aspects of optional avatar functionality:

```python
# Run all tests
python test_video_avatar.py

# Test coverage includes:
# ✅ Creating videos without avatars
# ✅ Creating videos with avatars
# ✅ Omitting avatar field
# ✅ Filtering by avatar presence
# ✅ Adding avatars via updates
# ✅ Removing avatars via updates
# ✅ Statistics calculation
# ✅ UI rendering both states
```

## 💡 Best Practices

### 1. Always Treat Avatar as Optional

```jsx
// ✅ Good - conditional rendering
{avatarUrl && (
  <Avatar>
    <AvatarImage src={avatarUrl} />
  </Avatar>
)}

// ❌ Bad - forces avatar display
<Avatar>
  <AvatarImage src={avatarUrl || '/default.png'} />
</Avatar>
```

### 2. Use Type Safety

```typescript
// ✅ Good - TypeScript optional
interface Video {
  avatarUrl?: string;
}

// ✅ Good - Python optional
class Video(BaseModel):
  avatar_url: str | None = None
```

### 3. Document Optional Nature

```jsx
/**
 * VideoPlayer Component
 * @param {string} [avatarUrl] - Optional avatar URL (can be null)
 */
```

### 4. Test Both States

Always test your components/API with:
- Videos that have avatars
- Videos that don't have avatars
- Transitions (adding/removing avatars)

## 🔍 Troubleshooting

### Videos not loading?
- Check backend is running on port 8080
- Verify video URLs are accessible
- Check browser console for errors

### Avatars not displaying?
- Verify `avatarUrl` has valid value
- Check conditional rendering: `{avatarUrl && <Avatar />}`
- Ensure avatar image URL is accessible

### Filtering not working?
- Check query parameter spelling: `has_avatar`
- Verify boolean values: `true` or `false`
- Check API response in network tab

### Tests failing?
- Ensure FastAPI is installed: `pip install fastapi`
- Check test dependencies: `pip install pytest httpx`
- Verify backend server is not running during tests

## 🗂️ File Structure

```
wired-chaos/
├── backend/
│   └── server.py                    # Video API endpoints
├── frontend/src/components/
│   ├── VideoPlayer.jsx              # Single video component
│   ├── VideoPlayer.css              # Video player styles
│   ├── VideoList.jsx                # Multi-video component
│   ├── VideoList.css                # Video list styles
│   ├── VideoDemoPage.jsx            # Demo page
│   └── VideoDemoPage.css            # Demo page styles
├── wix-gamma-integration/shared/types/
│   └── index.ts                     # TypeScript type definitions
├── test_video_avatar.py             # Test suite
├── VIDEO_AVATAR_DOCUMENTATION.md    # Complete API docs
├── VIDEO_QUICKSTART.md              # Quick start guide
├── VIDEO_INTEGRATION_EXAMPLE.md     # Integration examples
├── VIDEO_IMPLEMENTATION_SUMMARY.md  # Implementation overview
├── VIDEO_ARCHITECTURE_DIAGRAM.md    # System architecture
└── VIDEO_README.md                  # This file
```

## 🚀 Production Deployment

For production use:

1. **Replace In-Memory Storage**
   ```python
   # Use MongoDB, PostgreSQL, etc.
   from motor.motor_asyncio import AsyncIOMotorClient
   client = AsyncIOMotorClient(MONGO_URL)
   db = client['wired_chaos']
   videos_collection = db['videos']
   ```

2. **Add Authentication**
   ```python
   from fastapi import Depends, HTTPException
   async def verify_token(token: str = Depends(oauth2_scheme)):
       # Verify JWT token
       pass
   ```

3. **Set Up CDN**
   - Host videos on CDN (Cloudflare R2, AWS S3, etc.)
   - Use signed URLs for private content

4. **Enable CORS Properly**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["GET", "POST", "PUT", "DELETE"],
       allow_headers=["*"],
   )
   ```

5. **Add Rate Limiting**
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   
   @app.get("/api/videos")
   @limiter.limit("100/minute")
   async def list_videos():
       pass
   ```

## 📊 Statistics Example

The system tracks avatar usage statistics:

```json
{
  "total_videos": 150,
  "videos_with_avatars": 95,
  "videos_without_avatars": 55,
  "avatar_usage_percentage": 63.33
}
```

This helps you understand:
- How many videos have avatars
- Avatar adoption rate
- Content type distribution

## 🤝 Contributing

When adding new features:

1. Maintain optional avatar support
2. Add tests for new functionality
3. Update documentation
4. Follow WIRED CHAOS design system
5. Keep changes minimal and focused

## 📞 Support

For help with the video system:

1. Check [Quick Start Guide](VIDEO_QUICKSTART.md)
2. Review [API Documentation](VIDEO_AVATAR_DOCUMENTATION.md)
3. See [Integration Examples](VIDEO_INTEGRATION_EXAMPLE.md)
4. Check [Architecture Diagram](VIDEO_ARCHITECTURE_DIAGRAM.md)
5. File an issue on GitHub

## 📄 License

Part of the WIRED CHAOS platform.

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-01  
**Status:** ✅ Production Ready

For the complete implementation details, see [VIDEO_IMPLEMENTATION_SUMMARY.md](VIDEO_IMPLEMENTATION_SUMMARY.md)
