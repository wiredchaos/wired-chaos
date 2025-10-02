/**
 * XRPL Wallet Connection Component
 * Simplified wallet connection for VRG33589 game
 */
import React, { useState } from 'react';
import './XRPLWalletConnect.css';

const XRPLWalletConnect = ({ onConnect, onDisconnect, connected }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!walletAddress || !walletAddress.startsWith('r')) {
      alert('Please enter a valid XRPL wallet address (starts with "r")');
      return;
    }

    setIsConnecting(true);
    try {
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onConnect) {
        onConnect(walletAddress);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (connected) {
    return (
      <div className="xrpl-wallet-connected">
        <div className="wallet-badge">
          <span className="wallet-icon">🔐</span>
          <span className="wallet-address">{walletAddress.substring(0, 8)}...{walletAddress.slice(-6)}</span>
          <button onClick={handleDisconnect} className="btn-disconnect">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="xrpl-wallet-connect">
      <div className="wallet-prompt">
        <h3>Connect XRPL Wallet</h3>
        <p>Enter your XRP Ledger wallet address to participate</p>
        <input
          type="text"
          placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="wallet-input"
        />
        <button
          onClick={handleConnect}
          disabled={isConnecting || !walletAddress}
          className="btn-connect"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        <div className="wallet-info">
          <p className="info-text">
            💡 Don't have an XRPL wallet? Create one at{' '}
            <a href="https://xrpl.org/wallets.html" target="_blank" rel="noopener noreferrer">
              xrpl.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default XRPLWalletConnect;
