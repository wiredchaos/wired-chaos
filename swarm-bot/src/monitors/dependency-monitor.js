/**
 * SWARM Bot - Dependency Monitor
 * Monitors for dependency conflicts and security vulnerabilities
 */

class DependencyMonitor {
  constructor(config = {}) {
    this.config = {
      packageFiles: config.packageFiles || [
        'package.json',
        'frontend/package.json',
        'gamma-wix-automation/package.json',
        'wix-gamma-integration/package.json'
      ],
      checkVulnerabilities: config.checkVulnerabilities !== false,
      checkOutdated: config.checkOutdated !== false,
      ...config
    };
    this.results = [];
  }

  /**
   * Check all package files for issues
   * @returns {Promise<Object>} Dependency check results
   */
  async checkDependencies() {
    try {
      const checks = await Promise.all(
        this.config.packageFiles.map(file => this.checkPackageFile(file))
      );

      const summary = {
        timestamp: new Date().toISOString(),
        total_packages: checks.reduce((sum, c) => sum + (c.total || 0), 0),
        vulnerabilities: this.aggregateVulnerabilities(checks),
        outdated: checks.reduce((sum, c) => sum + (c.outdated || 0), 0),
        conflicts: this.detectConflicts(checks),
        packages: checks,
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
   * Check a single package file
   * @param {string} file - Path to package.json
   * @returns {Promise<Object>} Package check result
   */
  async checkPackageFile(file) {
    // In production, would run npm audit and npm outdated
    // For now, return mock data
    return {
      file,
      total: 50,
      vulnerabilities: {
        critical: 0,
        high: 0,
        moderate: 1,
        low: 2
      },
      outdated: 5,
      conflicts: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Aggregate vulnerability counts
   * @param {Array} checks - Array of package check results
   * @returns {Object} Aggregated vulnerabilities
   */
  aggregateVulnerabilities(checks) {
    const total = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0
    };

    for (const check of checks) {
      if (check.vulnerabilities) {
        total.critical += check.vulnerabilities.critical || 0;
        total.high += check.vulnerabilities.high || 0;
        total.moderate += check.vulnerabilities.moderate || 0;
        total.low += check.vulnerabilities.low || 0;
      }
    }

    return total;
  }

  /**
   * Detect version conflicts between packages
   * @param {Array} checks - Array of package check results
   * @returns {Array} Array of conflicts
   */
  detectConflicts(checks) {
    // In production, would analyze dependencies across all package.json files
    // and detect version mismatches
    return [];
  }

  /**
   * Determine overall dependency health status
   * @param {Array} checks - Array of package check results
   * @returns {string} Status: 'healthy', 'degraded', or 'critical'
   */
  determineStatus(checks) {
    const vulns = this.aggregateVulnerabilities(checks);

    if (vulns.critical > 0) return 'critical';
    if (vulns.high > 0) return 'degraded';
    if (vulns.moderate > 3) return 'degraded';
    return 'healthy';
  }

  /**
   * Get issues that need resolution
   * @returns {Array} Array of dependency issues
   */
  getIssues() {
    if (this.results.length === 0) return [];

    const latest = this.results[this.results.length - 1];
    const issues = [];

    const vulns = latest.vulnerabilities;
    if (vulns.critical > 0) {
      issues.push({
        type: 'security_vulnerability',
        severity: 'critical',
        count: vulns.critical,
        level: 'critical',
        description: `${vulns.critical} critical security vulnerabilities found`,
        timestamp: latest.timestamp,
        resolvable: true
      });
    }

    if (vulns.high > 0) {
      issues.push({
        type: 'security_vulnerability',
        severity: 'warning',
        count: vulns.high,
        level: 'high',
        description: `${vulns.high} high security vulnerabilities found`,
        timestamp: latest.timestamp,
        resolvable: true
      });
    }

    if (latest.conflicts && latest.conflicts.length > 0) {
      for (const conflict of latest.conflicts) {
        issues.push({
          type: 'dependency_conflict',
          severity: 'warning',
          ...conflict,
          timestamp: latest.timestamp,
          resolvable: false
        });
      }
    }

    return issues;
  }

  /**
   * Get recent monitoring history
   * @param {number} limit - Number of recent results to return
   * @returns {Array} Recent results
   */
  getHistory(limit = 10) {
    return this.results.slice(-limit);
  }
}

module.exports = DependencyMonitor;
