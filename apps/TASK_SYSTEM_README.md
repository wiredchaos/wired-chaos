# WIRED CHAOS Task Assignment System

## Overview

A distributed task management system that coordinates work across multiple specialized swarms:

- **Gamma WIX Zapier Notion Swarm**: Handles integration workflows and automation
- **Cloudflare Worker Swarm**: Manages serverless compute and API orchestration

## Architecture

```
┌─────────────────┐
│  Task Center UI │  (React Dashboard)
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │   Task Engine API    │
    │  /api/tasks          │
    │  /api/swarms         │
    └──┬──────────────┬────┘
       │              │
┌──────▼──────┐  ┌───▼──────────┐
│ Task Router │  │ Task Queue   │
└──────┬──────┘  └───┬──────────┘
       │             │
    ┌──▼─────────────▼──┐
    │  Swarm Client     │
    └──┬──────────┬─────┘
       │          │
┌──────▼──────┐  ┌▼──────────────┐
│ Gamma Swarm │  │Cloudflare Swarm│
└─────────────┘  └────────────────┘
```

## Directory Structure

```
apps/
├── task-engine/          # Core task management
│   ├── src/
│   │   ├── router.ts     # Task routing logic
│   │   ├── queue.ts      # Task queue management
│   │   ├── swarm-client.ts  # Swarm communication
│   │   └── aggregator.ts    # Result aggregation
│   └── package.json
│
├── swarms/              # Swarm implementations
│   ├── shared/
│   │   └── protocol.ts  # Common interfaces
│   ├── gamma/
│   │   └── handler.ts   # Gamma swarm handler
│   ├── cloudflare/
│   │   └── handler.ts   # Cloudflare swarm handler
│   └── package.json
│
└── web/                 # UI Components
    └── src/
        ├── pages/
        │   └── TaskCenter.tsx    # Main dashboard
        └── components/
            ├── SwarmMonitor.tsx  # Swarm status
            └── TaskQueue.tsx     # Task visualization
```

## Task Definition

```typescript
interface SwarmTask {
  id: string;
  type: 'gamma-automation' | 'cloudflare-compute' | 'hybrid';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  requirements: string[];
  dependencies: string[];
  assignedSwarm: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  metadata: Record<string, any>;
}
```

## API Endpoints

### Task Management

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task details
- `DELETE /api/tasks/:id` - Cancel a task
- `GET /api/tasks/metrics` - Get queue metrics

### Swarm Management

- `GET /api/swarms` - List all swarms
- `GET /api/swarms/:id` - Get swarm status
- `GET /api/swarms/:id/capabilities` - Get swarm capabilities
- `POST /api/swarms/:type` - Internal: Handle swarm tasks

## Usage Examples

### Creating a Gamma Automation Task

```javascript
const task = {
  type: 'gamma-automation',
  priority: 'high',
  description: 'Sync user profiles from WIX to Notion database',
  requirements: ['wix-api-access', 'notion-integration'],
  metadata: {
    wixSite: 'wiredchaos',
    notionDatabase: 'users-db',
  }
};

const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(task)
});
```

### Creating a Cloudflare Compute Task

```javascript
const task = {
  type: 'cloudflare-compute',
  priority: 'medium',
  description: 'Process InsightX data and update heat map',
  requirements: ['insightx-api', 'kv-storage'],
  metadata: {
    dataSize: 5000,
    cacheTtl: 3600,
  }
};

const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(task)
});
```

### Monitoring Swarms

```javascript
const response = await fetch('/api/swarms');
const data = await response.json();

data.swarms.forEach(swarm => {
  console.log(`${swarm.swarmId}: ${swarm.status}`);
  console.log(`Load: ${swarm.currentLoad}/${swarm.capacity}`);
  console.log(`Tasks Processed: ${swarm.tasksProcessed}`);
});
```

## Assignment Rules

The task router automatically assigns tasks based on patterns:

### Gamma Swarm
- Keywords: `zapier`, `wix`, `notion`, `workflow`, `automation`, `integration`, `sync`, `content`, `cms`, `database`, `document`, `form`
- Capabilities: Zapier integration, Notion sync, WIX automation, cross-platform sync

### Cloudflare Swarm
- Keywords: `api`, `endpoint`, `compute`, `process`, `calculation`, `edge`, `cdn`, `cache`, `auth`, `security`, `rate-limit`
- Capabilities: API development, data processing, edge computing, security

### Hybrid Tasks
- Keywords: `hybrid`, `cross-platform`, `multi-system`
- Coordination: Both swarms work together

## Gamma Swarm Capabilities

1. **Zapier Integration**: Create automated workflows
2. **Notion Sync**: Manage databases and documentation
3. **WIX Automation**: Handle website updates and forms
4. **Cross-Platform Sync**: Coordinate data between platforms

## Cloudflare Swarm Capabilities

1. **API Development**: Create and deploy serverless endpoints
2. **Data Processing**: Handle compute-intensive operations
3. **Edge Computing**: Manage global distribution and caching
4. **Security**: Implement authentication and rate limiting

## UI Components

### Task Center Dashboard

Main interface for task management:
- Create new tasks
- View task queue
- Monitor swarm status
- View metrics

Access at: `/task-center` (when integrated)

### Swarm Monitor

Real-time swarm status display:
- Current load and capacity
- Active capabilities
- Tasks processed
- Last heartbeat

### Task Queue

Task visualization with:
- Priority badges
- Status indicators
- Task details expansion
- Cancel functionality

## Integration with Existing Systems

The task system integrates with:

- **WIRED CHAOS Authentication**: Uses existing auth system
- **Resources Repository**: Coordinates with existing tools
- **Cloudflare Worker Infrastructure**: Leverages edge network
- **Backend API**: Can extend existing Python backend

## Error Handling

The system includes:

- Automatic retry with exponential backoff
- Task dependency resolution
- Capacity checking
- Timeout handling
- Error aggregation

## Monitoring

Track task system health through:

- Queue metrics (pending, in-progress, completed, failed)
- Swarm status (online, busy, offline, maintenance)
- Average wait time
- Average execution time
- Success/failure rates

## Future Enhancements

- [ ] Task templates for common operations
- [ ] Webhook notifications for task completion
- [ ] Task chaining and workflows
- [ ] Historical analytics dashboard
- [ ] Advanced load balancing algorithms
- [ ] Multi-region swarm deployment
- [ ] Task scheduling and cron support

## WIRED CHAOS Aesthetic

All UI components follow WIRED CHAOS design:
- Cyber-inspired color palette (#0ff, #ff0080, #000)
- Neon glow effects
- Monospace fonts
- Real-time status indicators
- Dark background gradients

## Development

```bash
# Install dependencies
cd apps/task-engine && npm install
cd apps/swarms && npm install

# Build TypeScript
npm run build

# Test (when tests are added)
npm test
```

## License

MIT - WIRED CHAOS Team
