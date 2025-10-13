/**
 * VRG33589 "The Eternal Loop" - Main Game Interface
 * Integrated XRPL game with 589 LLM swarm coordination
 */
import React, { useState, useEffect } from 'react';
import './EternalLoop.css';

const EternalLoop = () => {
  const [gameState, setGameState] = useState(null);
  const [wallet, setWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [solution, setSolution] = useState('');
  const [feedback, setFeedback] = useState('');

  const initializeGame = async () => {
    if (!wallet) {
      setFeedback('Please enter your XRPL wallet address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/vrg33589/game/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet })
      });

      const data = await response.json();
      if (data.success) {
        setGameState(data.state);
        setFeedback('Game initialized! Welcome to The Eternal Loop.');
      } else {
        setFeedback('Failed to initialize game');
      }
    } catch (error) {
      setFeedback(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameState = async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/vrg33589/game/state/${wallet}`);
      const data = await response.json();
      
      if (data.success) {
        setGameState(data.state);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSolution = async () => {
    if (!currentPuzzle || !solution) {
      setFeedback('Please enter a solution');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/vrg33589/game/puzzle/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          puzzle_id: currentPuzzle.puzzle_id,
          solution: solution
        })
      });

      const data = await response.json();
      if (data.success) {
        setFeedback('Solution submitted! Swarm verification in progress...');
        setSolution('');
        setTimeout(loadGameState, 2000);
      }
    } catch (error) {
      setFeedback(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const claimCredits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vrg33589/game/credits/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet })
      });

      const data = await response.json();
      if (data.success) {
        setFeedback(`Claimed ${data.credits_claimed} credits!`);
        loadGameState();
      }
    } catch (error) {
      setFeedback(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="eternal-loop-container">
      <div className="game-header">
        <h1 className="glitch-text">VRG33589</h1>
        <h2 className="subtitle">THE ETERNAL LOOP</h2>
        <p className="tagline">XRP Ledger × 589 LLM Swarm × Reality Simulation</p>
      </div>

      {!gameState ? (
        <div className="wallet-connect">
          <div className="connect-card">
            <h3>Initialize Game State</h3>
            <p>Connect your XRPL wallet to enter The Eternal Loop</p>
            <input
              type="text"
              placeholder="XRPL Wallet Address (r...)"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="wallet-input"
            />
            <button 
              onClick={initializeGame} 
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Initializing...' : 'Enter The Loop'}
            </button>
            {feedback && <p className="feedback">{feedback}</p>}
          </div>
        </div>
      ) : (
        <div className="game-interface">
          <div className="game-stats">
            <div className="stat-card">
              <span className="stat-label">Reality Layer</span>
              <span className="stat-value layer-badge">{gameState.reality_layer}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Loop Iteration</span>
              <span className="stat-value">{gameState.loop_iteration}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Credits</span>
              <span className="stat-value credit-balance">{gameState.credit_balance.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">NFTs</span>
              <span className="stat-value">{gameState.vrg33589_nfts.length}</span>
            </div>
          </div>

          <div className="game-content">
            <div className="left-panel">
              <div className="section-card">
                <h3>Current Puzzle</h3>
                {currentPuzzle ? (
                  <div className="puzzle-display">
                    <h4>{currentPuzzle.title}</h4>
                    <p className="puzzle-description">{currentPuzzle.description}</p>
                    <div className="puzzle-clue">
                      <span className="clue-label">Clue:</span>
                      <p className="clue-text">{currentPuzzle.clue}</p>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your solution..."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="solution-input"
                    />
                    <button 
                      onClick={submitSolution}
                      disabled={isLoading}
                      className="btn-submit"
                    >
                      Submit Solution
                    </button>
                  </div>
                ) : (
                  <p className="no-puzzle">No active puzzle. Generate one from the swarm.</p>
                )}
              </div>

              <div className="section-card">
                <h3>Puzzle Progress</h3>
                <div className="progress-list">
                  {gameState.puzzle_progress.length > 0 ? (
                    gameState.puzzle_progress.slice(-5).reverse().map((p, i) => (
                      <div key={i} className="progress-item">
                        <span className="puzzle-id">{p.puzzle_id}</span>
                        <span className={`status ${p.verified ? 'verified' : 'pending'}`}>
                          {p.verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-state">No puzzles attempted yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="right-panel">
              <div className="section-card">
                <h3>VRG33589 NFTs</h3>
                <div className="nft-list">
                  {gameState.vrg33589_nfts.length > 0 ? (
                    gameState.vrg33589_nfts.map((nft, i) => (
                      <div key={i} className="nft-card">
                        <div className="nft-rarity">{nft.rarity}</div>
                        <div className="nft-credits">{nft.daily_credits} credits/day</div>
                        <div className="nft-id">{nft.nft_id.substring(0, 12)}...</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-nft">
                      <p>No VRG33589 NFTs registered</p>
                      <button className="btn-secondary">Mint on XRPL</button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={claimCredits}
                  disabled={isLoading}
                  className="btn-claim"
                >
                  Claim Daily Credits
                </button>
              </div>

              <div className="section-card">
                <h3>589 Swarm Status</h3>
                <div className="swarm-indicators">
                  <div className="swarm-item active">
                    <span className="swarm-icon">🧩</span>
                    <span className="swarm-name">Puzzle Swarm</span>
                    <span className="swarm-status">Active</span>
                  </div>
                  <div className="swarm-item standby">
                    <span className="swarm-icon">🛡️</span>
                    <span className="swarm-name">Guardian Swarm</span>
                    <span className="swarm-status">Monitoring</span>
                  </div>
                  <div className="swarm-item standby">
                    <span className="swarm-icon">🌀</span>
                    <span className="swarm-name">Reality Patch</span>
                    <span className="swarm-status">Standby</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {feedback && (
            <div className="feedback-banner">
              {feedback}
            </div>
          )}
        </div>
      )}

      <div className="game-footer">
        <p className="footer-text">
          Powered by XRPL × 589 LLM Swarm × WIRED CHAOS
        </p>
      </div>
    </div>
  );
};

export default EternalLoop;
