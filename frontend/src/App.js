import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { MotherboardHub } from "./components/MotherboardUI";
import NeuroHologram from "./components/NeuroHologram";
import featureFlags, { FEATURES } from "./config/featureFlags";
import axios from "axios";

// Import the new locked theme motherboard component
const Motherboard = React.lazy(() => import('./components/Motherboard'));

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

// Main Motherboard Hub Component (Legacy)
const MotherboardHubLegacy = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showBot, setShowBot] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

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
      position: { bottom: '8%', left: '25%' },
      route: '/eveningvibes'
    },
    {
      id: 'merch',
      name: 'MERCH HUB',
      icon: '🛍️',
      title: 'MERCH HUB',
      description: 'WIRED CHAOS Store',
      position: { bottom: '8%', right: '25%' },
      route: '/merch'
    }
  ];

  const handleNodeClick = (route) => {
    setSelectedNode(route);
    // Brief delay to show connection animation before navigation
    setTimeout(() => {
      navigate(route);
      setSelectedNode(null);
    }, 800);
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
      
      {/* Brain Overlay System */}
      <div className="brain-overlay">
        <div className="brain-container">
          <div className="brain-core">
            <div className="brain-veins">
              <div className="vein vein-1"></div>
              <div className="vein vein-2"></div>
              <div className="vein vein-3"></div>
              <div className="vein vein-4"></div>
              <div className="vein vein-5"></div>
              <div className="vein vein-6"></div>
            </div>
            <div className="brain-symbol">🧠</div>
          </div>
          
          {/* Barbed Wire Ring */}
          <div className="barbed-wire-ring">
            {agents.map((agent, index) => (
              <div
                key={agent.id}
                className={`barbed-wire wire-${index + 1} ${selectedNode === agent.route ? 'wire-active' : ''}`}
                style={{
                  '--wire-angle': `${(360 / agents.length) * index}deg`,
                  '--target-x': agent.position.left ? `${agent.position.left}` : `${100 - parseInt(agent.position.right)}%`,
                  '--target-y': agent.position.top ? `${agent.position.top}` : `${100 - parseInt(agent.position.bottom)}%`
                }}
              >
                <div className="wire-segment"></div>
                <div className="wire-barb"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Title */}
      <div className="main-title">
        <h1 className="wired-chaos-title">
          <span className="glitch" data-text="WIRED CHAOS">WIRED CHAOS</span>
          <span className="brain-icon">🧠</span>
        </h1>
        <p className="subtitle">DIGITAL ECOSYSTEM MOTHERBOARD</p>
        
        {/* WIRED CHAOS Social Links */}
        <div className="wired-chaos-links">
          <div className="social-links-row">
            <a 
              href="https://www.wiredchaos.xyz/post/from-free-mint-to-joe-rogan-how-doginal-dogs-took-over-crypto-and-netflix" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link blog-link"
            >
              📰 Joe Rogan & Doginal Dogs
            </a>
            <a 
              href="https://www.wiredchaos.xyz/post/doginal-dogs-ddnyc-takeover-crypto-tech-web3-culture" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link blog-link"
            >
              📰 DDNYC Takeover Story
            </a>
          </div>
          <div className="social-links-row">
            <a 
              href="https://www.tiktok.com/@wired.chaos?_t=ZT-8zvd2Zq1PzB&_r=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link tiktok-link"
            >
              🎵 @wired.chaos TikTok
            </a>
            <a 
              href="https://www.quora.com/profile/Wired-Chaos?ch=17&oid=3098662541&share=85230f75&srid=5THMtG&target_type=user" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link quora-link"
            >
              🧭 Quora Profile
            </a>
          </div>
        </div>
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

// CSN - Crypto Spaces Net  
const CSNPage = () => {
  const navigate = useNavigate();
  const [liveStatus, setLiveStatus] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCSNData = async () => {
      try {
        // Mock API endpoints - replace with real CSN API when available
        const LIVE_API = "https://cryptospaces.net/api/live.json";
        const SCHED_API = "https://cryptospaces.net/api/schedule.json";
        
        try {
          const liveResponse = await fetch(LIVE_API);
          const liveData = await liveResponse.json();
          setLiveStatus(liveData);
        } catch (e) {
          // Fallback mock data for demo
          setLiveStatus({
            active: false,
            title: "33.3 FM Relay",
            status: "Scanning for broadcast...",
            nextShow: "Next: Daily Crypto Roundup at 6PM EST"
          });
        }

        try {
          const schedResponse = await fetch(SCHED_API);
          const schedData = await schedResponse.json();
          setSchedule(schedData.events || []);
        } catch (e) {
          // Fallback schedule
          setSchedule([
            {
              title: "Daily Crypto Roundup",
              date: "Today",
              time: "6:00 PM EST",
              description: "Market analysis and Web3 updates"
            },
            {
              title: "Weekend Spaces",
              date: "Saturday",
              time: "2:00 PM EST", 
              description: "Community discussions and project highlights"
            },
            {
              title: "Morning Briefing",
              date: "Weekdays",
              time: "9:00 AM EST",
              description: "Quick market overview and news"
            }
          ]);
        }
      } catch (error) {
        console.error("CSN data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCSNData();
  }, []);

  return (
    <div className="agent-container">
      <div className="agent-header">
        <h2>📡 CRYPTO SPACES NET</h2>
        <p>33.3 FM Relay • Live Streaming Network</p>
      </div>

      {/* Live Status Board */}
      <div className="board neon-glow" id="csn-board">
        <div className="board-hdr">
          <span className={`badge ${liveStatus?.active ? 'green' : 'red'}`}>
            {liveStatus?.active ? 'LIVE' : 'OFFLINE'}
          </span>
          <h3 className="board-title">Crypto Spaces Net — 33·3FM Relay</h3>
        </div>
        
        <div className="csn-status">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Connecting to broadcast network...</p>
            </div>
          ) : (
            <>
              <div className="live-status-text">
                {liveStatus?.active ? 
                  `Now Live: ${liveStatus.title}` : 
                  liveStatus?.status || "Scanning for broadcast..."
                }
              </div>
              
              {liveStatus?.active ? (
                <div className="live-player">
                  {liveStatus.embed ? (
                    <iframe 
                      src={liveStatus.embed} 
                      width="100%" 
                      height="200" 
                      style={{border: 0}} 
                      allow="autoplay; encrypted-media"
                      title="CSN Live Stream"
                    />
                  ) : (
                    <div className="live-placeholder">
                      <div className="pulse-icon">📡</div>
                      <p>Live Stream Active</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="live-player standby">
                  <div className="standby-signal">
                    <span className="signal-bars">
                      <span></span><span></span><span></span><span></span>
                    </span>
                    <p>Standby signal ⚡</p>
                  </div>
                  {liveStatus?.nextShow && (
                    <p className="next-show">{liveStatus.nextShow}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="btn-row">
          {liveStatus?.active && liveStatus.url && (
            <a href={liveStatus.url} className="btn green" target="_blank" rel="noopener noreferrer">
              Join Live Space
            </a>
          )}
          <a href="https://cryptospaces.net" className="btn cyan" target="_blank" rel="noopener noreferrer">
            Visit CSN ↗
          </a>
          <button className="btn" onClick={() => window.location.reload()}>
            Refresh Status
          </button>
        </div>
      </div>

      {/* Schedule Board */}
      <div className="board neon-glow">
        <div className="board-hdr">
          <span className="badge cyan">Schedule</span>
          <h3 className="board-title">Upcoming Shows</h3>
        </div>
        
        <ul className="schedule-list">
          {schedule.map((event, index) => (
            <li key={index} className="schedule-item">
              <div className="schedule-header">
                <strong className="show-title">{event.title}</strong>
                <span className="show-time">{event.date} • {event.time}</span>
              </div>
              {event.description && (
                <p className="show-description">{event.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Integration Info */}
      <div className="info-panel">
        <h4>🔗 Network Integration</h4>
        <p>Direct integration with Crypto Spaces Net broadcasting network. Real-time status updates and schedule synchronization.</p>
        <div className="network-links">
          <a href="https://x.com/cryptospacesnet" target="_blank" rel="noopener noreferrer" className="network-link">
            🐦 @cryptospacesnet
          </a>
          <a href="https://cryptospaces.net/schedule" target="_blank" rel="noopener noreferrer" className="network-link">
            📅 Full Schedule
          </a>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Motherboard
      </button>
    </div>
  );
};

// 33.3 FM Page (exact radio console design)
const FM333Page = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page fm333-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      </div>
      
      <div className="fm">
        <div className="hdr">
          <div className="pulse"></div>
          <h1>33.3 FM — WIRED CHAOS RADIO</h1>
        </div>
        <div className="sub">Streaming Barbed Wired Broadcasts, DJ Red Fang sets, and Evening Vibes 🔥</div>

        {/* Spotify Player Embed */}
        <iframe 
          src="https://open.spotify.com/embed/playlist/2VwOYrB1C93gNIPiBZNxhH?utm_source=generator" 
          allowtransparency="true" 
          allow="encrypted-media"
          title="WIRED CHAOS Radio Playlist"
        ></iframe>

        {/* Neon tuner effect */}
        <div className="tuner">
          <div className="dial">
            <div className="needle"></div>
          </div>
          <p className="tiny">Tuned to frequency <b>33.3</b> • Independent broadcast • WIRED CHAOS aesthetic</p>
        </div>

        {/* CTAs */}
        <div className="ctaRow">
          <Button onClick={() => navigate('/bwb')} className="btn">
            Barbed Wired Broadcast Newsletter
          </Button>
          <Button onClick={() => navigate('/eveningvibes')} className="btn">
            Evening Vibes Lounge
          </Button>
          <Button onClick={() => navigate('/csn')} className="btn">
            Crypto Spaces Net (separate)
          </Button>
        </div>
      </div>
    </div>
  );
};

// Evening Vibes - Level Up Lounge
const EveningVibesPage = () => {
  const navigate = useNavigate();
  const [pinnedTweet, setPinnedTweet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Twitter widgets
    const loadTwitterWidget = () => {
      if (window.twttr) {
        window.twttr.widgets.load();
      } else {
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        script.onload = () => {
          if (window.twttr) {
            window.twttr.widgets.load();
          }
        };
        document.head.appendChild(script);
      }
    };

    loadTwitterWidget();
    
    // Mock pinned tweet data (replace with real API call)
    setTimeout(() => {
      setPinnedTweet({
        id: "1234567890",
        url: "https://x.com/neurometax/status/1234567890",
        text: "Welcome to the Evening Vibes Level Up Lounge 🌆✨"
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleLevelUpRedirect = () => {
    // Redirect to vibescheck.xyz
    window.open('https://vibescheck.xyz', '_blank');
  };

  return (
    <div className="agent-container">
      <div className="agent-header">
        <h2>🌆 EVENING VIBES</h2>
        <p>Level Up Lounge • Hologram Crew Network</p>
      </div>

      {/* Level Up Lounge Board */}
      <div className="board neon-glow" id="lounge-board">
        <div className="board-hdr">
          <span className="badge red">Lounge</span>
          <h3 className="board-title">Evening Vibes — Level Up Lounge</h3>
        </div>
        
        <p className="lounge-subtitle">
          Hologram lounge, each crew member = profile node.
        </p>

        {/* Pinned Tweet Section */}
        <div className="pinned-section">
          <h4>📌 Featured Update</h4>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading lounge updates...</p>
            </div>
          ) : (
            <div className="pinned-tweet">
              <blockquote className="twitter-tweet" data-theme="dark">
                <a href={pinnedTweet?.url || "https://x.com/neurometax"}>
                  {pinnedTweet?.text || "Latest updates from the lounge..."}
                </a>
              </blockquote>
            </div>
          )}
        </div>

        {/* Crew Network Visualization */}
        <div className="crew-network">
          <h4>👥 Crew Network Nodes</h4>
          <div className="node-grid">
            <div className="crew-node active">
              <div className="node-avatar">🧠</div>
              <span className="node-label">NeuroMeta</span>
            </div>
            <div className="crew-node">
              <div className="node-avatar">🎵</div>
              <span className="node-label">Vibe Curator</span>
            </div>
            <div className="crew-node">
              <div className="node-avatar">⚡</div>
              <span className="node-label">Tech Node</span>
            </div>
            <div className="crew-node">
              <div className="node-avatar">🎨</div>
              <span className="node-label">Art Node</span>
            </div>
            <div className="crew-node">
              <div className="node-avatar">🔮</div>
              <span className="node-label">Mystery Node</span>
            </div>
            <div className="crew-node coming-soon">
              <div className="node-avatar">➕</div>
              <span className="node-label">Join Crew</span>
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button className="btn red" onClick={handleLevelUpRedirect}>
            Enter Level Up Lounge ↗
          </button>
          <a href="https://x.com/neurometax" className="btn cyan" target="_blank" rel="noopener noreferrer">
            Follow Updates
          </a>
        </div>
      </div>

      {/* Vibe Check Integration */}
      <div className="board neon-glow">
        <div className="board-hdr">
          <span className="badge cyan">Integration</span>
          <h3 className="board-title">Vibe Check Portal</h3>
        </div>
        
        <div className="vibe-portal">
          <div className="portal-visual">
            <div className="portal-ring">
              <div className="portal-center">
                <span className="portal-icon">🌀</span>
              </div>
            </div>
          </div>
          
          <p className="portal-description">
            Direct portal to the Level Up Lounge ecosystem. Connect with the crew, 
            check your vibe level, and join the hologram network.
          </p>
          
          <div className="portal-stats">
            <div className="stat-item">
              <span className="stat-value">∞</span>
              <span className="stat-label">Vibe Level</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">🌐</span>
              <span className="stat-label">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Links */}
      <div className="info-panel">
        <h4>🔗 Lounge Network</h4>
        <p>Evening Vibes operates as a holographic crew network with interconnected profile nodes.</p>
        <div className="network-links">
          <a href="https://vibescheck.xyz" target="_blank" rel="noopener noreferrer" className="network-link">
            🌐 vibescheck.xyz
          </a>
          <a href="https://x.com/neurometax" target="_blank" rel="noopener noreferrer" className="network-link">
            🐦 @neurometax
          </a>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Motherboard
      </button>
    </div>
  );
};

// NEURO Lab Page (with Lurky integration and Hologram)
const NeuroLabPage = () => {
  const navigate = useNavigate();
  const [showHologram, setShowHologram] = useState(false);
  
  return (
    <div className="agent-page neuro-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🧠 NEURO LAB</h1>
        <p>Web3 Onboarding & Content Hub</p>
      </div>
      
      <div className="widget-grid">
        {/* Hologram Portal Widget */}
        <Card className="widget-card hologram-widget">
          <h3>🧠⛓️‍💥 NEURO HOLOGRAM</h3>
          <p>Interactive business portal with holographic projections</p>
          <button 
            className="neuro-btn" 
            onClick={() => setShowHologram(true)}
          >
            ENTER NEURO LAB 🧠⛓️‍💥
          </button>
        </Card>
        
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
        
        {/* NEURO Contact Widget */}
        <Card className="widget-card neuro-contact-widget">
          <h3>📧 CONTACT NEURO</h3>
          <p>Direct line to Web3 onboarding specialist</p>
          <div className="neuro-email">
            <a href="mailto:neuro@wiredchaos.xyz" className="email-link">
              neuro@wiredchaos.xyz
            </a>
          </div>
          <p className="contact-note">All inquiries routed through NEURO for personalized assistance</p>
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
            <a href="https://wiredchaos.xyz" target="_blank" rel="noopener noreferrer" className="network-link">
              WiredChaos.xyz
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

      {/* Hologram Modal */}
      <NeuroHologram 
        isOpen={showHologram}
        onClose={() => setShowHologram(false)}
        images={[
          '/images/neuro_business1.jpg',
          '/images/neuro_business2.jpg',
          '/images/portal_echo.jpg',
          '/images/wired_chaos_brain.jpg'
        ]}
      />
    </div>
  );
};

// BWB - Barbed Wired Broadcast (Blog Feed)
const BWBPage = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogFeed = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/proxy`);
        const data = await response.json();
        
        if (data.posts && data.posts.length > 0) {
          setBlogPosts(data.posts);
        } else {
          // Fallback content
          setBlogPosts([{
            title: "⚠️ Blog Feed Unavailable",
            link: "https://www.wiredchaos.xyz/blog",
            description: "Unable to load recent posts. Visit the main blog for latest updates.",
            published: ""
          }]);
        }
      } catch (error) {
        console.error("Blog feed error:", error);
        setBlogPosts([{
          title: "🔥 WIRED CHAOS Blog System",
          link: "https://www.wiredchaos.xyz/blog",
          description: "The blog integration system is under development. Check back soon for live RSS feeds.",
          published: ""
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogFeed();
  }, []);

  return (
    <div className="agent-container">
      <div className="agent-header">
        <h2>📰 BARBED WIRED BROADCAST</h2>
        <p>Live feed • WIRED CHAOS Blog Network</p>
      </div>
      
      {/* Blog Feed Board */}
      <div className="vault-holo-grid p-6">
        <div className="board-hdr">
          <span className="vault-status-badge status-active">Broadcast</span>
          <h3 className="vault-neon-title vault-cyan-outline">Latest Posts</h3>
        </div>
        
        {loading ? (
          <div className="vault-loading">
            <div className="vault-spinner"></div>
            <p className="vault-cyan-outline">Loading broadcasts...</p>
          </div>
        ) : (
          <div className="vault-grid">
            {blogPosts.map((post, index) => (
              <div key={index} className="vault-holo-card">
                <div className="flex justify-between items-start mb-3">
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="vault-neon-title vault-cyan-outline hover:vault-red-core transition-all duration-300"
                  >
                    {post.title}
                  </a>
                  {post.published && (
                    <span className="text-xs opacity-60">
                      {new Date(post.published).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {post.description && (
                  <p className="text-sm opacity-80 leading-relaxed">
                    {post.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-4 justify-center mt-6 flex-wrap">
          <a 
            href="https://www.wiredchaos.xyz/blog" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="vault-btn"
          >
            View All Posts ↗
          </a>
          <button 
            className="vault-btn btn-red" 
            onClick={() => window.location.reload()}
          >
            Refresh Feed
          </button>
        </div>
      </div>

      {/* RSS Integration Info */}
      <div className="vault-holo-card accent-purple mt-6">
        <h4 className="vault-purple-glow mb-3">🔗 Feed Integration</h4>
        <p className="mb-4 opacity-80">
          Direct RSS integration with WIRED CHAOS blog network. Auto-refreshes on page load with 10-minute cache.
        </p>
        <div className="flex gap-3 flex-wrap">
          <a 
            href="https://www.wiredchaos.xyz/post/from-free-mint-to-joe-rogan-how-doginal-dogs-took-over-crypto-and-netflix" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="vault-btn btn-purple"
          >
            📰 Joe Rogan Feature
          </a>
          <a 
            href="https://www.wiredchaos.xyz/post/doginal-dogs-ddnyc-takeover-crypto-tech-web3-culture" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="vault-btn btn-purple"
          >  
            📰 DDNYC Takeover
          </a>
        </div>
      </div>

      <button onClick={() => navigate('/')} className="back-btn mt-6">
        ← Back to Motherboard
      </button>
    </div>
  );
};

// Vault33 - WL Gamification Page
const Vault33Page = () => {
  const navigate = useNavigate();

  return (
    <div className="agent-container">
      <div className="agent-header">
        <h2>🔐 VAULT33</h2>
        <p>WL Gamification • Merovingian Path Tracking</p>
      </div>
      
      {/* Import and render VaultDashboard */}
      <VaultDashboardWrapper />
      
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Motherboard
      </button>
    </div>
  );
};

// Wrapper component to handle dynamic import
const VaultDashboardWrapper = () => {
  const [VaultDashboard, setVaultDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { VaultDashboard: Dashboard } = await import('./components/VaultUI');
        setVaultDashboard(() => Dashboard);
      } catch (error) {
        console.error('Failed to load VaultDashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="vault-loading">
        <div className="vault-spinner"></div>
        <p className="vault-cyan-outline">Loading VAULT33 Dashboard...</p>
      </div>
    );
  }

  if (!VaultDashboard) {
    return (
      <div className="vault-holo-card accent-red">
        <h3 className="vault-red-core">Dashboard Unavailable</h3>
        <p>The VAULT33 dashboard could not be loaded. Please try refreshing the page.</p>
      </div>
    );
  }

  return <VaultDashboard userId="demo_user" />;
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
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const response = await axios.post(`${API}/referral/submit`, {
        name: payload.name,
        email: payload.email,
        service_interest: payload.need || 'B2B Inquiry',
        source_agent: 'b2b_professional',
        company: payload.company,
        budget: payload.budget,
        timeline: payload.timeline
      });
      
      if (response.data) {
        alert('Thanks! NEURO received your request.');
        e.target.reset();
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
    Layer1: 333,
    Layer2: 333,
    Layer3: 333,
    Layer4: 333,
    Layer5: 333,
    Layer6: 333,
    Layer7: 333,
    Layer8: 333,
    Layer9: 333
  });
  const [echoes, setEchoes] = useState(0);
  const [burnMsg, setBurnMsg] = useState('');
  const [isWarn, setIsWarn] = useState(false);

  const EchoCap = 3933;
  const embed = {
    layerOrigin: "Vault33 Access Key",
    archetype: "Frequency Keeper", 
    frequencyCode: "33.3",
    factions: ["Barbed Wired Broadcast", "33.3 FM", "NEURO Lab", "Merovingian Strand"],
    supply: {...supply},
    echoCap: EchoCap
  };

  const echoSpawnSummary = {
    layers: 9,
    perLayer: 333,
    totalSupply: 3933,
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

  const totalSupply = supply.Layer1 + supply.Layer2 + supply.Layer3 + supply.Layer4 + supply.Layer5 + supply.Layer6 + supply.Layer7 + supply.Layer8 + supply.Layer9;

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
            <h3>Access-Key Supply (9 Layers)</h3>
            <div className="vrg-row">
              <span className="vrg-badge">Layer 1: <span className="vrg-stat">{supply.Layer1}</span></span>
              <span className="vrg-badge">Layer 2: <span className="vrg-stat">{supply.Layer2}</span></span>
              <span className="vrg-badge">Layer 3: <span className="vrg-stat">{supply.Layer3}</span></span>
            </div>
            <div className="vrg-row">
              <span className="vrg-badge">Layer 4: <span className="vrg-stat">{supply.Layer4}</span></span>
              <span className="vrg-badge">Layer 5: <span className="vrg-stat">{supply.Layer5}</span></span>
              <span className="vrg-badge">Layer 6: <span className="vrg-stat">{supply.Layer6}</span></span>
            </div>
            <div className="vrg-row">
              <span className="vrg-badge">Layer 7: <span className="vrg-stat">{supply.Layer7}</span></span>
              <span className="vrg-badge">Layer 8: <span className="vrg-stat">{supply.Layer8}</span></span>
              <span className="vrg-badge">Layer 9: <span className="vrg-stat">{supply.Layer9}</span></span>
            </div>
            <div className="vrg-divider"></div>
            <div className="vrg-row vrg-tiny">
              <span className="vrg-pill">Total Keys: <b>{totalSupply}</b></span>
              <span className="vrg-pill">Total Echo Cap: <b>3,933</b></span>
              <span className="vrg-pill">Frequency Code: <b>33.3</b></span>
            </div>
          </div>

          <div className="vrg-card">
            <h3>Burn → Echo (Demo)</h3>
            <p className="vrg-tiny">
              In VRG-33-589, a burn splits the frequency: <b>+1 Rare Echo</b> and <b>+2 Super Rare Echoes</b>.
            </p>
            <div className="vrg-row">
              <button className="vrg-btn" onClick={() => demoBurn('Layer1')}>Burn Layer 1</button>
              <button className="vrg-btn" onClick={() => demoBurn('Layer2')}>Burn Layer 2</button>
              <button className="vrg-btn" onClick={() => demoBurn('Layer3')}>Burn Layer 3</button>
            </div>
            <div className="vrg-row">
              <button className="vrg-btn" onClick={() => demoBurn('Layer4')}>Burn Layer 4</button>
              <button className="vrg-btn" onClick={() => demoBurn('Layer5')}>Burn Layer 5</button>
              <button className="vrg-btn" onClick={() => demoBurn('Layer6')}>Burn Layer 6</button>
            </div>
            <div className="vrg-row">
              <button className="vrg-btn" onClick={() => demoBurn('Layer7')}>Burn Layer 7</button>
              <button className="vrg-btn" onClick={() => demoBurn('Layer8')}>Burn Layer 8</button>
              <button className="vrg-btn" onClick={() => demoBurn('Layer9')}>Burn Layer 9</button>
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
            9 Layers = frequency resonance (333 each). Layer 1-3 = whispers. Layer 4-6 = frequency carriers. Layer 7-9 = Merovingian sparks.
            A burn in VRG-33-589 is a frequency split → +1 Rare Echo +2 Super Rare Echoes. Max echo archive = 3,933 across 9 layers × 4 factions.
          </div>
        </details>
      </div>
    </div>
  );
};

// Merch Hub - WIRED CHAOS & BEASTCOAST
const MerchPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page merch-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      </div>
      
      {/* WIRED CHAOS Merch */}
      <div className="hub wc-hub">
        <h1>WIRED CHAOS MERCH 🧠</h1>
        <div className="sub">Stealth apparel • barbed-wire minimalism • glitch couture</div>
        
        <div className="grid">
          <div className="item">
            <div className="item-image">🧥</div>
            <h3>Barbed Wire Hoodie</h3>
            <p>Neon cyan embroidery • black base</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
          <div className="item">
            <div className="item-image">🧥</div>
            <h3>Cropped Trench</h3>
            <p>Cybernetic cut • motherboard accents</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
          <div className="item">
            <div className="item-image">👕</div>
            <h3>Neural Network Tee</h3>
            <p>Binary pattern • soft cotton blend</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
          <div className="item">
            <div className="item-image">👟</div>
            <h3>Cyber Sneakers</h3>
            <p>LED accents • future tech sole</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
        </div>
      </div>

      {/* BEASTCOAST Merch */}
      <div className="hub bc-hub">
        <h1>BEASTCOAST MERCH 🐉</h1>
        <div className="sub">Leather fits • purple + orange alt colorways • street x cyber couture</div>
        
        <div className="grid">
          <div className="item">
            <div className="item-image">🧥</div>
            <h3>Purple Leather Jacket</h3>
            <p>Beastcoast sigil patch • limited drop</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
          <div className="item">
            <div className="item-image">🥾</div>
            <h3>Combat Boots</h3>
            <p>Orange highlight stitching • heavy sole</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
          <div className="item">
            <div className="item-image">👕</div>
            <h3>Dragon Tee</h3>
            <p>Purple gradient • beast mode design</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
          <div className="item">
            <div className="item-image">🎒</div>
            <h3>Street Backpack</h3>
            <p>Orange details • urban tactical</p>
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>Shop Now</a>
          </div>
        </div>
      </div>
    </div>
  );
};
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
            <a href="https://www.doginaldogs.com/" target="_blank" rel="noopener noreferrer">
              DoginalDogs.com - NFT Collections
            </a>
            <a href="https://cryptospaces.net" target="_blank" rel="noopener noreferrer">
              CryptoSpaces.net - Live Community
            </a>
            <a href="https://wiredchaos.xyz" target="_blank" rel="noopener noreferrer">
              WiredChaos.xyz - Digital Ecosystem
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
          <Route path="/" element={
            FEATURES.motherboardUI && !featureFlags.useLegacyHub ? 
              <React.Suspense fallback={<div className="loading-spinner"><div className="spinner"></div><p>Loading WIRED CHAOS...</p></div>}>
                <Motherboard />
              </React.Suspense>
            : featureFlags.useLegacyHub ? 
              <MotherboardHubLegacy /> 
            : <MotherboardHub />
          } />
          <Route path="/csn" element={<CSNPage />} />
          <Route path="/fm333" element={<FM333Page />} />
          <Route path="/eveningvibes" element={<EveningVibesPage />} />
          <Route path="/neurolab" element={<NeuroLabPage />} />
          <Route path="/bwb" element={<BWBPage />} />
          <Route path="/vault33" element={<Vault33Page />} />
          <Route path="/b2b" element={<B2BPage />} />
          <Route path="/vrg33589" element={<VRG33589Page />} />
          <Route path="/merch" element={<MerchPage />} />
          
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