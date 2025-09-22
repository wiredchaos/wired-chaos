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
    { id: 'eveningvibes', label: 'Evening Vibes Lounge', route: '/eveningvibes', icon: '🌙' },
    { id: 'fm333', label: '33.3 FM Live Broadcasts', route: '/fm333', icon: '📻' }
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
      icon: '🚀',
      title: 'CSN',
      description: 'Community Network',
      position: { top: '8%', left: '15%' },
      route: '/csn'
    },
    {
      id: 'neurolab',
      name: 'NEURO LAB',
      icon: '🧠',
      title: 'NEURO LAB',
      description: 'Web3 Onboarding',
      position: { top: '8%', right: '15%' },
      route: '/neurolab'
    },
    {
      id: 'fm333',
      name: '33.3 FM',
      icon: '📻',
      title: '33.3 FM',
      description: 'DOGECHAIN Radio',
      position: { top: '30%', left: '8%' },
      route: '/fm333'
    },
    {
      id: 'bwb',
      name: 'BARBED WIRED BROADCAST',
      icon: '📰',
      title: 'BWB',
      description: 'Newsletter • RSS',
      position: { top: '30%', right: '8%' },
      route: '/bwb'
    },
    {
      id: 'vault33',
      name: 'VAULT 33',
      icon: '🔐',
      title: 'VAULT 33',
      description: 'WL Gamification',
      position: { bottom: '30%', left: '8%' },
      route: '/vault33'
    },
    {
      id: 'vrg33589',
      name: 'VRG-33-589',
      icon: '👁️',
      title: 'VRG-33-589',
      description: 'Tinfoil Bot',
      position: { bottom: '30%', right: '8%' },
      route: '/vrg33589'
    },
    {
      id: 'b2b',
      name: 'B2B / PROFESSIONAL',
      icon: '💼',
      title: 'B2B',
      description: 'Enterprise Intake',
      position: { bottom: '8%', left: '15%' },
      route: '/b2b'
    },
    {
      id: 'eveningvibes',
      name: 'EVENING VIBES',
      icon: '🌙',
      title: 'EVENING VIBES',
      description: 'Level Up Lounge',
      position: { bottom: '8%', right: '15%' },
      route: '/eveningvibes'
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

// CSN - Crypto Spaces Net Page (FM content removed)
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
        <h1>🚀 CRYPTO SPACES NET</h1>
        <p>Community Network & Collaboration Hub</p>
      </div>
      
      <div className="widget-grid">
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
          <h3>📞 COLLABORATE</h3>
          <p>Want to be featured or partner with CSN?</p>
          <Button onClick={() => navigate('/b2b')} className="contact-cta">
            Partnership Inquiries →
          </Button>
        </Card>
      </div>
    </div>
  );
};

// 33.3 FM Page (new radio design)
const FM333Page = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page fm333-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      </div>
      
      <div className="fm-console">
        <div className="fm-hdr">
          <div className="fm-pulse"></div>
          <h1>33.3 FM — WIRED CHAOS RADIO</h1>
        </div>
        <div className="fm-sub">Streaming Barbed Wired Broadcasts, DJ Red Fang sets, and Evening Vibes 🔥</div>

        {/* Spotify Player Embed */}
        <iframe 
          src="https://open.spotify.com/embed/playlist/2VwOYrB1C93gNIPiBZNxhH?utm_source=generator" 
          className="fm-iframe"
          allowtransparency="true" 
          allow="encrypted-media"
          title="WIRED CHAOS Radio Playlist"
        ></iframe>

        {/* Neon tuner effect */}
        <div className="fm-tuner">
          <div className="fm-dial">
            <div className="fm-needle"></div>
          </div>
          <p className="fm-tiny">Tuned to frequency <b>33.3</b> • Independent broadcast • WIRED CHAOS aesthetic</p>
        </div>

        {/* CTAs */}
        <div className="fm-cta-row">
          <Button onClick={() => navigate('/bwb')} className="fm-btn">
            Barbed Wired Broadcast Newsletter
          </Button>
          <Button onClick={() => navigate('/eveningvibes')} className="fm-btn">
            Evening Vibes Lounge
          </Button>
          <Button onClick={() => navigate('/csn')} className="fm-btn">
            Crypto Spaces Net (separate)
          </Button>
        </div>
      </div>
    </div>
  );
};

