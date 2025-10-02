# WIRED CHAOS Task System - Usage Examples

## Complete Workflow Examples

### Example 1: User Onboarding Automation

**Scenario**: New user signs up on WIX → Sync to Notion → Send welcome email via Zapier

```javascript
// Step 1: Create a Gamma automation task
const onboardingTask = {
  type: 'gamma-automation',
  priority: 'high',
  description: 'Process new user signup and sync to Notion',
  requirements: ['wix-api-access', 'notion-integration', 'zapier-webhook'],
  metadata: {
    wixUserId: 'user_12345',
    notionDatabase: 'users',
    zapierWebhook: 'https://hooks.zapier.com/...',
    triggers: ['user-signup'],
    actions: ['create-notion-page', 'send-welcome-email']
  }
};

// Step 2: Submit task via API
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(onboardingTask)
});

const result = await response.json();
console.log('Task created:', result.task.id);

// Step 3: Monitor task progress
const checkStatus = async (taskId) => {
  const statusResponse = await fetch(`/api/tasks/${taskId}`);
  const statusData = await statusResponse.json();
  return statusData.task.status;
};

// Poll for completion
let status = 'pending';
while (status !== 'completed' && status !== 'failed') {
  await new Promise(resolve => setTimeout(resolve, 1000));
  status = await checkStatus(result.task.id);
  console.log('Status:', status);
}

// Step 4: Get results
const finalResponse = await fetch(`/api/tasks/${result.task.id}`);
const finalData = await finalResponse.json();
console.log('Results:', finalData.results);
```

**Expected Output**:
```json
{
  "taskId": "task_gamma_001",
  "status": "completed",
  "data": {
    "workflows": [
      {
        "workflow": "wix-automation",
        "status": "completed",
        "data": {
          "userId": "user_12345",
          "profileData": {...}
        }
      },
      {
        "workflow": "notion-sync",
        "status": "completed",
        "data": {
          "databaseId": "users",
          "recordsUpdated": 1,
          "notionPageId": "abc-123"
        }
      },
      {
        "workflow": "zapier-integration",
        "status": "completed",
        "data": {
          "zapId": "zap_001",
          "emailSent": true
        }
      }
    ]
  },
  "executionTime": 2340
}
```

---

### Example 2: Data Processing Pipeline

**Scenario**: Process InsightX signals → Calculate heat map → Cache in KV → Update dashboard

```javascript
// Step 1: Create a Cloudflare compute task
const processingTask = {
  type: 'cloudflare-compute',
  priority: 'medium',
  description: 'Process InsightX data and generate heat map',
  requirements: ['insightx-api', 'kv-storage', 'data-processing'],
  metadata: {
    dataSource: 'insightx',
    outputFormat: 'heatmap',
    cacheKey: 'insightx:heatmap:latest',
    cacheTtl: 3600,
    dataSize: 5000
  }
};

// Submit task
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(processingTask)
});

const result = await response.json();

// Monitor with async/await pattern
const waitForCompletion = async (taskId, maxWait = 30000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const response = await fetch(`/api/tasks/${taskId}`);
    const data = await response.json();
    
    if (data.task.status === 'completed') {
      return data;
    }
    
    if (data.task.status === 'failed') {
      throw new Error(`Task failed: ${data.task.metadata.error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Task timed out');
};

const finalResult = await waitForCompletion(result.task.id);
console.log('Processing completed:', finalResult);
```

**Expected Output**:
```json
{
  "taskId": "task_cf_001",
  "status": "completed",
  "data": {
    "operations": [
      {
        "operation": "data-processing",
        "status": "completed",
        "data": {
          "recordsProcessed": 4750,
          "processingTime": 850,
          "cacheHitRate": 0.85
        }
      },
      {
        "operation": "edge-computing",
        "status": "completed",
        "data": {
          "edgeLocations": ["US-East", "US-West", "EU-West", "APAC"],
          "cacheEnabled": true,
          "ttl": 3600
        }
      }
    ]
  },
  "executionTime": 1200
}
```

---

### Example 3: Hybrid Multi-Swarm Task

**Scenario**: Process form submission → Store in Cloudflare KV → Sync to Notion → Trigger Zapier notification

```javascript
// Step 1: Create hybrid task
const hybridTask = {
  type: 'hybrid',
  priority: 'critical',
  description: 'Process contact form: store, sync, and notify',
  requirements: ['api', 'kv-storage', 'notion-integration', 'zapier-webhook'],
  metadata: {
    formData: {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'ACME Corp',
      message: 'Interested in WIRED CHAOS services',
      timestamp: new Date().toISOString()
    },
    kvKey: 'leads:latest',
    notionDatabase: 'leads',
    zapierWebhook: 'https://hooks.zapier.com/...'
  }
};

