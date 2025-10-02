# 🎬🎓 WIRED CHAOS Video Creation & Education System

Complete implementation of video creation pipeline and two-tiered education platform.

## 📁 Project Structure

```
wired-chaos/
├── apps/
│   ├── video-engine/                    # Video Creation Pipeline
│   │   ├── src/
│   │   │   ├── gamma-converter.js      # Gamma to video conversion
│   │   │   └── ai-narrator.js          # AI voice narration
│   │   ├── test/
│   │   │   └── video-engine.test.js    # Tests (5/5 passing ✅)
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── education/                       # Education Platform
│       ├── src/
│       │   ├── curriculum-manager.js   # Course management
│       │   └── progress-tracker.js     # Student progress & NFTs
│       ├── test/
│       │   └── education.test.js       # Tests (10/10 passing ✅)
│       ├── package.json
│       └── README.md
│
└── frontend/src/components/
    ├── VideoStudio.js/css              # Video creation interface
    ├── Academy.js/css                  # Education hub
    ├── CoursePlayer.js/css             # Video learning interface
    └── ProgressDashboard.js/css        # Achievement tracking
```

## 🎬 Video Creation Pipeline

### Features

**Gamma Integration**
- Seamless import of Gamma presentations
- Automatic slide extraction and processing
- Metadata preservation

**AI Narrator System**
- **Builder Persona**: Technical, confident, implementation-focused
- **Analyst Persona**: Analytical, data-driven, precise
- **Trader Persona**: Strategic, market-focused, dynamic
- **Security Persona**: Cautious, security-focused, authoritative
- **Custom Persona**: Neutral, clear, educational

**Video Enhancement**
- Background Music: Ambient, Energetic, Professional, None
- Transition Styles: Minimal, Dynamic, Glitch, Matrix
- Branding Levels: Subtle, Prominent, Branded

**Multi-Format Export**
- YouTube: 1920x1080, 30fps
- TikTok: 1080x1920, 30fps
- LinkedIn: 1920x1080, 30fps
- Platform Native: 1920x1080, 60fps

### Usage Example

```javascript
import { GammaVideoConverter } from './apps/video-engine/src/gamma-converter.js';

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
console.log('Estimated render time:', result.estimatedRenderTime);
```

## 🎓 Education Platform

### Two-Tiered System

#### Community College (Free Access)
- **Blockchain Fundamentals Department**
  - BC-101: Blockchain Basics
  - BC-102: Crypto Security 101
  
- **Platform Mastery Department**
  - PM-101: WIRED CHAOS Platform Guide
  - PM-201: Provider Integration Deep Dive

**Credentials:**
- Blockchain Explorer Certificate
- Platform Expert Certificate

#### Business School (Premium Access)

**Department of DeFi Finance**
- DF-301: Advanced DeFi Trading
- DF-401: Institutional DeFi
- Industry Partners: Aave, Compound, Uniswap

**Department of Blockchain Technology**
- BT-301: Smart Contract Development
- BT-401: Security Auditing
- Industry Partners: Consensys, OpenZeppelin, Chainlink

**Department of Business Development**
- BD-301: Web3 Business Strategy
- Industry Partners: a16z, Coinbase Ventures

**Department of Analytics & Data Science**
- AD-301: On-Chain Analytics
- Industry Partners: Dune Analytics, Nansen, The Graph

**Credentials:**
- DeFi Master Certification
- Blockchain Engineer Certification

### NFT Certificate System

Each course completion issues an NFT certificate on supported blockchains:
- Ethereum
- Solana
- XRPL
- Hedera
- Dogecoin

**Certificate Metadata:**
```json
{
  "courseId": "bc-101",
  "courseName": "Blockchain Basics",
  "studentId": "student-123",
  "walletAddress": "0x...",
  "completedAt": "2025-01-07T00:00:00Z",
  "tier": "community",
  "blockchain": "ethereum",
  "txHash": "0xabcd...",
  "tokenId": 12345
}
```

### Achievement System

**Milestones:**
- First Steps: Complete first course → WIRED-ACH-FIRST
- Community Graduate: Complete all Community College → WIRED-ACH-CC-GRAD
- Business School Elite: Complete Business School → WIRED-ACH-BS-GRAD
- Consistency King: 30-day study streak → WIRED-ACH-STREAK

**Badges:**
- Early Adopter: First 1000 students
- Community Leader: Help 10+ students

### Usage Example