// Evening Vibes Lounge (Redirect Hub)
const EveningVibesPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      window.open('https://www.vibescheck.xyz/', '_blank');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="agent-page eveningvibes-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🌙 EVENING VIBES</h1>
        <p>Level Up Lounge • Redirecting to Vibes Check</p>
      </div>
      
      <div className="redirect-container">
        <Card className="redirect-card">
          <div className="vibes-logo">🌙✨</div>
          <h2>Welcome to Evening Vibes</h2>
          <p>Level Up Lounge</p>
          <div className="redirect-status">
            <p>Redirecting you to Vibes Check...</p>
            <div className="redirect-progress"></div>
          </div>
          <div className="redirect-actions">
            <Button 
              onClick={() => window.open('https://www.vibescheck.xyz/', '_blank')}
              className="vibes-cta"
            >
              Go to Vibes Check →
            </Button>
            <Button onClick={() => navigate('/')} className="stay-btn">
              Stay on WIRED CHAOS
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// NEURO Lab Page (with Lurky integration)
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
            <a href="https://www.doginaldogs.com/" target="_blank" rel="noopener noreferrer" className="network-link">
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
        <p>WL Gamification • 9 Artifacts • Secret Merovingian Sigil</p>
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
          <h3>📻 LISTEN ON 33.3 FM</h3>
          <p>Catch our business discussions and industry insights</p>
          <Button onClick={() => navigate('/fm333')} className="fm-cta">
            Listen Live →
          </Button>
        </Card>
      </div>
    </div>
  );
};

