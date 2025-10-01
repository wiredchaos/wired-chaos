/**
 * Conflict Resolver
 * Automated conflict resolution for pull requests
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { execShell } from '../utils/shellUtils';

export class ConflictResolver {
    constructor(private outputChannel: vscode.OutputChannel) {}

    async resolveAllConflicts(): Promise<void> {
        this.outputChannel.appendLine('🔧 Resolving PR conflicts...');
        
        try {
            // Get list of conflicted PRs
            const result = await execShell(
                'gh pr list --json number,mergeable --jq \'.[] | select(.mergeable=="CONFLICTING") | .number\''
            );
            
            const conflictedPRs = result.stdout
                .trim()
                .split('\n')
                .filter(line => line.trim())
                .map(num => parseInt(num.trim()));
            
            if (conflictedPRs.length === 0) {
                this.outputChannel.appendLine('  ℹ️  No conflicted PRs found');
                return;
            }
            
            this.outputChannel.appendLine(`  Found ${conflictedPRs.length} conflicted PR(s)`);
            
            for (const prNumber of conflictedPRs) {
                await this.resolveConflict(prNumber);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`  ❌ Error: ${errorMessage}`);
            throw error;
        }
    }

    async resolveConflict(prNumber: number): Promise<boolean> {
        this.outputChannel.appendLine(`\n  🔧 Resolving conflicts for PR #${prNumber}...`);
        
        try {
            // Use the conflict-resolution.js script
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }
            
            const scriptPath = path.join(
                workspaceFolder.uri.fsPath,
                'wired-chaos-emergent/scripts/conflict-resolution.js'
            );
            
            const result = await execShell(`node "${scriptPath}" ${prNumber}`);
            this.outputChannel.appendLine(result.stdout);
            
            if (result.stderr) {
                this.outputChannel.appendLine(result.stderr);
            }
            
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`  ❌ Failed to resolve PR #${prNumber}: ${errorMessage}`);
            return false;
        }
    }
}
