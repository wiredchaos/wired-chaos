# Video System - Quick Start Guide

## 🎬 Overview

The WIRED CHAOS video system supports **optional avatar linking** for all videos. This means:

- ✅ Videos can be created **with or without** avatars
- ✅ Avatars can be added, updated, or removed at any time
- ✅ UI gracefully handles both states
- ✅ No functionality is lost without avatars

## 🚀 Quick Start

### Backend API

Start the backend server:

```bash
cd backend
python server.py
```

The video API will be available at `http://localhost:8080/api/videos`

### Frontend Components

Import and use the video components:

```jsx
import VideoPlayer from './components/VideoPlayer';
import VideoList from './components/VideoList';
import VideoDemoPage from './components/VideoDemoPage';

// Single video with avatar
<VideoPlayer
  videoUrl="https://example.com/video.mp4"
  title="My Video"
  avatarUrl="https://example.com/avatar.jpg"
/>

// Single video without avatar (works perfectly)
<VideoPlayer
  videoUrl="https://example.com/video.mp4"
  title="My Video"
  avatarUrl={null}
/>

// Video list with all videos
<VideoList layout="grid" />

// Video list filtered by avatar presence
<VideoList filterByAvatar={true} />  // Only with avatars
<VideoList filterByAvatar={false} /> // Only without avatars

// Complete demo page
<VideoDemoPage />
```

## 📖 API Examples

### Create Video WITHOUT Avatar

```bash
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tutorial Video",
    "video_url": "https://example.com/tutorial.mp4",
    "avatar_url": null
  }'
```

### Create Video WITH Avatar

```bash
curl -X POST http://localhost:8080/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Profile Video",
    "video_url": "https://example.com/profile.mp4",
    "avatar_url": "https://example.com/avatar.jpg"
  }'
```

### Filter Videos by Avatar

```bash
# Get all videos
curl http://localhost:8080/api/videos

# Get only videos WITH avatars
curl http://localhost:8080/api/videos?has_avatar=true

# Get only videos WITHOUT avatars
curl http://localhost:8080/api/videos?has_avatar=false
```

### Get Statistics

```bash
curl http://localhost:8080/api/videos/stats/summary
```

Response:
```json
{
  "total_videos": 100,
  "videos_with_avatars": 65,
  "videos_without_avatars": 35,
  "avatar_usage_percentage": 65.0
}
```

## 🧪 Testing

Run the test suite:

```bash
# Install dependencies
pip install pytest httpx fastapi

# Run tests
python test_video_avatar.py
```

Tests verify:
- ✅ Videos can be created without avatars
- ✅ Videos can be created with avatars
- ✅ Avatars can be added via updates
- ✅ Avatars can be removed via updates
- ✅ Filtering by avatar presence works
- ✅ Statistics are calculated correctly

## 📋 Components

### VideoPlayer.jsx

Displays a single video with optional avatar support.

**Props:**
- `videoId` (string): Unique video identifier
- `videoUrl` (string): URL to video file
- `title` (string): Video title
- `description` (string, optional): Video description
- `thumbnailUrl` (string, optional): Thumbnail image URL
- `avatarUrl` (string, optional): **Avatar URL - can be null**
- `uploadedBy` (string, optional): Uploader name
- `duration` (number, optional): Duration in seconds
- `tags` (array, optional): Video tags
- `onPlay` (function, optional): Callback when video plays
- `onPause` (function, optional): Callback when video pauses
- `showControls` (boolean): Show video controls (default: true)

### VideoList.jsx

Displays multiple videos with filtering options.

**Props:**
- `layout` (string): 'grid' or 'list' (default: 'grid')
- `filterByAvatar` (boolean|null): Filter by avatar presence
- `apiBaseUrl` (string): API base URL (default: '/api')

### VideoDemoPage.jsx

Complete demonstration page showing the video system.

**Features:**
- Displays sample videos with and without avatars
- Filter controls for avatar presence
- Statistics display
- Live examples of both states

## 🎨 Styling

All components use WIRED CHAOS color palette:

- **Cyan** (#00FFFF): Primary UI elements
- **Green** (#39FF14): Success states, labels
- **Pink** (#FF00FF): Special highlights
- **Black** (#000000): Backgrounds
- **White** (#FFFFFF): Text

Components are fully responsive and work on all screen sizes.

## 📚 Full Documentation

For complete documentation, see:
- [VIDEO_AVATAR_DOCUMENTATION.md](../VIDEO_AVATAR_DOCUMENTATION.md)

## 🔧 Configuration

### Environment Variables

No special environment variables needed for basic usage. Videos are stored in-memory by default.

For production:
- Configure database connection for persistent storage
- Set up CDN for video hosting
- Configure avatar storage service

## 💡 Best Practices

1. **Always treat avatarUrl as optional**
   ```jsx
   {avatarUrl && <Avatar src={avatarUrl} />}
   ```

2. **Don't use placeholder avatars**
   - If no avatar, simply don't show avatar UI
   - Layout adjusts naturally

3. **Document optional nature**
   - Use JSDoc comments
   - TypeScript optional markers (`?`)
   - Clear API documentation

4. **Test both states**
   - Always test with avatar
   - Always test without avatar
   - Test transitions (add/remove)

## 🐛 Troubleshooting

**Videos not loading?**
- Check video URL is accessible
- Verify CORS settings
- Check browser console for errors

**Avatars not displaying?**
- Verify avatarUrl is valid
- Check avatar image is accessible
- Ensure conditional rendering is correct

**Filtering not working?**
- Check has_avatar parameter spelling
- Verify API endpoint is correct
- Check network tab for request/response

## 📞 Support

For issues or questions:
1. Check this guide
2. Review [full documentation](../VIDEO_AVATAR_DOCUMENTATION.md)
3. Check component source code
4. File issue on GitHub

---

**Version:** 1.0.0
**Last Updated:** 2025-01-01
