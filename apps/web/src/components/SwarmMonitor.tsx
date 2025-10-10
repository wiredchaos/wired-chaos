/**
 * WIRED CHAOS - Swarm Monitor Component
 * Real-time swarm status display
 */

import React from 'react';
import type { SwarmStatus } from '../../../../swarms/shared/protocol';

interface SwarmMonitorProps {
  swarms: SwarmStatus[];
}

const SwarmMonitor: React.FC<SwarmMonitorProps> = ({ swarms }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online': return '#0f0';
      case 'busy': return '#ff0';
      case 'offline': return '#f00';
      case 'maintenance': return '#fa0';
      default: return '#888';
    }
  };

  const getLoadPercentage = (currentLoad: number, capacity: number): number => {
    return capacity > 0 ? (currentLoad / capacity) * 100 : 0;
  };

  const getLoadColor = (percentage: number): string => {
    if (percentage < 50) return '#0f0';
    if (percentage < 80) return '#ff0';
    return '#f00';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🤖 Swarm Status Monitor</h2>
      
      <div style={styles.swarmGrid}>
        {swarms.map((swarm) => {
          const loadPercentage = getLoadPercentage(swarm.currentLoad, swarm.capacity);
          const loadColor = getLoadColor(loadPercentage);
          const statusColor = getStatusColor(swarm.status);

          return (
            <div key={swarm.swarmId} style={styles.swarmCard}>
              {/* Header */}
              <div style={styles.swarmHeader}>
                <div style={styles.swarmName}>
                  {swarm.swarmType === 'gamma' ? '🎨' : '⚡'} 
                  {' '}
                  {swarm.swarmId}
                </div>
                <div 
                  style={{
                    ...styles.statusIndicator,
                    backgroundColor: statusColor,
                  }}
                  title={swarm.status}
                />
              </div>

              {/* Type Badge */}
              <div style={styles.typeBadge}>
                {swarm.swarmType === 'gamma' ? 'Gamma WIX Zapier Notion' : 'Cloudflare Worker'}
              </div>

              {/* Load Bar */}
              <div style={styles.loadSection}>
                <div style={styles.loadLabel}>
                  Load: {swarm.currentLoad} / {swarm.capacity}
                  <span style={{ marginLeft: '10px', opacity: 0.7 }}>
                    ({loadPercentage.toFixed(0)}%)
                  </span>
                </div>
                <div style={styles.loadBarContainer}>
                  <div 
                    style={{
                      ...styles.loadBar,
                      width: `${loadPercentage}%`,
                      backgroundColor: loadColor,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statValue}>{swarm.tasksProcessed}</div>
                  <div style={styles.statLabel}>Tasks Processed</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>{swarm.status}</div>
                  <div style={styles.statLabel}>Status</div>
                </div>
              </div>

              {/* Capabilities */}
              {swarm.metadata?.capabilities && (
                <div style={styles.capabilities}>
                  <div style={styles.capabilitiesTitle}>Capabilities:</div>
                  <div style={styles.capabilityList}>
                    {swarm.metadata.capabilities.map((cap: any, idx: number) => (
                      <div 
                        key={idx} 
                        style={{
                          ...styles.capabilityBadge,
                          opacity: cap.enabled ? 1 : 0.5,
                        }}
                        title={cap.description}
                      >
                        {cap.enabled ? '✓' : '✗'} {cap.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Heartbeat */}
              <div style={styles.heartbeat}>
                Last Heartbeat: {new Date(swarm.lastHeartbeat).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>

      {swarms.length === 0 && (
        <div style={styles.noSwarms}>
          No swarms available. Please check your configuration.
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#0ff',
    textShadow: '0 0 10px #0ff',
  },
  swarmGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  swarmCard: {
    padding: '20px',
    background: 'rgba(0, 255, 255, 0.05)',
    border: '2px solid #0ff',
    borderRadius: '8px',
  },
  swarmHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  swarmName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ff0080',
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    boxShadow: '0 0 10px currentColor',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    background: 'rgba(255, 0, 128, 0.2)',
    border: '1px solid #ff0080',
    borderRadius: '4px',
    fontSize: '11px',
    marginBottom: '15px',
  },
  loadSection: {
    marginBottom: '15px',
  },
  loadLabel: {
    fontSize: '12px',
    marginBottom: '5px',
  },
  loadBarContainer: {
    width: '100%',
    height: '8px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #0ff',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  loadBar: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
    boxShadow: '0 0 10px currentColor',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '15px',
  },
  stat: {
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0ff',
  },
  statLabel: {
    fontSize: '10px',
    opacity: 0.7,
    textTransform: 'uppercase' as const,
  },
  capabilities: {
    marginBottom: '10px',
  },
  capabilitiesTitle: {
    fontSize: '12px',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  capabilityList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '5px',
  },
  capabilityBadge: {
    padding: '3px 8px',
    background: 'rgba(0, 255, 255, 0.1)',
    border: '1px solid #0ff',
    borderRadius: '3px',
    fontSize: '10px',
  },
  heartbeat: {
    fontSize: '10px',
    opacity: 0.6,
    textAlign: 'right' as const,
    marginTop: '10px',
  },
  noSwarms: {
    padding: '40px',
    textAlign: 'center' as const,
    color: '#ff0080',
    opacity: 0.7,
  },
};

export default SwarmMonitor;