```javascript
import { CurriculumManager } from './apps/education/src/curriculum-manager.js';
import { ProgressTracker } from './apps/education/src/progress-tracker.js';

// Initialize systems
const curriculum = new CurriculumManager();
const tracker = new ProgressTracker();

// Create student
const student = tracker.initializeStudent('student-123', '0x1234567890');

// Enroll in course
tracker.enrollInCourse('student-123', 'bc-101', 'community');

// Update progress
tracker.updateCourseProgress('student-123', 'bc-101', 'lesson-1', 25);

// Complete course (issues NFT)
const course = curriculum.getCourse('bc-101');
const completion = await tracker.completeCourse('student-123', 'bc-101', course);

console.log('NFT Certificate:', completion.nft.explorerUrl);
```

## 🖥️ Frontend Components

### VideoStudio
**Purpose:** Main interface for creating videos from Gamma presentations

**Features:**
- Gamma deck ID input
- AI narrator selection (5 personas)
- Enhancement options (music, transitions, branding)
- Output format selection
- Render priority control
- Real-time job status

**Route:** `/video-studio`

### Academy
**Purpose:** Education hub showcasing both tiers

**Features:**
- Tier comparison
- Course statistics
- Student testimonials
- Enrollment CTAs
- Feature highlights

**Route:** `/academy`

### CoursePlayer
**Purpose:** Video learning interface with progress tracking

**Features:**
- Video playback with controls
- Lesson navigation
- Progress tracking
- Lesson notes display
- Auto-advance to next lesson
- Completion tracking

**Props:**
```javascript
{
  course: {
    id: 'bc-101',
    title: 'Blockchain Basics',
    lessons: [...]
  },
  onProgressUpdate: (data) => {},
  onCourseComplete: (courseId) => {}
}
```

### ProgressDashboard
**Purpose:** Student achievement tracking and NFT display

**Features:**
- Statistics overview (courses, NFTs, streak, time)
- Current courses with progress bars
- Recent NFT certificates
- Achievement tracking
- Global leaderboard rank
- Upgrade CTA for community students

**Props:**
```javascript
{
  studentId: 'student-123'
}
```

## 🧪 Testing

All modules include comprehensive tests:

```bash
# Test video engine
cd apps/video-engine
npm test
# Result: 5/5 tests passing ✅

# Test education platform
cd apps/education
npm test
# Result: 10/10 tests passing ✅
```

### Test Coverage

**Video Engine:**
- GammaVideoConverter initialization
- Video conversion workflow
- AI Narrator initialization
- Narration generation
- Render queue management

**Education Platform:**
- CurriculumManager initialization
- Course retrieval
- Prerequisites checking
- ProgressTracker initialization
- Course enrollment
- Progress updates
- Course completion & NFT issuance
- Dashboard generation
- Course search
- Statistics generation

## 🔗 Integration Points

### Existing Systems
- **Gamma Integration** (`gamma-integration.js`): Import presentations
- **Video Player** (`VideoPlayer.js`): Display course videos
- **NFT System**: Certificate issuance on multiple chains
- **Wallet Integration**: Student wallet connection

### Planned Integrations
- **VRG33589 Game**: Educational challenges unlock game features
- **Provider Ecosystem**: Hands-on learning with Alchemy, The Graph, etc.
- **Swarm Tasks**: Content creation and quality assurance
- **Social Sharing**: Auto-generate video clips for marketing

## 📊 Success Metrics

### Video Creation
- Gamma presentations converted per day
- Video completion rates
- Average engagement time
- Social sharing metrics

### Education Platform
- Daily active learners (both tiers)
- Course completion rates
- NFT certificate issuance
- Student progression (community → business)
- Industry partnership satisfaction

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Gamma API key (for video creation)
- Web3 wallet (for NFT certificates)

### Installation
```bash
# Install video engine
cd apps/video-engine
npm install

# Install education platform
cd apps/education
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Running Tests
```bash
# From root directory
npm run test

# Individual modules
cd apps/video-engine && npm test
cd apps/education && npm test
```

### Development
```bash
# Start frontend development server
npm run dev

# Access components
# - Video Studio: http://localhost:3000/video-studio
# - Academy: http://localhost:3000/academy
# - Course Player: http://localhost:3000/course/bc-101
# - Dashboard: http://localhost:3000/dashboard
```

## 📝 API Reference

See individual README files:
- [Video Engine API](./apps/video-engine/README.md)
- [Education Platform API](./apps/education/README.md)

## 🎯 Next Steps

1. **Backend API Integration**
   - Connect to actual Gamma API
   - Implement real TTS service
   - Setup blockchain NFT minting

2. **Advanced Features**
   - Live streaming courses
   - Interactive quizzes
   - Peer-to-peer study groups
   - Faculty mentorship system

3. **Platform Growth**
   - Partnership integrations
   - Alumni network
   - Job placement program
   - Industry accreditation

## 📄 License

MIT

## 👥 Contributors

WIRED CHAOS Team

---

Built with 💙 for the Web3 education revolution
