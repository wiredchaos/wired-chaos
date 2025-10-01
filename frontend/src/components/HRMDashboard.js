import React, { useState, useEffect } from 'react';
import './HRMDashboard.css';

const HRMDashboard = ({ userId = 'demo_user' }) => {
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [vrgRules, setVrgRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    loadHRMData();
  }, [userId]);

  const loadHRMData = async () => {
    try {
      // Load user stats
      const statsResponse = await fetch(`/api/hrm/users/${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData.data);
      } else {
        // Create demo user if not found
        await createDemoUser();
      }

      // Load leaderboard
      const leaderResponse = await fetch('/api/hrm/leaderboard');
      if (leaderResponse.ok) {
        const leaderData = await leaderResponse.json();
        setLeaderboard(leaderData.leaderboard);
      }

      // Load VRG rules
      const rulesResponse = await fetch('/api/vrg/rules');
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setVrgRules(rulesData.rules);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading HRM data:', error);
      setLoading(false);
    }
  };

  const createDemoUser = async () => {
    try {
      const response = await fetch('/api/hrm/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          username: 'WiredChaosUser',
          email: 'user@wiredchaos.com'
        })
      });
      
      if (response.ok) {
        // Award initial XP for joining
        await awardXP('daily_login');
        await loadHRMData();
      }
    } catch (error) {
      console.error('Error creating demo user:', error);
    }
  };

  const awardXP = async (eventType, customPoints = null) => {
    try {
      const response = await fetch('/api/hrm/xp/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          event_type: eventType,
          custom_points: customPoints
        })
      });
      
      if (response.ok) {
        await loadHRMData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const startVRGSession = async (gatewayType) => {
    try {
      const response = await fetch('/api/vrg/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          gateway_type: gatewayType
        })
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        setActiveSession(sessionData.session);
        await loadHRMData(); // Refresh for login XP
      }
    } catch (error) {
      console.error('Error starting VRG session:', error);
    }
  };

  const endVRGSession = async (achievements = []) => {
    if (!activeSession) return;
    
    try {
      const response = await fetch('/api/vrg/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          achievements
        })
      });
      
      if (response.ok) {
        setActiveSession(null);
        await loadHRMData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error ending VRG session:', error);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold': return '#FFD700';
      case 'Silver': return '#C0C0C0';
      case 'Bronze': return '#CD7F32';
      default: return '#39FF14';
    }
  };

  if (loading) {
    return (
      <div className="hrm-dashboard loading">
        <div className="neon-spinner"></div>
        <p>Loading HRM Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="hrm-dashboard">
      {/* Header */}
      <div className="hrm-header">
        <h2 className="neon-title">🤖 HRM + VRG Dashboard</h2>
        <p className="subtitle">Human Resource Management + Virtual Reality Gateway</p>
      </div>

      {/* User Stats Card */}
      {userStats && (
        <div className="user-stats-card">
          <div className="stats-header">
            <h3>{userStats.user.username}</h3>
            <div 
              className="tier-badge" 
              style={{ color: getTierColor(userStats.stats.current_tier) }}
            >
              {userStats.stats.current_tier} Tier
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">XP</span>
              <span className="stat-value neon-text">{userStats.stats.total_xp}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Level</span>
              <span className="stat-value neon-text">{userStats.stats.current_level}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sessions</span>
              <span className="stat-value neon-text">{userStats.stats.total_sessions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Days</span>
              <span className="stat-value neon-text">{userStats.stats.days_active}</span>
            </div>
          </div>

          {/* XP Progress Bar */}
          {userStats.stats.next_tier_xp && (
            <div className="xp-progress">
              <div className="progress-label">
                Progress to {userStats.stats.current_tier === 'Bronze' ? 'Silver' : 'Gold'} Tier
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(100, (userStats.stats.total_xp / (userStats.stats.total_xp + userStats.stats.next_tier_xp)) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="progress-text">
                {userStats.stats.next_tier_xp} XP needed
              </div>
            </div>
          )}

          {/* Tier Benefits */}
          <div className="tier-benefits">
            <h4>Your Benefits:</h4>
            <ul>
              {userStats.stats.tier_benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* VRG Session Control */}
      <div className="vrg-session-card">
        <h3>🌐 VRG Gateway Sessions</h3>
        
        {activeSession ? (
          <div className="active-session">
            <div className="session-info">
              <span className="session-type">{activeSession.gateway_type}</span>
              <span className="session-time">
                Started: {new Date(activeSession.start_time).toLocaleTimeString()}
              </span>
            </div>
            <button 
              className="neon-button end-session"
              onClick={() => endVRGSession(['completed_tour'])}
            >
              End Session
            </button>
          </div>
        ) : (
          <div className="gateway-buttons">
            <button 
              className="gateway-btn ai-brain"
              onClick={() => startVRGSession('ai_brain')}
            >
              🧠 AI Brain Assistant
            </button>
            <button 
              className="gateway-btn web3"
              onClick={() => startVRGSession('web3')}
            >
              🔗 Web3 Certificates
            </button>
            <button 
              className="gateway-btn vault"
              onClick={() => startVRGSession('vault')}
            >
              🏛️ Vault33 System
            </button>
            <button 
              className="gateway-btn motherboard"
              onClick={() => startVRGSession('motherboard')}
            >
              🔌 Motherboard Tour
            </button>
          </div>
        )}
      </div>

      {/* Quick XP Actions */}
      <div className="xp-actions-card">
        <h3>⚡ Quick XP Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn brain-chat"
            onClick={() => awardXP('brain_assistant_chat')}
          >
            Chat with AI (+5 XP)
          </button>
          <button 
            className="action-btn social-share"
            onClick={() => awardXP('social_share')}
          >
            Share Content (+25 XP)
          </button>
          <button 
            className="action-btn community-help"
            onClick={() => awardXP('community_help')}
          >
            Help Community (+30 XP)
          </button>
          <button 
            className="action-btn bug-report"
            onClick={() => awardXP('bug_report')}
          >
            Report Bug (+40 XP)
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="leaderboard-card">
          <h3>🏆 Top Users</h3>
          <div className="leaderboard-list">
            {leaderboard.map((user, index) => (
              <div key={index} className="leaderboard-item">
                <span className="rank">#{user.rank}</span>
                <span className="username">{user.username}</span>
                <span className="user-xp">{user.xp} XP</span>
                <span 
                  className="user-tier"
                  style={{ color: getTierColor(user.tier) }}
                >
                  {user.tier}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {userStats && userStats.recent_activity.length > 0 && (
        <div className="activity-card">
          <h3>📊 Recent Activity</h3>
          <div className="activity-list">
            {userStats.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-type">{activity.event_type}</span>
                <span className="activity-points">+{activity.points} XP</span>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VRG Rules Info */}
      {vrgRules && (
        <div className="rules-card">
          <h3>📋 VRG Rules & XP Events</h3>
          <div className="rules-grid">
            {Object.entries(vrgRules.xp_events).map(([event, points]) => (
              <div key={event} className="rule-item">
                <span className="event-name">{event.replace(/_/g, ' ')}</span>
                <span className="event-points">+{points} XP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRMDashboard;