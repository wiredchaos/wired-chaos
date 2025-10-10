import React, { useState, useEffect } from 'react';
import '../styles/ticker-heatmap.css';

interface HeatMapCell {
  row: number;
  col: number;
  intensity: number;
  symbol?: string;
  metric?: string;
}

interface HeatMapData {
  rows: number;
  cols: number;
  cells: HeatMapCell[];
}

/**
 * Heat Map Component - 8x8 Glow Grid Visualization
 */
export const HeatMap: React.FC = () => {
  const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null);
  const [mode, setMode] = useState<'stub' | 'live'>('stub');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  useEffect(() => {
    const API_BASE = process.env.REACT_APP_EDGE_API || 'http://localhost:8787';
    
    const fetchHeatMap = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/heatmap`);
        const data = await response.json();
        
        setHeatMapData(data.grid);
        setMode(data.mode);
        setLastUpdate(data.ts);
      } catch (error) {
        console.error('Heat map fetch error:', error);
      }
    };
    
    // Initial fetch
    fetchHeatMap();
    
    // Refresh every 5 seconds
    const interval = setInterval(fetchHeatMap, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getIntensityColor = (intensity: number): string => {
    if (intensity < 0.2) return '#0a0f13'; // Very low - dark
    if (intensity < 0.4) return '#1a3f52'; // Low - dark cyan
    if (intensity < 0.6) return '#00fff0'; // Medium - cyan
    if (intensity < 0.8) return '#39ff14'; // High - green
    return '#ff2a2a'; // Very high - red
  };
  
  const getIntensityGlow = (intensity: number): string => {
    if (intensity < 0.2) return '0';
    if (intensity < 0.4) return '5px';
    if (intensity < 0.6) return '10px';
    if (intensity < 0.8) return '15px';
    return '20px';
  };
  
  if (!heatMapData) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-loading">
          <div className="loading-spinner"></div>
          <span>Loading heat map...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="heatmap-container">
      <div className="heatmap-info">
        <span className="heatmap-mode">{mode === 'live' ? '🟢 LIVE' : '🟡 DEMO'}</span>
        <span className="heatmap-update">
          Updated: {new Date(lastUpdate).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="heatmap-grid">
        {heatMapData.cells.map((cell, idx) => {
          const color = getIntensityColor(cell.intensity);
          const glow = getIntensityGlow(cell.intensity);
          
          return (
            <div
              key={idx}
              className="heatmap-cell"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 ${glow} ${color}`,
                gridRow: cell.row + 1,
                gridColumn: cell.col + 1
              }}
              title={`${cell.symbol || 'N/A'} - ${cell.metric || 'N/A'}: ${(cell.intensity * 100).toFixed(0)}%`}
            >
              <span className="cell-intensity">{(cell.intensity * 100).toFixed(0)}</span>
            </div>
          );
        })}
      </div>
      
      <div className="heatmap-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#0a0f13' }}></div>
          <span>0-20%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#1a3f52' }}></div>
          <span>20-40%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#00fff0' }}></div>
          <span>40-60%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#39ff14' }}></div>
          <span>60-80%</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ff2a2a' }}></div>
          <span>80-100%</span>
        </div>
      </div>
    </div>
  );
};
