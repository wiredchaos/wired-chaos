/**
 * 589 Swarm Monitor Component
 * Real-time display of LLM swarm activity for VRG33589
 */
import React, { useState, useEffect } from 'react';
import './SwarmMonitor.css';

const SwarmMonitor = ({ gameState }) => {
  const [swarmTasks, setSwarmTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSwarmTasks();
    const interval = setInterval(loadSwarmTasks, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadSwarmTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vrg33589/swarm/tasks/pending');
      const data = await response.json();
      if (data.success) {
        setSwarmTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading swarm tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSwarmTypeIcon = (type) => {
    const icons = {
      puzzle: '🧩',
      patch: '🌀',
      guardian: '🛡️',
      community: '👥'
    };
    return icons[type] || '🤖';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#39FF14',
      medium: '#00FFFF',
      high: '#FFA500',
      critical: '#FF3131'
    };
    return colors[urgency] || '#FFFFFF';
  };

  return (
    <div className="swarm-monitor">
      <div className="monitor-header">
        <h3>589 LLM Swarm Coordination</h3>
        {isLoading && <span className="loading-indicator">⟳</span>}
      </div>

      <div className="swarm-overview">
        <div className="swarm-stat">
          <span className="stat-label">Active Swarms</span>
          <span className="stat-value">4</span>
        </div>
        <div className="swarm-stat">
          <span className="stat-label">Pending Tasks</span>
          <span className="stat-value">{swarmTasks.length}</span>
        </div>
        <div className="swarm-stat">
          <span className="stat-label">Response Time</span>
          <span className="stat-value">~2s</span>
        </div>
      </div>

      <div className="swarm-types">
        <div className="swarm-card puzzle-swarm">
          <div className="swarm-header">
            <span className="swarm-icon">🧩</span>
            <span className="swarm-name">Puzzle Generation</span>
          </div>
          <div className="swarm-details">
            <p className="swarm-desc">Creative, Logic, Narrative</p>
            <span className="swarm-status active">Active</span>
          </div>
        </div>

        <div className="swarm-card patch-swarm">
          <div className="swarm-header">
            <span className="swarm-icon">🌀</span>
            <span className="swarm-name">Reality Patching</span>
          </div>
          <div className="swarm-details">
            <p className="swarm-desc">Guardian, Narrative, Meta</p>
            <span className="swarm-status standby">Standby</span>
          </div>
        </div>

        <div className="swarm-card guardian-swarm">
          <div className="swarm-header">
            <span className="swarm-icon">🛡️</span>
            <span className="swarm-name">Anti-Exploit Guardian</span>
          </div>
          <div className="swarm-details">
            <p className="swarm-desc">Security, Monitoring</p>
            <span className="swarm-status monitoring">Monitoring</span>
          </div>
        </div>

        <div className="swarm-card community-swarm">
          <div className="swarm-header">
            <span className="swarm-icon">👥</span>
            <span className="swarm-name">Community Coordination</span>
          </div>
          <div className="swarm-details">
            <p className="swarm-desc">Social, Coordination, Incentive</p>
            <span className="swarm-status standby">Standby</span>
          </div>
        </div>
      </div>

      <div className="task-queue">
        <h4>Task Queue</h4>
        {swarmTasks.length === 0 ? (
          <p className="empty-queue">No pending tasks</p>
        ) : (
          <div className="task-list">
            {swarmTasks.slice(0, 5).map((task, i) => (
              <div key={i} className="task-item">
                <span className="task-icon">{getSwarmTypeIcon(task.swarm_type)}</span>
                <div className="task-info">
                  <span className="task-type">{task.swarm_type}</span>
                  <span 
                    className="task-urgency"
                    style={{ color: getUrgencyColor(task.urgency) }}
                  >
                    {task.urgency}
                  </span>
                </div>
                {task.collaboration_required && (
                  <span className="collab-badge">Multi-player</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="swarm-info">
        <p className="info-text">
          🤖 <strong>589 LLM Swarms</strong> generate dynamic puzzles, 
          detect exploits, and coordinate community challenges in real-time.
        </p>
      </div>
    </div>
  );
};

export default SwarmMonitor;
