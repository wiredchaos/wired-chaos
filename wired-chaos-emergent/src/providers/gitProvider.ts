/**
 * Git Provider
 * Handles git operations
 */

import { execShell } from '../utils/shellUtils';

export class GitProvider {
    async getCurrentBranch(): Promise<string> {
        const result = await execShell('git rev-parse --abbrev-ref HEAD');
        return result.stdout.trim();
    }

    async fetchAll(): Promise<void> {
        await execShell('git fetch --all');
    }

    async checkout(branch: string): Promise<void> {
        await execShell(`git checkout ${branch}`);
    }

    async pull(branch: string): Promise<void> {
        await execShell(`git pull origin ${branch}`);
    }

    async merge(branch: string, message?: string): Promise<void> {
        const cmd = message
            ? `git merge ${branch} -m "${message}"`
            : `git merge ${branch} --no-edit`;
        await execShell(cmd);
    }

    async push(): Promise<void> {
        await execShell('git push origin HEAD');
    }

    async getConflictedFiles(): Promise<string[]> {
        const result = await execShell('git diff --name-only --diff-filter=U');
        return result.stdout.trim().split('\n').filter(f => f);
    }

    async resolveConflict(file: string, strategy: 'ours' | 'theirs'): Promise<void> {
        await execShell(`git checkout --${strategy} "${file}"`);
        await execShell(`git add "${file}"`);
    }

    async commit(message: string): Promise<void> {
        await execShell(`git commit -m "${message}"`);
    }
}
