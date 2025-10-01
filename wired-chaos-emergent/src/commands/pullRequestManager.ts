/**
 * Pull Request Manager
 * Handles automated PR operations: draft conversion, merging, status checks
 */

import * as vscode from 'vscode';
import { execShell } from '../utils/shellUtils';
import { GitHubProvider } from '../providers/githubProvider';

export class PullRequestManager {
    private githubProvider: GitHubProvider;
    
    constructor(private outputChannel: vscode.OutputChannel) {
        this.githubProvider = new GitHubProvider();
    }

    async managePullRequests(): Promise<void> {
        this.outputChannel.appendLine('📋 Managing Pull Requests...');
        
        try {
            await this.convertDraftsToReady();
            await this.displayPRStatus();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`❌ Error managing PRs: ${errorMessage}`);
            throw error;
        }
    }

    async convertDraftsToReady(): Promise<void> {
        this.outputChannel.appendLine('📝 Converting draft PRs to ready...');
        
        try {
            // Get list of draft PRs using GitHub CLI
            const result = await execShell('gh pr list --draft --json number');
            const draftPRs = JSON.parse(result.stdout);
            
            if (draftPRs.length === 0) {
                this.outputChannel.appendLine('  ℹ️  No draft PRs found');
                return;
            }
            
            this.outputChannel.appendLine(`  Found ${draftPRs.length} draft PR(s)`);
            
            for (const pr of draftPRs) {
                try {
                    this.outputChannel.appendLine(`  Converting PR #${pr.number} to ready...`);
                    await execShell(`gh pr ready ${pr.number}`);
                    this.outputChannel.appendLine(`  ✅ PR #${pr.number} is now ready for review`);
                } catch (error) {
                    this.outputChannel.appendLine(`  ⚠️  Failed to convert PR #${pr.number}`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`  ❌ Error: ${errorMessage}`);
            throw error;
        }
    }

    async mergeReadyPRs(): Promise<void> {
        this.outputChannel.appendLine('🔄 Merging ready PRs...');
        
        // PR merge order based on dependencies
        const prOrder = [23, 22, 24, 25];
        
        for (const prNumber of prOrder) {
            try {
                // Check PR status
                const prInfo = await execShell(
                    `gh pr view ${prNumber} --json mergeable,state,statusCheckRollup`
                );
                const pr = JSON.parse(prInfo.stdout);
                
                if (pr.state !== 'OPEN') {
                    this.outputChannel.appendLine(`  ℹ️  PR #${prNumber} is ${pr.state}, skipping...`);
                    continue;
                }
                
                if (pr.mergeable === 'MERGEABLE') {
                    this.outputChannel.appendLine(`  Merging PR #${prNumber}...`);
                    await execShell(`gh pr merge ${prNumber} --merge --auto`);
                    this.outputChannel.appendLine(`  ✅ PR #${prNumber} merged successfully`);
                    
                    // Wait for merge to complete
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    this.outputChannel.appendLine(
                        `  ⚠️  PR #${prNumber} is not mergeable (status: ${pr.mergeable})`
                    );
                }
            } catch (error) {
                this.outputChannel.appendLine(`  ⚠️  PR #${prNumber} not found or error occurred`);
            }
        }
    }

    async displayPRStatus(): Promise<void> {
        this.outputChannel.appendLine('\n📊 Pull Request Status:');
        this.outputChannel.appendLine('─'.repeat(60));
        
        try {
            const result = await execShell(
                'gh pr list --json number,title,state,mergeable,isDraft'
            );
            const prs = JSON.parse(result.stdout);
            
            if (prs.length === 0) {
                this.outputChannel.appendLine('  No open pull requests');
                return;
            }
            
            for (const pr of prs) {
                const status = pr.isDraft ? '📝 DRAFT' :
                              pr.mergeable === 'MERGEABLE' ? '✅ READY' :
                              pr.mergeable === 'CONFLICTING' ? '⚠️  CONFLICTS' :
                              '❓ UNKNOWN';
                
                this.outputChannel.appendLine(`  PR #${pr.number}: ${pr.title}`);
                this.outputChannel.appendLine(`    Status: ${status}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`  ❌ Error fetching PR status: ${errorMessage}`);
        }
    }
}
