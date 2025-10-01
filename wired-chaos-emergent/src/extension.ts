/**
 * WIRED CHAOS EMERGENT VSCode Extension
 * Main extension entry point
 */

import * as vscode from 'vscode';
import { PullRequestManager } from './commands/pullRequestManager';
import { ConflictResolver } from './commands/conflictResolver';
import { DeploymentManager } from './commands/deploymentManager';
import { SmokeTestRunner } from './commands/smokeTestRunner';

export function activate(context: vscode.ExtensionContext) {
    console.log('WIRED CHAOS EMERGENT extension is now active');

    const outputChannel = vscode.window.createOutputChannel('WIRED CHAOS EMERGENT');
    
    // Initialize managers
    const prManager = new PullRequestManager(outputChannel);
    const conflictResolver = new ConflictResolver(outputChannel);
    const deploymentManager = new DeploymentManager(outputChannel);
    const smokeTestRunner = new SmokeTestRunner(outputChannel);

    // Register commands
    
    // Deploy All - Full automation sequence
    const deployAllCommand = vscode.commands.registerCommand(
        'wired-chaos-emergent.deployAll',
        async () => {
            outputChannel.show();
            outputChannel.appendLine('🚀 Starting EMERGENT Full Deployment...');
            outputChannel.appendLine('='.repeat(60));
            
            try {
                // Step 1: Manage PRs
                outputChannel.appendLine('\n📋 Step 1/5: Managing Pull Requests...');
                await prManager.convertDraftsToReady();
                
                // Step 2: Resolve conflicts
                outputChannel.appendLine('\n🔧 Step 2/5: Resolving Conflicts...');
                await conflictResolver.resolveAllConflicts();
                
                // Step 3: Merge PRs
                outputChannel.appendLine('\n🔄 Step 3/5: Merging Pull Requests...');
                await prManager.mergeReadyPRs();
                
                // Step 4: Deploy to Cloudflare
                outputChannel.appendLine('\n☁️  Step 4/5: Deploying to Cloudflare...');
                await deploymentManager.deployToCloudflare();
                
                // Step 5: Run smoke tests
                outputChannel.appendLine('\n🔥 Step 5/5: Running Smoke Tests...');
                await smokeTestRunner.runAllTests();
                
                outputChannel.appendLine('\n' + '='.repeat(60));
                outputChannel.appendLine('✅ EMERGENT deployment completed successfully!');
                
                vscode.window.showInformationMessage(
                    'EMERGENT deployment completed successfully!',
                    'View Logs'
                ).then(selection => {
                    if (selection === 'View Logs') {
                        outputChannel.show();
                    }
                });
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`\n❌ Deployment failed: ${errorMessage}`);
                vscode.window.showErrorMessage(`Deployment failed: ${errorMessage}`);
            }
        }
    );

    // Manage PRs
    const managePRsCommand = vscode.commands.registerCommand(
        'wired-chaos-emergent.managePRs',
        async () => {
            outputChannel.show();
            await prManager.managePullRequests();
        }
    );

    // Resolve Conflicts
    const resolveConflictsCommand = vscode.commands.registerCommand(
        'wired-chaos-emergent.resolveConflicts',
        async () => {
            outputChannel.show();
            await conflictResolver.resolveAllConflicts();
        }
    );

    // Deploy to Cloudflare
    const deployCloudflareCommand = vscode.commands.registerCommand(
        'wired-chaos-emergent.deployCloudflare',
        async () => {
            outputChannel.show();
            await deploymentManager.deployToCloudflare();
        }
    );

    // Run Smoke Tests
    const runSmokeTestsCommand = vscode.commands.registerCommand(
        'wired-chaos-emergent.runSmokeTests',
        async () => {
            outputChannel.show();
            await smokeTestRunner.runAllTests();
        }
    );

    // Add commands to subscriptions
    context.subscriptions.push(
        deployAllCommand,
        managePRsCommand,
        resolveConflictsCommand,
        deployCloudflareCommand,
        runSmokeTestsCommand,
        outputChannel
    );

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    statusBarItem.text = '$(rocket) EMERGENT';
    statusBarItem.tooltip = 'WIRED CHAOS EMERGENT Deployment';
    statusBarItem.command = 'wired-chaos-emergent.deployAll';
    statusBarItem.show();
    
    context.subscriptions.push(statusBarItem);
}

export function deactivate() {
    console.log('WIRED CHAOS EMERGENT extension is now deactivated');
}
