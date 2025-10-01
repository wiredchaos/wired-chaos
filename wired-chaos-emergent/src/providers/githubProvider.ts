/**
 * GitHub API Provider
 * Handles GitHub API interactions
 */

import { Octokit } from '@octokit/rest';
import { ConfigManager } from '../utils/config';

export class GitHubProvider {
    private octokit: Octokit | null = null;

    constructor() {
        const token = ConfigManager.getGitHubToken();
        if (token) {
            this.octokit = new Octokit({ auth: token });
        }
    }

    async getPullRequests(owner: string, repo: string): Promise<any[]> {
        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        const { data } = await this.octokit.pulls.list({
            owner,
            repo,
            state: 'open'
        });

        return data;
    }

    async mergePullRequest(
        owner: string,
        repo: string,
        pullNumber: number
    ): Promise<void> {
        if (!this.octokit) {
            throw new Error('GitHub token not configured');
        }

        await this.octokit.pulls.merge({
            owner,
            repo,
            pull_number: pullNumber,
            merge_method: 'merge'
        });
    }
}
