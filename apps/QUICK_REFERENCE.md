# WIRED CHAOS Task System - Quick Reference Card

## 📁 File Structure

```
apps/
├── task-engine/          # Core task management
│   ├── src/
│   │   ├── router.ts     # Task routing
│   │   ├── queue.ts      # Queue management
│   │   ├── swarm-client.ts  # Communication
│   │   └── aggregator.ts    # Results
│   └── test-example.js   # Demo
│
├── swarms/              # Swarm handlers
│   ├── shared/protocol.ts   # Interfaces
│   ├── gamma/handler.ts     # Gamma swarm
│   └── cloudflare/handler.ts # CF swarm
│
└── web/src/             # UI Components
    ├── pages/TaskCenter.tsx
    └── components/
        ├── SwarmMonitor.tsx
        └── TaskQueue.tsx

edge/worker/             # Cloudflare Worker
├── src/
│   ├── index.ts         # Main entry
│   └── routes/
│       ├── tasks.ts     # Task API
│       └── swarms.ts    # Swarm API
└── wrangler.toml        # Config
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get task details |
| DELETE | `/api/tasks/:id` | Cancel task |
| GET | `/api/tasks/metrics` | Get metrics |
| GET | `/api/swarms` | List swarms |
| GET | `/api/swarms/:id` | Get swarm status |
| GET | `/api/swarms/:id/capabilities` | Get capabilities |

## 📝 Task Types

| Type | Swarm | Use Cases |
|------|-------|-----------|
| `gamma-automation` | Gamma | Zapier, WIX, Notion, integrations |
| `cloudflare-compute` | Cloudflare | API, processing, edge, security |
| `hybrid` | Both | Multi-swarm coordination |

## 🎯 Priority Levels

- `critical` - Immediate execution
- `high` - High priority
- `medium` - Normal priority (default)
- `low` - Background tasks

## 🔄 Task Status Flow

```
pending → assigned → in-progress → completed/failed
```

## 💻 Quick Code Examples

### Create Task
```javascript
await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'gamma-automation',
    priority: 'high',
    description: 'Task description',
    requirements: ['req1', 'req2']
  })
});
```

### Check Status
```javascript
const response = await fetch('/api/tasks/task_123');
const { task, results } = await response.json();
console.log(task.status); // pending/in-progress/completed/failed
```

### List Swarms
```javascript
const response = await fetch('/api/swarms');
const { swarms } = await response.json();
swarms.forEach(s => console.log(`${s.swarmId}: ${s.status}`));
```

### Cancel Task
```javascript
await fetch('/api/tasks/task_123', { method: 'DELETE' });
```

## 🎨 UI Integration

### TaskCenter (Full Dashboard)
```jsx
import TaskCenter from './apps/web/src/pages/TaskCenter';

<Route path="/tasks" element={<TaskCenter />} />
```

### Individual Components
```jsx
import SwarmMonitor from './apps/web/src/components/SwarmMonitor';
import TaskQueue from './apps/web/src/components/TaskQueue';

<SwarmMonitor swarms={swarmData} />
<TaskQueue tasks={taskData} onTaskUpdate={refresh} />
```

## 🔍 Routing Keywords

### Gamma Swarm Keywords
`zapier`, `wix`, `notion`, `workflow`, `automation`, `integration`, `sync`, `content`, `cms`, `database`, `document`, `form`

### Cloudflare Swarm Keywords
`api`, `endpoint`, `compute`, `process`, `calculation`, `edge`, `cdn`, `cache`, `auth`, `security`, `rate-limit`

## 🚀 Deployment Commands

```bash
# Deploy worker
cd edge/worker
npm install
npm run deploy

# Production
npm run deploy:production

# Staging
npm run deploy:staging

# Test locally
npm run dev
```

## 📊 Monitoring

```javascript
// Get metrics
const metrics = await fetch('/api/tasks/metrics');
// Returns: totalTasks, pendingTasks, inProgressTasks, 
//          completedTasks, failedTasks, averageWaitTime

