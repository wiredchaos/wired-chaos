/**
 * Smoke Test Runner
 * Runs comprehensive endpoint smoke tests after deployment
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { execShell } from '../utils/shellUtils';

export class SmokeTestRunner {
    constructor(private outputChannel: vscode.OutputChannel) {}

    async runAllTests(): Promise<void> {
        this.outputChannel.appendLine('🔥 Running smoke tests...');
        
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }
            
            const scriptPath = path.join(
                workspaceFolder.uri.fsPath,
                'wired-chaos-emergent/scripts/smoke-tests.js'
            );
            
            const result = await execShell(`node "${scriptPath}"`);
            this.outputChannel.appendLine(result.stdout);
            
            if (result.stderr) {
                this.outputChannel.appendLine(result.stderr);
            }
            
            this.outputChannel.appendLine('\n✅ Smoke tests completed!');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`\n❌ Smoke tests failed: ${errorMessage}`);
            throw error;
        }
    }
}
