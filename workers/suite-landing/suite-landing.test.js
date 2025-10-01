/**
 * WIRED CHAOS - Suite Landing Worker Tests
 * Tests for the /suite endpoint worker handler
 */

const { handleSuiteLanding } = require('./index.js');

/**
 * Mock Request object for testing
 */
class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
  }
}

/**
 * Test helper to create mock requests
 */
function createMockRequest(path, options = {}) {
  const baseUrl = 'https://wiredchaos.xyz';
  return new MockRequest(baseUrl + path, options);
}

/**
 * Test Suite
 */
describe('Suite Landing Worker', () => {
  
  test('should return HTML for default stub mode', async () => {
    const request = createMockRequest('/suite');
    const response = await handleSuiteLanding(request);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('X-Suite-Mode')).toBe('stub');
    
    const html = await response.text();
    expect(html).toContain('WIRED CHAOS');
    expect(html).toContain('Suite');
    expect(html).toContain('STUB MODE');
  });
  
  test('should return partial mode when requested', async () => {
    const request = createMockRequest('/suite?mode=partial');
    const response = await handleSuiteLanding(request);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Suite-Mode')).toBe('partial');
    
    const html = await response.text();
    expect(html).toContain('PARTIAL MODE');
  });
  
  test('should return full mode when requested', async () => {
    const request = createMockRequest('/suite?mode=full');
    const response = await handleSuiteLanding(request);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Suite-Mode')).toBe('full');
    
    const html = await response.text();
    expect(html).toContain('FULL MODE');
  });
  
  test('should respect X-Suite-Mode header', async () => {
    const request = createMockRequest('/suite', {
      headers: { 'X-Suite-Mode': 'partial' }
    });
    const response = await handleSuiteLanding(request);
    
    expect(response.headers.get('X-Suite-Mode')).toBe('partial');
  });
  
  test('should default to stub for invalid mode', async () => {
    const request = createMockRequest('/suite?mode=invalid');
    const response = await handleSuiteLanding(request);
    
    expect(response.headers.get('X-Suite-Mode')).toBe('stub');
  });
  
  test('should include CORS headers', async () => {
    const request = createMockRequest('/suite');
    const response = await handleSuiteLanding(request);
    
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });
  
  test('should include version header', async () => {
    const request = createMockRequest('/suite');
    const response = await handleSuiteLanding(request);
    
    expect(response.headers.get('X-Suite-Version')).toBe('1.0.0');
  });
  
  test('should include cache control', async () => {
    const request = createMockRequest('/suite');
    const response = await handleSuiteLanding(request);
    
    expect(response.headers.get('Cache-Control')).toContain('max-age');
  });

  test('should render different features for each mode', async () => {
    const stubRequest = createMockRequest('/suite?mode=stub');
    const stubResponse = await handleSuiteLanding(stubRequest);
    const stubHtml = await stubResponse.text();
    
    const partialRequest = createMockRequest('/suite?mode=partial');
    const partialResponse = await handleSuiteLanding(partialRequest);
    const partialHtml = await partialResponse.text();
    
    const fullRequest = createMockRequest('/suite?mode=full');
    const fullResponse = await handleSuiteLanding(fullRequest);
    const fullHtml = await fullResponse.text();
    
    // Each mode should have different content
    expect(stubHtml).not.toBe(partialHtml);
    expect(partialHtml).not.toBe(fullHtml);
    expect(stubHtml).not.toBe(fullHtml);
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running Suite Landing Worker Tests...');
  console.log('Note: These tests require a proper test runner like Jest.');
  console.log('Install Jest and run: npm test suite-landing.test.js');
}

module.exports = {
  createMockRequest,
  MockRequest
};
