/**
 * WIRED CHAOS - Suite Landing Page
 * Dedicated landing page for suite features with stub-first implementation
 * 
 * Features:
 * - Feature flag controlled (ENABLE_SUITE_LANDING: stub/partial/full)
 * - WIRED CHAOS neon-cyberpunk design system
 * - Responsive mobile-first design
 * - Accessibility-first implementation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../../config/featureFlags';
import { getSuiteUrl } from '../../utils/env';
import styles from './SuiteLanding.module.css';

const SuiteLanding = () => {
  const navigate = useNavigate();
  const suiteUrl = getSuiteUrl();
  const featureMode = FEATURES.enableSuiteLanding || 'stub';
  const [hoveredCard, setHoveredCard] = useState(null);

  // Suite features configuration based on mode
  const features = [
    {
      id: 'dashboard',
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time metrics and insights',
      status: featureMode === 'full' ? 'active' : 'coming-soon'
    },
    {
      id: 'admin',
      icon: '⚙️',
      title: 'Admin Controls',
      description: 'System management and configuration',
      status: featureMode === 'full' ? 'active' : 'coming-soon'
    },
    {
      id: 'tools',
      icon: '🔧',
      title: 'Power Tools',
      description: 'Advanced utilities and automation',
      status: featureMode === 'full' || featureMode === 'partial' ? 'active' : 'coming-soon'
    },
    {
      id: 'reports',
      icon: '📈',
      title: 'Reports & Analytics',
      description: 'Comprehensive reporting suite',
      status: featureMode === 'full' ? 'active' : 'coming-soon'
    },
    {
      id: 'integrations',
      icon: '🔗',
      title: 'Integrations',
      description: 'Connect external services',
      status: 'coming-soon'
    },
    {
      id: 'api',
      icon: '🌐',
      title: 'API Access',
      description: 'Developer tools and API keys',
      status: featureMode === 'full' || featureMode === 'partial' ? 'active' : 'coming-soon'
    }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.status === 'active' && suiteUrl) {
      window.open(`${suiteUrl}/${feature.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLaunchSuite = () => {
    if (suiteUrl) {
      window.open(suiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
          aria-label="Back to Hub"
        >
          ← Back
        </button>
        
        <h1 className={styles.title}>
          <span className={styles.titleMain}>WIRED CHAOS</span>
          <span className={styles.titleSub}>Suite</span>
        </h1>
        
        <p className={styles.subtitle}>
          Complete toolkit and dashboard for digital chaos management
        </p>

        {/* Mode Badge */}
        <div className={styles.modeBadge} aria-label={`Feature mode: ${featureMode}`}>
          <span className={styles.badgeIcon}>🔧</span>
          <span className={styles.badgeText}>Mode: {featureMode.toUpperCase()}</span>
        </div>
      </header>

      {/* Features Grid */}
      <main className={styles.main}>
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`${styles.featureCard} ${feature.status === 'active' ? styles.active : styles.comingSoon}`}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleFeatureClick(feature)}
              role="button"
              tabIndex={0}
              aria-label={`${feature.title}: ${feature.description}. Status: ${feature.status === 'active' ? 'Active' : 'Coming Soon'}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFeatureClick(feature);
                }
              }}
            >
              <div className={styles.cardIcon}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
              
              <div className={styles.cardStatus}>
                {feature.status === 'active' ? (
                  <span className={styles.statusActive}>● Active</span>
                ) : (
                  <span className={styles.statusComingSoon}>● Coming Soon</span>
                )}
              </div>

              {hoveredCard === feature.id && feature.status === 'active' && (
                <div className={styles.cardHoverEffect}>
                  <span>Launch →</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Launch Button */}
        {suiteUrl && (
          <div className={styles.launchSection}>
            <button
              onClick={handleLaunchSuite}
              className={styles.launchButton}
              aria-label="Launch full Suite interface"
            >
              <span className={styles.launchIcon}>🚀</span>
              <span className={styles.launchText}>Launch Suite</span>
            </button>
          </div>
        )}

        {/* Info Section */}
        {!suiteUrl && (
          <div className={styles.infoSection} role="alert">
            <div className={styles.infoIcon}>🔒</div>
            <p className={styles.infoTitle}>Suite URL Not Configured</p>
            <p className={styles.infoText}>
              Set REACT_APP_SUITE_URL environment variable to enable full suite access.
            </p>
          </div>
        )}

        {/* Stub Mode Notice */}
        {featureMode === 'stub' && (
          <div className={styles.stubNotice}>
            <p className={styles.stubText}>
              <strong>🔧 Stub Mode Active:</strong> This is a preview interface. 
              Set REACT_APP_ENABLE_SUITE_LANDING=partial or full for more features.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          WIRED CHAOS Suite v1.0.0 | {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default SuiteLanding;
