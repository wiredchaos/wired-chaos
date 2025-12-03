import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import GameDashboard from './GameDashboard';
import PuzzleInterface from './PuzzleInterface';
import CommunityHub from './CommunityHub';
import PatchHistory from './PatchHistory';
import './Game.css';

const Game = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(null);
  const [credits, setCredits] = useState(5); // Demo credits
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [gameState, setGameState] = useState({
    currentLayer: 0,
    loopIteration: 1,
    systemStability: 100
  });

  useEffect(() => {
    // Check for connected wallet
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    // Placeholder - would check MetaMask or other wallet
    const demoAddress = localStorage.getItem('demo_wallet');
    if (demoAddress) {
      setWalletAddress(demoAddress);
    }
  };

  const handleClaimCredits = async () => {
    // Simulate claiming credits
    setCredits(prev => prev + 1);
    alert('Credits claimed! +1 credit added to your balance.');
  };

  const handleSolvePuzzle = (puzzleId) => {
    // Deduct credit and update progress
    setCredits(prev => Math.max(0, prev - 1));
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      systemStability: Math.max(10, prev.systemStability - 5)
    }));
  };

  const connectWallet = () => {
    // Demo wallet connection
    const demoAddress = '0x' + Math.random().toString(16).substring(2, 42);
    localStorage.setItem('demo_wallet', demoAddress);
    setWalletAddress(demoAddress);
    setCredits(5);
  };

  return (
    <div className="game-page">
      {/* Header */}
      <div className="game-header">
        <div className="header-content">
          <div className="header-left">
            <Button onClick={() => navigate('/')} variant="ghost" className="back-button">
              ← Back to Hub
            </Button>
            <h1 className="game-title">
              <span className="title-icon">🌀</span>
              VRG33589: The Eternal Loop
            </h1>
          </div>
          
          <div className="header-right">
            {walletAddress ? (
              <div className="wallet-status connected">
                <span className="status-dot"></span>
                <span className="wallet-label">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <span className="credits-badge">{credits} 💎</span>
              </div>
            ) : (
              <Button onClick={connectWallet} className="connect-wallet">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
        
        {/* System Status Bar */}
        <div className="system-status">
          <div className="status-item">
            <span className="status-label">Loop:</span>
            <span className="status-value">#{gameState.loopIteration}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Layer:</span>
            <span className="status-value">{['Surface', 'Deep', 'Core', 'Void'][gameState.currentLayer]}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Stability:</span>
            <div className="stability-meter">
              <div 
                className="stability-fill" 
                style={{width: `${gameState.systemStability}%`}}
              ></div>
            </div>
            <span className="status-value">{gameState.systemStability}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="game-content">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="game-tabs">
          <TabsList className="tabs-list">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="puzzles">Puzzles</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="history">Patch History</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="tab-content">
            <GameDashboard 
              walletAddress={walletAddress}
              credits={credits}
              onClaimCredits={handleClaimCredits}
            />
          </TabsContent>

          <TabsContent value="puzzles" className="tab-content">
            <PuzzleInterface 
              walletAddress={walletAddress}
              currentLayer={gameState.currentLayer}
              credits={credits}
              onSolve={handleSolvePuzzle}
            />
          </TabsContent>

          <TabsContent value="community" className="tab-content">
            <CommunityHub 
              walletAddress={walletAddress}
            />
          </TabsContent>

          <TabsContent value="history" className="tab-content">
            <PatchHistory />
          </TabsContent>
        </Tabs>
      </div>

      {/* Glitch Effect Overlay */}
      {gameState.systemStability < 30 && (
        <div className="glitch-overlay">
          <div className="glitch-text">SYSTEM UNSTABLE</div>
        </div>
      )}
    </div>
  );
};

export default Game;
