import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main Motherboard Hub Component
const MotherboardHub = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);

  const agents = [
    {
      id: 'csn',
      name: 'CRYPTO SPACES NET',
      icon: '📡',
      title: 'CSN',
      description: 'Live Stream Hub',
      position: { top: '10%', left: '20%' },
      route: '/csn'
    },
    {
      id: 'neurolab',
      name: 'NEURO LAB',
      icon: '🧠',
      title: 'NEURO LAB',
      description: 'AI Content Hub',
      position: { top: '10%', right: '20%' },
      route: '/neurolab'
    },
    {
      id: 'bwb',
      name: 'BARBED WIRED BROADCAST',
      icon: '📰',
      title: 'BWB',
      description: 'Newsletter & RSS',
      position: { top: '35%', left: '10%' },
      route: '/bwb'
    },
    {
      id: 'vault33',
      name: 'VAULT 33',
      icon: '🔐',
      title: 'VAULT 33',
      description: 'Quest System',
      position: { top: '35%', right: '10%' },
      route: '/vault33'
    },
    {
      id: 'b2b',
      name: 'B2B / PROFESSIONAL',
      icon: '💼',
      title: 'B2B',
      description: 'Business Intake',
      position: { bottom: '20%', left: '15%' },
      route: '/b2b'
    },
    {
      id: 'vrg33589',
      name: 'VRG-33-589',
      icon: '👁️',
      title: 'VRG-33-589',
      description: 'AKASHIC Bot',
      position: { bottom: '20%', right: '15%' },
      route: '/vrg33589'
    },
    {
      id: 'groups',
      name: 'GROUPS',
      icon: '👥',
      title: 'GROUPS',
      description: 'Community Links',
      position: { bottom: '10%', left: '30%' },
      route: '/groups'
    },
    {
      id: 'merch',
      name: 'MERCH',
      icon: '🛍️',
      title: 'MERCH',
      description: 'Store & Gear',
      position: { bottom: '10%', right: '30%' },
      route: '/merch'
    }
  ];

  const handleNodeClick = (route) => {
    navigate(route);
  };

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
    </div>
  );
};

// CSN - Crypto Spaces Net Page
const CSNPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page csn-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📡 CRYPTO SPACES NET</h1>
        <p>Live Stream & Community Hub</p>
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
        
        {/* Spotify Embed */}
        <Card className="widget-card spotify-widget">
          <h3>🎵 PODCAST</h3>
          <div className="iframe-container">
            <iframe
              src="https://open.spotify.com/embed/show/4rOoJ6Egrf8K2IrywzwOMk"
              width="100%"
              height="232"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
            ></iframe>
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
        <p>AI Content & Social Hub</p>
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
        

        
        {/* RSS Feed Widget */}
        <Card className="widget-card rss-widget">
          <h3>📡 CONTENT FEED</h3>
          <div className="feed-container">
            <div className="feed-item">
              <span className="feed-date">Latest</span>
              <span className="feed-title">AI Content Generation Pipeline</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">Recent</span>
              <span className="feed-title">Neural Network Training Updates</span>
            </div>
            <div className="feed-item">
              <span className="feed-date">Archive</span>
              <span className="feed-title">Machine Learning Best Practices</span>
            </div>
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

