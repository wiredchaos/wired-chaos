/**
 * Deployment Manager
 * Handles Cloudflare Edge deployment and cache purging
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { execShell } from '../utils/shellUtils';

export class DeploymentManager {
    constructor(private outputChannel: vscode.OutputChannel) {}

    async deployToCloudflare(): Promise<void> {
        this.outputChannel.appendLine('☁️  Deploying to Cloudflare Edge...');
        
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }
            
            const rootPath = workspaceFolder.uri.fsPath;
            
            // Step 1: Build frontend
            this.outputChannel.appendLine('  📦 Building frontend...');
            const frontendPath = path.join(rootPath, 'frontend');
            
            try {
                await execShell('npm install', { cwd: frontendPath });
                await execShell('npm run build', { cwd: frontendPath });
                this.outputChannel.appendLine('  ✅ Frontend built successfully');
            } catch (error) {
                this.outputChannel.appendLine('  ⚠️  Frontend build failed or not configured');
            }
            
            // Step 2: Deploy worker
            this.outputChannel.appendLine('  🚀 Deploying worker to Cloudflare...');
            
            const workerPath = path.join(rootPath, 'src');
            const hasWorkerConfig = await this.checkFileExists(
                path.join(workerPath, 'wrangler.toml')
            );
            
            if (hasWorkerConfig) {
                try {
                    const result = await execShell(
                        'npx wrangler deploy --env production',
                        { cwd: workerPath }
                    );
                    this.outputChannel.appendLine(result.stdout);
                    this.outputChannel.appendLine('  ✅ Worker deployed successfully');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.outputChannel.appendLine(`  ❌ Worker deployment failed: ${errorMessage}`);
                    throw error;
                }
            } else {
                this.outputChannel.appendLine('  ⚠️  Wrangler config not found, skipping worker deployment');
            }
            
            // Step 3: Verify deployment
            this.outputChannel.appendLine('  🔍 Verifying deployment...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const healthUrl = 'https://www.wiredchaos.xyz/health';
            try {
                const result = await execShell(`curl -s ${healthUrl}`);
                const response = JSON.parse(result.stdout);
                
                if (response.ok) {
                    this.outputChannel.appendLine('  ✅ Deployment verified - health check passed');
                } else {
                    this.outputChannel.appendLine('  ⚠️  Health check returned unexpected response');
                }
            } catch (error) {
                this.outputChannel.appendLine('  ⚠️  Unable to verify deployment via health check');
            }
            
            this.outputChannel.appendLine('\n✅ Cloudflare deployment completed!');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`\n❌ Deployment failed: ${errorMessage}`);
            throw error;
        }
    }

    private async checkFileExists(filePath: string): Promise<boolean> {
        try {
            const uri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.stat(uri);
            return true;
        } catch {
            return false;
        }
    }
}
