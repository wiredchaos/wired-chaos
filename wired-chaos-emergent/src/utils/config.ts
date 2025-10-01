/**
 * Configuration utilities
 */

import * as vscode from 'vscode';

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'wiredChaos';

    static getGitHubToken(): string {
        return this.getConfig('githubToken', '');
    }

    static getCloudflareToken(): string {
        return this.getConfig('cloudflareToken', '');
    }

    static getCloudflareAccountId(): string {
        return this.getConfig('cloudflareAccountId', '');
    }

    static getCloudflareProjectName(): string {
        return this.getConfig('cloudflareProjectName', 'wired-chaos');
    }

    static getDiscordWebhook(): string {
        return this.getConfig('discordWebhook', '');
    }

    private static getConfig<T>(key: string, defaultValue: T): T {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.get<T>(key, defaultValue);
    }

    static async setConfig(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
}
