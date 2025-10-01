/**
 * WIRED CHAOS - Locked Theme Motherboard Component
 * Isolated 2D layout with locked palette - no global overrides
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/featureFlags';
import { getSuiteUrl } from '../utils/env';
import './motherboard.css';

const Motherboard = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null);
  const [connectionPaths, setConnectionPaths] = useState([]);

  const panelNodes = [
    {
      id: 'csn',
      icon: '🚀',
      title: 'CSN',
      description: 'Crypto Spaces Network',
      path: '/csn',
      variant: 'cyan',
      status: 'active'
    },
    {
      id: 'neurolab',
      icon: '🧠',
      title: 'NEURO LAB',
      description: 'Web3 Onboarding Hub',
      path: '/neurolab',
      variant: 'green',
      status: 'active'
    },
    {
      id: 'fm333',
      icon: '📻',
      title: '33.3 FM',
      description: 'DOGECHAIN Radio',
      path: '/fm333',
      variant: 'red',
      status: 'active'
    },
    {
      id: 'bwb',
      icon: '📰',
      title: 'BWB',
      description: 'Barbed Wired Broadcast',
      path: '/bwb',
      variant: 'cyan',
      status: 'active'
    },
    {
      id: 'vault33',
      icon: '🔐',
      title: 'VAULT 33',
      description: 'WL Gamification',
      path: '/vault33',
      variant: 'red',
      status: 'active'
    },
    {
      id: 'vrg33589',
      icon: '👁️',
      title: 'VRG-33-589',
      description: 'Tinfoil Bot',
      path: '/vrg33589',
      variant: 'orange',
      status: 'active'
    },
    {
      id: 'b2b',
      icon: '💼',
      title: 'B2B',
      description: 'Enterprise Intake',
      path: '/b2b',
      variant: 'green',
      status: 'active'
    },
    {
      id: 'eveningvibes',
      icon: '🌙',
      title: 'EVENING VIBES',
      description: 'Level Up Lounge',
      path: '/eveningvibes',
      variant: 'orange',
      status: 'active'
    },
    {
      id: 'merch',
      icon: '🛍️',
      title: 'MERCH HUB',
      description: 'WIRED CHAOS Store',
      path: '/merch',
      variant: 'cyan',
      status: 'active'
    }
  ];

  const handlePanelClick = (panel) => {
    if (panel.status === 'coming-soon') return;
    
    setActivePanel(panel.id);
    setConnectionPaths([panel.id]);
    
    // Animate connection pathway
    setTimeout(() => {
      navigate(panel.path);
      setActivePanel(null);
      setConnectionPaths([]);
    }, 800);
  };

  const renderPanel = (panel, gridPosition) => (
    <div
      key={panel.id}
      className={`motherboard-panel variant-${panel.variant} status-${panel.status} ${gridPosition} ${
        activePanel === panel.id ? 'active-connection' : ''
      }`}
      onClick={() => handlePanelClick(panel)}
    >
      <div className="panel-header">
        <span className="panel-icon">{panel.icon}</span>
        <div className="panel-status-indicator" />
      </div>
      <div className="panel-body">
        <h3 className="panel-title">{panel.title}</h3>
        <p className="panel-description">{panel.description}</p>
      </div>
      <div className="panel-connector" />
    </div>
  );

  const suiteUrl = getSuiteUrl();

  const handleOpenSuite = () => {
    if (suiteUrl) {
      window.open(suiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="motherboard-container">
      {FEATURES.debugMode && (
        <div className="debug-info">
          <span>STACK: react-fastapi | FEATURES.motherboardUI: {String(FEATURES.motherboardUI)}</span>
        </div>
      )}
      
      {/* Suite Access Button - Only shown when configured */}
      {suiteUrl && (
        <button
          onClick={handleOpenSuite}
          className="suite-access-btn"
          title="Open Management Suite"
          aria-label="Open Management Suite"
        >
          ⚙️ Suite
        </button>
      )}
      
      {/* Main Grid Layout */}
      <div className="motherboard-grid">
        {/* Top Row */}
        {renderPanel(panelNodes[0], 'grid-csn')}
        <div className="grid-center-top">
          <h1 className="motherboard-title">
            <span className="glitch-text" data-text="WIRED CHAOS">WIRED CHAOS</span>
            <span className="brain-symbol">🧠</span>
          </h1>
          <p className="motherboard-subtitle">DIGITAL ECOSYSTEM MOTHERBOARD</p>
        </div>
        {renderPanel(panelNodes[1], 'grid-neuro')}
        
        {/* Middle Row */}
        {renderPanel(panelNodes[2], 'grid-fm')}
        
        {/* Central CPU Core */}
        <div className="grid-cpu-core">
          <div className="cpu-core">
            <div className="cpu-inner">
              <div className="cpu-brain">🧠</div>
              <div className="cpu-pulse"></div>
            </div>
            <div className="cpu-label">CORE</div>
          </div>
          
          {/* Connection pathways */}
          {connectionPaths.map((pathId, index) => (
            <div key={pathId} className={`connection-pathway pathway-${pathId}`} />
          ))}
        </div>
        
        {renderPanel(panelNodes[3], 'grid-bwb')}
        
        {/* Bottom Row */}
        {renderPanel(panelNodes[4], 'grid-vault')}
        {renderPanel(panelNodes[5], 'grid-vrg')}
        {renderPanel(panelNodes[6], 'grid-b2b')}
        {renderPanel(panelNodes[7], 'grid-vibes')}
        {renderPanel(panelNodes[8], 'grid-merch')}
      </div>
      
      {/* System Status */}
      <div className="system-status">
        <div className="status-indicator active">●</div>
        <span>ALL SYSTEMS OPERATIONAL</span>
        <div className="status-indicator active">●</div>
      </div>
    </div>
  );
};

export default Motherboard;