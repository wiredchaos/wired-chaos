# Video System Integration Example

## Adding Video System to Main App

This guide shows how to integrate the video system into the main WIRED CHAOS application.

## Step 1: Import Components

Add to `frontend/src/App.js`:

```javascript
import VideoDemoPage from './components/VideoDemoPage';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
```

## Step 2: Add Route

In your router configuration:

```javascript
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/csn" element={<CSNPage />} />
        <Route path="/neurolab" element={<NeuroLabPage />} />
        
        {/* NEW: Video routes */}
        <Route path="/videos" element={<VideoDemoPage />} />
        <Route path="/videos/list" element={<VideoList layout="grid" />} />
      </Routes>
    </Router>
  );
}
```

## Step 3: Add Navigation Link

In your navigation menu:

```javascript
<nav>
  <a href="/csn">CSN</a>
  <a href="/neurolab">NEURO LAB</a>
  {/* NEW: Video link */}
  <a href="/videos">🎬 Videos</a>
</nav>
```

## Step 4: Update Sections Config

Add to `frontend/public/sections.js`:

```javascript
export const SECTIONS = [
  { slug:"csn",      title:"CRYPTO SPACES NET",  blurb:"24/7 stream • 33.3FM", status:"live", links:{preview:"/csn"} },
  { slug:"neurolab", title:"NEURO LAB",          blurb:"Content hub • Chirp", status:"live", links:{preview:"/neurolab"} },
  // NEW: Video section
  { slug:"videos",   title:"VIDEO HUB",          blurb:"Content • Tutorials • Demos", status:"live", links:{preview:"/videos"} },
];
```

## Step 5: Example Usage in Page

### Simple Video Player

```jsx
const MyPage = () => {
  return (
    <div className="page">
      <h1>Tutorial</h1>
      
      {/* Video with avatar */}
      <VideoPlayer
        videoId="tutorial-1"
        videoUrl="/videos/tutorial.mp4"
        title="Getting Started"
        description="Learn the basics"
        avatarUrl="/avatars/instructor.jpg"
        uploadedBy="Instructor"
        duration={300}
        tags={['tutorial', 'basics']}
      />
    </div>
  );
};
```

### Video List with Filter

```jsx
const VideosPage = () => {
  return (
    <div className="page">
      <h1>All Videos</h1>
      
      {/* Show all videos */}
      <VideoList layout="grid" />
      
      {/* Or filter by avatar */}
      <h2>Featured Videos (with avatars)</h2>
      <VideoList layout="list" filterByAvatar={true} />
    </div>
  );
};
```

### Inline Video in Content

```jsx
const ContentPage = () => {
  return (
    <div className="content">
      <h1>Article Title</h1>
      <p>Introduction text...</p>
      
      {/* Embedded video without avatar */}
      <VideoPlayer
        videoUrl="/videos/demo.mp4"
        title="Demo Video"
        avatarUrl={null}  // No avatar for embedded videos
        showControls={true}
      />
      
      <p>More content...</p>
    </div>
  );
};
```

## Backend Integration

### Start Backend Server

```bash
cd backend
python server.py
```

Server will run on `http://localhost:8080`

### Configure API Base URL

In your frontend config (e.g., `.env`):

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

Then use in components:

```javascript
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

<VideoList apiBaseUrl={apiBaseUrl} />
```

## Database Integration (Optional)

For persistent storage, replace the in-memory store in `backend/server.py`:

```python
# Instead of:
videos_store = {}

# Use MongoDB, PostgreSQL, etc.:
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(MONGO_URL)
db = client['wired_chaos']
videos_collection = db['videos']

@app.get("/api/videos")
async def list_videos():
    videos = await videos_collection.find().to_list(100)
    return {"videos": videos}
```

## Example: Add to NEURO Lab

```jsx
// In NeuroLabPage component

const NeuroLabPage = () => {
  return (
    <div className="neuro-lab">
      <h1>🧠 NEURO LAB</h1>
      
      {/* Existing content */}
      <div className="lab-content">
        ...
      </div>
      
      {/* NEW: Tutorial videos section */}
      <section className="tutorials">
        <h2>Video Tutorials</h2>
        <VideoList 
          layout="grid" 
          filterByAvatar={true}  // Show only instructor-led videos
        />
      </section>
    </div>
  );
};
```

## Example: Add to Vault33

```jsx
// In Vault33Page component

const Vault33Page = () => {
  return (
    <div className="vault33">
      <h1>🔐 VAULT 33</h1>
      
      {/* Vault content */}
      
      {/* NEW: Quest walkthrough videos */}
      <section className="quest-guides">
        <h2>Quest Walkthroughs</h2>
        
        {/* Specific video for a quest */}
        <VideoPlayer
          videoUrl="/videos/vault33/quest-1.mp4"
          title="Quest 1: The Beginning"
          description="Complete walkthrough of the first quest"
          avatarUrl={null}  // Game walkthrough, no avatar needed
          tags={['quest', 'walkthrough', 'vault33']}
        />
      </section>
    </div>
  );
};
```

## Testing Integration

1. **Start backend:**
   ```bash
   python backend/server.py
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Visit test page:**
   ```
   http://localhost:3000/videos
   ```

4. **Test filtering:**
   - Click "With Avatars" button
   - Click "Without Avatars" button
   - Click "All Videos" button

5. **Verify UI:**
   - Videos with avatars show avatar next to title
   - Videos without avatars display cleanly without avatar
   - No errors in console
   - Responsive on mobile

## Common Patterns

### Pattern 1: Featured Video with Avatar
```jsx
<VideoPlayer
  videoUrl="/featured.mp4"
  title="Featured Content"
  avatarUrl="/creator-avatar.jpg"
  uploadedBy="Creator Name"
/>
```

### Pattern 2: System Video without Avatar
```jsx
<VideoPlayer
  videoUrl="/system-demo.mp4"
  title="System Demo"
  avatarUrl={null}  // System videos don't need avatars
/>
```

### Pattern 3: Dynamic Avatar Loading
```jsx
const MyComponent = ({ video }) => {
  // Avatar might come from API
  const avatarUrl = video.creator?.avatar || null;
  
  return (
    <VideoPlayer
      {...video}
      avatarUrl={avatarUrl}  // Will be null if creator has no avatar
    />
  );
};
```

## Troubleshooting

**Videos not showing?**
- Check backend is running on port 8080
- Verify API endpoint in browser: `http://localhost:8080/api/videos`
- Check CORS settings in backend

**Styling issues?**
- Ensure CSS files are imported
- Check WIRED CHAOS color palette is used
- Verify responsive breakpoints

**Avatar not displaying?**
- Check avatarUrl is valid
- Verify conditional rendering: `{avatarUrl && <Avatar />}`
- Check browser console for image loading errors

## Next Steps

1. Replace demo video URLs with actual video files
2. Set up CDN for video hosting
3. Implement video upload functionality
4. Add video analytics tracking
5. Create admin panel for video management

---

For complete documentation, see:
- [VIDEO_QUICKSTART.md](../VIDEO_QUICKSTART.md)
- [VIDEO_AVATAR_DOCUMENTATION.md](../VIDEO_AVATAR_DOCUMENTATION.md)
