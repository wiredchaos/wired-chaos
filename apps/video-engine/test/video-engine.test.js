// Video Engine Tests
// Basic validation tests for video creation pipeline

import { GammaVideoConverter } from '../src/gamma-converter.js';
import { AIeNarrator } from '../src/ai-narrator.js';

// Test Suite
async function runTests() {
  console.log('🧪 Starting Video Engine Tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: GammaVideoConverter Initialization
  try {
    console.log('Test 1: GammaVideoConverter initialization...');
    const converter = new GammaVideoConverter();
    
    if (converter.brandKit && converter.renderQueue) {
      console.log('✅ PASSED: GammaVideoConverter initialized correctly');
      passed++;
    } else {
      console.log('❌ FAILED: GammaVideoConverter initialization incomplete');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: GammaVideoConverter initialization error -', error.message);
    failed++;
  }

  // Test 2: Video Conversion
  try {
    console.log('\nTest 2: Video conversion workflow...');
    const converter = new GammaVideoConverter();
    const result = await converter.convertToVideo('test-deck-123', {
      ai_narrator: 'builder',
      background_music: 'ambient'
    });
    
    if (result.success && result.jobId) {
      console.log('✅ PASSED: Video conversion workflow works');
      passed++;
    } else {
      console.log('❌ FAILED: Video conversion returned failure');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Video conversion error -', error.message);
    failed++;
  }

  // Test 3: AI Narrator Initialization
  try {
    console.log('\nTest 3: AI Narrator initialization...');
    const narrator = new AIeNarrator();
    const voices = narrator.getAvailableVoices();
    
    if (voices.length === 5 && voices.find(v => v.id === 'builder')) {
      console.log('✅ PASSED: AI Narrator initialized with all personas');
      passed++;
    } else {
      console.log('❌ FAILED: AI Narrator missing expected voices');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: AI Narrator initialization error -', error.message);
    failed++;
  }

  // Test 4: Narration Generation
  try {
    console.log('\nTest 4: Narration generation...');
    const narrator = new AIeNarrator();
    const script = {
      sections: [
        { slideId: 1, narration: 'Test narration', duration: 5 }
      ]
    };
    const result = await narrator.generateNarration(script, 'builder');
    
    if (result.success && result.files.length === 1) {
      console.log('✅ PASSED: Narration generation works');
      passed++;
    } else {
      console.log('❌ FAILED: Narration generation failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Narration generation error -', error.message);
    failed++;
  }

  // Test 5: Render Queue Management
  try {
    console.log('\nTest 5: Render queue management...');
    const converter = new GammaVideoConverter();
    const jobId = converter.addToRenderQueue({
      composition: { test: 'data' },
      output_formats: { youtube: true },
      priority: 'normal'
    });
    const status = converter.getRenderQueueStatus();
    
    if (jobId && status.total === 1 && status.queued === 1) {
      console.log('✅ PASSED: Render queue management works');
      passed++;
    } else {
      console.log('❌ FAILED: Render queue management failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ FAILED: Render queue error -', error.message);
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
