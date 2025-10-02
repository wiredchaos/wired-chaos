# 🎓 WIRED CHAOS Education Platform

Two-tiered blockchain education system with NFT certificates and achievement tracking.

## Overview

The WIRED CHAOS Education Platform provides comprehensive blockchain and DeFi education through two tiers:

- **Community College** (Free): Foundation courses for beginners
- **Business School** (Premium): Advanced strategies and enterprise solutions

## Features

- **Two-Tiered System**: Free community courses + premium business programs
- **NFT Certificates**: Blockchain-verified course completion certificates
- **Achievement System**: Milestones, badges, and skill tracking
- **Department Structure**: Organized curriculum by specialization
- **Progress Tracking**: Detailed student analytics and dashboards
- **Industry Partnerships**: Direct connections with blockchain companies
- **Prerequisites System**: Smart course sequencing
- **Credential Paths**: Guided learning journeys

## Installation

```bash
cd apps/education
npm install
```

## Usage

### Curriculum Management

```javascript
import { CurriculumManager } from './src/curriculum-manager.js';

const curriculum = new CurriculumManager();

// Get a course
const course = curriculum.getCourse('bc-101');

// Search courses
const results = curriculum.searchCourses('blockchain', {
  tier: 'community',
  difficulty: 'beginner'
});

// Check prerequisites
const prereqCheck = curriculum.checkPrerequisites('bc-102', ['bc-101']);

// Get learning path
const path = curriculum.getLearningPath('blockchain-explorer', 'community');

// Get statistics
const stats = curriculum.getStatistics();
```

### Progress Tracking

```javascript
import { ProgressTracker } from './src/progress-tracker.js';

const tracker = new ProgressTracker();

// Initialize student
const student = tracker.initializeStudent('student-123', '0x1234567890abcdef');

// Enroll in course
tracker.enrollInCourse('student-123', 'bc-101', 'community');

// Update progress
tracker.updateCourseProgress('student-123', 'bc-101', 'lesson-1', 25);

// Complete course (issues NFT)
const completion = await tracker.completeCourse('student-123', 'bc-101', {
  title: 'Blockchain Basics',
  completion_nft: 'WIRED-CC-BC101',
  tier: 'community'
});

// Get dashboard
const dashboard = tracker.getDashboard('student-123');

// Upgrade to Business School
tracker.upgradeToBusiness('student-123');
```

## Curriculum Structure

### Community College (Tier 1 - Free)

**Departments:**
- **Blockchain Fundamentals**: Wallet setup, transactions, security
- **Platform Mastery**: WIRED CHAOS tools, provider integration

**Courses:**
- BC-101: Blockchain Basics
- BC-102: Crypto Security 101
- PM-101: WIRED CHAOS Platform Guide
- PM-201: Provider Integration Deep Dive

**Credentials:**
- Blockchain Explorer Certificate
- Platform Expert Certificate

### Business School (Tier 2 - Premium)

**Departments:**

1. **DeFi Finance**
   - Advanced trading strategies
   - Portfolio management
   - Yield optimization
   - Risk management

2. **Blockchain Technology**
   - Smart contract development
   - Security auditing
   - Protocol design
   - Layer 2 solutions

3. **Business Development**
   - Partnership strategies
   - Tokenomics design
   - Go-to-market planning
   - Ecosystem building

4. **Analytics & Data Science**
   - On-chain analysis
   - MEV strategies
   - Market microstructure
   - Quantitative trading

**Credentials:**
- DeFi Master Certification
- Blockchain Engineer Certification

## API Reference

### CurriculumManager

#### Methods

##### `getCourse(courseId, tier)`
Retrieve course by ID.

##### `getCoursesByTier(tier)`
Get all courses for a tier (community|business).

##### `checkPrerequisites(courseId, completedCourses)`
Check if student meets course prerequisites.

##### `getLearningPath(credentialId, tier)`
Get structured learning path for a credential.

##### `getDepartment(departmentId, tier)`
Get department information.

##### `searchCourses(query, filters)`
Search courses with filters.

##### `getStatistics()`
Get curriculum statistics.

### ProgressTracker

#### Methods

##### `initializeStudent(studentId, walletAddress)`
Initialize new student record.

##### `enrollInCourse(studentId, courseId, courseTier)`
Enroll student in course.

##### `updateCourseProgress(studentId, courseId, lessonId, progressPercent)`
Update course progress.

##### `completeCourse(studentId, courseId, courseData)`
Complete course and issue NFT certificate.

##### `checkAchievements(studentId)`
Check and award achievements.

##### `awardBadge(studentId, badgeId)`
Award special badge to student.

##### `upgradeToBusiness(studentId)`
Upgrade student to Business School tier.

##### `getDashboard(studentId)`
Get student dashboard data.

##### `getLeaderboard(metric, limit)`
Get student leaderboard.

## NFT Certificates

Each course completion issues an NFT certificate on one of the supported blockchains:
- Ethereum
- Solana
- XRPL
- Hedera
- Dogecoin

Certificate metadata includes:
- Course ID and name
- Student ID and wallet
- Completion date
- Tier information

## Achievement System

**Milestones:**
- First Steps: Complete first course
- Community Graduate: Complete all Community College
- Business School Elite: Complete Business School
- Consistency King: 30-day study streak

**Badges:**
- Early Adopter: First 1000 students
- Community Leader: Help 10+ students

## Testing

```bash
npm test
```

## Integration Points

- **Gamma Integration**: Video courses from presentations
- **VRG33589 Game**: Educational challenges and rewards
- **Provider Ecosystem**: Hands-on learning with partners
- **Swarm Tasks**: Content creation and quality assurance

## License

MIT
