// WIRED CHAOS - Swarm Bot Orchestration Integration
// Automatically triggers deployment phases based on immediate actions completion

const { Octokit } = require('@octokit/rest');

class SwarmDeploymentOrchestrator {
    constructor(config = {}) {
        this.config = {
            owner: 'wiredchaos',
            repo: 'wired-chaos',
            orchestrationWorkflow: 'deployment-orchestration.yml',
            immediateActionLabels: ['immediate-action', 'hotfix', 'critical-fix'],
            deploymentPhases: ['phase1-foundation', 'phase2-automation', 'phase3-optimization', 'phase4-advanced'],
            ...config
        };

        this.octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        this.actionLog = [];
    }

    // Check if immediate actions are complete
    async checkImmediateActions() {
        console.log('🔍 Checking immediate actions status...');

        try {
            const { data: issues } = await this.octokit.issues.listForRepo({
                owner: this.config.owner,
                repo: this.config.repo,
                state: 'open',
                labels: this.config.immediateActionLabels.join(',')
            });

            const openImmediateActions = issues.filter(issue => {
                return this.config.immediateActionLabels.some(label =>
                    issue.labels.some(l => l.name === label)
                );
            });

            console.log(`📊 Found ${openImmediateActions.length} open immediate actions`);

            if (openImmediateActions.length === 0) {
                console.log('✅ All immediate actions complete!');
                return {
                    complete: true,
                    openActions: [],
                    readyForDeployment: true
                };
            }

            console.log(`⏳ Waiting for ${openImmediateActions.length} immediate actions to complete`);
            return {
                complete: false,
                openActions: openImmediateActions.map(issue => ({
                    number: issue.number,
                    title: issue.title,
                    labels: issue.labels.map(l => l.name)
                })),
                readyForDeployment: false
            };

        } catch (error) {
            console.error('Error checking immediate actions:', error);
            return {
                complete: false,
                error: error.message,
                readyForDeployment: false
            };
        }
    }

    // Trigger deployment orchestration
    async triggerDeploymentOrchestration(phase = 'all') {
        console.log(`🚀 Triggering deployment orchestration: ${phase}`);

        try {
            const { data: workflow } = await this.octokit.actions.createWorkflowDispatch({
                owner: this.config.owner,
                repo: this.config.repo,
                workflow_id: this.config.orchestrationWorkflow,
                ref: 'main',
                inputs: {
                    phase: phase,
                    skip_tests: 'false'
                }
            });

            console.log('✅ Deployment orchestration triggered successfully');

            // Log action
            this.actionLog.push({
                timestamp: new Date().toISOString(),
                action: 'trigger_deployment',
                phase: phase,
                status: 'triggered'
            });

            return {
                success: true,
                phase: phase,
                message: `Deployment orchestration triggered for ${phase}`
            };

        } catch (error) {
            console.error('Error triggering deployment:', error);
            return {
                success: false,
                phase: phase,
                error: error.message
            };
        }
    }

    // Monitor deployment progress
    async monitorDeploymentProgress(runId) {
        console.log(`📊 Monitoring deployment run: ${runId}`);

        try {
            const { data: run } = await this.octokit.actions.getWorkflowRun({
                owner: this.config.owner,
                repo: this.config.repo,
                run_id: runId
            });

            console.log(`Status: ${run.status}, Conclusion: ${run.conclusion || 'pending'}`);

            return {
                status: run.status,
                conclusion: run.conclusion,
                started_at: run.started_at,
                updated_at: run.updated_at,
                url: run.html_url
            };

        } catch (error) {
            console.error('Error monitoring deployment:', error);
            return {
                error: error.message
            };
        }
    }

    // Get recent deployment runs
    async getRecentDeployments(limit = 5) {
        console.log(`📋 Fetching recent deployments (limit: ${limit})...`);

        try {
            const { data: runs } = await this.octokit.actions.listWorkflowRuns({
                owner: this.config.owner,
                repo: this.config.repo,
                workflow_id: this.config.orchestrationWorkflow,
                per_page: limit
            });

            const deployments = runs.workflow_runs.map(run => ({
                id: run.id,
                status: run.status,
                conclusion: run.conclusion,
                created_at: run.created_at,
                updated_at: run.updated_at,
                url: run.html_url,
                actor: run.actor.login
            }));

            console.log(`Found ${deployments.length} recent deployments`);
            return deployments;

        } catch (error) {
            console.error('Error fetching deployments:', error);
            return [];
        }
    }

