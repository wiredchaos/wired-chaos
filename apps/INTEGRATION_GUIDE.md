# WIRED CHAOS Task System - Integration Guide

## Quick Start

### 1. Deploy the Worker

```bash
cd edge/worker
npm install
npm run deploy
```

This will deploy the task management worker to Cloudflare.

### 2. Integrate UI Components

Add the TaskCenter to your React application:

```jsx
// In your main App.js or routing configuration
import TaskCenter from './apps/web/src/pages/TaskCenter';

// Add route
<Route path="/task-center" element={<TaskCenter />} />
```

### 3. Configure API Endpoints

The worker exposes these endpoints:

- `POST /api/tasks` - Create new task
- `GET /api/tasks` - List tasks
- `GET /api/tasks/:id` - Get task details
- `DELETE /api/tasks/:id` - Cancel task
- `GET /api/tasks/metrics` - Get metrics
- `GET /api/swarms` - List swarms
- `GET /api/swarms/:id` - Get swarm status

## Integration with Existing Backend

### Option 1: Standalone Worker

Deploy the worker to a subdomain:

```toml
# In wrangler.toml
[[routes]]
pattern = "tasks.wiredchaos.xyz/*"
zone_name = "wiredchaos.xyz"
```

Configure CORS to allow your frontend domain.

### Option 2: Integrated with Main Worker

Merge the routes into your existing Cloudflare Worker:

```typescript
// In your main worker src/index.js or src/index.ts
import { handleTasksRoute } from './routes/tasks';
import { handleSwarmsRoute } from './routes/swarms';

// In your fetch handler:
if (url.pathname.startsWith('/api/tasks')) {
  return await handleTasksRoute(request);
}
if (url.pathname.startsWith('/api/swarms')) {
  return await handleSwarmsRoute(request);
}
```

### Option 3: Backend API Extension

Add endpoints to your Python backend:

```python
# In backend/server.py
from apps.task_engine import TaskRouter, TaskQueue

@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    # Use the task system components
    router = TaskRouter()
    queue = TaskQueue()
    
    # Create and route task
    task_obj = create_task_object(task)
    assigned_swarm = router.route_task(task_obj)
    queue.enqueue(task_obj)
    
    return {"success": True, "task": task_obj}
```

## Connecting Swarm Handlers

### Gamma Swarm Integration

Connect to your existing WIX/Zapier/Notion integrations:

```typescript
// In apps/swarms/gamma/handler.ts
import { WixAIBotClient } from '../../../wix-gamma-integration/wix/ai-bot/wix-ai-bot-client.js';

export class GammaSwarmHandler {
  private wixClient: WixAIBotClient;
  
  constructor(swarmId: string) {
    this.wixClient = new WixAIBotClient();
    // ... rest of initialization
  }
  
  private async handleWixAutomation(task: SwarmTask): Promise<any> {
    // Use actual WIX client
    const result = await this.wixClient.performAction({
      action: task.metadata.wixAction,
      data: task.metadata.data
    });
    
    return {
      workflow: 'wix-automation',
      status: 'completed',
      data: result
    };
  }
}
```

### Cloudflare Swarm Integration

Leverage existing Cloudflare infrastructure:

```typescript
// In apps/swarms/cloudflare/handler.ts
export class CloudflareSwarmHandler {
  private async handleApiDevelopment(task: SwarmTask): Promise<any> {
    // Deploy actual worker or update KV
    if (task.metadata.kvKey) {
      await env.KV.put(task.metadata.kvKey, task.metadata.value);
    }
    
    return {
      operation: 'api-development',
      status: 'completed',
      data: { deployed: true }
    };
  }
}
```

## Frontend Integration

### Adding to Existing React App

```jsx
// In your main navigation
import { Link } from 'react-router-dom';

<nav>
  <Link to="/task-center">Task Center</Link>
  {/* ... other links */}
</nav>
```

### Using Individual Components

You can also use components separately:

```jsx
import SwarmMonitor from './apps/web/src/components/SwarmMonitor';
import TaskQueue from './apps/web/src/components/TaskQueue';

function Dashboard() {
  const [swarms, setSwarms] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Load data...
  
  return (
    <div>
      <SwarmMonitor swarms={swarms} />
      <TaskQueue tasks={tasks} onTaskUpdate={loadData} />
    </div>
  );
}
```

