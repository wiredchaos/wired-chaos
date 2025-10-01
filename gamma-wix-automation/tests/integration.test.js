#!/usr/bin/env node
/**
 * Integration Tests
 * Tests for GAMMA-Wix integration workflow
 */

import { PresentationGenerator } from '../src/presentation-generator.js';
import { ContentSync } from '../src/content-sync.js';
import TemplateManager from '../src/template-manager.js';

const TESTS = {
  passed: 0,
  failed: 0,
  total: 0
};

function assert(condition, message) {
  TESTS.total++;
  if (condition) {
    TESTS.passed++;
    console.log(`  ✅ ${message}`);
    return true;
  } else {
    TESTS.failed++;
    console.log(`  ❌ ${message}`);
    return false;
  }
}

function testHeader(name) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ${name}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

async function testPresentationGenerator() {
  testHeader('Presentation Generator Tests');
  
  const generator = new PresentationGenerator();
  assert(generator !== null, 'PresentationGenerator instantiated');
  assert(generator.gammaClient !== null, 'GAMMA client initialized');
  assert(generator.wixClient !== null, 'Wix client initialized');
  assert(generator.templateManager !== null, 'Template manager initialized');
}

async function testTemplateManager() {
  testHeader('Template Manager Tests');
  
  const manager = new TemplateManager();
  assert(manager !== null, 'TemplateManager instantiated');
  
  // Test slide creation methods
  const titleSlide = manager.createTitleSlide('Test', 'Subtitle');
  assert(titleSlide.type === 'title', 'Title slide created');
  assert(titleSlide.title === 'Test', 'Title slide has correct title');
  
  const contentSlide = manager.createContentSlide('Content', 'Body text');
  assert(contentSlide.type === 'content', 'Content slide created');
  assert(contentSlide.title === 'Content', 'Content slide has correct title');
  
  const codeSlide = manager.createCodeSlide('Code', 'const x = 1;', 'javascript');
  assert(codeSlide.type === 'code', 'Code slide created');
  assert(codeSlide.content.language === 'javascript', 'Code slide has correct language');
}

async function testComponentPresentation() {
  testHeader('Component Presentation Tests');
  
  const manager = new TemplateManager();
  
  const componentData = {
    name: 'Test Component',
    description: 'Test description',
    overview: 'Component overview',
    features: ['Feature 1', 'Feature 2'],
    codeExample: 'const component = new TestComponent();',
    language: 'javascript'
  };
  
  const presentation = manager.generateComponentPresentation(componentData);
  
  assert(presentation !== null, 'Component presentation generated');
  assert(presentation.title === 'Test Component', 'Presentation has correct title');
  assert(Array.isArray(presentation.slides), 'Presentation has slides array');
  assert(presentation.slides.length > 0, 'Presentation has slides');
  assert(presentation.type === 'component', 'Presentation type is component');
}

async function testFeaturePresentation() {
  testHeader('Feature Presentation Tests');
  
  const manager = new TemplateManager();
  
  const featureData = {
    name: 'Test Feature',
    version: 'v1.0',
    description: 'Feature description',
    benefits: ['Benefit 1', 'Benefit 2'],
    implementation: 'const feature = new Feature();',
    gettingStarted: 'Getting started guide'
  };
  
  const presentation = manager.generateFeaturePresentation(featureData);
  
  assert(presentation !== null, 'Feature presentation generated');
  assert(presentation.title === 'Test Feature', 'Presentation has correct title');
  assert(Array.isArray(presentation.slides), 'Presentation has slides array');
  assert(presentation.type === 'feature', 'Presentation type is feature');
}

async function testMilestonePresentation() {
  testHeader('Milestone Presentation Tests');
  
  const manager = new TemplateManager();
  
  const milestoneData = {
    name: 'Test Milestone',
    date: '2025-01-01',
    summary: 'Milestone summary',
    achievements: ['Achievement 1', 'Achievement 2'],
    nextSteps: ['Step 1', 'Step 2']
  };
  
  const presentation = manager.generateMilestonePresentation(milestoneData);
  
  assert(presentation !== null, 'Milestone presentation generated');
  assert(presentation.title === 'Test Milestone', 'Presentation has correct title');
  assert(Array.isArray(presentation.slides), 'Presentation has slides array');
  assert(presentation.type === 'milestone', 'Presentation type is milestone');
}

async function testContentSync() {
  testHeader('Content Sync Tests');
  
  const sync = new ContentSync();
  assert(sync !== null, 'ContentSync instantiated');
  assert(sync.gammaClient !== null, 'GAMMA client initialized');
  assert(sync.wixClient !== null, 'Wix client initialized');
  
  // Test Wix content conversion
  const wixItem = {
    title: 'Test Item',
    description: 'Test description',
    content: 'Test content',
    metadata: { type: 'test' }
  };
  
  const slides = sync.convertWixContentToSlides(wixItem);
  assert(Array.isArray(slides), 'Wix content converted to slides');
  assert(slides.length > 0, 'Converted slides array not empty');
  assert(slides[0].type === 'title', 'First slide is title');
}

async function testWorkflowIntegration() {
  testHeader('Workflow Integration Tests');
  
  // Test configuration loading
  const config = await import('../config/gamma-config.js');
  assert(config !== null, 'Configuration module loaded');
  assert(config.config !== null, 'Config object exists');
  assert(config.config.gamma !== null, 'GAMMA config exists');
  assert(config.config.wix !== null, 'Wix config exists');
  
  // Test environment management
  const env = await import('../config/environment.js');
  assert(env !== null, 'Environment module loaded');
  assert(env.environments !== null, 'Environments defined');
}

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║           Integration Tests                              ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    await testPresentationGenerator();
    await testTemplateManager();
    await testComponentPresentation();
    await testFeaturePresentation();
    await testMilestonePresentation();
    await testContentSync();
    await testWorkflowIntegration();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Test Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Total:   ${TESTS.total}`);
    console.log(`  Passed:  ${TESTS.passed}`);
    console.log(`  Failed:  ${TESTS.failed}`);
    console.log(`  Success: ${((TESTS.passed / TESTS.total) * 100).toFixed(1)}%`);
    console.log('');
    
    if (TESTS.failed === 0) {
      console.log('🎉 All integration tests passed!');
      process.exit(0);
    } else {
      console.log(`⚠️  ${TESTS.failed} test(s) failed`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
