/**
 * WIRED CHAOS - VR Lobby Component
 * Mozilla Hubs Integration for VR/AR Social Space
 */
import React, { useState } from 'react';
import './VRLobby.css';

const VRLobby = () => {
  const [hubsUrl] = useState('https://hubs.mozilla.com/');
  const [showVR, setShowVR] = useState(false);

  const vrFeatures = [
    {
      icon: '🥽',
      title: 'VR/AR Support',
      description: 'Full VR headset and AR device compatibility'
    },
    {
      icon: '💬',
      title: 'Voice Chat',
      description: 'Real-time spatial audio communication'
    },
    {
      icon: '👥',
      title: 'Avatars',
      description: 'Custom student avatars and profiles'
    },
    {
      icon: '🌐',
      title: 'Cross-Platform',
      description: 'Works on VR, desktop, and mobile'
    }
  ];

  return (
    <div className="vr-lobby-container">
      <div className="lobby-header">
        <h1 className="lobby-title">
          <span className="glitch" data-text="VR LOBBY">VR LOBBY</span>
        </h1>
        <p className="lobby-subtitle">Mozilla Hubs Powered Virtual Social Space</p>
      </div>

      <div className="vr-controls">
        <button 
          className={`vr-button ${showVR ? 'active' : ''}`}
          onClick={() => setShowVR(!showVR)}
        >
          {showVR ? '🔴 Exit VR Space' : '🎮 Enter VR Space'}
        </button>
        <a 
          href={hubsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="vr-button external"
        >
          🚀 Launch in New Window
        </a>
      </div>

      {showVR && (
        <div className="vr-embed-container">
          <div className="vr-frame-wrapper">
            <iframe
              src={hubsUrl}
              title="Mozilla Hubs VR Space"
              className="vr-iframe"
              allow="camera; microphone; display-capture; xr-spatial-tracking"
              allowFullScreen
            />
          </div>
          <div className="vr-instructions">
            <h3>🎯 Getting Started</h3>
            <ul>
              <li>Allow microphone and camera permissions for full experience</li>
              <li>Use WASD keys to move, mouse to look around</li>
              <li>Press Space to jump, click objects to interact</li>
              <li>Enable VR mode for immersive experience with headset</li>
            </ul>
          </div>
        </div>
      )}

      <div className="vr-features-grid">
        {vrFeatures.map((feature, index) => (
          <div key={index} className="vr-feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="lobby-info">
        <div className="info-section">
          <h2>📍 Available Spaces</h2>
          <ul className="spaces-list">
            <li>
              <span className="space-icon">🏛️</span>
              <strong>Main Commons</strong> - General gathering area
            </li>
            <li>
              <span className="space-icon">📚</span>
              <strong>Study Pods</strong> - Collaborative workspaces
            </li>
            <li>
              <span className="space-icon">🎭</span>
              <strong>Event Hall</strong> - Presentations and performances
            </li>
            <li>
              <span className="space-icon">🎮</span>
              <strong>Gaming Zone</strong> - Multiplayer activities
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2>⚙️ Technical Specs</h2>
          <ul className="specs-list">
            <li>✅ WebXR compatible</li>
            <li>✅ No downloads required</li>
            <li>✅ Works on all devices</li>
            <li>✅ Free educational license</li>
            <li>✅ Customizable environments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VRLobby;
