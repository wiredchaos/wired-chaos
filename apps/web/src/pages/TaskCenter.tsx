/**
 * WIRED CHAOS - Task Center Dashboard
 * Main task management interface for swarm coordination
 */

import React, { useState, useEffect } from 'react';
import SwarmMonitor from '../components/SwarmMonitor';
import TaskQueue from '../components/TaskQueue';
import type { SwarmTask, SwarmStatus } from '../../../../swarms/shared/protocol';

interface TaskCenterProps {
  apiEndpoint?: string;
}

const TaskCenter: React.FC<TaskCenterProps> = ({ 
  apiEndpoint = '/api/tasks' 
}) => {
  const [tasks, setTasks] = useState<SwarmTask[]>([]);
  const [swarms, setSwarms] = useState<SwarmStatus[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New task form state
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    type: 'cloudflare-compute' as const,
    priority: 'medium' as const,
    description: '',
    requirements: '',
  });

  useEffect(() => {
    loadData();
    
    // Refresh data every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load tasks
      const tasksResponse = await fetch(apiEndpoint);
      const tasksData = await tasksResponse.json();
      
      if (tasksData.success) {
        setTasks(tasksData.tasks || []);
      }

      // Load swarm statuses
      const swarmsResponse = await fetch('/api/swarms');
      const swarmsData = await swarmsResponse.json();
      
      if (swarmsData.success) {
        setSwarms(swarmsData.swarms || []);
      }

      // Load metrics
      const metricsResponse = await fetch('/api/tasks/metrics');
      const metricsData = await metricsResponse.json();
      
      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          requirements: newTask.requirements.split(',').map(r => r.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowNewTaskForm(false);
        setNewTask({
          type: 'cloudflare-compute',
          priority: 'medium',
          description: '',
          requirements: '',
        });
        
        // Reload data
        await loadData();
      } else {
        alert('Failed to create task: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to create task: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="task-center-loading" style={styles.loading}>
        <div className="wired-chaos-spinner">⚡</div>
        <p>Loading Task Center...</p>
      </div>
    );
  }

  return (
    <div className="task-center" style={styles.container}>
      {/* Header */}
      <div className="task-center-header" style={styles.header}>
        <h1 style={styles.title}>⚡ WIRED CHAOS Task Center</h1>
        <p style={styles.subtitle}>Swarm Orchestration & Task Management</p>
        
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          style={styles.createButton}
        >
          {showNewTaskForm ? '✕ Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* New Task Form */}
      {showNewTaskForm && (
        <div style={styles.newTaskForm}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask}>
            <div style={styles.formGroup}>
              <label>Task Type</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                style={styles.input}
              >
                <option value="cloudflare-compute">Cloudflare Compute</option>
                <option value="gamma-automation">Gamma Automation</option>
                <option value="hybrid">Hybrid (Both Swarms)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                style={styles.input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe what this task should do..."
                style={{ ...styles.input, minHeight: '80px' }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label>Requirements (comma-separated)</label>
              <input
                type="text"
                value={newTask.requirements}
                onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                placeholder="api, auth, cache"
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              Create Task
            </button>
          </form>
        </div>
      )}

      {/* Metrics Dashboard */}
      {metrics && (
        <div style={styles.metrics}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.queue?.totalTasks || 0}</div>
            <div style={styles.metricLabel}>Total Tasks</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.queue?.pendingTasks || 0}</div>
            <div style={styles.metricLabel}>Pending</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.queue?.inProgressTasks || 0}</div>
            <div style={styles.metricLabel}>In Progress</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.queue?.completedTasks || 0}</div>
            <div style={styles.metricLabel}>Completed</div>
          </div>
        </div>
      )}

      {/* Swarm Monitor */}
      <SwarmMonitor swarms={swarms} />

      {/* Task Queue */}
      <TaskQueue tasks={tasks} onTaskUpdate={loadData} />
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'monospace',
    color: '#0ff',
    background: 'linear-gradient(135deg, #000 0%, #1a0033 100%)',
    minHeight: '100vh',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#0ff',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    padding: '20px',
    background: 'rgba(0, 255, 255, 0.1)',
    border: '2px solid #0ff',
    borderRadius: '8px',
  },
  title: {
    fontSize: '32px',
    margin: '0 0 10px 0',
    color: '#ff0080',
    textShadow: '0 0 10px #ff0080',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    opacity: 0.8,
  },
  createButton: {
    padding: '10px 20px',
    background: '#0ff',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  error: {
    padding: '15px',
    background: 'rgba(255, 0, 0, 0.2)',
    border: '2px solid #f00',
    borderRadius: '4px',
    marginBottom: '20px',
    color: '#f00',
  },
  newTaskForm: {
    padding: '20px',
    background: 'rgba(0, 255, 255, 0.05)',
    border: '2px solid #0ff',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #0ff',
    borderRadius: '4px',
    color: '#0ff',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px 20px',
    background: '#ff0080',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  metricCard: {
    padding: '20px',
    background: 'rgba(0, 255, 255, 0.1)',
    border: '2px solid #0ff',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff0080',
    marginBottom: '5px',
  },
  metricLabel: {
    fontSize: '12px',
    opacity: 0.8,
    textTransform: 'uppercase' as const,
  },
};

export default TaskCenter;
