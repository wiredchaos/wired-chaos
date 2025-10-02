import React from 'react';
import '../styles/ticker-heatmap.css';

interface Signal {
  type: string;
  data: any;
  timestamp: number;
}

interface RecentSignalsProps {
  signals: Signal[];
}

/**
 * Recent Signals Component - Normalized list of InsightX signals
 */
export const RecentSignals: React.FC<RecentSignalsProps> = ({ signals }) => {
  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const getSignalIcon = (type: string): string => {
    switch (type) {
      case 'ix:risk': return '⚠️';
      case 'ix:bubble': return '💭';
      case 'ix:watch': return '👁️';
      default: return '📊';
    }
  };
  
  const getSignalColor = (type: string): string => {
    switch (type) {
      case 'ix:risk': return 'signal-risk';
      case 'ix:bubble': return 'signal-bubble';
      case 'ix:watch': return 'signal-watch';
      default: return 'signal-default';
    }
  };
  
  const renderSignalDetails = (signal: Signal) => {
    const { type, data } = signal;
    
    if (type === 'ix:risk') {
      return (
        <>
          <span className="signal-symbol">{data.symbol}</span>
          <span className="signal-detail">Risk: {data.riskLevel}</span>
          <span className="signal-value">{data.score}/100</span>
          <span className="signal-meta">{data.factors}</span>
        </>
      );
    }
    
    if (type === 'ix:bubble') {
      return (
        <>
          <span className="signal-symbol">{data.symbol}</span>
          <span className="signal-detail">Bubble Score: {data.bubbleScore}</span>
          <span className="signal-value">{data.trend}</span>
          <span className="signal-meta">Vol: {data.volume.toLocaleString()}</span>
        </>
      );
    }
    
    if (type === 'ix:watch') {
      return (
        <>
          <span className="signal-symbol">{data.symbol}</span>
          <span className="signal-detail">Action: {data.action}</span>
          <span className="signal-value">{data.confidence}%</span>
          <span className="signal-meta">{data.reason}</span>
        </>
      );
    }
    
    return <span className="signal-detail">Unknown signal type</span>;
  };
  
  if (signals.length === 0) {
    return (
      <div className="signals-container">
        <div className="signals-empty">
          <div className="empty-icon">📡</div>
          <p>Waiting for InsightX signals...</p>
          <p className="empty-subtitle">Real-time market intelligence will appear here</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="signals-container">
      <div className="signals-list">
        {signals.map((signal, idx) => (
          <div 
            key={idx} 
            className={`signal-item ${getSignalColor(signal.type)}`}
          >
            <div className="signal-header">
              <span className="signal-icon">{getSignalIcon(signal.type)}</span>
              <span className="signal-type">{signal.type.toUpperCase()}</span>
              <span className="signal-timestamp">{formatTimestamp(signal.timestamp)}</span>
            </div>
            <div className="signal-body">
              {renderSignalDetails(signal)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="signals-footer">
        <span className="footer-text">Total Signals: {signals.length}</span>
        <span className="footer-text">Auto-refresh: ON</span>
      </div>
    </div>
  );
};
