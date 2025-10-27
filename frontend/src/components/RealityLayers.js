/**
 * Reality Layers Visualization Component
 * Shows progression through game reality layers
 */
import React from 'react';
import './RealityLayers.css';

const RealityLayers = ({ currentLayer, loopIteration, puzzlesSolved }) => {
  const layers = [
    {
      id: 'surface',
      name: 'Surface Layer',
      description: 'Gamma verification + XRPL connection',
      minLevel: 0,
      color: '#00FFFF',
      icon: '🌊'
    },
    {
      id: 'deep',
      name: 'Deep Layer',
      description: 'Multi-NFT puzzles & DEX trading',
      minLevel: 5,
      color: '#FF00FF',
      icon: '🌀'
    },
    {
      id: 'core',
      name: 'Core Layer',
      description: 'Collaborative swarm challenges',
      minLevel: 10,
      color: '#FF3131',
      icon: '⚡'
    },
    {
      id: 'void',
      name: 'Void Layer',
      description: 'Meta-awareness & simulation theory',
      minLevel: 20,
      color: '#39FF14',
      icon: '🕳️'
    }
  ];

  const getCurrentLayerIndex = () => {
    return layers.findIndex(layer => layer.id === currentLayer);
  };

  const isLayerUnlocked = (layer) => {
    return loopIteration >= layer.minLevel;
  };

  const isLayerActive = (layer) => {
    return layer.id === currentLayer;
  };

  return (
    <div className="reality-layers">
      <div className="layers-header">
        <h3>Reality Layer Progression</h3>
        <div className="iteration-badge">
          Loop Iteration: <span className="iteration-value">{loopIteration}</span>
        </div>
      </div>

      <div className="layers-visualization">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            className={`layer-node ${isLayerActive(layer) ? 'active' : ''} ${
              isLayerUnlocked(layer) ? 'unlocked' : 'locked'
            }`}
            style={{ '--layer-color': layer.color }}
          >
            <div className="layer-connector">
              {index < layers.length - 1 && (
                <div className="connector-line"></div>
              )}
            </div>
            
            <div className="layer-circle">
              <span className="layer-icon">{layer.icon}</span>
              {isLayerActive(layer) && (
                <div className="active-pulse"></div>
              )}
            </div>

            <div className="layer-info">
              <h4 className="layer-name">{layer.name}</h4>
              <p className="layer-description">{layer.description}</p>
              <div className="layer-requirements">
                <span className="req-label">Min Loop:</span>
                <span className="req-value">{layer.minLevel}</span>
              </div>
              
              {isLayerActive(layer) && (
                <div className="layer-progress">
                  <span className="progress-label">Puzzles Solved:</span>
                  <span className="progress-value">{puzzlesSolved}</span>
                </div>
              )}

              {!isLayerUnlocked(layer) && (
                <div className="locked-badge">
                  🔒 Locked
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="layers-legend">
        <div className="legend-item">
          <span className="legend-icon active-icon">●</span>
          <span className="legend-text">Current Layer</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon unlocked-icon">●</span>
          <span className="legend-text">Unlocked</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon locked-icon">●</span>
          <span className="legend-text">Locked</span>
        </div>
      </div>

      <div className="layers-footer">
        <p className="footer-note">
          Progress through reality layers by solving puzzles and increasing your loop iteration.
          Each layer reveals deeper truths about The Eternal Loop.
        </p>
      </div>
    </div>
  );
};

export default RealityLayers;