// Get swarm health
const swarms = await fetch('/api/swarms');
// Returns: status, capacity, currentLoad, tasksProcessed
```

## 🛠️ Configuration

### Worker Environment Variables
```toml
# In wrangler.toml
[vars]
ENVIRONMENT = "production"
```

### Swarm Config
```typescript
{
  maxConcurrentTasks: 5,  // Gamma
  maxConcurrentTasks: 10, // Cloudflare
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 1000
  }
}
```

## 🎯 Task Templates

```javascript
// User onboarding
{
  type: 'gamma-automation',
  priority: 'high',
  description: 'Onboard new user',
  requirements: ['wix', 'notion', 'zapier'],
  metadata: { userId, email }
}

// Data processing
{
  type: 'cloudflare-compute',
  priority: 'medium',
  description: 'Process analytics data',
  requirements: ['api', 'kv-storage'],
  metadata: { dataSource, cacheTtl }
}

// Hybrid workflow
{
  type: 'hybrid',
  priority: 'critical',
  description: 'Multi-swarm operation',
  requirements: ['api', 'notion', 'zapier'],
  metadata: { formData }
}
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Task not routing | Check description keywords match patterns |
| Swarm offline | Verify handler initialization |
| UI not updating | Check API endpoint configuration |
| Slow performance | Increase maxConcurrentTasks |
| Failed tasks | Check swarm logs, verify requirements |

## 📚 Documentation Links

- [**TASK_SYSTEM_README.md**](TASK_SYSTEM_README.md) - Full documentation
- [**INTEGRATION_GUIDE.md**](INTEGRATION_GUIDE.md) - Integration steps
- [**ARCHITECTURE_DIAGRAM.md**](ARCHITECTURE_DIAGRAM.md) - System architecture
- [**USAGE_EXAMPLES.md**](USAGE_EXAMPLES.md) - Code examples
- [**test-example.js**](task-engine/test-example.js) - Working demo

## 🎨 WIRED CHAOS Styling

```css
/* Color palette */
--primary: #0ff;      /* Cyan */
--secondary: #ff0080; /* Magenta */
--background: #000;   /* Black */
--gradient: linear-gradient(135deg, #000 0%, #1a0033 100%);

/* Effects */
text-shadow: 0 0 10px currentColor;
box-shadow: 0 0 10px currentColor;
```

## ⚡ Performance Tips

1. Use appropriate priority levels
2. Set realistic maxConcurrentTasks
3. Implement task result caching
4. Clean up old tasks regularly
5. Monitor swarm load distribution
6. Use dependencies for task ordering
7. Batch similar tasks together

## 🔐 Security Best Practices

1. Add authentication to endpoints
2. Validate task inputs
3. Rate limit task creation
4. Sanitize metadata
5. Log all task operations
6. Monitor for abuse patterns
7. Implement RBAC if needed

## 📈 Scaling Strategies

1. Deploy multiple swarm instances
2. Use Cloudflare KV for persistence
3. Implement task result caching
4. Add regional swarm nodes
5. Load balance across instances
6. Monitor and auto-scale
7. Archive old task data

## 🎯 Success Metrics

Track these KPIs:
- Task completion rate
- Average execution time
- Swarm utilization
- Error rate
- Task queue depth
- Response time
- System throughput

## 💡 Tips & Tricks

- Use descriptive task descriptions for better routing
- Set dependencies for sequential workflows
- Monitor swarm health regularly
- Use templates for common tasks
- Test with small batches first
- Clean up completed tasks
- Log errors for debugging

## 🆘 Getting Help

1. Check documentation files
2. Review code examples
3. Test with demo script: `node apps/task-engine/test-example.js`
4. Check API responses for errors
5. Monitor Cloudflare Worker logs
6. Review swarm handler logs

---

**System Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-10-02
