/**
 * WIRED CHAOS - Progress Dashboard Component
 * Student achievement tracking and NFT certificate display
 */

import React, { useState } from 'react';
import './ProgressDashboard.css';

const ProgressDashboard = ({ studentId }) => {
  // Mock dashboard data
  const [dashboardData] = useState({
    student: {
      id: studentId || 'student-123',
      name: 'Cyber Student',
      tier: 'business',
      enrolledAt: '2024-01-15T00:00:00Z',
      wallet: '0x1234...5678'
    },
    progress: {
      coursesCompleted: 5,
      coursesInProgress: 2,
      totalNFTs: 8,
      currentStreak: 15,
      totalStudyTime: 1200 // minutes
    },
    currentCourses: [
      {
        courseId: 'df-301',
        title: 'Advanced DeFi Trading',
        progress: 65,
        lastAccessed: '2025-01-07T14:30:00Z'
      },
      {
        courseId: 'bt-301',
        title: 'Smart Contract Development',
        progress: 40,
        lastAccessed: '2025-01-06T10:15:00Z'
      }
    ],
    recentNFTs: [
      {
        nft: 'WIRED-CC-BC102',
        name: 'Crypto Security 101',
        type: 'certificate',
        issuedAt: '2025-01-05T00:00:00Z',
        txHash: '0xabcd...1234',
        blockchain: 'ethereum'
      },
      {
        nft: 'WIRED-ACH-FIRST',
        name: 'First Steps Achievement',
        type: 'achievement',
        issuedAt: '2025-01-03T00:00:00Z',
        txHash: '0xefgh...5678',
        blockchain: 'solana'
      },
      {
        nft: 'WIRED-CC-BC101',
        name: 'Blockchain Basics',
        type: 'certificate',
        issuedAt: '2025-01-01T00:00:00Z',
        txHash: '0xijkl...9012',
        blockchain: 'xrpl'
      }
    ],
    achievements: [
      {
        id: 'first-course',
        name: 'First Steps',
        description: 'Complete your first course',
        earned: true,
        earnedAt: '2025-01-03T00:00:00Z'
      },
      {
        id: 'streak-master',
        name: 'Consistency King',
        description: 'Study for 30 days straight',
        earned: false,
        progress: 15,
        target: 30
      }
    ],
    stats: {
      rank: 42,
      totalStudents: 1500
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getNFTIcon = (type) => {
    switch (type) {
      case 'certificate':
        return '🎓';
      case 'achievement':
        return '🏆';
      case 'badge':
        return '🏅';
      default:
        return '✨';
    }
  };

  const getBlockchainColor = (blockchain) => {
    const colors = {
      ethereum: '#627EEA',
      solana: '#14F195',
      xrpl: '#23292F',
      hedera: '#000000',
      dogecoin: '#C2A633'
    };
    return colors[blockchain] || '#00FFFF';
  };

  return (
    <div className="progress-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="student-info">
          <h1 className="dashboard-title">📊 My Progress</h1>
          <div className="student-details">
            <span className="student-name">{dashboardData.student.name}</span>
            <span className={`tier-badge ${dashboardData.student.tier}`}>
              {dashboardData.student.tier === 'community' ? 'Community' : 'Business School'}
            </span>
          </div>
          <div className="wallet-address">{dashboardData.student.wallet}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{dashboardData.progress.coursesCompleted}</div>
          <div className="stat-label">Courses Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{dashboardData.progress.coursesInProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{dashboardData.progress.totalNFTs}</div>
          <div className="stat-label">NFTs Earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{dashboardData.progress.currentStreak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{formatTime(dashboardData.progress.totalStudyTime)}</div>
          <div className="stat-label">Study Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">#{dashboardData.stats.rank}</div>
          <div className="stat-label">Global Rank</div>
        </div>
      </div>

      {/* Current Courses */}
      <div className="dashboard-section">
        <h2 className="section-title">Current Courses</h2>
        <div className="courses-grid">
          {dashboardData.currentCourses.map((course, index) => (
            <div key={index} className="course-card">
              <div className="course-header">
                <h3 className="course-name">{course.title}</h3>
                <span className="course-id">{course.courseId}</span>
              </div>
              <div className="course-progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <div className="course-footer">
                <span className="progress-percent">{course.progress}% Complete</span>
                <span className="last-accessed">
                  Last: {formatDate(course.lastAccessed)}
                </span>
              </div>
              <button className="continue-button">Continue Learning →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent NFTs */}
      <div className="dashboard-section">
        <h2 className="section-title">Recent NFT Certificates</h2>
        <div className="nfts-grid">
          {dashboardData.recentNFTs.map((nft, index) => (
            <div key={index} className="nft-card">
              <div className="nft-icon">{getNFTIcon(nft.type)}</div>
              <div className="nft-info">
                <h4 className="nft-name">{nft.name}</h4>
                <div className="nft-id">{nft.nft}</div>
                <div className="nft-details">
                  <span
                    className="blockchain-badge"
                    style={{ background: getBlockchainColor(nft.blockchain) }}
                  >
                    {nft.blockchain}
                  </span>
                  <span className="nft-date">{formatDate(nft.issuedAt)}</span>
                </div>
                <div className="nft-hash">
                  TX: {nft.txHash.slice(0, 10)}...{nft.txHash.slice(-4)}
                </div>
              </div>
              <button className="view-nft-button">View on Explorer</button>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="dashboard-section">
        <h2 className="section-title">Achievements</h2>
        <div className="achievements-grid">
          {dashboardData.achievements.map((achievement, index) => (
            <div
              key={index}
              className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.earned ? '🏆' : '🔒'}
              </div>
              <div className="achievement-info">
                <h4 className="achievement-name">{achievement.name}</h4>
                <p className="achievement-desc">{achievement.description}</p>
                {!achievement.earned && achievement.progress && (
                  <div className="achievement-progress">
                    <div className="progress-bar-small">
                      <div
                        className="progress-fill-small"
                        style={{
                          width: `${(achievement.progress / achievement.target) * 100}%`
                        }}
                      />
                    </div>
                    <span className="progress-text-small">
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                )}
                {achievement.earned && (
                  <div className="earned-date">
                    Earned: {formatDate(achievement.earnedAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="dashboard-cta">
        <h3 className="cta-title">Keep Learning!</h3>
        <p className="cta-text">
          {dashboardData.student.tier === 'community'
            ? 'Ready for advanced courses? Upgrade to Business School'
            : 'Explore more advanced courses and earn exclusive NFTs'}
        </p>
        <div className="cta-buttons">
          <button className="cta-button primary">Browse Courses</button>
          {dashboardData.student.tier === 'community' && (
            <button className="cta-button secondary">Upgrade to Business School</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