// Vault 33 Quest System
const Vault33Page = () => {
  const navigate = useNavigate();
  const [currentLayer, setCurrentLayer] = useState(1);
  
  return (
    <div className="agent-page vault33-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🔐 VAULT 33</h1>
        <p>Merovingian Sigil Quest System</p>
      </div>
      
      <div className="quest-system">
        <Card className="quest-widget">
          <h3>🎮 QUEST LAYERS</h3>
          <div className="layer-progress">
            <div className="layer-indicator">
              Layer {currentLayer} / 9
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${(currentLayer / 9) * 100}%`}}
              ></div>
            </div>
          </div>
          
          <div className="quest-content">
            <h4>🔍 Current Challenge</h4>
            <p>Decode the Merovingian Sigil fragments hidden in the digital matrix.</p>
            
            <div className="sigil-fragment">
              <div className="sigil-display">
                {/* Placeholder for sigil visualization */}
                <div className="sigil-symbols">⧨ ⟐ ◊ ⟢ ▣</div>
              </div>
            </div>
            
            <div className="quest-actions">
              <Button 
                onClick={() => setCurrentLayer(Math.min(9, currentLayer + 1))}
                className="quest-btn"
                disabled={currentLayer >= 9}
              >
                Advance Layer
              </Button>
              <Button 
                onClick={() => setCurrentLayer(1)}
                className="reset-btn"
              >
                Reset Quest
              </Button>
            </div>
          </div>
        </Card>
        
        <Card className="vault-stats">
          <h3>📊 VAULT STATUS</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-value">33</span>
              <span className="stat-label">Sealed Vaults</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{currentLayer}</span>
              <span className="stat-label">Current Layer</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">∞</span>
              <span className="stat-label">Possibilities</span>
            </div>
          </div>
        </Card>
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
        <p>Business & Enterprise Solutions</p>
      </div>
      
      <div className="widget-grid">
        <Card className="widget-card intake-widget">
          <h3>📋 PROFESSIONAL INTAKE</h3>
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
              Submit Professional Inquiry
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

// VRG-33-589 AKASHIC Bot Page
const VRG33589Page = () => {
  const navigate = useNavigate();
  const [botStatus, setBotStatus] = useState('active');
  
  return (
    <div className="agent-page vrg-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>👁️ VRG-33-589</h1>
        <p>AKASHIC-589 Intelligence Bot</p>
      </div>
      
      <div className="bot-interface">
        <Card className="bot-widget">
          <h3>🤖 AKASHIC-589 STATUS</h3>
          <div className="bot-status">
            <span className={`status-indicator ${botStatus}`}></span>
            <span className="status-text">Bot Status: {botStatus.toUpperCase()}</span>
          </div>
          
          <div className="bot-skills">
            <h4>🧠 Bot Capabilities</h4>
            <div className="skill-list">
              <div className="skill-item">
                <span className="skill-icon">📡</span>
                <span className="skill-name">RSS → Summary</span>
                <span className="skill-status">✅ Active</span>
              </div>
              <div className="skill-item">
                <span className="skill-icon">🎤</span>
                <span className="skill-name">TTS → Video</span>
                <span className="skill-status">✅ Active</span>
              </div>
            </div>
          </div>
          
          <div className="bot-actions">
            <Button className="bot-action-btn">Generate Summary</Button>
            <Button className="bot-action-btn">Create Video</Button>
            <Button className="bot-action-btn">View Archives</Button>
          </div>
        </Card>
        
        <Card className="akashic-feed">
          <h3>📜 AKASHIC RECORDS</h3>
          <div className="record-list">
            <div className="record-item">
              <span className="record-timestamp">15:33:59</span>
              <span className="record-content">RSS feed processed: 42 articles summarized</span>
            </div>
            <div className="record-item">
              <span className="record-timestamp">15:30:12</span>
              <span className="record-content">TTS video generated: "Crypto Market Analysis"</span>
            </div>
            <div className="record-item">
              <span className="record-timestamp">15:25:44</span>
              <span className="record-content">AKASHIC pattern detected in data stream</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Groups Page
const GroupsPage = () => {
  const navigate = useNavigate();
  
  const groups = [
    { label: "Wired Chaos Group", href: "https://t.me/wiredchaos", members: "1.2K" },
    { label: "VRG-33-589 Group", href: "https://t.me/vrg33589", members: "589" },
    { label: "B2B / Professional", href: "/b2b", members: "Internal" }
  ];
  
  return (
    <div className="agent-page groups-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>👥 GROUPS</h1>
        <p>Community & Professional Networks</p>
      </div>
      
      <div className="groups-grid">
        {groups.map((group, index) => (
          <Card key={index} className="group-card">
            <h3>{group.label}</h3>
            <div className="group-stats">
              <span className="member-count">{group.members} members</span>
            </div>
            <Button 
              onClick={() => group.href.startsWith('http') ? 
                window.open(group.href, '_blank') : 
                navigate(group.href)
              }
              className="join-btn"
            >
              {group.href.startsWith('http') ? 'Join Group' : 'Access Hub'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Merch Page
const MerchPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page merch-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🛍️ MERCH</h1>
        <p>WIRED CHAOS Store & Gear</p>
      </div>
      
      <div className="merch-grid">
        <Card className="merch-card">
          <div className="merch-image">🧠</div>
          <h3>WIRED CHAOS Brain Tee</h3>
          <p className="merch-price">$33.00</p>
          <Button className="buy-btn">Add to Cart</Button>
        </Card>
        
        <Card className="merch-card">
          <div className="merch-image">👁️</div>
          <h3>VRG-33-589 Hoodie</h3>
          <p className="merch-price">$89.00</p>
          <Button className="buy-btn">Add to Cart</Button>
        </Card>
        
        <Card className="merch-card">
          <div className="merch-image">📡</div>
          <h3>CSN Radio Pin</h3>
          <p className="merch-price">$15.00</p>
          <Button className="buy-btn">Add to Cart</Button>
        </Card>
        
        <Card className="merch-card">
          <div className="merch-image">🔐</div>
          <h3>VAULT 33 Keychain</h3>
          <p className="merch-price">$25.00</p>
          <Button className="buy-btn">Add to Cart</Button>
        </Card>
      </div>
    </div>
  );
};

// Signal Ghost Hub (SEO)
const SignalPage = () => {
  const navigate = useNavigate();
  
  const industries = [
    "Finance", "Gaming", "Music", "Fashion", "Real Estate", 
    "Healthcare", "Education", "Technology", "Marketing", "Legal",
    "Manufacturing", "Retail", "Entertainment", "Transportation", "Energy"
  ];
  
  return (
    <div className="agent-page signal-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📡 SIGNAL</h1>
        <p>Industry Solutions Hub</p>
      </div>
      
      <div className="industry-grid">
        {industries.map((industry, index) => (
          <Card key={index} className="industry-card">
            <h3>Industry: {industry}</h3>
            <p>Specialized solutions for {industry.toLowerCase()} sector</p>
            <Button 
              onClick={() => navigate(`/industry/${industry.toLowerCase()}`)}
              className="industry-btn"
            >
              Explore {industry}
            </Button>
          </Card>
        ))}
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
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/merch" element={<MerchPage />} />
          <Route path="/signal" element={<SignalPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;