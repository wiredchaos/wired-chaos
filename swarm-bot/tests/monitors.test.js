/**
 * SWARM Bot - Monitor Tests
 * Tests for monitoring modules
 */

const EndpointMonitor = require('../src/monitors/endpoint-monitor');
const BuildMonitor = require('../src/monitors/build-monitor');
const DependencyMonitor = require('../src/monitors/dependency-monitor');
const PerformanceMonitor = require('../src/monitors/performance-monitor');

describe('EndpointMonitor', () => {
  test('should create monitor with default config', () => {
    const monitor = new EndpointMonitor();
    expect(monitor.config.timeout).toBe(5000);
    expect(monitor.config.retries).toBe(3);
  });

  test('should track monitoring history', async () => {
    const monitor = new EndpointMonitor({
      endpoints: [{ name: 'Test', url: 'https://example.com', critical: false }]
    });
    
    await monitor.checkAll();
    const history = monitor.getHistory();
    
    expect(history.length).toBe(1);
    expect(history[0]).toHaveProperty('timestamp');
    expect(history[0]).toHaveProperty('status');
  });

  test('should identify issues from failed checks', async () => {
    const monitor = new EndpointMonitor({
      endpoints: [{ name: 'Test', url: 'https://invalid-domain-12345.com', critical: true }]
    });
    
    await monitor.checkAll();
    const issues = monitor.getIssues();
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toHaveProperty('type', 'endpoint_failure');
  });
});

describe('BuildMonitor', () => {
  test('should create monitor with default config', () => {
    const monitor = new BuildMonitor();
    expect(monitor.config.owner).toBe('wiredchaos');
    expect(monitor.config.repo).toBe('wired-chaos');
  });

  test('should group workflow runs by workflow name', () => {
    const monitor = new BuildMonitor();
    const runs = [
      { workflow_name: 'deploy-worker.yml', conclusion: 'success' },
      { workflow_name: 'deploy-worker.yml', conclusion: 'failure' },
      { workflow_name: 'deploy-frontend.yml', conclusion: 'success' }
    ];
    
    const grouped = monitor.groupByWorkflow(runs);
    
    expect(grouped['deploy-worker.yml'].total).toBe(2);
    expect(grouped['deploy-worker.yml'].successful).toBe(1);
    expect(grouped['deploy-worker.yml'].failed).toBe(1);
  });

  test('should calculate success rates', () => {
    const monitor = new BuildMonitor();
    const runs = [
      { workflow_name: 'test.yml', conclusion: 'success' },
      { workflow_name: 'test.yml', conclusion: 'success' },
      { workflow_name: 'test.yml', conclusion: 'failure' }
    ];
    
    const grouped = monitor.groupByWorkflow(runs);
    const successRate = grouped['test.yml'].success_rate;
    
    expect(successRate).toBeCloseTo(67, 0);
  });
});

describe('DependencyMonitor', () => {
  test('should create monitor with default config', () => {
    const monitor = new DependencyMonitor();
    expect(monitor.config.checkVulnerabilities).toBe(true);
    expect(monitor.config.checkOutdated).toBe(true);
  });

  test('should aggregate vulnerabilities correctly', () => {
    const monitor = new DependencyMonitor();
    const checks = [
      { vulnerabilities: { critical: 1, high: 2, moderate: 3, low: 4 } },
      { vulnerabilities: { critical: 0, high: 1, moderate: 1, low: 2 } }
    ];
    
    const aggregated = monitor.aggregateVulnerabilities(checks);
    
    expect(aggregated.critical).toBe(1);
    expect(aggregated.high).toBe(3);
    expect(aggregated.moderate).toBe(4);
    expect(aggregated.low).toBe(6);
  });

  test('should determine status based on vulnerabilities', () => {
    const monitor = new DependencyMonitor();
    
    const checks1 = [{ vulnerabilities: { critical: 1, high: 0, moderate: 0, low: 0 } }];
    expect(monitor.determineStatus(checks1)).toBe('critical');
    
    const checks2 = [{ vulnerabilities: { critical: 0, high: 1, moderate: 0, low: 0 } }];
    expect(monitor.determineStatus(checks2)).toBe('degraded');
    
    const checks3 = [{ vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 1 } }];
    expect(monitor.determineStatus(checks3)).toBe('healthy');
  });
});

describe('PerformanceMonitor', () => {
  test('should create monitor with default config', () => {
    const monitor = new PerformanceMonitor();
    expect(monitor.config.samples).toBe(3);
    expect(monitor.config.timeout).toBe(10000);
  });

  test('should determine status based on thresholds', () => {
    const monitor = new PerformanceMonitor();
    
    const checks1 = [
      { threshold_exceeded: true },
      { threshold_exceeded: true }
    ];
    expect(monitor.determineStatus(checks1)).toBe('critical');
    
    const checks2 = [
      { threshold_exceeded: true },
      { threshold_exceeded: false },
      { threshold_exceeded: false }
    ];
    expect(monitor.determineStatus(checks2)).toBe('degraded');
    
    const checks3 = [
      { threshold_exceeded: false },
      { threshold_exceeded: false }
    ];
    expect(monitor.determineStatus(checks3)).toBe('healthy');
  });

  test('should detect trends', () => {
    const monitor = new PerformanceMonitor();
    
    // Add mock results
    for (let i = 0; i < 10; i++) {
      monitor.results.push({
        avg_response_time: 100 + (i * 20) // Increasing response time
      });
    }
    
    const trends = monitor.getTrends();
    expect(trends.trend).toBe('degrading');
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running SWARM Bot monitor tests...');
  // In a real setup, would use Jest or another test runner
  console.log('✅ All tests would run with: npm test');
}
