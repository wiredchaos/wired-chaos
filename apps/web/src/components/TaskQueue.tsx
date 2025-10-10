/**
 * WIRED CHAOS - Task Queue Component
 * Visualizes task queue with status and controls
 */

import React, { useState } from 'react';
import type { SwarmTask } from '../../../../swarms/shared/protocol';

interface TaskQueueProps {
  tasks: SwarmTask[];
  onTaskUpdate?: () => void;
}

const TaskQueue: React.FC<TaskQueueProps> = ({ tasks, onTaskUpdate }) => {
  const [selectedTask, setSelectedTask] = useState<SwarmTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#0f0';
      case 'in-progress': return '#ff0';
      case 'failed': return '#f00';
      case 'pending': return '#0ff';
      default: return '#888';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return '#f00';
      case 'high': return '#ff0080';
      case 'medium': return '#ff0';
      case 'low': return '#0ff';
      default: return '#888';
    }
  };

  const handleCancelTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to cancel this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onTaskUpdate?.();
      } else {
        alert('Failed to cancel task');
      }
    } catch (error) {
      alert('Error cancelling task: ' + error);
    }
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Then by creation time
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 Task Queue</h2>
        
        <div style={styles.filters}>
          <button 
            onClick={() => setFilterStatus('all')}
            style={{
              ...styles.filterButton,
              opacity: filterStatus === 'all' ? 1 : 0.5,
            }}
          >
            All ({tasks.length})
          </button>
          <button 
            onClick={() => setFilterStatus('pending')}
            style={{
              ...styles.filterButton,
              opacity: filterStatus === 'pending' ? 1 : 0.5,
            }}
          >
            Pending ({tasks.filter(t => t.status === 'pending').length})
          </button>
          <button 
            onClick={() => setFilterStatus('in-progress')}
            style={{
              ...styles.filterButton,
              opacity: filterStatus === 'in-progress' ? 1 : 0.5,
            }}
          >
            In Progress ({tasks.filter(t => t.status === 'in-progress').length})
          </button>
          <button 
            onClick={() => setFilterStatus('completed')}
            style={{
              ...styles.filterButton,
              opacity: filterStatus === 'completed' ? 1 : 0.5,
            }}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>
      </div>

      <div style={styles.taskList}>
        {sortedTasks.map((task) => (
          <div 
            key={task.id} 
            style={styles.taskCard}
            onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
          >
            <div style={styles.taskHeader}>
              <div style={styles.taskId}>
                {task.id}
              </div>
              <div style={styles.badges}>
                <span 
                  style={{
                    ...styles.badge,
                    borderColor: getPriorityColor(task.priority),
                    color: getPriorityColor(task.priority),
                  }}
                >
                  {task.priority}
                </span>
                <span 
                  style={{
                    ...styles.badge,
                    borderColor: getStatusColor(task.status),
                    color: getStatusColor(task.status),
                  }}
                >
                  {task.status}
                </span>
              </div>
            </div>

            <div style={styles.taskType}>
              {task.type === 'gamma-automation' && '🎨 Gamma Automation'}
              {task.type === 'cloudflare-compute' && '⚡ Cloudflare Compute'}
              {task.type === 'hybrid' && '🔀 Hybrid Task'}
            </div>

            <div style={styles.taskDescription}>
              {task.description}
            </div>

            <div style={styles.taskMeta}>
              <span>Swarm: {task.assignedSwarm || 'Not assigned'}</span>
              <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
            </div>

            {/* Expanded Details */}
            {selectedTask?.id === task.id && (
              <div style={styles.taskDetails}>
                <div style={styles.detailsSection}>
                  <strong>Requirements:</strong>
                  <div style={styles.requirementsList}>
                    {task.requirements.length > 0 
                      ? task.requirements.map((req, idx) => (
                          <span key={idx} style={styles.requirementTag}>{req}</span>
                        ))
                      : 'None'
                    }
                  </div>
                </div>

                {task.dependencies.length > 0 && (
                  <div style={styles.detailsSection}>
                    <strong>Dependencies:</strong>
                    <div style={styles.requirementsList}>
                      {task.dependencies.map((dep, idx) => (
                        <span key={idx} style={styles.requirementTag}>{dep}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.detailsSection}>
                  <strong>Updated:</strong> {new Date(task.updatedAt).toLocaleString()}
                  {task.completedAt && (
                    <> | <strong>Completed:</strong> {new Date(task.completedAt).toLocaleString()}</>
                  )}
                </div>

                {task.status !== 'completed' && task.status !== 'failed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelTask(task.id);
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel Task
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedTasks.length === 0 && (
        <div style={styles.emptyState}>
          No tasks found. Create a new task to get started.
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '15px',
  },
  title: {
    fontSize: '24px',
    color: '#0ff',
    textShadow: '0 0 10px #0ff',
    margin: 0,
  },
  filters: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  filterButton: {
    padding: '8px 12px',
    background: 'rgba(0, 255, 255, 0.1)',
    border: '1px solid #0ff',
    borderRadius: '4px',
    color: '#0ff',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'opacity 0.2s',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  taskCard: {
    padding: '15px',
    background: 'rgba(0, 255, 255, 0.05)',
    border: '2px solid #0ff',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  taskId: {
    fontFamily: 'monospace',
    fontSize: '12px',
    opacity: 0.7,
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '3px 8px',
    border: '1px solid',
    borderRadius: '3px',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
  },
  taskType: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#ff0080',
  },
  taskDescription: {
    fontSize: '14px',
    marginBottom: '10px',
    lineHeight: '1.4',
  },
  taskMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    opacity: 0.6,
    flexWrap: 'wrap' as const,
    gap: '10px',
  },
  taskDetails: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(0, 255, 255, 0.3)',
  },
  detailsSection: {
    marginBottom: '10px',
    fontSize: '12px',
  },
  requirementsList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '5px',
    marginTop: '5px',
  },
  requirementTag: {
    padding: '3px 8px',
    background: 'rgba(255, 0, 128, 0.2)',
    border: '1px solid #ff0080',
    borderRadius: '3px',
    fontSize: '10px',
  },
  cancelButton: {
    marginTop: '10px',
    padding: '8px 16px',
    background: '#f00',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#0ff',
    opacity: 0.6,
    fontSize: '14px',
  },
};

export default TaskQueue;