### Custom Styling

Override the inline styles with your own CSS:

```css
/* Override WIRED CHAOS default styles */
.task-center {
  /* Your custom styles */
}

.swarm-status-widget {
  /* Your custom styles */
}
```

## Environment Variables

Set these environment variables:

```bash
# For the worker
ENVIRONMENT=production

# For the backend (if using Python integration)
TASK_API_ENDPOINT=https://tasks.wiredchaos.xyz/api
```

## Authentication

Add authentication to task endpoints:

```typescript
// In edge/worker/src/index.ts
async function authenticateRequest(request: Request): Promise<boolean> {
  const token = request.headers.get('Authorization');
  
  if (!token) return false;
  
  // Verify token against your auth system
  // Example: JWT verification, API key check, etc.
  return await verifyToken(token);
}

// In your fetch handler:
if (path.startsWith('/api/tasks') || path.startsWith('/api/swarms')) {
  if (!(await authenticateRequest(request))) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ... continue with handling
}
```

## Webhook Integration

Set up webhooks for task completion notifications:

```typescript
// In apps/task-engine/src/queue.ts
export class TaskQueue {
  private webhookUrl?: string;
  
  async updateTaskStatus(taskId: string, status: SwarmTask['status'], data?: any): Promise<void> {
    // ... update logic ...
    
    // Send webhook notification
    if (this.webhookUrl && (status === 'completed' || status === 'failed')) {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'task_status_changed',
          taskId,
          status,
          data
        })
      });
    }
  }
}
```

## Monitoring and Logging

Add monitoring to track system health:

```typescript
// In edge/worker/src/index.ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const start = Date.now();
    
    try {
      const response = await handleRequest(request);
      
      // Log metrics
      const duration = Date.now() - start;
      console.log({
        path: new URL(request.url).pathname,
        method: request.method,
        status: response.status,
        duration
      });
      
      return response;
    } catch (error) {
      // Log error
      console.error('Request failed:', error);
      throw error;
    }
  }
};
```

## Testing

### Unit Tests

```javascript
// test/task-router.test.js
import { TaskRouter } from '../apps/task-engine/src/router';

describe('TaskRouter', () => {
  test('routes Gamma tasks correctly', () => {
    const router = new TaskRouter();
    const task = {
      type: 'gamma-automation',
      description: 'Sync to Notion',
      requirements: ['notion-integration']
    };
    
    const swarmId = router.routeTask(task);
    expect(swarmId).toContain('gamma');
  });
});
```

### Integration Tests

```javascript
// test/api.test.js
describe('Task API', () => {
  test('creates task successfully', async () => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        type: 'cloudflare-compute',
        description: 'Test task',
        priority: 'medium'
      })
    });
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.task).toBeDefined();
  });
});
```

## Deployment Checklist

- [ ] Deploy Cloudflare Worker
- [ ] Configure routes in wrangler.toml
- [ ] Set environment variables
- [ ] Test API endpoints
- [ ] Integrate UI components
- [ ] Configure authentication
- [ ] Set up monitoring
- [ ] Test task creation and routing
- [ ] Verify swarm communication
- [ ] Test error handling
- [ ] Set up webhooks (optional)

## Troubleshooting

### Tasks not routing correctly
- Check routing rules in `apps/task-engine/src/router.ts`
- Verify task description and requirements match patterns

### Swarms showing as offline
- Check swarm handler initialization
- Verify network connectivity
- Review console logs for errors

### UI components not rendering
- Ensure React Router is configured
- Check API endpoint configuration
- Verify CORS headers are set

### Performance issues
- Increase `maxConcurrentTasks` in swarm configs
- Add caching for frequently accessed data
- Use Cloudflare KV for task persistence

## Support

For issues or questions:
- Check the main README: `apps/TASK_SYSTEM_README.md`
- Review code examples in `apps/task-engine/test-example.js`
- Check existing WIRED CHAOS documentation

## Next Steps

1. Deploy and test the basic system
2. Add custom task types for your use cases
3. Extend swarm handlers with real integrations
4. Customize UI to match your branding
5. Add monitoring and alerting
6. Scale to multiple swarm instances
