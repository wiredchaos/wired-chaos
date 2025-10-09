# WIRED CHAOS Task Assignment System - Architecture Diagram

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     WIRED CHAOS Task Center UI                    │
│                        (React Dashboard)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ TaskCenter  │  │SwarmMonitor  │  │  TaskQueue   │           │
│  │   .tsx      │  │   .tsx       │  │    .tsx      │           │
│  └─────────────┘  └──────────────┘  └──────────────┘           │
└──────────────┬───────────────────────────────────┬───────────────┘
               │                                   │
               │ HTTP/REST API                     │
               │                                   │
┌──────────────▼───────────────────────────────────▼───────────────┐
│              Cloudflare Worker (Edge Network)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Main Worker (index.ts)                                   │   │
│  │  • CORS handling                                          │   │
│  │  • Request routing                                        │   │
│  │  • Error handling                                         │   │
│  └────┬─────────────────────────────────────────┬────────────┘   │
│       │                                         │                │
│  ┌────▼──────────┐                         ┌───▼─────────────┐  │
│  │ /api/tasks    │                         │  /api/swarms    │  │
│  │ (tasks.ts)    │                         │  (swarms.ts)    │  │
│  │               │                         │                 │  │
│  │ • POST /tasks │                         │ • GET /swarms   │  │
│  │ • GET /tasks  │                         │ • GET /swarms/  │  │
│  │ • DELETE /... │                         │   :id           │  │
│  └───────────────┘                         └─────────────────┘  │
└────────────┬──────────────────────────────────────┬──────────────┘
             │                                      │
             │                                      │
┌────────────▼──────────────────────────────────────▼──────────────┐
│                    Task Engine Layer                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ TaskRouter  │  │  TaskQueue   │  │   SwarmClient           │ │
│  │ • Pattern   │  │  • Priority  │  │   • Retry logic         │ │
│  │   matching  │  │  • Deps      │  │   • Communication       │ │
│  │ • Load      │  │  • Status    │  │   • Timeout handling    │ │
│  │   balancing │  │              │  │                         │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ResultAggregator                                          │  │
│  │  • Collect results from multiple swarms                    │  │
│  │  • Merge data from parallel operations                     │  │
│  │  • Track dependencies                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────┬────────────────────────────────────┬───────────────┘
              │                                    │
              │                                    │
      ┌───────▼─────────┐                 ┌───────▼─────────┐
      │  Gamma Swarm    │                 │Cloudflare Swarm │
      │   (handler.ts)  │                 │  (handler.ts)   │
      └───────┬─────────┘                 └───────┬─────────┘
              │                                   │
    ┌─────────▼─────────────┐         ┌──────────▼──────────────┐
    │  Gamma Capabilities   │         │ Cloudflare Capabilities │
    ├───────────────────────┤         ├─────────────────────────┤
    │ • Zapier Integration  │         │ • API Development       │
    │ • Notion Sync         │         │ • Data Processing       │
    │ • WIX Automation      │         │ • Edge Computing        │
    │ • Cross-Platform Sync │         │ • Security (Auth/Rate)  │
    └───────────────────────┘         └─────────────────────────┘
```

## Data Flow Diagram

```
User Creates Task
       │
       ▼
┌──────────────────┐
│  POST /api/tasks │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│   Validate Task      │
│   • Check required   │
│   • fields           │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   Task Router        │
│   • Analyze content  │
│   • Match patterns   │
│   • Select swarm     │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   Task Queue         │
│   • Enqueue task     │
│   • Sort by priority │
│   • Check deps       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   Swarm Client       │
│   • Assign to swarm  │
│   • Monitor status   │
└────────┬─────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌───────┐  ┌──────────┐
│ Gamma │  │Cloudflare│
│ Swarm │  │  Swarm   │
└───┬───┘  └────┬─────┘
    │           │
    │  Execute  │
    │   Task    │
    │           │
    └─────┬─────┘
          │
          ▼
   ┌──────────────┐
   │   Results    │
   │ Aggregator   │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │Update Queue  │
   │  Status      │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │Return Result │
   │  to User     │
   └──────────────┘
```

## Swarm Communication Protocol

```
Task Engine                      Gamma Swarm
    │                                │
    │  POST /api/swarms/gamma        │
    │  { action: "assign",           │
    │    task: {...} }                │
    ├───────────────────────────────>│
    │                                │
    │                                │  ┌──────────────┐
    │                                │  │ Process Task │
    │                                │  │ • Validate   │
    │                                │  │ • Execute    │
    │                                │  │ • Track      │
    │                                │  └──────────────┘
    │                                │
    │  { taskId: "...",              │
    │    status: "completed",        │
    │    data: {...} }               │
    │<───────────────────────────────┤
    │                                │
    │  GET /api/swarms/gamma         │
    │  ?action=status                │
    ├───────────────────────────────>│
    │                                │
    │  { status: "online",           │
    │    capacity: 5,                │
    │    currentLoad: 2 }            │
    │<───────────────────────────────┤
    │                                │
