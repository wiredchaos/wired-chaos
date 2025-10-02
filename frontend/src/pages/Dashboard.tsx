import React, { useState, useEffect } from 'react';
import { Ticker } from '../components/Ticker';
import { HeatMap } from '../components/HeatMap';
import { BubblemapsPreview } from '../components/BubblemapsPreview';
import { RecentSignals } from '../components/RecentSignals';
import '../styles/dashboard.css';

/**
 * Complete WIRED CHAOS Dashboard
 * - Top: Ticker with InsightX events
 * - Left: Heat map
 * - Right: Bubblemaps preview
 * - Bottom: Recent signals list
 */
export const Dashboard: React.FC = () => {
  const [signals, setSignals] = useState<any[]>([]);
  
  // Listen to ticker events and capture InsightX signals
  useEffect(() => {
    const handleSignal = (event: CustomEvent) => {
      const signal = event.detail;
      setSignals(prev => [signal, ...prev].slice(0, 20)); // Keep last 20
    };
    
    window.addEventListener('insightx-signal' as any, handleSignal);
    
    return () => {
      window.removeEventListener('insightx-signal' as any, handleSignal);
    };
  }, []);
  
  return (
    <div className="dashboard-container">
      {/* Top Rail - Ticker */}
      <div className="dashboard-ticker">
        <Ticker />
      </div>
      
      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Left Panel - Heat Map */}
        <div className="dashboard-left">
          <div className="panel-header">
            <h2>Market Heat Map</h2>
            <span className="panel-subtitle">8x8 Intensity Grid</span>
          </div>
          <HeatMap />
        </div>
        
        {/* Right Panel - Bubblemaps */}
        <div className="dashboard-right">
          <div className="panel-header">
            <h2>Bubblemaps Preview</h2>
            <span className="panel-subtitle">Token Distribution</span>
          </div>
          <BubblemapsPreview />
        </div>
      </div>
      
      {/* Bottom Panel - Recent Signals */}
      <div className="dashboard-bottom">
        <div className="panel-header">
          <h2>Recent InsightX Signals</h2>
          <span className="panel-subtitle">Live Feed</span>
        </div>
        <RecentSignals signals={signals} />
      </div>
    </div>
  );
};

export default Dashboard;
