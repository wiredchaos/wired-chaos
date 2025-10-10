/**
 * VRG33589 Dashboard - Complete Game Interface
 * Combines all game components into a unified dashboard
 */
import React from 'react';
import EternalLoop from './EternalLoop';
import SwarmMonitor from './SwarmMonitor';
import RealityLayers from './RealityLayers';
import XRPLWalletConnect from './XRPLWalletConnect';
import './VRG33589Dashboard.css';

const VRG33589Dashboard = () => {
  return (
    <div className="vrg33589-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">VRG33589</h1>
          <p className="dashboard-subtitle">The Eternal Loop</p>
        </div>
        <div className="header-tagline">
          XRPL × 589 LLM Swarm × Reality Simulation
        </div>
      </div>

      <div className="dashboard-main">
        {/* Main game interface */}
        <EternalLoop />
        
        {/* Additional monitoring components can be integrated here */}
        {/* Example usage when game state is available:
        <div className="dashboard-extras">
          <SwarmMonitor gameState={gameState} />
          <RealityLayers 
            currentLayer={gameState?.reality_layer || 'surface'}
            loopIteration={gameState?.loop_iteration || 0}
            puzzlesSolved={gameState?.puzzle_progress?.length || 0}
          />
        </div>
        */}
      </div>
    </div>
  );
};

export default VRG33589Dashboard;
