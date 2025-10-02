import React, { useState } from 'react';
import '../styles/ticker-heatmap.css';

/**
 * Bubblemaps Preview Component
 * Displays iframe or canvas fallback for token distribution visualization
 */
export const BubblemapsPreview: React.FC = () => {
  const [useIframe, setUseIframe] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  
  // Example token address (replace with dynamic selection)
  const tokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'; // UNI token
  const bubblemapsUrl = `https://app.bubblemaps.io/eth/token/${tokenAddress}`;
  
  const handleIframeError = () => {
    console.log('Bubblemaps iframe failed to load, using fallback');
    setIframeError(true);
    setUseIframe(false);
  };
  
  // Canvas fallback visualization
  const renderCanvasFallback = () => {
    return (
      <div className="bubblemaps-fallback">
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="bubble-svg">
          {/* Central bubble */}
          <circle
            cx="200"
            cy="200"
            r="60"
            fill="rgba(0, 255, 240, 0.3)"
            stroke="#00fff0"
            strokeWidth="2"
          />
          <text
            x="200"
            y="200"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#00fff0"
            fontSize="12"
            fontWeight="600"
          >
            Token Pool
          </text>
          <text
            x="200"
            y="215"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8B9DC3"
            fontSize="10"
          >
            45%
          </text>
          
          {/* Surrounding bubbles */}
          {[
            { cx: 120, cy: 120, r: 40, label: 'Whale 1', pct: '15%' },
            { cx: 280, cy: 120, r: 35, label: 'Whale 2', pct: '12%' },
            { cx: 120, cy: 280, r: 30, label: 'Whale 3', pct: '10%' },
            { cx: 280, cy: 280, r: 25, label: 'DEX', pct: '8%' },
            { cx: 340, cy: 200, r: 20, label: 'Others', pct: '10%' }
          ].map((bubble, idx) => (
            <g key={idx}>
              <circle
                cx={bubble.cx}
                cy={bubble.cy}
                r={bubble.r}
                fill="rgba(57, 255, 20, 0.2)"
                stroke="#39ff14"
                strokeWidth="1.5"
              />
              <text
                x={bubble.cx}
                y={bubble.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#39ff14"
                fontSize="10"
                fontWeight="600"
              >
                {bubble.label}
              </text>
              <text
                x={bubble.cx}
                y={bubble.cy + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#8B9DC3"
                fontSize="9"
              >
                {bubble.pct}
              </text>
            </g>
          ))}
          
          {/* Connecting lines */}
          <line x1="200" y1="200" x2="120" y2="120" stroke="rgba(0, 255, 240, 0.3)" strokeWidth="1" />
          <line x1="200" y1="200" x2="280" y2="120" stroke="rgba(0, 255, 240, 0.3)" strokeWidth="1" />
          <line x1="200" y1="200" x2="120" y2="280" stroke="rgba(0, 255, 240, 0.3)" strokeWidth="1" />
          <line x1="200" y1="200" x2="280" y2="280" stroke="rgba(0, 255, 240, 0.3)" strokeWidth="1" />
          <line x1="200" y1="200" x2="340" y2="200" stroke="rgba(0, 255, 240, 0.3)" strokeWidth="1" />
        </svg>
        
        <div className="fallback-message">
          <p>⚠️ Live Bubblemaps unavailable</p>
          <p className="fallback-subtitle">Showing mock token distribution</p>
          <a 
            href={bubblemapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="fallback-link"
          >
            View on Bubblemaps ↗
          </a>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bubblemaps-container">
      {useIframe && !iframeError ? (
        <>
          <iframe
            src={bubblemapsUrl}
            title="Bubblemaps Token Distribution"
            className="bubblemaps-iframe"
            sandbox="allow-scripts allow-same-origin"
            onError={handleIframeError}
          />
          <div className="bubblemaps-controls">
            <button 
              onClick={() => setUseIframe(false)}
              className="control-btn"
            >
              Use Fallback
            </button>
            <a 
              href={bubblemapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="control-link"
            >
              Open Full View ↗
            </a>
          </div>
        </>
      ) : (
        <>
          {renderCanvasFallback()}
          <div className="bubblemaps-controls">
            <button 
              onClick={() => {
                setUseIframe(true);
                setIframeError(false);
              }}
              className="control-btn"
            >
              Try Iframe
            </button>
          </div>
        </>
      )}
    </div>
  );
};
