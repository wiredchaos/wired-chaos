/**
 * WIRED CHAOS - Audit Logger Durable Object
 * Distributed audit logging using Cloudflare Durable Objects
 */

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type: string;
  action: string;
  userId?: string;
  ip?: string;
  details: Record<string, unknown>;
}

export interface QueryOptions {
  startTime?: number;
  endTime?: number;
  type?: string;
  limit?: number;
}

export class AuditLogger {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/log' && request.method === 'POST') {
      return this.handleLog(request);
    } else if (path === '/query' && request.method === 'POST') {
      return this.handleQuery(request);
    } else if (path === '/export' && request.method === 'GET') {
      return this.handleExport(request);
    }

    return new Response('Not Found', { status: 404 });
  }

  private async handleLog(request: Request): Promise<Response> {
    try {
      const entry = await request.json() as Omit<AuditLogEntry, 'id' | 'timestamp'>;

      const logEntry: AuditLogEntry = {
        id: this.generateId(),
        timestamp: Date.now(),
        ...entry,
      };

      // Store the log entry
      const key = `log:${logEntry.timestamp}:${logEntry.id}`;
      await this.state.storage.put(key, logEntry);

      // Set alarm for cleanup (keep logs for 30 days)
      const expirationTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await this.state.storage.setAlarm(expirationTime);

      return new Response(
        JSON.stringify({ success: true, id: logEntry.id }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to log entry' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async handleQuery(request: Request): Promise<Response> {
    try {
      const options = await request.json() as QueryOptions;

      const entries = await this.queryLogs(options);

      return new Response(JSON.stringify({ entries, count: entries.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to query logs' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async handleExport(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const format = url.searchParams.get('format') || 'json';

      const allLogs = await this.state.storage.list<AuditLogEntry>({
        prefix: 'log:',
      });

      const entries: AuditLogEntry[] = [];
      allLogs.forEach((value) => {
        entries.push(value);
      });

      // Sort by timestamp descending
      entries.sort((a, b) => b.timestamp - a.timestamp);

      if (format === 'csv') {
        const csv = this.convertToCSV(entries);
        return new Response(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="audit-log.csv"',
          },
        });
      }

      return new Response(JSON.stringify({ entries, count: entries.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to export logs' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async queryLogs(options: QueryOptions): Promise<AuditLogEntry[]> {
    const { startTime, endTime, type, limit = 100 } = options;

    const allLogs = await this.state.storage.list<AuditLogEntry>({
      prefix: 'log:',
    });

    const entries: AuditLogEntry[] = [];

    allLogs.forEach((value) => {
      // Filter by time range
      if (startTime && value.timestamp < startTime) return;
      if (endTime && value.timestamp > endTime) return;

      // Filter by type
      if (type && value.type !== type) return;

      entries.push(value);
    });

    // Sort by timestamp descending and limit
    entries.sort((a, b) => b.timestamp - a.timestamp);
    return entries.slice(0, limit);
  }

  private generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private convertToCSV(entries: AuditLogEntry[]): string {
    if (entries.length === 0) {
      return 'id,timestamp,type,action,userId,ip,details\n';
    }

    const header = 'id,timestamp,type,action,userId,ip,details\n';
    const rows = entries.map((entry) => {
      return [
        entry.id,
        new Date(entry.timestamp).toISOString(),
        entry.type,
        entry.action,
        entry.userId || '',
        entry.ip || '',
        JSON.stringify(entry.details).replace(/"/g, '""'),
      ].join(',');
    });

    return header + rows.join('\n');
  }

  async alarm(): Promise<void> {
    // Clean up old entries (older than 30 days)
    const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const allLogs = await this.state.storage.list<AuditLogEntry>({
      prefix: 'log:',
    });

    const keysToDelete: string[] = [];

    allLogs.forEach((value, key) => {
      if (value.timestamp < cutoffTime) {
        keysToDelete.push(key);
      }
    });

    if (keysToDelete.length > 0) {
      await this.state.storage.delete(keysToDelete);
    }

    // Set next alarm for tomorrow
    await this.state.storage.setAlarm(Date.now() + 24 * 60 * 60 * 1000);
  }
}
