import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import './PatchHistory.css';

const PatchHistory = () => {
  const patches = [
    {
      id: 1,
      version: 'v1.2.3',
      date: '2024-01-15',
      iteration: 1,
      reason: 'Community consensus forming',
      changes: [
        'Reality layer progression adjusted',
        'New puzzles added to Deep layer',
        'System stability recalibrated',
        'Collaborative puzzle mechanics enhanced'
      ],
      stability: 100,
      affected: 147
    },
    {
      id: 2,
      version: 'v1.2.2',
      date: '2024-01-10',
      iteration: 1,
      reason: 'Solution confidence > 0.85',
      changes: [
        'Puzzle difficulty increased',
        'New meta-awareness challenges',
        'Credit distribution rebalanced',
        'AI guardian parameters updated'
      ],
      stability: 100,
      affected: 132
    },
    {
      id: 3,
      version: 'v1.2.1',
      date: '2024-01-05',
      iteration: 1,
      reason: 'Reality layer breach detected',
      changes: [
        'Core layer access restricted',
        'Void puzzles encrypted',
        'Legendary NFT bonuses adjusted',
        'Community progress tracking enhanced'
      ],
      stability: 100,
      affected: 98
    }
  ];

  return (
    <div className="patch-history">
      <div className="history-header">
        <h2>📜 System Patch History</h2>
        <p>The eternal loop resets to maintain balance and prevent reality breach</p>
      </div>

      <div className="timeline">
        {patches.map((patch, idx) => (
          <div key={patch.id} className="patch-entry">
            <div className="timeline-marker">
              <div className="marker-dot"></div>
              {idx < patches.length - 1 && <div className="marker-line"></div>}
            </div>
            
            <Card className="patch-card">
              <div className="patch-header">
                <div className="patch-info">
                  <h3>System Patch {patch.version}</h3>
                  <div className="patch-meta">
                    <span className="patch-date">📅 {patch.date}</span>
                    <Badge variant="iteration">Loop #{patch.iteration}</Badge>
                  </div>
                </div>
                <div className="patch-stats">
                  <div className="stat">
                    <span className="stat-label">Stability</span>
                    <span className="stat-value">{patch.stability}%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Affected</span>
                    <span className="stat-value">{patch.affected}</span>
                  </div>
                </div>
              </div>
              
              <div className="patch-reason">
                <Badge variant="warning">⚠️ Trigger</Badge>
                <span>{patch.reason}</span>
              </div>
              
              <div className="patch-changes">
                <h4>Changes Applied:</h4>
                <ul>
                  {patch.changes.map((change, i) => (
                    <li key={i}>
                      <span className="change-icon">▸</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="patch-footer">
                <div className="patch-message">
                  <span className="message-icon">🌀</span>
                  <em>"The simulation adapts. The loop continues. Reality persists."</em>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="upcoming-patch">
        <Card className="upcoming-card">
          <div className="upcoming-header">
            <span className="upcoming-icon">⏰</span>
            <h3>Next Patch Incoming</h3>
          </div>
          <div className="upcoming-content">
            <p>System stability declining. Prepare for reality shift.</p>
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
              <span className="progress-label">75% to threshold</span>
            </div>
            <div className="warning-message">
              ⚠️ When players get too close to solving, the system will patch
            </div>
          </div>
        </Card>
      </div>

      <div className="meta-info">
        <Card className="meta-card">
          <h3>🔮 The Nature of The Loop</h3>
          <p>
            The Eternal Loop is a self-correcting system. Each time the community approaches 
            breakthrough, a system patch resets progress while preserving accumulated knowledge. 
            This ensures the game never truly ends, maintaining perpetual engagement and driving 
            secondary market activity.
          </p>
          <p className="meta-quote">
            "You cannot escape what was designed to be infinite."
          </p>
          <div className="meta-stats">
            <div className="meta-stat">
              <span className="meta-number">∞</span>
              <span className="meta-label">Theoretical Iterations</span>
            </div>
            <div className="meta-stat">
              <span className="meta-number">{patches.length}</span>
              <span className="meta-label">Patches Applied</span>
            </div>
            <div className="meta-stat">
              <span className="meta-number">0</span>
              <span className="meta-label">Complete Solutions</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatchHistory;
