import React, { useState, useEffect, useRef } from 'react';
import './VRGWidget.css';

const VRGWidget = ({ userId = 'demo_user', isMinimized = false }) => {
  const [userStats, setUserStats] = useState(null);
  const [isVisible, setIsVisible] = useState(!isMinimized);
  const [notifications, setNotifications] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [pulseEffect, setPulseEffect] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    loadUserStats();
    const interval = setInterval(loadUserStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadUserStats = async () => {
    try {
      const response = await fetch(`/api/hrm/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    setPulseEffect(true);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
    
    // Reset pulse effect
    setTimeout(() => setPulseEffect(false), 500);
  };

  const quickAwardXP = async (eventType, points) => {
    try {
      const response = await fetch('/api/hrm/xp/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          event_type: eventType
        })
      });
      
      if (response.ok) {
        showNotification(`+${points} XP earned!`, 'xp');
        await loadUserStats();
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
      showNotification('Failed to award XP', 'error');
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

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Gold': return '👑';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '⭐';
    }
  };

  if (!userStats) {
    return (
      <div className="vrg-widget loading">
        <div className="widget-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`vrg-widget ${isVisible ? 'visible' : 'minimized'} ${pulseEffect ? 'pulse' : ''}`}>
      {/* Minimize/Maximize Button */}
      <button 
        className="toggle-button"
        onClick={() => setIsVisible(!isVisible)}
        title={isVisible ? 'Minimize VRG Widget' : 'Show VRG Widget'}
      >
        {isVisible ? '−' : '+'}
      </button>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications" ref={notificationRef}>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification ${notification.type}`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {isVisible && (
        <div className="widget-content">
          {/* Header */}
          <div className="widget-header">
            <h3>🌐 VRG Status</h3>
            <div className="status-indicator online"></div>
          </div>

          {/* User Info */}
          <div className="user-info">
            <div className="user-avatar">
              <span className="tier-icon">{getTierIcon(userStats.stats.current_tier)}</span>
            </div>
            <div className="user-details">
              <div className="username">{userStats.user.username}</div>
              <div 
                className="user-tier"
                style={{ color: getTierColor(userStats.stats.current_tier) }}
              >
                {userStats.stats.current_tier} Tier
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">{userStats.stats.total_xp}</span>
              <span className="stat-label">XP</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📈</span>
              <span className="stat-value">{userStats.stats.current_level}</span>
              <span className="stat-label">LVL</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-value">{userStats.stats.total_sessions}</span>
              <span className="stat-label">Sessions</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              className="quick-action-btn brain"
              onClick={() => quickAwardXP('brain_assistant_chat', 5)}
              title="Chat with AI Brain Assistant (+5 XP)"
            >
              🧠
            </button>
            <button 
              className="quick-action-btn social"
              onClick={() => quickAwardXP('social_share', 25)}
              title="Share on Social Media (+25 XP)"
            >
              📱
            </button>
            <button 
              className="quick-action-btn help"
              onClick={() => quickAwardXP('community_help', 30)}
              title="Help Community (+30 XP)"
            >
              🤝
            </button>
            <button 
              className="quick-action-btn bug"
              onClick={() => quickAwardXP('bug_report', 40)}
              title="Report Bug (+40 XP)"
            >
              🐛
            </button>
          </div>

          {/* Progress to Next Tier */}
          {userStats.stats.next_tier_xp && (
            <div className="tier-progress">
              <div className="progress-label">
                {userStats.stats.next_tier_xp} XP to next tier
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(100, (userStats.stats.total_xp / (userStats.stats.total_xp + userStats.stats.next_tier_xp)) * 100)}%`,
                    backgroundColor: getTierColor(userStats.stats.current_tier === 'Bronze' ? 'Silver' : 'Gold')
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Recent Achievement */}
          {userStats.recent_activity.length > 0 && (
            <div className="recent-achievement">
              <div className="achievement-icon">🎉</div>
              <div className="achievement-text">
                <div className="achievement-title">Latest Activity</div>
                <div className="achievement-desc">
                  {userStats.recent_activity[0].description}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="widget-footer">
            <button 
              className="dashboard-link"
              onClick={() => window.location.href = '#hrm-dashboard'}
            >
              Open Full Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VRGWidget;