import React, { useState, useEffect } from 'react';
import '../styles/ticker-heatmap.css';

interface TickerEvent {
  type: string;
  data: any;
}

/**
 * Enhanced Ticker Component with InsightX Events
 * Displays: price updates + ix:risk + ix:bubble + ix:watch
 */
export const Ticker: React.FC = () => {
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const [mode, setMode] = useState<'stub' | 'live'>('stub');
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const API_BASE = process.env.REACT_APP_EDGE_API || 'http://localhost:8787';
    const eventSource = new EventSource(`${API_BASE}/api/ticker`);
    
    eventSource.addEventListener('connected', (e: any) => {
      const data = JSON.parse(e.data);
      setMode(data.mode);
      setConnected(true);
      console.log('Ticker connected:', data.mode);
    });
    
    eventSource.addEventListener('price', (e: any) => {
      const data = JSON.parse(e.data);
      addEvent('price', data);
    });
    
    eventSource.addEventListener('ix:risk', (e: any) => {
      const data = JSON.parse(e.data);
      addEvent('ix:risk', data);
      emitInsightXSignal('ix:risk', data);
    });
    
    eventSource.addEventListener('ix:bubble', (e: any) => {
      const data = JSON.parse(e.data);
      addEvent('ix:bubble', data);
      emitInsightXSignal('ix:bubble', data);
    });
    
    eventSource.addEventListener('ix:watch', (e: any) => {
      const data = JSON.parse(e.data);
      addEvent('ix:watch', data);
      emitInsightXSignal('ix:watch', data);
    });
    
    eventSource.addEventListener('closed', () => {
      setConnected(false);
      eventSource.close();
    });
    
    eventSource.onerror = (err) => {
      console.error('Ticker SSE error:', err);
      setConnected(false);
      eventSource.close();
    };
    
    return () => {
      eventSource.close();
    };
  }, []);
  
  const addEvent = (type: string, data: any) => {
    setEvents(prev => [...prev.slice(-19), { type, data }]);
  };
  
  const emitInsightXSignal = (type: string, data: any) => {
    const event = new CustomEvent('insightx-signal', {
      detail: { type, data, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  };
  
  const getEventChip = (event: TickerEvent) => {
    const { type, data } = event;
    
    if (type === 'price') {
      const changeClass = data.change >= 0 ? 'positive' : 'negative';
      return (
        <div key={Date.now() + Math.random()} className="ticker-chip price-chip">
          <span className="chip-symbol">{data.symbol}</span>
          <span className="chip-price">${data.price.toFixed(2)}</span>
          <span className={`chip-change ${changeClass}`}>
            {data.change >= 0 ? '+' : ''}{data.change}%
          </span>
        </div>
      );
    }
    
    if (type === 'ix:risk') {
      const riskColors: Record<string, string> = {
        low: 'green',
        medium: 'yellow',
        high: 'orange',
        critical: 'red'
      };
      return (
        <div key={Date.now() + Math.random()} className={`ticker-chip ix-chip ix-risk risk-${data.riskLevel}`}>
          <span className="chip-icon">⚠️</span>
          <span className="chip-symbol">{data.symbol}</span>
          <span className="chip-label">Risk: {data.riskLevel}</span>
          <span className="chip-score">{data.score}/100</span>
        </div>
      );
    }
    
    if (type === 'ix:bubble') {
      const trendIcons: Record<string, string> = {
        bullish: '🚀',
        bearish: '📉',
        neutral: '➡️'
      };
      return (
        <div key={Date.now() + Math.random()} className={`ticker-chip ix-chip ix-bubble trend-${data.trend}`}>
          <span className="chip-icon">{trendIcons[data.trend] || '💭'}</span>
          <span className="chip-symbol">{data.symbol}</span>
          <span className="chip-label">Bubble: {data.bubbleScore}/100</span>
          <span className="chip-trend">{data.trend}</span>
        </div>
      );
    }
    
    if (type === 'ix:watch') {
      return (
        <div key={Date.now() + Math.random()} className="ticker-chip ix-chip ix-watch">
          <span className="chip-icon">👁️</span>
          <span className="chip-symbol">{data.symbol}</span>
          <span className="chip-label">Watch: {data.action}</span>
          <span className="chip-confidence">{data.confidence}%</span>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="ticker-container">
      <div className="ticker-header">
        <div className="ticker-logo">
          <span className="logo-text">WIRED CHAOS</span>
          <span className="logo-icon">⚡</span>
        </div>
        <div className="ticker-status">
          <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">{mode === 'live' ? 'LIVE' : 'DEMO'}</span>
        </div>
      </div>
      
      <div className="ticker-rail">
        <div className="ticker-track">
          {events.map((event, idx) => (
            <React.Fragment key={idx}>
              {getEventChip(event)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