    // Auto-trigger deployment when immediate actions complete
    async autoTriggerOnCompletion() {
        console.log('🤖 AUTO-TRIGGER: Checking if deployment should be triggered...');

        const status = await this.checkImmediateActions();

        if (status.readyForDeployment) {
            console.log('✅ Immediate actions complete - triggering full deployment!');

            // Trigger all phases
            const result = await this.triggerDeploymentOrchestration('all');

            if (result.success) {
                console.log('🎉 Full deployment orchestration started!');

                // Create notification issue
                await this.createDeploymentNotification(result);

                return {
                    triggered: true,
                    result: result,
                    message: 'NO TOUCH INFRA: Deployment triggered automatically'
                };
            } else {
                console.error('❌ Failed to trigger deployment:', result.error);
                return {
                    triggered: false,
                    error: result.error
                };
            }
        } else {
            console.log('⏳ Immediate actions still pending - deployment delayed');
            return {
                triggered: false,
                reason: 'immediate_actions_pending',
                pendingActions: status.openActions
            };
        }
    }

    // Create deployment notification
    async createDeploymentNotification(deploymentResult) {
        console.log('📢 Creating deployment notification...');

        try {
            const issueBody = `# 🚀 Automated Deployment Triggered

**NO TOUCH INFRA**: Deployment orchestration has been automatically triggered by the Swarm Bot.

## Deployment Details

- **Phase:** ${deploymentResult.phase}
- **Triggered At:** ${new Date().toISOString()}
- **Triggered By:** Swarm Bot Orchestrator
- **Reason:** All immediate actions completed

## Deployment Phases

${deploymentResult.phase === 'all' ? `
- ✅ Phase 1: Foundation (Week 1)
- ✅ Phase 2: Automation (Week 2)
- ✅ Phase 3: Optimization (Week 3)
- ✅ Phase 4: Advanced Features (Week 4)
` : `
- ✅ ${deploymentResult.phase}
`}

## Monitoring

- Check [Actions](https://github.com/${this.config.owner}/${this.config.repo}/actions) for workflow progress
- View deployment artifacts after completion
- Monitor Discord/Telegram for notifications

## What Happens Next

1. ⏳ Deployment phases execute sequentially
2. 📊 Performance metrics collected
3. 🧪 A/B tests initiated
4. 📈 Scaling automation activated
5. 🎉 Final deployment report generated

## NO TOUCH INFRA

This deployment is fully automated. No manual intervention required unless errors occur.

---

**WIRED CHAOS** - Automated Deployment System 🤖
`;

            const { data: issue } = await this.octokit.issues.create({
                owner: this.config.owner,
                repo: this.config.repo,
                title: '🚀 Automated Deployment Triggered',
                body: issueBody,
                labels: ['deployment', 'automated', 'swarm-bot']
            });

            console.log(`✅ Notification issue created: #${issue.number}`);

            return issue;

        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    // Generate orchestration report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            service: 'swarm-deployment-orchestrator',
            version: '1.0.0',
            actions: this.actionLog,
            config: {
                owner: this.config.owner,
                repo: this.config.repo,
                workflow: this.config.orchestrationWorkflow,
                phases: this.config.deploymentPhases
            }
        };

        console.log('\n📊 Orchestration Report:');
        console.log(JSON.stringify(report, null, 2));

        return report;
    }

    // Main execution
    async run() {
        console.log('🚀 WIRED CHAOS Swarm Deployment Orchestrator');
        console.log('═'.repeat(60));

        // Check immediate actions
        const status = await this.checkImmediateActions();

        if (status.readyForDeployment) {
            // Auto-trigger deployment
            const result = await this.autoTriggerOnCompletion();

            if (result.triggered) {
                console.log('\n✅ Deployment successfully triggered!');
                console.log('🎯 NO TOUCH INFRA: System now runs autonomously');
            }
        } else {
            console.log('\n⏳ Waiting for immediate actions to complete');
            console.log('Pending actions:', status.openActions);
        }

        // Get recent deployments
        const recentDeployments = await this.getRecentDeployments(3);
        console.log('\n📋 Recent Deployments:', recentDeployments);

        // Generate report
        const report = this.generateReport();

        console.log('\n═'.repeat(60));
        console.log('🏁 Orchestration check complete!');

        return report;
    }
}

// CLI execution
if (require.main === module) {
    const orchestrator = new SwarmDeploymentOrchestrator();
    orchestrator.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { SwarmDeploymentOrchestrator };
