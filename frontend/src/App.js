import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// WIRED CHAOS Bot Brain Component
const BotBrain = ({ onRoute, onClose }) => {
  const [step, setStep] = useState('greeting');
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { id: 'web3', label: 'Web3 Onboarding', route: '/neurolab', icon: '🧠' },
    { id: 'gamification', label: 'WL Gamification', route: '/vault33', icon: '🔐' },
    { id: 'content', label: 'NEURO Content', route: '/neurolab', icon: '📚' },
    { id: 'b2b', label: 'B2B/Enterprise', route: '/b2b', icon: '💼' },
    { id: 'broadcasts', label: 'Live Broadcasts', route: '/csn', icon: '📡' }
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option.label);
    setTimeout(() => {
      onRoute(option.route);
      onClose();
    }, 1000);
  };

  if (step === 'greeting') {
    return (
      <div className="bot-brain-overlay">
        <div className="bot-brain-modal">
          <div className="bot-header">
            <h3>🧠 WIRED CHAOS ROUTING AGENT</h3>
            <button onClick={onClose} className="bot-close">×</button>
          </div>
          <div className="bot-content">
            <p>Welcome to the WIRED CHAOS digital ecosystem.</p>
            <p>What brings you here today?</p>
            <div className="bot-options">
              {options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className="bot-option"
                >
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
          {selectedOption && (
            <div className="bot-routing">
              <p>Routing you to {selectedOption}...</p>
              <div className="routing-animation"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
};

// Main Motherboard Hub Component
const MotherboardHub = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showBot, setShowBot] = useState(false);

  const agents = [
    {
      id: 'csn',
      name: 'CRYPTO SPACES NET',
      icon: '📡',
      title: 'CSN',
      description: '24/7 Stream • 33.3FM',
      position: { top: '10%', left: '20%' },
      route: '/csn'
    },
    {
      id: 'neurolab',
      name: 'NEURO LAB',
      icon: '🧠',
      title: 'NEURO LAB',
      description: 'Content Hub • Chirp',
      position: { top: '10%', right: '20%' },
      route: '/neurolab'
    },
    {
      id: 'bwb',
      name: 'BARBED WIRED BROADCAST',
      icon: '📰',
      title: 'BWB',
      description: 'Newsletter • RSS',
      position: { top: '35%', left: '10%' },
      route: '/bwb'
    },
    {
      id: 'vault33',
      name: 'VAULT 33',
      icon: '🔐',
      title: 'VAULT 33',
      description: 'WL Gamification',
      position: { top: '35%', right: '10%' },
      route: '/vault33'
    },
    {
      id: 'b2b',
      name: 'B2B / PROFESSIONAL',
      icon: '💼',
      title: 'B2B',
      description: 'Enterprise Intake',
      position: { bottom: '20%', left: '15%' },
      route: '/b2b'
    },
    {
      id: 'vrg33589',
      name: 'VRG-33-589',
      icon: '👁️',
      title: 'VRG-33-589',
      description: 'Tinfoil Bot • RSS→TTS',
      position: { bottom: '20%', right: '15%' },
      route: '/vrg33589'
    }
  ];

  const handleNodeClick = (route) => {
    navigate(route);
  };

  const handleBotRoute = (route) => {
    navigate(route);
  };

  useEffect(() => {
    // Show bot brain after 3 seconds for new visitors
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('visited')) {
        setShowBot(true);
        sessionStorage.setItem('visited', 'true');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="motherboard-container">
      {/* Animated Background Grid */}
      <div className="cyber-grid"></div>
      
      {/* Main Title */}
      <div className="main-title">
        <h1 className="wired-chaos-title">
          <span className="glitch" data-text="WIRED CHAOS">WIRED CHAOS</span>
          <span className="brain-icon">🧠</span>
        </h1>
        <p className="subtitle">DIGITAL ECOSYSTEM MOTHERBOARD</p>
      </div>

      {/* Bot Brain Button */}
      <div className="bot-brain-trigger">
        <Button onClick={() => setShowBot(true)} className="brain-btn">
          🧠 ROUTING AGENT
        </Button>
      </div>

      {/* Central CPU */}
      <div className="central-cpu">
        <div className="cpu-core">
          <div className="cpu-inner">
            <span className="cpu-text">WIRED</span>
            <span className="cpu-text">CHAOS</span>
            <div className="cpu-pulse"></div>
          </div>
        </div>
        {/* CPU Connection Lines */}
        <div className="cpu-connections">
          {agents.map((agent, index) => (
            <div 
              key={agent.id} 
              className={`connection-line line-${index + 1}`}
              style={{
                '--target-x': agent.position.left || agent.position.right,
                '--target-y': agent.position.top || agent.position.bottom
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Agent Nodes */}
      {agents.map((agent) => (
        <Card
          key={agent.id}
          className={`agent-node ${hoveredNode === agent.id ? 'hovered' : ''}`}
          style={agent.position}
          onMouseEnter={() => setHoveredNode(agent.id)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick(agent.route)}
        >
          <div className="node-content">
            <div className="node-icon">{agent.icon}</div>
            <div className="node-name">{agent.title}</div>
            <div className="node-description">{agent.description}</div>
            <div className="node-glow"></div>
          </div>
        </Card>
      ))}

      {/* Footer Info */}
      <div className="footer-info">
        <p>Select a node to enter the network</p>
      </div>

      {/* Bot Brain Modal */}
      {showBot && (
        <BotBrain 
          onRoute={handleBotRoute} 
          onClose={() => setShowBot(false)} 
        />
      )}
    </div>
  );
};

// CSN - Crypto Spaces Net Page
const CSNPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load Twitter widgets script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.charset = 'utf-8';
    document.head.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div className="agent-page csn-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📡 CRYPTO SPACES NET</h1>
        <p>Live Stream & Community Hub</p>
      </div>
      
      <div className="widget-grid">
        {/* 33.3FM Section with Spotify */}
        <Card className="widget-card fm-section">
          <h3>📻 33.3FM DOGECHAIN</h3>
          <div className="radio-display">
            <div className="frequency">33.3 FM</div>
            <div className="station">DOGECHAIN</div>
          </div>
          
          {/* Spotify Playlist in 33.3FM Section */}
          <div className="fm-playlist">
            <h4>🎵 WIRED CHAOS PLAYLIST</h4>
            <div className="iframe-container">
              <iframe
                src="https://open.spotify.com/embed/playlist/2VwOYrB1C93gNIPiBZNxhH?utm_source=generator"
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </Card>
        
        {/* YouTube Live Stream */}
        <Card className="widget-card youtube-widget">
          <h3>🔴 LIVE STREAM</h3>
          <div className="iframe-container">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/jfKfPfyJRdk"
              title="Crypto Spaces Network Live"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Card>
        
        {/* X.com Feed */}
        <Card className="widget-card x-feed-widget">
          <h3>🐦 @CRYPTOSPACESNET</h3>
          <div className="x-feed-container">
            <a 
              className="twitter-timeline" 
              data-theme="dark" 
              data-chrome="nofooter noborders transparent" 
              data-tweet-limit="5"
              href="https://twitter.com/cryptospacesnet"
            >
              Tweets by @cryptospacesnet
            </a>
          </div>
          <div className="x-fallback">
            <p>Latest updates from Crypto Spaces Network</p>
            <Button 
              onClick={() => window.open('https://x.com/cryptospacesnet?s=21', '_blank')}
              className="x-follow-btn"
            >
              Follow @cryptospacesnet →
            </Button>
          </div>
        </Card>
        
        {/* Contact Form Widget */}
        <Card className="widget-card contact-widget">
          <h3>📞 GET IN TOUCH</h3>
          <p>Want to be featured or collaborate?</p>
          <Button onClick={() => navigate('/b2b')} className="contact-cta">
            Professional Inquiries →
          </Button>
        </Card>
      </div>
    </div>
  );
};

// NEURO Lab Page
const NeuroLabPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page neuro-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🧠 NEURO LAB</h1>
        <p>Web3 Onboarding & Content Hub</p>
      </div>
      
      <div className="widget-grid">
        {/* Chirp Follow Widget */}
        <Card className="widget-card chirp-widget">
          <h3>🐦 FOLLOW ON CHIRP</h3>
          <p>Stay updated with latest NEURO content</p>
          <Button 
            onClick={() => window.open('https://chirp.me/neurometa', '_blank')}
            className="chirp-btn"
          >
            Follow @neurometa
          </Button>
        </Card>
        
        {/* Web3 Onboarding Widget */}
        <Card className="widget-card onboarding-widget">
          <h3>🌐 WEB3 ONBOARDING</h3>
          <p>Your guide to crypto, NFTs, and decentralized future</p>
          <div className="onboarding-links">
            <Button onClick={() => navigate('/industry/finance')} className="industry-link">
              Finance & DeFi →
            </Button>
            <Button onClick={() => navigate('/industry/gaming')} className="industry-link">
              Gaming & NFTs →
            </Button>
            <Button onClick={() => navigate('/industry/art')} className="industry-link">
              Digital Art →
            </Button>
          </div>
        </Card>
        
        {/* RSS Feed Widget */}
        <Card className="widget-card rss-widget">
          <h3>📡 CONTENT FEED</h3>
          <div className="feed-container">
            <div className="feed-item">
              <span className="feed-date">Latest</span>
              <span className="feed-title">Web3 Onboarding Guide 2025</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">Recent</span>
              <span className="feed-title">DeFi Strategies for Beginners</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">Archive</span>
              <span className="feed-title">NFT Market Analysis</span>
            </div>
          </div>
        </Card>

        {/* Backlink Network */}
        <Card className="widget-card network-widget">
          <h3>🔗 NETWORK</h3>
          <div className="backlink-grid">
            <a href="https://doginal-dogs.com" target="_blank" rel="noopener noreferrer" className="network-link">
              DoginalDogs.com
            </a>
            <a href="https://cryptospaces.net" target="_blank" rel="noopener noreferrer" className="network-link">
              CryptoSpaces.net
            </a>
            <a href="https://barkmeta.io" target="_blank" rel="noopener noreferrer" className="network-link">
              BarkMeta.io
            </a>
          </div>
        </Card>
      </div>

      {/* Lurky Integration CTA */}
      <div className="lurky-cta-section">
        <Card className="lurky-cta-card">
          <div className="lurky-brain-icon">🧠</div>
          <div className="lurky-content">
            <h3>Boost your reach with Lurky 🚀</h3>
            <p>Join through NEURO's link to track and grow your Web3 impact.</p>
            <Button 
              onClick={() => window.open('https://lurky.app/auth?referral-code=neurometax', '_blank')}
              className="lurky-cta-btn"
            >
              Join Lurky via NEURO →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// BWB - Barbed Wired Broadcast Page
const BWBPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Integration with Buttondown would go here
    alert('Newsletter signup functionality - integrate with Buttondown API');
  };
  
  return (
    <div className="agent-page bwb-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📰 BARBED WIRED BROADCAST</h1>
        <p>Newsletter & RSS Automation</p>
      </div>
      
      <div className="widget-grid">
        {/* Newsletter Signup */}
        <Card className="widget-card newsletter-widget">
          <h3>📬 SUBSCRIBE TO BWB</h3>
          <p>Get weekly updates on AI, crypto, and digital chaos</p>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <Button type="submit" className="subscribe-btn">
              Subscribe
            </Button>
          </form>
        </Card>
        
        {/* RSS Feed */}
        <Card className="widget-card rss-feed-widget">
          <h3>📡 LIVE FEED</h3>
          <div className="feed-container">
            <div className="feed-item">
              <span className="feed-date">Today</span>
              <span className="feed-title">Digital Chaos Weekly Roundup</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">Yesterday</span>
              <span className="feed-title">AI Pipeline Automation Update</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">2 days ago</span>
              <span className="feed-title">Crypto Market Analysis</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">3 days ago</span>
              <span className="feed-title">RSS to Social Media Pipeline</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Vault 33 WL Gamification System
const Vault33Page = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState([
    { id: 1, name: 'Pre-Vault Sigil', unlocked: false, xp: 100, description: 'The first key to the vault mysteries' },
    { id: 2, name: '82675 Ember', unlocked: false, xp: 150, description: 'Numeric sequence holds power' },
    { id: 3, name: 'Sangreal Lie', unlocked: false, xp: 200, description: 'Truth hidden in deception' },
    { id: 4, name: 'Shadow Ember', unlocked: false, xp: 175, description: 'Dark fire that illuminates' },
    { id: 5, name: 'Hidden Hour', unlocked: false, xp: 250, description: 'Time that does not exist' },
    { id: 6, name: 'Obsidian Mirror', unlocked: false, xp: 300, description: 'Reflects what should not be seen' },
    { id: 7, name: 'Iron Cage', unlocked: false, xp: 225, description: 'Prison that protects the imprisoned' },
    { id: 8, name: 'Bloodline Knot', unlocked: false, xp: 275, description: 'Ancestry tied in digital threads' },
    { id: 9, name: 'Barbed Crown', unlocked: false, xp: 350, description: 'Rule through beautiful suffering' }
  ]);
  
  const [totalXP, setTotalXP] = useState(0);
  const [merovingianUnlocked, setMerovingianUnlocked] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  const unlockArtifact = (artifactId) => {
    setArtifacts(prev => prev.map(artifact => {
      if (artifact.id === artifactId && !artifact.unlocked) {
        setTotalXP(prevXP => prevXP + artifact.xp);
        return { ...artifact, unlocked: true };
      }
      return artifact;
    }));

    // Check if all artifacts are unlocked for Merovingian Sigil
    const unlockedCount = artifacts.filter(a => a.unlocked).length + 1;
    if (unlockedCount === 9) {
      setMerovingianUnlocked(true);
    }
  };

  return (
    <div className="agent-page vault33-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🔐 VAULT 33</h1>
        <p>WL Gamification • 9 Artifacts • Secret Sigil</p>
      </div>
      
      <div className="vault-interface">
        <div className="vault-stats-header">
          <Card className="xp-display">
            <h3>⚡ TOTAL XP: {totalXP}</h3>
            <div className="xp-bar">
              <div className="xp-fill" style={{width: `${Math.min(100, (totalXP / 1825) * 100)}%`}}></div>
            </div>
          </Card>
          
          {merovingianUnlocked && (
            <Card className="merovingian-sigil">
              <h3>👑 MEROVINGIAN SIGIL UNLOCKED</h3>
              <p>Advanced referral bonus activated!</p>
              <div className="sigil-symbol">⧨⟐◊⟢▣⧫⟡◈⧩</div>
            </Card>
          )}
        </div>

        <div className="artifacts-grid">
          {artifacts.map(artifact => (
            <Card 
              key={artifact.id} 
              className={`artifact-card ${artifact.unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => setSelectedArtifact(artifact)}
            >
              <div className="artifact-icon">
                {artifact.unlocked ? '✨' : '🔒'}
              </div>
              <h4>{artifact.name}</h4>
              <p className="artifact-xp">+{artifact.xp} XP</p>
              <p className="artifact-status">
                {artifact.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </p>
            </Card>
          ))}
        </div>

        {selectedArtifact && (
          <Card className="artifact-detail">
            <h3>{selectedArtifact.name}</h3>
            <p>{selectedArtifact.description}</p>
            {!selectedArtifact.unlocked && (
              <Button 
                onClick={() => unlockArtifact(selectedArtifact.id)}
                className="unlock-btn"
              >
                Attempt Unlock (+{selectedArtifact.xp} XP)
              </Button>
            )}
            <Button 
              onClick={() => setSelectedArtifact(null)}
              className="close-btn"
            >
              Close
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

// B2B Professional Page
const B2BPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    need: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API}/referral/submit`, {
        name: formData.name,
        email: formData.email,
        service_interest: formData.need,
        source_agent: 'b2b_professional'
      });
      
      if (response.data) {
        alert('✅ Your professional inquiry has been submitted!');
        setFormData({ name: '', email: '', company: '', budget: '', timeline: '', need: '' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('❌ Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <div className="agent-page b2b-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>💼 B2B / PROFESSIONAL</h1>
        <p>Enterprise Solutions & Partnerships</p>
      </div>
      
      <div className="widget-grid">
        <Card className="widget-card intake-widget">
          <h3>📋 ENTERPRISE INTAKE</h3>
          <form onSubmit={handleSubmit} className="intake-form">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              required
            />
            
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-input"
              required
            />
            
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="form-input"
            />
            
            <select
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="form-select"
            >
              <option value="">Select Budget Range</option>
              <option value="5k-10k">$5K - $10K</option>
              <option value="10k-25k">$10K - $25K</option>
              <option value="25k-50k">$25K - $50K</option>
              <option value="50k+">$50K+</option>
            </select>
            
            <select
              value={formData.timeline}
              onChange={(e) => setFormData({...formData, timeline: e.target.value})}
              className="form-select"
            >
              <option value="">Project Timeline</option>
              <option value="asap">ASAP</option>
              <option value="1-3months">1-3 Months</option>
              <option value="3-6months">3-6 Months</option>
              <option value="6months+">6+ Months</option>
            </select>
            
            <textarea
              placeholder="What do you need?"
              value={formData.need}
              onChange={(e) => setFormData({...formData, need: e.target.value})}
              className="form-textarea"
              rows="4"
              required
            ></textarea>
            
            <Button type="submit" className="submit-btn">
              Submit Enterprise Inquiry
            </Button>
          </form>
        </Card>
        
        <Card className="widget-card cta-widget">
          <h3>🎧 LISTEN ON CSN</h3>
          <p>Catch our business discussions and industry insights</p>
          <Button onClick={() => navigate('/csn')} className="csn-cta">
            Listen Live →
          </Button>
        </Card>
      </div>
    </div>
  );
};

// VRG-33-589 Tinfoil Bot Page
const VRG33589Page = () => {
  const navigate = useNavigate();
  const [botStatus, setBotStatus] = useState('active');
  
  return (
    <div className="agent-page vrg-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>👁️ VRG-33-589</h1>
        <p>Tinfoil Bot • RSS→TTS • Truth Detection</p>
      </div>
      
      <div className="bot-interface">
        <Card className="bot-widget">
          <h3>🤖 VRG-33-589 STATUS</h3>
          <div className="bot-status">
            <span className={`status-indicator ${botStatus}`}></span>
            <span className="status-text">Bot Status: {botStatus.toUpperCase()}</span>
          </div>
          
          <div className="bot-skills">
            <h4>🧠 Bot Capabilities</h4>
            <div className="skill-list">
              <div className="skill-item">
                <span className="skill-icon">📡</span>
                <span className="skill-name">RSS → TTS</span>
                <span className="skill-status">✅ Active</span>
              </div>
              <div className="skill-item">
                <span className="skill-icon">🎤</span>
                <span className="skill-name">Conspiracy Analysis</span>
                <span className="skill-status">✅ Active</span>
              </div>
            </div>
          </div>
          
          <div className="bot-actions">
            <Button className="bot-action-btn">Generate Analysis</Button>
            <Button className="bot-action-btn">Create TTS</Button>
            <Button className="bot-action-btn">View Archives</Button>
          </div>
        </Card>
        
        <Card className="conspiracy-feed">
          <h3>🕵️ TINFOIL ANALYSIS</h3>
          <div className="record-list">
            <div className="record-item">
              <span className="record-timestamp">15:33:59</span>
              <span className="record-content">RSS feed processed: 42 articles analyzed</span>
            </div>
            <div className="record-item">
              <span className="record-timestamp">15:30:12</span>
              <span className="record-content">TTS generated: "Hidden Market Patterns"</span>
            </div>
            <div className="record-item">
              <span className="record-timestamp">15:25:44</span>
              <span className="record-content">Conspiracy pattern detected in data stream</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// SEO Ghost Pages for Industries
const IndustryPage = ({ industry }) => {
  const navigate = useNavigate();
  
  const industryContent = {
    finance: {
      title: "Web3 Finance & DeFi Solutions",
      question: "How is Web3 revolutionizing traditional finance?",
      answer: `Web3 is fundamentally transforming the financial landscape through decentralized finance (DeFi) protocols, smart contracts, and blockchain technology. Unlike traditional banking systems that rely on centralized institutions, Web3 finance operates on distributed networks that provide unprecedented transparency, accessibility, and user control.

      The core advantages of Web3 finance include: 24/7 global accessibility without geographical restrictions, programmable money through smart contracts, yield farming opportunities that often exceed traditional savings accounts, and the elimination of intermediaries that typically charge high fees.

      NEURO has been at the forefront of Web3 financial education, helping individuals and institutions understand everything from basic cryptocurrency concepts to advanced DeFi strategies. Our network includes partnerships with leading platforms like CryptoSpaces.net for real-time market analysis and BarkMeta.io for NFT-based financial instruments.

      Key Web3 financial innovations include automated market makers (AMMs), liquidity mining, decentralized autonomous organizations (DAOs) for governance, and cross-chain interoperability solutions. These technologies are creating new revenue streams and investment opportunities that were previously impossible in traditional finance.

      The gaming sector particularly benefits from Web3 finance through play-to-earn economies, where players can generate real income through gameplay. This intersection of gaming and finance represents one of the most exciting frontiers in the digital economy.

      For businesses looking to integrate Web3 financial solutions, NEURO provides comprehensive consulting services covering regulatory compliance, technical implementation, and strategic planning. Our expertise spans from simple cryptocurrency payment integration to complex DeFi protocol development.`
    },
    gaming: {
      title: "Web3 Gaming & NFT Integration",
      question: "How are NFTs and blockchain changing the gaming industry?",
      answer: `The gaming industry is experiencing a paradigm shift through Web3 integration, with NFTs and blockchain technology creating true digital ownership and play-to-earn economies. This transformation goes far beyond simple collectibles, establishing new economic models where players own, trade, and monetize their in-game assets.

      Web3 gaming introduces several revolutionary concepts: provable scarcity through blockchain verification, interoperability allowing assets to move between games, player-driven economies where supply and demand determine value, and decentralized governance through gaming DAOs.

      NEURO's gaming division has partnered with major platforms including DoginalDogs.com for NFT gaming assets and CryptoSpaces.net for gaming community management. These partnerships demonstrate the interconnected nature of the Web3 gaming ecosystem.

      The economic impact is substantial. Players can now earn sustainable income through skilled gameplay, rare item discovery, and strategic asset trading. Some players have replaced traditional employment with play-to-earn gaming, particularly in regions where this income exceeds local wages.

      Technical innovations driving this space include layer-2 scaling solutions that reduce transaction costs, cross-chain bridges enabling multi-game asset portability, and sophisticated smart contracts that govern complex game mechanics and reward systems.

      For game developers, Web3 integration offers new monetization models beyond traditional one-time purchases or microtransactions. Developers can earn ongoing royalties from secondary asset sales, create token-based governance systems, and build sustainable long-term communities.

      The music and art industries are also benefiting from these gaming innovations, with virtual concerts in metaverse games and NFT art galleries creating new venues for creative expression and monetization.`
    },
    art: {
      title: "Digital Art & NFT Marketplace Revolution",
      question: "How has Web3 transformed the art market and creative economy?",
      answer: `Web3 technology has democratized the art world in unprecedented ways, enabling artists to maintain ownership rights, earn ongoing royalties, and reach global audiences without traditional gatekeepers. The NFT revolution has created new revenue streams and artistic possibilities that were previously impossible.

      Digital art on blockchain provides immutable provenance, ensuring authenticity and ownership history. This addresses longstanding issues in the art world around forgeries and disputed ownership. Smart contracts automatically distribute royalties to artists from secondary sales, creating sustainable income streams.

      NEURO's creative network includes collaborations with BarkMeta.io for NFT art curation and CryptoSpaces.net for artist community building. These partnerships highlight the collaborative nature of the Web3 creative economy.

      The democratization effect is profound. Artists no longer need gallery representation or institutional backing to monetize their work. Direct creator-to-collector relationships are flourishing, with social media and Web3 platforms enabling artists to build dedicated followings and sustainable businesses.

      Innovative art forms are emerging specifically for Web3, including generative art algorithms, interactive multimedia NFTs, and collaborative community artworks. These new formats leverage blockchain capabilities in ways traditional art cannot.

      The intersection with gaming and virtual worlds creates additional opportunities. Artists can design assets for metaverse environments, create branded virtual spaces, and develop interactive experiences that generate ongoing revenue through user engagement.

      For collectors, Web3 art offers liquidity, fractional ownership opportunities, and the ability to showcase collections in virtual galleries. The global nature of blockchain markets means artists can reach collectors worldwide without geographical limitations.

      Music artists are also leveraging these technologies, releasing exclusive tracks as NFTs, creating fan-owned record labels through DAOs, and building deeper relationships with their audiences through token-gated communities.`
    },
    // Additional industries will be added here
  };

  const content = industryContent[industry] || industryContent.finance;

  return (
    <div className="seo-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>{content.title}</h1>
        <p>Expert guidance from NEURO • Web3 onboarding specialists</p>
      </div>
      
      <div className="seo-content">
        <Card className="content-card">
          <h2>{content.question}</h2>
          <div className="answer-content">
            {content.answer.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph.trim()}</p>
            ))}
          </div>
        </Card>
        
        <Card className="cta-card">
          <h3>Ready to Enter Web3?</h3>
          <p>Get personalized guidance from NEURO's Web3 experts</p>
          <div className="cta-buttons">
            <Button onClick={() => navigate('/neurolab')} className="primary-cta">
              Start Web3 Journey
            </Button>
            <Button onClick={() => navigate('/b2b')} className="secondary-cta">
              Enterprise Solutions
            </Button>
          </div>
        </Card>

        <Card className="network-card">
          <h3>Explore Our Network</h3>
          <div className="network-links">
            <a href="https://cryptospaces.net" target="_blank" rel="noopener noreferrer">
              CryptoSpaces.net - Live Community
            </a>
            <a href="https://doginal-dogs.com" target="_blank" rel="noopener noreferrer">
              DoginalDogs.com - NFT Collections
            </a>
            <a href="https://barkmeta.io" target="_blank" rel="noopener noreferrer">
              BarkMeta.io - Metaverse Assets
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

function App() {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MotherboardHub />} />
          <Route path="/csn" element={<CSNPage />} />
          <Route path="/neurolab" element={<NeuroLabPage />} />
          <Route path="/bwb" element={<BWBPage />} />
          <Route path="/vault33" element={<Vault33Page />} />
          <Route path="/b2b" element={<B2BPage />} />
          <Route path="/vrg33589" element={<VRG33589Page />} />
          
          {/* SEO Ghost Pages */}
          <Route path="/industry/finance" element={<IndustryPage industry="finance" />} />
          <Route path="/industry/gaming" element={<IndustryPage industry="gaming" />} />
          <Route path="/industry/art" element={<IndustryPage industry="art" />} />
          <Route path="/industry/music" element={<IndustryPage industry="music" />} />
          <Route path="/industry/realestate" element={<IndustryPage industry="realestate" />} />
          <Route path="/industry/health" element={<IndustryPage industry="health" />} />
          <Route path="/industry/politics" element={<IndustryPage industry="politics" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;