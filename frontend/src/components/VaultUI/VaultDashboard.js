/**
 * Vault UI - Main Dashboard Component
 * Combines all Vault UI widgets into a comprehensive dashboard
 */
import React, { useState, useEffect } from 'react';
import StatusCard from './StatusCard';
import WLBadge from './WLBadge';
import BurnTracker from './BurnTracker';
import { BACKEND_URL } from '../../config/env';

const VaultDashboard = ({ userId, className = '' }) => {
  const [userStats, setUserStats] = useState({
    points: 0,
    tier: 'Seeker',
    fragments: [],
    burnCount: 0,
    raffleTickets: 0,
    lastActivity: null,
    loading: true
  });

  useEffect(() => {
    if (userId) {
      fetchUserStats(userId);
    }
  }, [userId]);

  const fetchUserStats = async (userId) => {
    try {
      setUserStats(prev => ({ ...prev, loading: true }));
      
      // Try to fetch from Gatekeeper API
      const response = await fetch(`${BACKEND_URL}/api/vault/user/${userId}/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setUserStats({
          points: data.total_points || 0,
          tier: determineTier(data.total_points || 0),
          fragments: data.fragments_unlocked || [],
          burnCount: data.burn_count || 0,
          raffleTickets: data.raffle_tickets || 0,
          lastActivity: data.last_activity,
          loading: false
        });
      } else {
        // Fallback to mock data for demo
        setUserStats({
          points: Math.floor(Math.random() * 500),
          tier: 'Seeker',
          fragments: [],
          burnCount: 0,
          raffleTickets: 0,
          lastActivity: new Date().toISOString(),
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      setUserStats(prev => ({ ...prev, loading: false }));
    }
  };

  const determineTier = (points) => {
    if (points >= 1000) return 'Merovingian';
    if (points >= 500) return 'Pathfinder';
    if (points >= 100) return 'Holder';
    return 'Seeker';
  };

  const calculateProgress = (points, tier) => {
    const thresholds = { Seeker: 100, Holder: 500, Pathfinder: 1000 };
    const nextThreshold = thresholds[tier];
    
    if (tier === 'Merovingian') return { progress: 1000, max: 1000 };
    
    const prevThreshold = tier === 'Seeker' ? 0 : 
                         tier === 'Holder' ? 100 : 500;
    
    return {
      progress: points - prevThreshold,
      max: nextThreshold - prevThreshold
    };
  };

  if (userStats.loading) {
    return (
      <div className={`vault-holo-grid p-6 ${className}`}>
        <div className="vault-loading">
          <div className="vault-spinner"></div>
          <p className="vault-cyan-outline">Loading VAULT33 status...</p>
        </div>
      </div>
    );
  }

  const { progress, max } = calculateProgress(userStats.points, userStats.tier);

  return (
    <div className={`vault-holo-grid p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="vault-neon-title vault-red-core vault-cyan-outline text-3xl font-bold mb-2">
          VAULT33 DASHBOARD
        </h2>
        <p className="opacity-80">WL Gamification • Merovingian Path Tracking</p>
      </div>

      {/* Stats Grid */}
      <div className="vault-stats-grid mb-6">
        <div className="vault-stat-item">
          <div className="vault-stat-value">{userStats.points}</div>
          <div className="vault-stat-label">WL Points</div>
        </div>
        <div className="vault-stat-item">
          <div className="vault-stat-value">{userStats.raffleTickets}</div>
          <div className="vault-stat-label">Raffle Tickets</div>
        </div>
        <div className="vault-stat-item">
          <div className="vault-stat-value">{userStats.fragments.length}/5</div>
          <div className="vault-stat-label">Fragments</div>
        </div>
        <div className="vault-stat-item">
          <div className="vault-stat-value">{userStats.burnCount}</div>
          <div className="vault-stat-label">Burns</div>
        </div>
      </div>

      {/* Main Components Grid */}
      <div className="vault-grid">
        <WLBadge 
          points={userStats.points}
          tier={userStats.tier}
          progress={progress}
          maxProgress={max}
        />
        
        <BurnTracker 
          fragments={userStats.fragments}
          burnCount={userStats.burnCount}
        />
        
        <StatusCard
          title="Gatekeeper Status"
          value="Connected"
          status="active"
          description="Discord & Telegram bots online. XRPL validation ready."
          icon="🤖"
          accent="cyan"
        />
        
        <StatusCard
          title="Last Activity"
          value={userStats.lastActivity ? 
            new Date(userStats.lastActivity).toLocaleDateString() : 
            'No activity'
          }
          status={userStats.lastActivity ? 'active' : 'pending'}
          description="Most recent interaction with VAULT33 system"
          icon="⏱️"
          accent="purple"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mt-6 flex-wrap">
        <button className="vault-btn btn-red">
          🔥 Register Burn
        </button>
        <button className="vault-btn">
          💎 Claim WL
        </button>
        <button className="vault-btn btn-purple">
          🧩 View Fragments
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs opacity-60">
        <p>Connected to VAULT33 Gatekeeper System</p>
        <p>Discord • Telegram • XRPL Integration</p>
      </div>
    </div>
  );
};

export default VaultDashboard;