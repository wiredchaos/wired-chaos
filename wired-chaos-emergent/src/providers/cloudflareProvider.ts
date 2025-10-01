/**
 * Cloudflare API Provider
 * Handles Cloudflare deployment and cache management
 */

import axios from 'axios';
import { ConfigManager } from '../utils/config';

export class CloudflareProvider {
    private baseUrl = 'https://api.cloudflare.com/client/v4';
    private token: string;
    private accountId: string;

    constructor() {
        this.token = ConfigManager.getCloudflareToken();
        this.accountId = ConfigManager.getCloudflareAccountId();
    }

    private get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async purgeCache(zoneId: string): Promise<void> {
        if (!this.token) {
            throw new Error('Cloudflare token not configured');
        }

        await axios.post(
            `${this.baseUrl}/zones/${zoneId}/purge_cache`,
            { purge_everything: true },
            { headers: this.headers }
        );
    }

    async getDeploymentStatus(projectName: string): Promise<any> {
        if (!this.token || !this.accountId) {
            throw new Error('Cloudflare credentials not configured');
        }

        const response = await axios.get(
            `${this.baseUrl}/accounts/${this.accountId}/pages/projects/${projectName}/deployments`,
            { headers: this.headers }
        );

        return response.data;
    }
}
