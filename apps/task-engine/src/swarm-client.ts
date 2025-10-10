/**
 * WIRED CHAOS - Swarm Client
 * Handles communication with swarm handlers
 */

import type { SwarmTask, SwarmTaskResult, SwarmStatus, SwarmMessage } from '../../swarms/shared/protocol';

export interface SwarmClientConfig {
  gammaEndpoint: string;
  cloudflareEndpoint: string;
  timeout: number;
  retryAttempts: number;
}

export class SwarmClient {
  private config: SwarmClientConfig;
  private messageHandlers: Map<string, (message: SwarmMessage) => void>;

  constructor(config: Partial<SwarmClientConfig> = {}) {
    this.config = {
      gammaEndpoint: config.gammaEndpoint || '/api/swarms/gamma',
      cloudflareEndpoint: config.cloudflareEndpoint || '/api/swarms/cloudflare',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
    };
    
    this.messageHandlers = new Map();
  }

  /**
   * Assign a task to a swarm
   */
  async assignTask(task: SwarmTask, swarmId: string): Promise<SwarmTaskResult> {
    const endpoint = this.getSwarmEndpoint(swarmId);
    
    try {
      const response = await this.sendWithRetry(
        endpoint,
        'POST',
        { action: 'assign', task }
      );

      return response;
    } catch (error) {
      return {
        taskId: task.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get task status from swarm
   */
  async getTaskStatus(taskId: string, swarmId: string): Promise<SwarmTask | null> {
    const endpoint = this.getSwarmEndpoint(swarmId);
    
    try {
      const response = await this.sendWithRetry(
        endpoint,
        'GET',
        null,
        `?action=status&taskId=${taskId}`
      );

      return response.task || null;
    } catch (error) {
      console.error(`Failed to get task status: ${error}`);
      return null;
    }
  }

  /**
   * Get swarm status
   */
  async getSwarmStatus(swarmId: string): Promise<SwarmStatus | null> {
    const endpoint = this.getSwarmEndpoint(swarmId);
    
    try {
      const response = await this.sendWithRetry(
        endpoint,
        'GET',
        null,
        '?action=status'
      );

      return response.status || null;
    } catch (error) {
      console.error(`Failed to get swarm status: ${error}`);
      return null;
    }
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, swarmId: string): Promise<boolean> {
    const endpoint = this.getSwarmEndpoint(swarmId);
    
    try {
      await this.sendWithRetry(
        endpoint,
        'POST',
        { action: 'cancel', taskId }
      );

      return true;
    } catch (error) {
      console.error(`Failed to cancel task: ${error}`);
      return false;
    }
  }

  /**
   * Send message to swarm with retry logic
   */
  private async sendWithRetry(
    endpoint: string,
    method: string,
    body: any,
    queryString: string = ''
  ): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const url = `${endpoint}${queryString}`;
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.json();
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Wait before retry with exponential backoff
        if (attempt < this.config.retryAttempts - 1) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Get the appropriate endpoint for a swarm
   */
  private getSwarmEndpoint(swarmId: string): string {
    if (swarmId.includes('gamma')) {
      return this.config.gammaEndpoint;
    } else if (swarmId.includes('cloudflare')) {
      return this.config.cloudflareEndpoint;
    }
    
    // Default to cloudflare
    return this.config.cloudflareEndpoint;
  }

  /**
   * Register a message handler
   */
  onMessage(messageType: string, handler: (message: SwarmMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Handle incoming message from swarm
   */
  handleMessage(message: SwarmMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
