/**
 * SWARM Bot - Performance Monitor
 * Monitors system performance metrics and response times
 */

class PerformanceMonitor {
  constructor(config = {}) {
    this.config = {
      endpoints: config.endpoints || [
        { name: 'Main Site', url: 'https://www.wiredchaos.xyz/', threshold: 2000 },
        { name: 'API Health', url: 'https://www.wiredchaos.xyz/api/health', threshold: 1000 },
        { name: 'Suite Landing', url: 'https://www.wiredchaos.xyz/suite', threshold: 2000 }
      ],
      samples: config.samples || 3,
      timeout: config.timeout || 10000,
      ...config
    };
    this.results = [];
  }

  /**
   * Measure performance for a single endpoint
   * @param {Object} endpoint - Endpoint configuration
   * @returns {Promise<Object>} Performance metrics
   */
  async measureEndpoint(endpoint) {
    const measurements = [];

    for (let i = 0; i < this.config.samples; i++) {
      try {
        const startTime = performance.now();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(endpoint.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SWARM-Bot/1.0'
          }
        });

        clearTimeout(timeoutId);
        const duration = performance.now() - startTime;

        measurements.push({
          duration,
          status: response.status,
          ok: response.ok
        });

        // Small delay between samples
        if (i < this.config.samples - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        measurements.push({
          duration: this.config.timeout,
          error: error.message,
          ok: false
        });
      }
    }

    // Calculate statistics
    const durations = measurements.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return {
      name: endpoint.name,
      url: endpoint.url,
      threshold: endpoint.threshold,
      samples: this.config.samples,
      avg: Math.round(avg),
      min: Math.round(min),
      max: Math.round(max),
      threshold_exceeded: avg > endpoint.threshold,
      measurements,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check performance for all configured endpoints
   * @returns {Promise<Object>} Performance results
   */
  async checkPerformance() {
    try {
      const checks = await Promise.all(
        this.config.endpoints.map(endpoint => this.measureEndpoint(endpoint))
      );

      const summary = {
        timestamp: new Date().toISOString(),
        total: checks.length,
        slow: checks.filter(c => c.threshold_exceeded).length,
        fast: checks.filter(c => !c.threshold_exceeded).length,
        avg_response_time: Math.round(
          checks.reduce((sum, c) => sum + c.avg, 0) / checks.length
        ),
        checks,
        status: this.determineStatus(checks)
      };

      this.results.push(summary);
      return summary;
    } catch (error) {
      return {
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Determine overall performance status
   * @param {Array} checks - Array of performance checks
   * @returns {string} Status: 'healthy', 'degraded', or 'critical'
   */
  determineStatus(checks) {
    const slowCount = checks.filter(c => c.threshold_exceeded).length;
    const slowRate = slowCount / checks.length;

    if (slowRate >= 0.5) return 'critical';
    if (slowRate >= 0.2) return 'degraded';
    return 'healthy';
  }

  /**
   * Get issues that need attention
   * @returns {Array} Array of performance issues
   */
  getIssues() {
    if (this.results.length === 0) return [];

    const latest = this.results[this.results.length - 1];
    return latest.checks
      .filter(check => check.threshold_exceeded)
      .map(check => ({
        type: 'performance_degradation',
        severity: check.avg > check.threshold * 2 ? 'critical' : 'warning',
        endpoint: check.name,
        url: check.url,
        avg_response_time: `${check.avg}ms`,
        threshold: `${check.threshold}ms`,
        timestamp: check.timestamp,
        resolvable: true
      }));
  }

  /**
   * Get recent monitoring history
   * @param {number} limit - Number of recent results to return
   * @returns {Array} Recent results
   */
  getHistory(limit = 10) {
    return this.results.slice(-limit);
  }

  /**
   * Get performance trends over time
   * @returns {Object} Trend analysis
   */
  getTrends() {
    if (this.results.length < 2) {
      return { trend: 'insufficient_data', message: 'Need at least 2 data points' };
    }

    const recent = this.results.slice(-10);
    const avgTimes = recent.map(r => r.avg_response_time);
    
    // Simple trend detection
    const firstHalf = avgTimes.slice(0, Math.floor(avgTimes.length / 2));
    const secondHalf = avgTimes.slice(Math.floor(avgTimes.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    return {
      trend: change > 20 ? 'degrading' : change < -20 ? 'improving' : 'stable',
      change_percent: Math.round(change),
      first_half_avg: Math.round(firstAvg),
      second_half_avg: Math.round(secondAvg)
    };
  }
}

module.exports = PerformanceMonitor;
