import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import './CommunityHub.css';

const CommunityHub = ({ walletAddress }) => {
  const [leaderboard] = useState([
    { rank: 1, address: '0x1a2b...3c4d', score: 1250, layer: 3, solved: 42 },
    { rank: 2, address: '0x5e6f...7g8h', score: 980, layer: 2, solved: 35 },
    { rank: 3, address: '0x9i0j...1k2l', score: 875, layer: 2, solved: 31 },
    { rank: 4, address: '0x3m4n...5o6p', score: 720, layer: 1, solved: 28 },
    { rank: 5, address: '0x7q8r...9s0t', score: 650, layer: 1, solved: 24 }
  ]);

  const [recentSolutions] = useState([
    { address: '0x1a2b...3c4d', puzzle: 'The Beginning', layer: 0, time: '2 min ago' },
    { address: '0x5e6f...7g8h', puzzle: 'Reality Check', layer: 1, time: '15 min ago' },
    { address: '0x9i0j...1k2l', puzzle: 'Hidden Message', layer: 0, time: '1 hour ago' }
  ]);

  const [communityProgress] = useState({
    totalSolvers: 147,
    totalPuzzlesSolved: 892,
    currentLoop: 1,
    nextPatchAt: 75 // percentage
  });

  return (
    <div className="community-hub">
      <div className="community-header">
        <h2>🌐 Community Hub</h2>
        <p>Collaborate with other VRG33589 holders to solve the eternal loop</p>
      </div>

      <div className="community-grid">
        {/* Global Progress */}
        <Card className="community-card progress-card">
          <div className="card-title">
            <span className="icon">📊</span>
            <h3>Global Progress</h3>
          </div>
          
          <div className="progress-stats">
            <div className="stat-box">
              <div className="stat-number">{communityProgress.totalSolvers}</div>
              <div className="stat-label">Active Solvers</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{communityProgress.totalPuzzlesSolved}</div>
              <div className="stat-label">Puzzles Solved</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">#{communityProgress.currentLoop}</div>
              <div className="stat-label">Current Loop</div>
            </div>
          </div>

          <div className="patch-progress">
            <div className="patch-header">
              <span>Next System Patch</span>
              <span>{communityProgress.nextPatchAt}%</span>
            </div>
            <div className="patch-bar">
              <div 
                className="patch-fill" 
                style={{width: `${communityProgress.nextPatchAt}%`}}
              ></div>
            </div>
            <div className="patch-warning">
              ⚠️ System stability critical. Patch imminent.
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="community-card leaderboard-card">
          <div className="card-title">
            <span className="icon">🏆</span>
            <h3>Top Solvers</h3>
          </div>
          
          <div className="leaderboard">
            {leaderboard.map(entry => (
              <div 
                key={entry.rank} 
                className={`leaderboard-entry ${entry.address === walletAddress ? 'current-user' : ''}`}
              >
                <div className="rank">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                  {entry.rank > 3 && `#${entry.rank}`}
                </div>
                <div className="entry-info">
                  <div className="address">{entry.address}</div>
                  <div className="entry-stats">
                    <span>{entry.solved} solved</span>
                    <span>Layer {entry.layer + 1}</span>
                  </div>
                </div>
                <div className="score">{entry.score} pts</div>
              </div>
            ))}
          </div>
          
          {walletAddress && (
            <div className="your-rank">
              <span>Your Rank: #12</span>
              <Badge variant="info">Rising</Badge>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="community-card activity-card">
          <div className="card-title">
            <span className="icon">⚡</span>
            <h3>Recent Solutions</h3>
          </div>
          
          <div className="activity-feed">
            {recentSolutions.map((activity, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon">✓</div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-address">{activity.address}</span>
                    <Badge variant="layer">Layer {activity.layer + 1}</Badge>
                  </div>
                  <div className="activity-puzzle">{activity.puzzle}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Collaborative Puzzles */}
        <Card className="community-card collab-card">
          <div className="card-title">
            <span className="icon">👥</span>
            <h3>Collaborative Puzzles</h3>
          </div>
          
          <div className="collab-info">
            <p>Some puzzles require multiple VRG33589 holders to solve together.</p>
            <div className="collab-status">
              <div className="collab-puzzle">
                <h4>🔒 The Void Gate</h4>
                <div className="collab-progress">
                  <span>3 / 5 solvers needed</span>
                  <div className="collab-bar">
                    <div className="collab-fill" style={{width: '60%'}}></div>
                  </div>
                </div>
                <Badge variant="legendary">Legendary Only</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHub;
