/**
 * SWARM Bot - Endpoint Health Monitor
 * Monitors critical endpoints for availability and performance
 */

class EndpointMonitor {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 5000,
      retries: config.retries || 3,
      endpoints: config.endpoints || [
        { name: 'Main Health', url: 'https://www.wiredchaos.xyz/api/health', critical: true },
        { name: 'Suite Landing', url: 'https://www.wiredchaos.xyz/suite', critical: true },
        { name: 'Tax Suite', url: 'https://www.wiredchaos.xyz/tax', critical: false },
        { name: 'VSP', url: 'https://www.wiredchaos.xyz/vsp', critical: false },
        { name: 'Worker Health', url: 'https://www.wiredchaos.xyz/health', critical: true }
      ],
      ...config
    };
    this.results = [];
  }

  /**
   * Check a single endpoint
   * @param {Object} endpoint - Endpoint configuration
   * @returns {Promise<Object>} Check result
   */
  async checkEndpoint(endpoint) {
    const startTime = Date.now();
    let lastError = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(endpoint.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SWARM-Bot/1.0'
          }
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        return {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok,
          duration: `${duration}ms`,
          critical: endpoint.critical,
          healthy: response.ok,
          attempt,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.config.retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    // All retries failed
    return {
      name: endpoint.name,
      url: endpoint.url,
      status: 'ERROR',
      ok: false,
      duration: `${Date.now() - startTime}ms`,
      critical: endpoint.critical,
      healthy: false,
      error: lastError?.message || 'Unknown error',
      attempt: this.config.retries,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check all configured endpoints
   * @returns {Promise<Object>} Monitoring results
   */
  async checkAll() {
    const checks = await Promise.all(
      this.config.endpoints.map(endpoint => this.checkEndpoint(endpoint))
    );

    const summary = {
      timestamp: new Date().toISOString(),
      total: checks.length,
      healthy: checks.filter(c => c.healthy).length,
      unhealthy: checks.filter(c => !c.healthy).length,
      critical_failures: checks.filter(c => !c.healthy && c.critical).length,
      checks,
      status: this.determineOverallStatus(checks)
    };

    this.results.push(summary);
    return summary;
  }

  /**
   * Determine overall health status
   * @param {Array} checks - Array of check results
   * @returns {string} Status: 'healthy', 'degraded', or 'critical'
   */
  determineOverallStatus(checks) {
    const criticalFailures = checks.filter(c => !c.healthy && c.critical).length;
    const totalFailures = checks.filter(c => !c.healthy).length;

    if (criticalFailures > 0) return 'critical';
    if (totalFailures > 0) return 'degraded';
    return 'healthy';
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
   * Get issues that need resolution
   * @returns {Array} Array of issues
   */
  getIssues() {
    if (this.results.length === 0) return [];

    const latest = this.results[this.results.length - 1];
    return latest.checks
      .filter(check => !check.healthy)
      .map(check => ({
        type: 'endpoint_failure',
        severity: check.critical ? 'critical' : 'warning',
        endpoint: check.name,
        url: check.url,
        status: check.status,
        error: check.error,
        timestamp: check.timestamp,
        resolvable: true
      }));
  }
}

module.exports = EndpointMonitor;