// Submit task
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(hybridTask)
});

const result = await response.json();
console.log('Hybrid task created:', result.task.id);
console.log('Assigned to:', result.task.assignedSwarm); // Will be 'hybrid'

// The system will coordinate both swarms automatically
// Cloudflare swarm: Cache the data
// Gamma swarm: Sync to Notion and trigger Zapier
```

**Expected Output**:
```json
{
  "taskId": "task_hybrid_001",
  "overallStatus": "completed",
  "results": [
    {
      "taskId": "task_hybrid_001_cf",
      "status": "completed",
      "data": {
        "operations": [
          {
            "operation": "data-processing",
            "data": { "kvStored": true, "key": "leads:latest" }
          }
        ]
      }
    },
    {
      "taskId": "task_hybrid_001_gamma",
      "status": "completed",
      "data": {
        "workflows": [
          {
            "workflow": "notion-sync",
            "data": { "recordCreated": true, "notionId": "xyz-789" }
          },
          {
            "workflow": "zapier-integration",
            "data": { "notificationSent": true }
          }
        ]
      }
    }
  ],
  "totalExecutionTime": 3450
}
```

---

### Example 4: Batch Processing with Dependencies

**Scenario**: Process multiple tasks with dependencies

```javascript
// Task 1: Fetch user data from WIX
const fetchTask = {
  id: 'task_fetch_001',
  type: 'gamma-automation',
  priority: 'high',
  description: 'Fetch all active users from WIX',
  requirements: ['wix-api-access'],
  dependencies: [],
  metadata: {
    wixSite: 'wiredchaos',
    filter: 'active=true'
  }
};

// Task 2: Process user data (depends on Task 1)
const processTask = {
  id: 'task_process_001',
  type: 'cloudflare-compute',
  priority: 'high',
  description: 'Process and enrich user data',
  requirements: ['data-processing'],
  dependencies: ['task_fetch_001'], // Wait for Task 1
  metadata: {
    operation: 'enrich-profiles'
  }
};

// Task 3: Sync to Notion (depends on Task 2)
const syncTask = {
  id: 'task_sync_001',
  type: 'gamma-automation',
  priority: 'high',
  description: 'Sync processed data to Notion',
  requirements: ['notion-integration'],
  dependencies: ['task_process_001'], // Wait for Task 2
  metadata: {
    notionDatabase: 'users'
  }
};

// Submit all tasks
const tasks = [fetchTask, processTask, syncTask];

for (const task of tasks) {
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
}

console.log('Batch processing started');
console.log('Tasks will execute in dependency order:');
console.log('1. task_fetch_001 (no dependencies)');
console.log('2. task_process_001 (waits for task_fetch_001)');
console.log('3. task_sync_001 (waits for task_process_001)');
```

---

### Example 5: Real-Time Monitoring Dashboard

**React component for live monitoring**:

```jsx
import React, { useState, useEffect } from 'react';
import TaskCenter from '../pages/TaskCenter';

function LiveDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [swarms, setSwarms] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Get metrics
      const metricsRes = await fetch('/api/tasks/metrics');
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.metrics);

      // Get swarm statuses
      const swarmsRes = await fetch('/api/swarms');
      const swarmsData = await swarmsRes.json();
      setSwarms(swarmsData.swarms);

      // Get recent tasks
      const tasksRes = await fetch('/api/tasks?limit=10');
      const tasksData = await tasksRes.json();
      setRecentTasks(tasksData.tasks);
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>WIRED CHAOS Task System Dashboard</h1>
      
      {/* Metrics Overview */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Tasks"
          value={metrics?.queue?.totalTasks || 0}
          icon="📊"
        />
        <MetricCard
          title="Active"
          value={metrics?.queue?.inProgressTasks || 0}
          icon="⚡"
        />
        <MetricCard
          title="Completed"
          value={metrics?.queue?.completedTasks || 0}
          icon="✅"
        />
        <MetricCard
          title="Failed"
          value={metrics?.queue?.failedTasks || 0}
          icon="❌"
        />
      </div>

      {/* Swarm Status */}
      <div className="swarms-section">
        <h2>Swarm Status</h2>
        {swarms.map(swarm => (
          <SwarmCard key={swarm.swarmId} swarm={swarm} />
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="tasks-section">
        <h2>Recent Tasks</h2>
        <TaskList tasks={recentTasks} />
      </div>

      {/* Full Task Center */}
      <TaskCenter apiEndpoint="/api/tasks" />
    </div>
  );
}

function MetricCard({ title, value, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-title">{title}</div>
    </div>
  );
}

function SwarmCard({ swarm }) {
  const loadPercent = (swarm.currentLoad / swarm.capacity) * 100;
  
  return (
    <div className="swarm-card">
      <h3>{swarm.swarmId}</h3>
      <div className="load-bar">
        <div 
          className="load-fill" 
          style={{ width: `${loadPercent}%` }}
        />
      </div>
      <p>Load: {swarm.currentLoad}/{swarm.capacity} ({loadPercent.toFixed(0)}%)</p>
      <p>Status: {swarm.status}</p>
      <p>Tasks Processed: {swarm.tasksProcessed}</p>
    </div>
  );
}

export default LiveDashboard;
```

---

### Example 6: Error Handling and Retry

```javascript
async function createTaskWithRetry(taskData, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`Task created successfully on attempt ${attempt}`);
        return result.task;
      } else {
        throw new Error(result.error || 'Task creation failed');
      }
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError.message}`);
}

// Usage
try {
  const task = await createTaskWithRetry({
    type: 'cloudflare-compute',
    priority: 'high',
    description: 'Critical data processing task',
    requirements: ['api', 'kv-storage']
  });
  
  console.log('Task created:', task.id);
} catch (error) {
  console.error('Failed to create task:', error);
  // Handle error appropriately (notify admin, log to monitoring, etc.)
}
```

