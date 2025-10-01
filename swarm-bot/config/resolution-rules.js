/**
 * SWARM Bot - Resolution Rules
 * Defines safe auto-resolution rules and guardrails
 */

module.exports = {
  // Safe operations that can be auto-resolved
  safeOperations: [
    'cache_clear',
    'purge_cache',
    'retry_workflow',
    'verify_routes',
    'check_dns',
    'check_ssl',
    'fetch_logs',
    'analyze_logs'
  ],

  // Operations requiring manual approval
  manualApprovalRequired: [
    'update_dependencies',
    'modify_code',
    'change_configuration',
    'database_migration',
    'rollback_deployment'
  ],

  // Resolution rules by issue type
  rules: {
    endpoint_failure: {
      autoResolve: true,
      maxAttempts: 3,
      cooldown: 300000, // 5 minutes
      strategies: [
        {
          condition: 'status === 404',
          strategy: 'routing_fix',
          safe: true,
          description: 'Check and fix routing configuration'
        },
        {
          condition: 'status === 500 || status === 503',
          strategy: 'worker_restart',
          safe: true,
          description: 'Redeploy Cloudflare Worker'
        },
        {
          condition: 'status === "ERROR"',
          strategy: 'cache_clear',
          safe: true,
          description: 'Clear CDN cache and retry'
        }
      ]
    },

    build_failure: {
      autoResolve: true,
      maxAttempts: 2,
      cooldown: 600000, // 10 minutes
      strategies: [
        {
          condition: 'success_rate > 90',
          strategy: 'retry_build',
          safe: true,
          description: 'Likely flaky test, retry build'
        },
        {
          condition: 'contains_cache_error',
          strategy: 'clear_cache_retry',
          safe: true,
          description: 'Clear build cache and retry'
        },
        {
          condition: 'default',
          strategy: 'diagnostic',
          safe: true,
          description: 'Analyze logs and report'
        }
      ]
    },

    security_vulnerability: {
      autoResolve: false,
      requiresManualReview: true,
      maxAttempts: 0,
      strategies: [
        {
          condition: 'severity === "critical" || severity === "high"',
          strategy: 'escalate',
          safe: true,
          description: 'Create GitHub issue for manual review'
        }
      ]
    },

    performance_degradation: {
      autoResolve: true,
      maxAttempts: 2,
      cooldown: 600000, // 10 minutes
      strategies: [
        {
          condition: 'avg_response_time > threshold * 2',
          strategy: 'cache_optimization',
          safe: true,
          description: 'Clear cache and optimize'
        },
        {
          condition: 'default',
          strategy: 'diagnostic',
          safe: true,
          description: 'Monitor and report if persists'
        }
      ]
    },

    dependency_conflict: {
      autoResolve: false,
      requiresManualReview: true,
      maxAttempts: 0,
      strategies: [
        {
          condition: 'default',
          strategy: 'escalate',
          safe: true,
          description: 'Create GitHub issue for manual resolution'
        }
      ]
    }
  },

  // Guardrails and safety checks
  guardrails: {
    // Maximum resolutions per hour
    maxResolutionsPerHour: 10,

    // Minimum time between resolutions for same endpoint
    minTimeBetweenResolutions: 300000, // 5 minutes

    // Auto-disable after consecutive failures
    disableAfterFailures: 5,

    // Require human approval for critical systems
    criticalSystemsRequireApproval: true,

    // Maximum simultaneous resolutions
    maxSimultaneousResolutions: 3
  },

  // Escalation triggers
  escalationTriggers: {
    // Auto-escalate after failed resolution attempts
    failedResolutionAttempts: 3,

    // Escalate critical issues immediately
    criticalIssuesImmediate: true,

    // Escalate if multiple systems affected
    multipleSystemsThreshold: 3,

    // Escalate if health score drops below threshold
    healthScoreThreshold: 70
  },

  // Verification requirements
  verification: {
    // Verify fix worked before marking as resolved
    verifyAfterResolution: true,

    // Wait time before verification (ms)
    verificationDelay: 5000,

    // Number of verification attempts
    verificationAttempts: 3,

    // Verification timeout (ms)
    verificationTimeout: 10000
  }
};
