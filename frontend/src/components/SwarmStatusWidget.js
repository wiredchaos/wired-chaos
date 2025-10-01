/**
 * SwarmStatusWidget - WC-BUS status display with offline fallback
 * Shows full widget when online, compact pill when offline
 */
import React, { useState, useEffect } from 'react';
import './SwarmStatusWidget.css';

const SwarmStatusWidget = () => {
  const [busStatus, setBusStatus] = useState({
    online: false,
    loading: true,
    error: null,
    data: null
  });

  const checkBusStatus = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/bus/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.ok === false) {
        // API returned { ok: false }
        if (process.env.NODE_ENV === 'development') {
          console.debug('[SwarmStatus] BUS returned ok:false');
        }
        setBusStatus({ online: false, loading: false, error: 'BUS offline', data });
      } else {
        // Success
        if (process.env.NODE_ENV === 'development') {
          console.debug('[SwarmStatus] BUS online', data);
        }
        setBusStatus({ online: true, loading: false, error: null, data });
      }
    } catch (err) {
      // Network error or non-2xx
      if (process.env.NODE_ENV === 'development') {
        console.debug('[SwarmStatus] BUS unreachable:', err.message);
      }
      setBusStatus({ online: false, loading: false, error: err.message, data: null });
    }
  };

  useEffect(() => {
    // Initial check
    checkBusStatus();

    // Poll every 30 seconds for auto-recovery
    const interval = setInterval(checkBusStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (busStatus.loading) {
    return (
      <div className="swarm-status-loading">
        <span className="swarm-pulse">●</span>
      </div>
    );
  }

  // Offline state - show compact pill
  if (!busStatus.online) {
    return (
      <div 
        className="swarm-offline-pill" 
        title="WC-BUS unreachable. UI in fallback mode."
      >
        <span className="swarm-pill-text">Swarm offline (fallback)</span>
      </div>
    );
  }

  // Online state - show full widget
  return (
    <div className="swarm-status-widget">
      <div className="swarm-status-header">
        <span className="swarm-icon">🧠</span>
        <span className="swarm-title">WC-BUS</span>
        <span className="swarm-status-indicator online">●</span>
      </div>
      <div className="swarm-status-body">
        <div className="swarm-stat">
          <span className="swarm-label">Status</span>
          <span className="swarm-value">ONLINE</span>
        </div>
        {busStatus.data?.nodes && (
          <div className="swarm-stat">
            <span className="swarm-label">Nodes</span>
            <span className="swarm-value">{busStatus.data.nodes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwarmStatusWidget;
