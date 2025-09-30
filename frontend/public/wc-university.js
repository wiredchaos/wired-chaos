/**
 * WIRED CHAOS UNIVERSITY - Web Component
 * Complete educational platform with XP tracking, badges, and Proof of School credentials
 */

(function() {
  'use strict';

  // Level thresholds
  const LEVELS = [
    { level: 1, min: 0, max: 299, name: 'Beginner' },
    { level: 2, min: 300, max: 799, name: 'Intermediate' },
    { level: 3, min: 800, max: 1499, name: 'Advanced' },
    { level: 4, min: 1500, max: 2499, name: 'Expert' },
    { level: 5, min: 2500, max: Infinity, name: 'Master' }
  ];

  // XP rewards
  const XP_REWARDS = {
    MODULE: 50,
    TRACK: 100,
    ARTIFACT: 25,
    REVIEW: 15,
    CONTRIBUTION: 10
  };

  class WCUniversity extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.state = {
        userId: 'guest',
        wallet: null,
        xp: 0,
        level: 1,
        tracks: {},
        badges: [],
        enrolled: false
      };
    }

    connectedCallback() {
      this.userId = this.getAttribute('user-id') || 'guest';
      this.wallet = this.getAttribute('wallet') || null;
      
      // Load saved state
      this.loadState();
      
      // Parse curriculum data
      const curriculumJson = this.getAttribute('curriculum');
      if (curriculumJson) {
        try {
          this.curriculum = JSON.parse(curriculumJson);
        } catch (e) {
          console.error('Failed to parse curriculum JSON', e);
          this.curriculum = this.getDefaultCurriculum();
        }
      } else {
        this.curriculum = this.getDefaultCurriculum();
      }
      
      this.render();
      this.attachEventListeners();
      
      // Listen for external credential events
      this.addEventListener('wc-university:credential:pose', this.handlePoseCredential.bind(this));
      this.addEventListener('wc-university:credential:posm', this.handlePosmCredential.bind(this));
    }

    loadState() {
      const storageKey = `wc.uni.${this.userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.state = { ...this.state, ...data };
        } catch (e) {
          console.error('Failed to load state', e);
        }
      }
    }

    saveState() {
      const storageKey = `wc.uni.${this.userId}`;
      localStorage.setItem(storageKey, JSON.stringify(this.state));
      
      // Emit progress event
      this.dispatchEvent(new CustomEvent('wc-university:progress', {
        detail: { state: this.state },
        bubbles: true,
        composed: true
      }));
    }

    calculateLevel(xp) {
      for (const levelData of LEVELS) {
        if (xp >= levelData.min && xp <= levelData.max) {
          return levelData;
        }
      }
      return LEVELS[LEVELS.length - 1];
    }

    awardXP(amount, reason = 'activity') {
      const oldXP = this.state.xp;
      const oldLevel = this.state.level;
      
      this.state.xp += amount;
      const newLevelData = this.calculateLevel(this.state.xp);
      this.state.level = newLevelData.level;
      
      this.saveState();
      
      // Emit XP event
      this.dispatchEvent(new CustomEvent('wc-university:xp', {
        detail: { amount, total: this.state.xp, reason },
        bubbles: true,
        composed: true
      }));
      
      // Check for level up
      if (newLevelData.level > oldLevel) {
        this.showNotification(`🎉 Level Up! You're now ${newLevelData.name} (Level ${newLevelData.level})`);
      }
      
      this.updateXPDisplay();
    }

    completeModule(trackId, moduleId) {
      if (!this.state.tracks[trackId]) {
        this.state.tracks[trackId] = { completed: [], progress: 0 };
      }
      
      const track = this.state.tracks[trackId];
      if (!track.completed.includes(moduleId)) {
        track.completed.push(moduleId);
        this.awardXP(XP_REWARDS.MODULE, `Completed module ${moduleId}`);
        
        // Check if track is complete
        const trackData = this.curriculum.find(t => t.id === trackId);
        if (trackData && track.completed.length === trackData.modules.length) {
          this.awardXP(XP_REWARDS.TRACK, `Completed track ${trackId}`);
          this.checkBadgeEligibility(trackId);
        }
        
        track.progress = (track.completed.length / trackData.modules.length) * 100;
        this.saveState();
        this.render();
      }
    }

    checkBadgeEligibility(trackId) {
      // White Belt: Complete Track A
      if (trackId === 'A' && !this.hasBadge('White Belt')) {
        this.awardBadge({
          name: 'White Belt',
          modules: this.state.tracks['A'].completed,
          artifacts: [],
          userId: this.userId,
          wallet: this.wallet,
          kind: 'XRPL'
        });
      }
      
      // Additional badge logic can be added here
    }

    hasBadge(name) {
      return this.state.badges.some(b => b.name === name);
    }

    awardBadge(badgeData) {
      this.state.badges.push({
        ...badgeData,
        timestamp: Date.now()
      });
      
      this.saveState();
      
      // Emit badge event
      this.dispatchEvent(new CustomEvent('wc-university:badge', {
        detail: badgeData,
        bubbles: true,
        composed: true
      }));
      
      this.showNotification(`🏆 Badge Earned: ${badgeData.name}!`);
      this.render();
    }

    async enrollStudent() {
      if (!this.wallet) {
        this.showNotification('⚠️ Please connect a wallet first', 'error');
        return;
      }
      
      // Emit enrollment ready event
      this.dispatchEvent(new CustomEvent('wc-university:enrollment:ready', {
        detail: {
          userId: this.userId,
          wallet: this.wallet,
          programId: 'WCU-2024',
          cohortId: 'COHORT-1'
        },
        bubbles: true,
        composed: true
      }));
      
      this.showNotification('📝 Enrollment initiated...');
    }

    async mintPoSM(badgeName) {
      if (!this.wallet) {
        this.showNotification('⚠️ Please connect a wallet first', 'error');
        return;
      }
      
      const badge = this.state.badges.find(b => b.name === badgeName);
      if (!badge) {
        this.showNotification('⚠️ Badge not found', 'error');
        return;
      }
      
      // This will be handled by the parent component/page
      this.dispatchEvent(new CustomEvent('wc-university:mint-posm', {
        detail: {
          userId: this.userId,
          wallet: this.wallet,
          badge: badgeName,
          modules: badge.modules,
          artifacts: badge.artifacts || []
        },
        bubbles: true,
        composed: true
      }));
      
      this.showNotification('🎨 Minting Proof of School Mastery NFT...');
    }

    handlePoseCredential(event) {
      const { tx_hash, credential_url } = event.detail;
      this.state.enrolled = true;
      this.state.enrollment_tx = tx_hash;
      this.saveState();
      this.showNotification(`✅ Enrolled! TX: ${tx_hash.substring(0, 12)}...`);
      this.render();
    }

    handlePosmCredential(event) {
      const { bundle, tx_hash, credential_url } = event.detail;
      this.showNotification(`✅ PoS-M Minted! TX: ${tx_hash.substring(0, 12)}...`);
    }

    showNotification(message, type = 'info') {
      const notification = this.shadowRoot.querySelector('.notification');
      if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }
    }

    updateXPDisplay() {
      const xpFill = this.shadowRoot.querySelector('.xp-fill');
      const xpText = this.shadowRoot.querySelector('.xp-text');
      const levelText = this.shadowRoot.querySelector('.level-text');
      
      const levelData = this.calculateLevel(this.state.xp);
      const progress = ((this.state.xp - levelData.min) / (levelData.max - levelData.min)) * 100;
      
      if (xpFill) xpFill.style.width = `${Math.min(progress, 100)}%`;
      if (xpText) xpText.textContent = `${this.state.xp} XP`;
      if (levelText) levelText.textContent = `Level ${levelData.level}: ${levelData.name}`;
    }

    attachEventListeners() {
      // Module checkboxes
      this.shadowRoot.querySelectorAll('.module-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const trackId = e.target.dataset.track;
          const moduleId = e.target.dataset.module;
          if (e.target.checked) {
            this.completeModule(trackId, moduleId);
          }
        });
      });
      
      // Enroll button
      const enrollBtn = this.shadowRoot.querySelector('.enroll-btn');
      if (enrollBtn) {
        enrollBtn.addEventListener('click', () => this.enrollStudent());
      }
      
      // Mint buttons
      this.shadowRoot.querySelectorAll('.mint-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const badgeName = e.target.dataset.badge;
          this.mintPoSM(badgeName);
        });
      });
    }

    getDefaultCurriculum() {
      return [
        {
          id: 'A',
          name: 'Foundation',
          modules: [
            { id: 'A1', name: 'Introduction to Blockchain' },
            { id: 'A2', name: 'Cryptography Basics' },
            { id: 'A3', name: 'Decentralization Principles' }
          ]
        },
        {
          id: 'B',
          name: 'XRPL Development',
          modules: [
            { id: 'B1', name: 'XRPL Architecture' },
            { id: 'B2', name: 'Account Management' },
            { id: 'B3', name: 'Payment Channels' },
            { id: 'B4', name: 'Hooks & Smart Contracts' }
          ]
        },
        {
          id: 'C',
          name: 'Token Economics',
          modules: [
            { id: 'C1', name: 'Fungible Tokens (XRP, ERC-20)' },
            { id: 'C2', name: 'Non-Fungible Tokens (NFTs)' },
            { id: 'C3', name: 'DeFi Protocols' },
            { id: 'C4', name: 'Tokenomics Design' }
          ]
        },
        {
          id: 'D',
          name: 'Web3 Development',
          modules: [
            { id: 'D1', name: 'dApp Architecture' },
            { id: 'D2', name: 'Wallet Integration' },
            { id: 'D3', name: 'Smart Contract Development' },
            { id: 'D4', name: 'Frontend Integration' }
          ]
        },
        {
          id: 'E',
          name: 'Security & Best Practices',
          modules: [
            { id: 'E1', name: 'Cryptographic Security' },
            { id: 'E2', name: 'Smart Contract Auditing' },
            { id: 'E3', name: 'Operational Security' },
            { id: 'E4', name: 'Incident Response' }
          ]
        },
        {
          id: 'F',
          name: 'Community & Governance',
          modules: [
            { id: 'F1', name: 'DAO Structures' },
            { id: 'F2', name: 'Governance Mechanisms' },
            { id: 'F3', name: 'Community Building' },
            { id: 'F4', name: 'Decentralized Identity' }
          ]
        },
        {
          id: 'G',
          name: 'Advanced Topics',
          modules: [
            { id: 'G1', name: 'Layer 2 Scaling' },
            { id: 'G2', name: 'Cross-Chain Interoperability' },
            { id: 'G3', name: 'Zero-Knowledge Proofs' },
            { id: 'G4', name: 'MEV & Advanced Trading' }
          ]
        },
        {
          id: 'H',
          name: 'Real-World Applications',
          modules: [
            { id: 'H1', name: 'Supply Chain' },
            { id: 'H2', name: 'Digital Identity' },
            { id: 'H3', name: 'Healthcare & Records' },
            { id: 'H4', name: 'Gaming & Metaverse' }
          ]
        },
        {
          id: 'I',
          name: 'Capstone Projects',
          modules: [
            { id: 'I1', name: 'Project Planning' },
            { id: 'I2', name: 'Implementation' },
            { id: 'I3', name: 'Testing & Deployment' },
            { id: 'I4', name: 'Presentation & Defense' }
          ]
        }
      ];
    }

    render() {
      const levelData = this.calculateLevel(this.state.xp);
      const progress = ((this.state.xp - levelData.min) / (levelData.max - levelData.min)) * 100;
      
      this.shadowRoot.innerHTML = `
        <style>
          ${this.getStyles()}
        </style>
        <div class="wcu-container">
          <div class="notification"></div>
          
          <header class="wcu-header">
            <h1>🎓 WIRED CHAOS UNIVERSITY</h1>
            <p class="tagline">Educational Seal Chips • Proof of School on XRPL</p>
          </header>
          
          <section class="stats-panel">
            <div class="stat-card">
              <div class="stat-label">Level</div>
              <div class="stat-value level-text">Level ${levelData.level}: ${levelData.name}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">XP Progress</div>
              <div class="xp-bar">
                <div class="xp-fill" style="width: ${Math.min(progress, 100)}%"></div>
                <span class="xp-text">${this.state.xp} XP</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Badges Earned</div>
              <div class="stat-value">${this.state.badges.length}</div>
            </div>
          </section>
          
          <section class="proof-panel">
            <h2>🏅 Proof of School</h2>
            <div class="proof-actions">
              <button class="enroll-btn" ${!this.wallet ? 'disabled' : ''} ${this.state.enrolled ? 'disabled' : ''}>
                ${this.state.enrolled ? '✓ Enrolled' : '📝 Issue PoS-E SBT'}
              </button>
              ${this.state.badges.map(badge => `
                <button class="mint-btn" data-badge="${badge.name}" ${!this.wallet ? 'disabled' : ''}>
                  🎨 Mint PoS-M: ${badge.name}
                </button>
              `).join('')}
            </div>
            ${!this.wallet ? '<p class="warning">⚠️ Connect wallet to issue credentials</p>' : ''}
          </section>
          
          <section class="curriculum">
            <h2>📚 Curriculum - Tracks A–I</h2>
            ${this.curriculum.map(track => this.renderTrack(track)).join('')}
          </section>
          
          ${this.state.badges.length > 0 ? `
            <section class="badges-panel">
              <h2>🏆 Your Badges</h2>
              <div class="badges-grid">
                ${this.state.badges.map(badge => `
                  <div class="badge-card">
                    <div class="badge-icon">🏆</div>
                    <div class="badge-name">${badge.name}</div>
                    <div class="badge-date">${new Date(badge.timestamp).toLocaleDateString()}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
        </div>
      `;
      
      this.attachEventListeners();
    }

    renderTrack(track) {
      const trackState = this.state.tracks[track.id] || { completed: [], progress: 0 };
      
      return `
        <details class="track" ${trackState.progress > 0 ? 'open' : ''}>
          <summary class="track-header">
            <span class="track-title">Track ${track.id}: ${track.name}</span>
            <span class="track-progress">${Math.round(trackState.progress)}%</span>
          </summary>
          <div class="modules">
            ${track.modules.map(module => `
              <label class="module-item">
                <input 
                  type="checkbox" 
                  class="module-checkbox"
                  data-track="${track.id}"
                  data-module="${module.id}"
                  ${trackState.completed.includes(module.id) ? 'checked' : ''}
                  ${trackState.completed.includes(module.id) ? 'disabled' : ''}
                />
                <span class="module-name">${module.name}</span>
                <span class="module-xp">+${XP_REWARDS.MODULE} XP</span>
              </label>
            `).join('')}
          </div>
        </details>
      `;
    }

    getStyles() {
      return `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .wcu-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #000000;
          color: #d9fffb;
          padding: 2rem;
          min-height: 100vh;
        }
        
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #00FFFF;
          color: #000000;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          opacity: 0;
          transform: translateY(-20px);
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
        }
        
        .notification.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .notification.error {
          background: #FF3131;
          color: #ffffff;
        }
        
        .wcu-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid #00FFFF;
          padding-bottom: 1rem;
        }
        
        .wcu-header h1 {
          font-size: 2.5rem;
          color: #00FFFF;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .tagline {
          color: #39FF14;
          font-size: 1.1rem;
        }
        
        .stats-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: linear-gradient(135deg, #001a1a 0%, #003333 100%);
          border: 2px solid #00FFFF;
          border-radius: 12px;
          padding: 1.5rem;
          transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 255, 255, 0.3);
        }
        
        .stat-label {
          color: #39FF14;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .stat-value {
          color: #00FFFF;
          font-size: 1.8rem;
          font-weight: 700;
        }
        
        .xp-bar {
          position: relative;
          background: #001a1a;
          height: 40px;
          border-radius: 20px;
          border: 2px solid #00FFFF;
          overflow: hidden;
        }
        
        .xp-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #39FF14 0%, #00FFFF 100%);
          transition: width 0.5s ease;
        }
        
        .xp-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          color: #000000;
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
          z-index: 1;
        }
        
        .proof-panel {
          background: linear-gradient(135deg, #1a0033 0%, #330066 100%);
          border: 2px solid #FF00FF;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .proof-panel h2 {
          color: #FF00FF;
          margin-bottom: 1rem;
        }
        
        .proof-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        button {
          background: linear-gradient(135deg, #00FFFF 0%, #39FF14 100%);
          color: #000000;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1rem;
        }
        
        button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 255, 255, 0.5);
        }
        
        button:focus {
          outline: 3px solid #FF00FF;
          outline-offset: 2px;
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .mint-btn {
          background: linear-gradient(135deg, #FF00FF 0%, #FF3131 100%);
          color: #ffffff;
        }
        
        .warning {
          color: #FF3131;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
        
        .curriculum {
          margin-bottom: 2rem;
        }
        
        .curriculum h2 {
          color: #00FFFF;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        
        .track {
          background: #001a1a;
          border: 2px solid #00FFFF;
          border-radius: 8px;
          margin-bottom: 1rem;
          overflow: hidden;
        }
        
        .track-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          cursor: pointer;
          background: linear-gradient(135deg, #001a1a 0%, #003333 100%);
          transition: background 0.2s ease;
          list-style: none;
        }
        
        .track-header::-webkit-details-marker {
          display: none;
        }
        
        .track-header:hover {
          background: #003333;
        }
        
        .track-title {
          color: #00FFFF;
          font-weight: 700;
          font-size: 1.2rem;
        }
        
        .track-progress {
          color: #39FF14;
          font-weight: 700;
        }
        
        .modules {
          padding: 1rem;
          background: #000000;
        }
        
        .module-item {
          display: flex;
          align-items: center;
          padding: 0.8rem;
          margin-bottom: 0.5rem;
          background: #001a1a;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .module-item:hover {
          background: #002626;
          transform: translateX(4px);
        }
        
        .module-checkbox {
          margin-right: 1rem;
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #39FF14;
        }
        
        .module-name {
          flex: 1;
          color: #d9fffb;
        }
        
        .module-xp {
          color: #39FF14;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .badges-panel {
          margin-top: 2rem;
        }
        
        .badges-panel h2 {
          color: #00FFFF;
          margin-bottom: 1rem;
        }
        
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .badge-card {
          background: linear-gradient(135deg, #1a0033 0%, #330066 100%);
          border: 2px solid #FF00FF;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.2s ease;
        }
        
        .badge-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 20px rgba(255, 0, 255, 0.3);
        }
        
        .badge-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        
        .badge-name {
          color: #FF00FF;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        .badge-date {
          color: #39FF14;
          font-size: 0.9rem;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .wcu-container {
            padding: 1rem;
          }
          
          .wcu-header h1 {
            font-size: 1.8rem;
          }
          
          .stats-panel {
            grid-template-columns: 1fr;
          }
          
          .proof-actions {
            flex-direction: column;
          }
          
          button {
            width: 100%;
          }
        }
      `;
    }
  }

  // Register the custom element
  if (!customElements.get('wc-university')) {
    customElements.define('wc-university', WCUniversity);
  }
})();
