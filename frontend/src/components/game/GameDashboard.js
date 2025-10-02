import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import './GameDashboard.css';

const GameDashboard = ({ walletAddress, credits, onClaimCredits }) => {
  const [gameProgress, setGameProgress] = useState({
    realityLayer: 0,
    loopIteration: 0,
    solvedCount: 0,
    totalScore: 0
  });
  
  const [nftInfo, setNFTInfo] = useState({
    count: 0,
    hasLegendary: false
  });

  const realityLayers = ['Surface', 'Deep', 'Core', 'Void'];
  
  useEffect(() => {
    // Load game progress from backend
    if (walletAddress) {
      loadGameProgress();
      loadNFTInfo();
    }
  }, [walletAddress]);

  const loadGameProgress = async () => {
    // Placeholder - would fetch from smart contract or backend
    setGameProgress({
      realityLayer: 0,
      loopIteration: 1,
      solvedCount: 0,
      totalScore: 0
    });
  };

  const loadNFTInfo = async () => {
    // Placeholder - would fetch from NFT contract
    setNFTInfo({
      count: 0,
      hasLegendary: false
    });
  };

  return (
    <div className="game-dashboard">
      <div className="dashboard-grid">
        {/* Credit Balance */}
        <Card className="dashboard-card credit-card">
          <div className="card-header">
            <h3>💎 Prompt Credits</h3>
            {nftInfo.hasLegendary && (
              <Badge variant="legendary">∞ Legendary Stream</Badge>
            )}
          </div>
          <div className="credit-display">
            <div className="credit-amount">{credits}</div>
            <div className="credit-label">Available Credits</div>
          </div>
          <Button 
            onClick={onClaimCredits}
            className="claim-btn"
            disabled={!walletAddress}
          >
            Claim Daily Credits
          </Button>
          <div className="credit-info">
            <div className="info-row">
              <span>NFT Count:</span>
              <span>{nftInfo.count}</span>
            </div>
            <div className="info-row">
              <span>Daily Rate:</span>
              <span>{nftInfo.count || 1} credits/day</span>
            </div>
          </div>
        </Card>

        {/* Reality Layer Progress */}
        <Card className="dashboard-card layer-card">
          <div className="card-header">
            <h3>🌀 Reality Layer</h3>
            <Badge variant="layer">{realityLayers[gameProgress.realityLayer]}</Badge>
          </div>
          <div className="layer-progress">
            <div className="layer-indicator">
              {realityLayers.map((layer, idx) => (
                <div 
                  key={layer}
                  className={`layer-node ${idx <= gameProgress.realityLayer ? 'active' : ''} ${idx === gameProgress.realityLayer ? 'current' : ''}`}
                >
                  <div className="layer-dot"></div>
                  <div className="layer-name">{layer}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="layer-info">
            <div className="info-row">
              <span>Loop Iteration:</span>
              <span>#{gameProgress.loopIteration}</span>
            </div>
            <div className="info-row">
              <span>System Stability:</span>
              <span className="stability-bar">
                <div className="stability-fill" style={{width: '75%'}}></div>
              </span>
            </div>
          </div>
        </Card>

        {/* Player Stats */}
        <Card className="dashboard-card stats-card">
          <div className="card-header">
            <h3>📊 Statistics</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{gameProgress.solvedCount}</div>
              <div className="stat-label">Puzzles Solved</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameProgress.totalScore}</div>
              <div className="stat-label">Total Score</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{gameProgress.realityLayer + 1}/4</div>
              <div className="stat-label">Layer Progress</div>
            </div>
          </div>
        </Card>

        {/* Wallet Status */}
        <Card className="dashboard-card wallet-card">
          <div className="card-header">
            <h3>👛 Wallet Status</h3>
          </div>
          {walletAddress ? (
            <div className="wallet-info">
              <div className="wallet-address">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
              <Badge variant="connected">Connected</Badge>
              <div className="nft-holdings">
                <div className="nft-label">VRG33589 Holdings:</div>
                <div className="nft-count">{nftInfo.count} NFTs</div>
              </div>
            </div>
          ) : (
            <div className="wallet-disconnected">
              <p>Connect wallet to access full features</p>
              <Button className="connect-wallet-btn">Connect Wallet</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default GameDashboard;
