// Education Platform Tests
// Basic validation tests for curriculum and progress tracking

import { CurriculumManager } from '../src/curriculum-manager.js';
import { ProgressTracker } from '../src/progress-tracker.js';

// Test Suite
async function runTests() {
  console.log('🧪 Starting Education Platform Tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: CurriculumManager Initialization
  try {
    console.log('Test 1: CurriculumManager initialization...');
    const curriculum = new CurriculumManager();
    
    if (curriculum.tiers.community && curriculum.tiers.business) {
      console.log('✅ PASSED: CurriculumManager initialized with both tiers');
      passed++;
    } else {
      console.log('❌ FAILED: CurriculumManager missing tiers');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: CurriculumManager initialization error -', error.message);
    failed++;
  }

  // Test 2: Course Retrieval
  try {
    console.log('\nTest 2: Course retrieval...');
    const curriculum = new CurriculumManager();
    const course = curriculum.getCourse('bc-101');
    
    if (course && course.title === 'Blockchain Basics') {
      console.log('✅ PASSED: Course retrieval works');
      passed++;
    } else {
      console.log('❌ FAILED: Course not found or incorrect');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Course retrieval error -', error.message);
    failed++;
  }

  // Test 3: Prerequisites Check
  try {
    console.log('\nTest 3: Prerequisites checking...');
    const curriculum = new CurriculumManager();
    const check = curriculum.checkPrerequisites('bc-102', ['bc-101']);
    
    if (check.met === true) {
      console.log('✅ PASSED: Prerequisites check works');
      passed++;
    } else {
      console.log('❌ FAILED: Prerequisites check failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Prerequisites check error -', error.message);
    failed++;
  }

  // Test 4: ProgressTracker Initialization
  try {
    console.log('\nTest 4: ProgressTracker initialization...');
    const tracker = new ProgressTracker();
    const student = tracker.initializeStudent('student-123', '0x1234567890');
    
    if (student && student.id === 'student-123' && student.tier === 'community') {
      console.log('✅ PASSED: ProgressTracker initialized student correctly');
      passed++;
    } else {
      console.log('❌ FAILED: Student initialization incomplete');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: ProgressTracker initialization error -', error.message);
    failed++;
  }

  // Test 5: Course Enrollment
  try {
    console.log('\nTest 5: Course enrollment...');
    const tracker = new ProgressTracker();
    tracker.initializeStudent('student-123', '0x1234567890');
    const enrollment = tracker.enrollInCourse('student-123', 'bc-101', 'community');
    
    if (enrollment.success === true) {
      console.log('✅ PASSED: Course enrollment works');
      passed++;
    } else {
      console.log('❌ FAILED: Course enrollment failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Course enrollment error -', error.message);
    failed++;
  }

  // Test 6: Progress Update
  try {
    console.log('\nTest 6: Progress update...');
    const tracker = new ProgressTracker();
    tracker.initializeStudent('student-123', '0x1234567890');
    tracker.enrollInCourse('student-123', 'bc-101', 'community');
    const update = tracker.updateCourseProgress('student-123', 'bc-101', 'lesson-1', 25);
    
    if (update.success && update.progress === 25) {
      console.log('✅ PASSED: Progress update works');
      passed++;
    } else {
      console.log('❌ FAILED: Progress update failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Progress update error -', error.message);
    failed++;
  }

  // Test 7: Course Completion
  try {
    console.log('\nTest 7: Course completion and NFT issuance...');
    const tracker = new ProgressTracker();
    tracker.initializeStudent('student-123', '0x1234567890');
    tracker.enrollInCourse('student-123', 'bc-101', 'community');
    const completion = await tracker.completeCourse('student-123', 'bc-101', {
      title: 'Blockchain Basics',
      completion_nft: 'WIRED-CC-BC101',
      tier: 'community'
    });
    
    if (completion.success && completion.nft.success) {
      console.log('✅ PASSED: Course completion and NFT issuance work');
      passed++;
    } else {
      console.log('❌ FAILED: Course completion failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Course completion error -', error.message);
    failed++;
  }

  // Test 8: Dashboard Generation
  try {
    console.log('\nTest 8: Dashboard data generation...');
    const tracker = new ProgressTracker();
    tracker.initializeStudent('student-123', '0x1234567890');
    const dashboard = tracker.getDashboard('student-123');
    
    if (dashboard && dashboard.student && dashboard.progress) {
      console.log('✅ PASSED: Dashboard generation works');
      passed++;
    } else {
      console.log('❌ FAILED: Dashboard generation failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Dashboard generation error -', error.message);
    failed++;
  }

  // Test 9: Search Courses
  try {
    console.log('\nTest 9: Course search...');
    const curriculum = new CurriculumManager();
    const results = curriculum.searchCourses('blockchain', { difficulty: 'beginner' });
    
    if (results.length > 0) {
      console.log('✅ PASSED: Course search works');
      passed++;
    } else {
      console.log('❌ FAILED: Course search returned no results');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Course search error -', error.message);
    failed++;
  }

  // Test 10: Statistics
  try {
    console.log('\nTest 10: Curriculum statistics...');
    const curriculum = new CurriculumManager();
    const stats = curriculum.getStatistics();
    
    if (stats.community.courses > 0 && stats.business.departments === 4) {
      console.log('✅ PASSED: Statistics generation works');
      passed++;
    } else {
      console.log('❌ FAILED: Statistics incomplete');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Statistics error -', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50));
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
