// test-swarm-general.js
// Integration and unit tests for SWARM General workflow, SwarmBotAutomation, and HealthBotVSCodeIntegration

const { SwarmBotAutomation } = require('./swarm-bot-automation.js');
const { HealthBotVSCodeIntegration } = require('./health-bot-vscode-integration.js');

describe('SWARM General Workflow Integration', () => {
  test('SwarmBotAutomation class instantiates and exposes expected methods', () => {
    const swarmBot = new SwarmBotAutomation();
    expect(typeof swarmBot.monitorBlockingIssues).toBe('function');
    expect(typeof swarmBot.triageIssue).toBe('function');
    expect(typeof swarmBot.run).toBe('function');
  });

  test('HealthBotVSCodeIntegration class instantiates and exposes expected methods', () => {
    const healthBot = new HealthBotVSCodeIntegration();
    expect(typeof healthBot.monitorVSCodeAutomation).toBe('function');
    expect(typeof healthBot.monitorDeploymentHealth).toBe('function');
    expect(typeof healthBot.generateHealthDashboard).toBe('function');
  });

  test('SwarmBotAutomation has deployment fix pattern', () => {
    const swarmBot = new SwarmBotAutomation();
    const patterns = swarmBot.config.autoFixPatterns;
    expect(patterns.deploymentError).toBeDefined();
    expect(patterns.deploymentError.autoFixable).toBe(true);
  });

  test('HealthBotVSCodeIntegration uses configurable health thresholds', () => {
    const healthBot = new HealthBotVSCodeIntegration({
      healthThresholds: { critical: 60, warning: 80, good: 90 }
    });
    expect(healthBot.config.healthThresholds.critical).toBe(60);
    expect(healthBot.config.healthThresholds.warning).toBe(80);
    expect(healthBot.config.healthThresholds.good).toBe(90);
  });

  test('SwarmBotAutomation triage rules are configurable', () => {
    const customRule = {
      urgent: {
        condition: (issue) => issue.labels.some(l => l.name === 'urgent'),
        priority: 0,
        escalate: true
      }
    };
    const swarmBot = new SwarmBotAutomation({ triageRules: customRule });
    expect(swarmBot.config.triageRules.urgent).toBeDefined();
  });
});