---

### Example 7: Cancelling Tasks

```javascript
// Cancel a running task
async function cancelTask(taskId) {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Task cancelled successfully');
      return true;
    } else {
      console.error('Failed to cancel task:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error cancelling task:', error);
    return false;
  }
}

// Usage
await cancelTask('task_abc_123');
```

---

### Example 8: Custom Task Templates

```javascript
// Define reusable task templates
const TASK_TEMPLATES = {
  userOnboarding: (userId, email) => ({
    type: 'gamma-automation',
    priority: 'high',
    description: `Onboard user ${userId}`,
    requirements: ['wix-api-access', 'notion-integration', 'zapier-webhook'],
    metadata: {
      userId,
      email,
      notionDatabase: 'users',
      workflow: 'onboarding'
    }
  }),
  
  dataProcessing: (dataSource, outputKey) => ({
    type: 'cloudflare-compute',
    priority: 'medium',
    description: `Process data from ${dataSource}`,
    requirements: ['data-processing', 'kv-storage'],
    metadata: {
      dataSource,
      outputKey,
      cacheTtl: 3600
    }
  }),
  
  notificationBurst: (users, message) => ({
    type: 'gamma-automation',
    priority: 'low',
    description: `Send notifications to ${users.length} users`,
    requirements: ['zapier-webhook'],
    metadata: {
      users,
      message,
      batchSize: 50
    }
  })
};

// Use templates
const task = TASK_TEMPLATES.userOnboarding('user_123', 'user@example.com');

await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(task)
});
```

---

## Testing Examples

### Unit Test Example

```javascript
// test/task-router.test.js
import { TaskRouter } from '../apps/task-engine/src/router';

describe('TaskRouter', () => {
  let router;
  
  beforeEach(() => {
    router = new TaskRouter();
  });
  
  test('routes Gamma automation tasks', () => {
    const task = {
      type: 'gamma-automation',
      description: 'Sync to Notion',
      requirements: ['notion-integration']
    };
    
    const swarmId = router.routeTask(task);
    expect(swarmId).toContain('gamma');
  });
  
  test('routes Cloudflare compute tasks', () => {
    const task = {
      type: 'cloudflare-compute',
      description: 'Process API request',
      requirements: ['api', 'compute']
    };
    
    const swarmId = router.routeTask(task);
    expect(swarmId).toContain('cloudflare');
  });
  
  test('routes based on keywords', () => {
    const task = {
      type: 'cloudflare-compute',
      description: 'Handle zapier webhook and store in notion',
      requirements: ['zapier', 'notion']
    };
    
    // Should route to gamma because of keywords
    const swarmId = router.routeTask(task);
    expect(swarmId).toContain('gamma');
  });
});
```

---

## Best Practices

1. **Always set appropriate priority levels**
2. **Include detailed descriptions for better routing**
3. **Use requirements array for pattern matching**
4. **Set realistic dependencies**
5. **Monitor task status regularly**
6. **Handle errors gracefully**
7. **Use templates for common task types**
8. **Clean up old completed tasks**
9. **Monitor swarm health**
10. **Test with small batches first**

## Next Steps

- Review the [Integration Guide](INTEGRATION_GUIDE.md)
- Read the [Architecture Diagram](ARCHITECTURE_DIAGRAM.md)
- Check the [Main README](TASK_SYSTEM_README.md)
- Deploy your first worker
- Create your first task!
