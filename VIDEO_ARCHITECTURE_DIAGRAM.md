# Video System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     WIRED CHAOS VIDEO SYSTEM                                │
│                   with Optional Avatar Linking                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND (React)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐   ┌──────────────────┐│
│  │  VideoPlayer.jsx    │    │   VideoList.jsx     │   │VideoDemoPage.jsx ││
│  ├─────────────────────┤    ├─────────────────────┤   ├──────────────────┤│
│  │ • Single video      │    │ • Grid/list layout  │   │ • Demo examples  ││
│  │ • Optional avatar   │───▶│ • Filter by avatar  │──▶│ • Statistics     ││
│  │ • Conditional render│    │ • Statistics bar    │   │ • Filter UI      ││
│  │                     │    │                     │   │                  ││
│  │ Props:              │    │ Props:              │   │ Features:        ││
│  │ - avatarUrl? ◄──────┼────┼─- filterByAvatar   │   │ - 6 demo videos  ││
│  │ - videoUrl          │    │ - layout            │   │ - 3 with avatar  ││
│  │ - title             │    │ - apiBaseUrl        │   │ - 3 without      ││
│  └─────────────────────┘    └─────────────────────┘   └──────────────────┘│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Avatar Rendering Logic                          │   │
│  │  {avatarUrl && <Avatar><AvatarImage src={avatarUrl} /></Avatar>}   │   │
│  │  ✅ If avatarUrl exists → Show avatar                               │   │
│  │  ✅ If avatarUrl is null → No avatar (clean layout)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP Requests
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API (FastAPI)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API Endpoints                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                     │   │
│  │  GET    /api/videos                    ──┐                         │   │
│  │  GET    /api/videos/{id}                 │                         │   │
│  │  POST   /api/videos                      │  Query Params:          │   │
│  │  PUT    /api/videos/{id}                 ├─ ?has_avatar=true       │   │
│  │  DELETE /api/videos/{id}                 │  ?has_avatar=false      │   │
│  │  POST   /api/videos/{id}/views           │  ?status=published      │   │
│  │  GET    /api/videos/stats/summary      ──┘                         │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Data Models (Pydantic)                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  class Video(BaseModel):                                            │   │
│  │      id: str                                                        │   │
│  │      title: str                                                     │   │
│  │      video_url: str                                                 │   │
│  │      avatar_url: str | None = None  ◄────── OPTIONAL FIELD         │   │
│  │      uploaded_by: str                                               │   │
│  │      tags: list[str] = []                                           │   │
│  │      status: str = "published"                                      │   │
│  │      ...                                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Filtering Logic                                  │   │
│  │                                                                     │   │
│  │  if has_avatar is not None:                                         │   │
│  │      if has_avatar:                                                 │   │
│  │          result = [v for v in videos if v.get("avatar_url")]        │   │
│  │      else:                                                           │   │
│  │          result = [v for v in videos if not v.get("avatar_url")]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA STORAGE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Current: In-Memory Dictionary (videos_store)                              │
│  Production: MongoDB / PostgreSQL / etc.                                   │
│                                                                             │
│  Sample Data:                                                               │
│  {                                                                          │
│    "video-1": {                                                             │
│      "id": "video-1",                                                       │
│      "title": "Tutorial",                                                   │
│      "avatar_url": "https://example.com/avatar.jpg"  ◄── HAS AVATAR        │
│    },                                                                       │
│    "video-2": {                                                             │
│      "id": "video-2",                                                       │
│      "title": "System Demo",                                                │
│      "avatar_url": null                              ◄── NO AVATAR         │
│    }                                                                        │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        TYPE SYSTEM (TypeScript)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  interface Video {                                                          │
│    id: string;                                                              │
│    title: string;                                                           │
│    videoUrl: string;                                                        │
│    avatarUrl?: string;           ◄───── Optional (?) marker                │
│    uploadedBy: string;                                                      │
│    tags?: string[];                                                         │
│    status: 'draft' | 'published' | 'archived';                             │
│  }                                                                          │
│                                                                             │
│  ✅ TypeScript enforces optional nature at compile time                    │
│  ✅ Can be null, undefined, or string                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW EXAMPLE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

1. CREATE VIDEO WITHOUT AVATAR
   ┌──────────────────────────────────────────────────────────────────┐
   │ Frontend                  Backend                    Storage     │
   │                                                                  │
   │ POST /api/videos    ──▶  Validate data       ──▶   Store:       │
   │ {                        Create ID                  {            │
   │   title: "Demo",         avatar_url: null          "avatar_url":│
   │   avatar_url: null       Status: 200                null         │
   │ }                   ◀──  Return video        ◀──   }            │
   │                          with ID                                 │
   └──────────────────────────────────────────────────────────────────┘

2. CREATE VIDEO WITH AVATAR
   ┌──────────────────────────────────────────────────────────────────┐
   │ Frontend                  Backend                    Storage     │
   │                                                                  │
   │ POST /api/videos    ──▶  Validate data       ──▶   Store:       │
   │ {                        Create ID                  {            │
   │   title: "Tutorial",     avatar_url: "url"         "avatar_url":│
   │   avatar_url: "url"      Status: 200                "url"        │
   │ }                   ◀──  Return video        ◀──   }            │
   │                          with ID                                 │
   └──────────────────────────────────────────────────────────────────┘

3. FILTER BY AVATAR
   ┌──────────────────────────────────────────────────────────────────┐
   │ Frontend                  Backend                    Storage     │
   │                                                                  │
   │ GET /api/videos     ──▶  Check param:        ──▶   Query all    │
   │ ?has_avatar=true         has_avatar=true          videos        │
   │                          Filter results      ◀──                 │
   │                   ◀──    Return only videos                      │
   │                          where avatar_url                        │
   │                          is not null                             │
   └──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            UI STATES                                        │
└─────────────────────────────────────────────────────────────────────────────┘

STATE 1: Video WITH Avatar
┌───────────────────────────────────┐
│ 👤 [Avatar] Tutorial Video        │  ◄── Avatar rendered
│             by John Doe           │
├───────────────────────────────────┤
│     [Video Player]                │
├───────────────────────────────────┤
│ Description...                    │
│ #tutorial #guide                  │
└───────────────────────────────────┘

STATE 2: Video WITHOUT Avatar
┌───────────────────────────────────┐
│ System Demo                       │  ◄── No avatar, clean layout
│ Tech Team                         │
├───────────────────────────────────┤
│     [Video Player]                │
├───────────────────────────────────┤
│ Description...                    │
│ #demo #system                     │
└───────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          KEY PRINCIPLES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

1. OPTIONAL AT EVERY LEVEL
   ✅ TypeScript: avatarUrl?: string
   ✅ Python: avatar_url: str | None = None
   ✅ UI: {avatarUrl && <Avatar />}
   ✅ API: Accepts null/omitted/valid URL

2. NO DEFAULT AVATARS
   ❌ Don't use placeholder images
   ✅ Simply don't render avatar UI
   ✅ Layout adapts naturally

3. EXPLICIT FILTERING
   ✅ has_avatar=true → Only with avatars
   ✅ has_avatar=false → Only without avatars
   ✅ No parameter → All videos

4. TRANSPARENT STATISTICS
   ✅ Total count
   ✅ With avatars count
   ✅ Without avatars count
   ✅ Percentage usage

5. GRACEFUL DEGRADATION
   ✅ Adding avatar → Instant UI update
   ✅ Removing avatar → Clean removal
   ✅ No errors in either state
   ✅ Consistent UX


┌─────────────────────────────────────────────────────────────────────────────┐
│                          TESTING MATRIX                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────┬──────────┬──────────────────────────────┐
│ Test Case                  │ Status   │ Validation                   │
├────────────────────────────┼──────────┼──────────────────────────────┤
│ Create without avatar      │ ✅ Pass  │ avatar_url is null           │
│ Create with avatar         │ ✅ Pass  │ avatar_url has value         │
│ Omit avatar field          │ ✅ Pass  │ Defaults to null             │
│ Filter has_avatar=true     │ ✅ Pass  │ Returns only with avatars    │
│ Filter has_avatar=false    │ ✅ Pass  │ Returns only without avatars │
│ Add avatar via update      │ ✅ Pass  │ Avatar added successfully    │
│ Remove avatar via update   │ ✅ Pass  │ Avatar removed successfully  │
│ Get statistics             │ ✅ Pass  │ Correct counts               │
│ UI renders with avatar     │ ✅ Pass  │ Avatar displayed             │
│ UI renders without avatar  │ ✅ Pass  │ Clean layout, no errors      │
└────────────────────────────┴──────────┴──────────────────────────────┘
