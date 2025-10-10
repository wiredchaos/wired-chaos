/**
 * WIRED CHAOS - Academy Hub
 * Main education hub with two-tiered access
 */

import React, { useState } from 'react';
import './Academy.css';

const Academy = () => {
  const [selectedTier, setSelectedTier] = useState(null);

  const stats = {
    community: {
      students: '1,200+',
      courses: '12',
      certificates: '800+',
      completion_rate: '85%'
    },
    business: {
      students: '300+',
      departments: '4',
      faculty: '15+',
      partnerships: '20+'
    }
  };

  const communityFeatures = [
    {
      icon: '📚',
      title: 'Blockchain Fundamentals',
      description: 'Master wallet setup, transactions, and security basics'
    },
    {
      icon: '🎮',
      title: 'Platform Mastery',
      description: 'Navigate tools, engage with community, integrate providers'
    },
    {
      icon: '🏆',
      title: 'NFT Certificates',
      description: 'Earn blockchain-verified certificates and achievement badges'
    },
    {
      icon: '👥',
      title: 'Peer Learning',
      description: 'Forums, study groups, and collaborative projects'
    }
  ];

  const businessFeatures = [
    {
      icon: '💼',
      title: 'DeFi Finance Department',
      description: 'Advanced trading, yield optimization, and risk management'
    },
    {
      icon: '⚙️',
      title: 'Blockchain Technology',
      description: 'Smart contracts, security auditing, protocol design'
    },
    {
      icon: '🚀',
      title: 'Business Development',
      description: 'Partnerships, tokenomics, go-to-market strategies'
    },
    {
      icon: '📊',
      title: 'Analytics & Data Science',
      description: 'On-chain analysis, MEV, market microstructure'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'DeFi Developer',
      tier: 'business',
      quote: 'Business School transformed my career. Now working at a top DeFi protocol.',
      avatar: '👨‍💻'
    },
    {
      name: 'Sarah Martinez',
      role: 'Blockchain Analyst',
      tier: 'community',
      quote: 'Started with Community College, got my first crypto job within 3 months!',
      avatar: '👩‍💼'
    }
  ];

  return (
    <div className="academy">
      {/* Hero Section */}
      <section className="academy-hero">
        <h1 className="hero-title">🎓 WIRED CHAOS Academy</h1>
        <p className="hero-subtitle">
          Two-Tiered Blockchain Education • NFT Certificates • Industry Partnerships
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">1,500+</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">16+</div>
            <div className="stat-label">Courses</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">1,000+</div>
            <div className="stat-label">NFTs Issued</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">20+</div>
            <div className="stat-label">Partners</div>
          </div>
        </div>
      </section>

      {/* Tier Selection */}
      <section className="tier-selection">
        <h2 className="section-title">Choose Your Path</h2>
        <div className="tier-grid">
          {/* Community College Card */}
          <div className="tier-card community">
            <div className="tier-badge">FREE ACCESS</div>
            <h3 className="tier-name">Community College</h3>
            <p className="tier-description">
              Foundation courses for blockchain beginners and platform users
            </p>
            
            <div className="tier-stats">
              <div className="tier-stat">
                <span className="stat-icon">👥</span>
                <span>{stats.community.students} Students</span>
              </div>
              <div className="tier-stat">
                <span className="stat-icon">📚</span>
                <span>{stats.community.courses} Courses</span>
              </div>
              <div className="tier-stat">
                <span className="stat-icon">🏆</span>
                <span>{stats.community.certificates} Certificates</span>
              </div>
            </div>

            <div className="features-list">
              {communityFeatures.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-content">
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-desc">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="tier-button community-btn"
              onClick={() => setSelectedTier('community')}
            >
              Start Learning Free
            </button>
          </div>

          {/* Business School Card */}
          <div className="tier-card business">
            <div className="tier-badge premium">PREMIUM</div>
            <h3 className="tier-name">Business School</h3>
            <p className="tier-description">
              Advanced DeFi strategies, enterprise solutions, and industry mentorship
            </p>
            
            <div className="tier-stats">
              <div className="tier-stat">
                <span className="stat-icon">🎓</span>
                <span>{stats.business.students} Elite Students</span>
              </div>
              <div className="tier-stat">
                <span className="stat-icon">🏛️</span>
                <span>{stats.business.departments} Departments</span>
              </div>
              <div className="tier-stat">
                <span className="stat-icon">👨‍🏫</span>
                <span>{stats.business.faculty} Faculty</span>
              </div>
            </div>

            <div className="features-list">
              {businessFeatures.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-content">
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-desc">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="tier-button business-btn"
              onClick={() => setSelectedTier('business')}
            >
              Upgrade to Business School
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2 className="section-title">Student Success Stories</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-avatar">{testimonial.avatar}</div>
              <div className="testimonial-content">
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                  <div className={`author-tier ${testimonial.tier}`}>
                    {testimonial.tier === 'business' ? 'Business School' : 'Community College'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Start Your Web3 Journey?</h2>
        <p className="cta-text">
          Join 1,500+ students learning blockchain technology and DeFi strategies
        </p>
        <div className="cta-buttons">
          <button className="cta-button primary">Start Free Course</button>
          <button className="cta-button secondary">Explore Curriculum</button>
        </div>
      </section>
    </div>
  );
};

export default Academy;