```

## Task State Machine

```
     ┌─────────┐
     │ PENDING │
     └────┬────┘
          │
          │ Dequeued & Dependencies Met
          │
          ▼
     ┌─────────┐
     │ASSIGNED │
     └────┬────┘
          │
          │ Sent to Swarm
          │
          ▼
   ┌──────────────┐
   │ IN-PROGRESS  │
   └───┬──────┬───┘
       │      │
Success │      │ Failure
       │      │
       ▼      ▼
  ┌─────┐  ┌──────┐
  │DONE │  │FAILED│
  └─────┘  └──────┘
```

## Priority Queue Visualization

```
┌────────────────────────────────────────┐
│          TASK QUEUE                     │
├────────────────────────────────────────┤
│ Priority: CRITICAL                      │
│  ├─ Task A (hybrid, deps: [])          │
│  └─ Task B (gamma, deps: [])           │
├────────────────────────────────────────┤
│ Priority: HIGH                          │
│  ├─ Task C (cloudflare, deps: [Task A])│
│  └─ Task D (gamma, deps: [])           │
├────────────────────────────────────────┤
│ Priority: MEDIUM                        │
│  ├─ Task E (cloudflare, deps: [])      │
│  └─ Task F (gamma, deps: [Task C])     │
├────────────────────────────────────────┤
│ Priority: LOW                           │
│  └─ Task G (hybrid, deps: [])          │
└────────────────────────────────────────┘

Processing Order (with deps):
1. Task A or Task B (critical, no deps)
2. Task D (high, no deps)
3. Task C (high, waits for Task A)
4. Task E (medium, no deps)
5. Task F (medium, waits for Task C)
6. Task G (low, no deps)
```

## Load Balancing Algorithm

```
┌─────────────────────────────────────────────┐
│         Multiple Swarm Instances             │
├─────────────────────────────────────────────┤
│                                              │
│  Gamma-1: [██████░░░░] 60% (3/5 tasks)     │
│  Gamma-2: [████░░░░░░] 40% (2/5 tasks)     │
│  Gamma-3: [██░░░░░░░░] 20% (1/5 tasks)     │
│                                              │
│  CF-1:    [████████░░] 80% (8/10 tasks)    │
│  CF-2:    [█████░░░░░] 50% (5/10 tasks)    │
│  CF-3:    [███░░░░░░░] 30% (3/10 tasks)    │
│                                              │
└─────────────────────────────────────────────┘

New Gamma Task → Routed to Gamma-3 (lowest load)
New CF Task    → Routed to CF-3 (lowest load)
```

## Error Handling Flow

```
Task Execution Attempt
         │
         ▼
    ┌────────┐
    │Execute │
    └───┬────┘
        │
     Success?
    ┌───┴───┐
    │       │
   Yes      No
    │       │
    ▼       ▼
 ┌────┐ ┌───────────┐
 │Done│ │Retry < 3? │
 └────┘ └─────┬─────┘
              │
           ┌──┴───┐
          Yes     No
           │      │
           ▼      ▼
    ┌──────────┐ ┌──────┐
    │Wait (2^n)│ │FAILED│
    └────┬─────┘ └──────┘
         │
         └─────────┐
                   │
                   ▼
              Execute Again
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│           Cloudflare Global Network              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ US-East  │  │ EU-West  │  │  APAC    │      │
│  │  Edge    │  │  Edge    │  │  Edge    │      │
│  │ Location │  │ Location │  │ Location │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │              │
└───────┼─────────────┼─────────────┼──────────────┘
        │             │             │
        └──────┬──────┴──────┬──────┘
               │             │
        ┌──────▼─────────────▼──────┐
        │  Load Balancer             │
        │  (Cloudflare)              │
        └──────┬────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │  Worker Instances            │
        │  • Auto-scaling              │
        │  • Request routing           │
        │  • Task management           │
        └──────┬──────────────────────┘
               │
    ┌──────────┴───────────┐
    │                      │
┌───▼────────┐    ┌───────▼──────┐
│   KV Store │    │  Durable Obj │
│  (Tasks)   │    │  (State)     │
└────────────┘    └──────────────┘
```

## Key Benefits

1. **Scalability**: Workers scale automatically with traffic
2. **Low Latency**: Edge network deployment, <50ms response
3. **High Availability**: Multi-region redundancy
4. **Intelligent Routing**: Automatic task-to-swarm matching
5. **Load Balancing**: Distributes work across instances
6. **Error Recovery**: Automatic retry with backoff
7. **Real-time Monitoring**: Live swarm status updates
8. **Dependency Management**: Handles task dependencies
9. **Priority Handling**: Critical tasks processed first
10. **Result Aggregation**: Combines multi-swarm results