// VRG-33-589 Lore Console
const VRG33589Page = () => {
  const navigate = useNavigate();
  const [supply, setSupply] = useState({
    Common: 150,
    Uncommon: 100,
    Rare: 50,
    SuperRare: 33
  });
  const [echoes, setEchoes] = useState(0);
  const [burnMsg, setBurnMsg] = useState('');
  const [isWarn, setIsWarn] = useState(false);

  const EchoCap = 936;
  const embed = {
    layerOrigin: "Vault33 Access Key",
    archetype: "Frequency Keeper", 
    frequencyCode: "33.3",
    factions: ["Barbed Wired Broadcast", "33.3 FM", "NEURO Lab", "Merovingian Strand"],
    supply: {...supply},
    echoCap: EchoCap
  };

  const echoSpawnSummary = {
    tiers: 6,
    factions: 4, 
    cap: EchoCap,
    rule: "Each burn spawns 1 Rare Echo + 2 Super Rare Echoes"
  };

  const demoBurn = (kind) => {
    if (supply[kind] <= 0) {
      setBurnMsg(`No ${kind} keys left to burn.`);
      setIsWarn(true);
      return;
    }
    if (echoes + 3 > EchoCap) {
      setBurnMsg(`Echo archive at capacity.`);
      setIsWarn(true);
      return;
    }
    
    setSupply(prev => ({...prev, [kind]: prev[kind] - 1}));
    setEchoes(prev => prev + 3);
    setBurnMsg(`Burned ${kind}. +1 Rare Echo, +2 Super Rare Echoes.`);
    setIsWarn(false);
  };

  const totalSupply = supply.Common + supply.Uncommon + supply.Rare + supply.SuperRare;

  return (
    <div className="agent-page vrg-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      </div>
      
      <div className="vrg-console">
        <div className="vrg-hdr">
          <div className="vrg-halo"></div>
          <h1>VRG-33-589 — Resonant Vault</h1>
        </div>
        <div className="vrg-sub">
          Access-Keys, Merovingian Echoes, and the frequency 33.3. 
          <span className="vrg-tiny">Lore-mode • no wallet • demo counters</span>
        </div>

        <div className="vrg-grid">
          <div className="vrg-card">
            <h3>Access-Key Supply</h3>
            <div className="vrg-row">
              <span className="vrg-badge">Common: <span className="vrg-stat">{supply.Common}</span></span>
              <span className="vrg-badge">Uncommon: <span className="vrg-stat">{supply.Uncommon}</span></span>
              <span className="vrg-badge">Rare: <span className="vrg-stat">{supply.Rare}</span></span>
              <span className="vrg-badge">Super Rare: <span className="vrg-stat">{supply.SuperRare}</span></span>
            </div>
            <div className="vrg-divider"></div>
            <div className="vrg-row vrg-tiny">
              <span className="vrg-pill">Total Keys: <b>{totalSupply}</b></span>
              <span className="vrg-pill">Total Echo Cap: <b>936</b></span>
              <span className="vrg-pill">Frequency Code: <b>33.3</b></span>
            </div>
          </div>

          <div className="vrg-card">
            <h3>Burn → Echo (Demo)</h3>
            <p className="vrg-tiny">
              In VRG-33-589, a burn splits the frequency: <b>+1 Rare Echo</b> and <b>+2 Super Rare Echoes</b>.
            </p>
            <div className="vrg-row">
              <button className="vrg-btn" onClick={() => demoBurn('Common')}>Burn Common</button>
              <button className="vrg-btn" onClick={() => demoBurn('Uncommon')}>Burn Uncommon</button>
              <button className="vrg-btn" onClick={() => demoBurn('Rare')}>Burn Rare</button>
              <button className="vrg-btn" onClick={() => demoBurn('SuperRare')}>Burn Super Rare</button>
            </div>
            <p className="vrg-tiny">Echoes minted: <b>{echoes}</b> / 936</p>
            <p className={`vrg-tiny ${isWarn ? 'vrg-warn' : 'vrg-success'}`}>{burnMsg}</p>
          </div>

          <div className="vrg-card">
            <h3>Archetype Embeds</h3>
            <ul className="vrg-tiny">
              <li>Layer Origin: <b>Vault33 Access Key</b></li>
              <li>Archetype: <b>Frequency Keeper</b></li>
              <li>Frequency Code: <b>33.3</b></li>
              <li>Faction Ties: <b>BWB ⚡</b> • <b>33.3FM 📡</b> • <b>NEURO 🧠</b> • <b>Merovingian 🩸</b></li>
            </ul>
            <details className="vrg-details">
              <summary>See JSON embed</summary>
              <pre className="vrg-mono">{JSON.stringify(embed, null, 2)}</pre>
            </details>
          </div>

          <div className="vrg-card">
            <h3>Chamber Notes</h3>
            <p className="vrg-tiny">
              VRG-33-589 is the echo vault where failed timelines are stored. Burned keys are cataloged; their
              <b> Merovingian Echoes</b> form a secondary archive (6 tiers × 4 factions).
            </p>
            <details className="vrg-details">
              <summary>Echo Spawn Summary</summary>
              <pre className="vrg-mono">{JSON.stringify(echoSpawnSummary, null, 2)}</pre>
            </details>
            <div className="vrg-cta-row">
              <Button onClick={() => navigate('/vault33')} className="vrg-btn">Enter Vault 33</Button>
              <Button onClick={() => navigate('/bwb')} className="vrg-btn">Subscribe BWB</Button>
              <Button onClick={() => navigate('/csn')} className="vrg-btn">Listen on CSN</Button>
              <Button onClick={() => navigate('/fm333')} className="vrg-btn">Tune 33.3 FM</Button>
              <Button onClick={() => navigate('/b2b')} className="vrg-btn">B2B / Referrals</Button>
            </div>
          </div>
        </div>

        <details className="vrg-details vrg-lore">
          <summary>Lore: Distribution & Rules</summary>
          <div className="vrg-mono">
            Commons = whispers (150). Uncommons = frequency carriers (100). Rares = gatewardens (50). Super Rares = Merovingian sparks (33).
            A burn in VRG-33-589 is a frequency split → +1 Rare Echo +2 Super Rare Echoes. Max echo archive = 936 across 6 tiers × 4 factions.
          </div>
        </details>
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
    }
    // Additional industries will be added
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
            <a href="https://www.doginaldogs.com/" target="_blank" rel="noopener noreferrer">
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
          <Route path="/fm333" element={<FM333Page />} />
          <Route path="/eveningvibes" element={<EveningVibesPage />} />
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