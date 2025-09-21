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
      name: 'CSN',
      icon: '📡',
      title: 'Crypto Spaces Network',
      description: '33.3FM Live Radio',
      position: { top: '15%', left: '25%' },
      route: '/csn'
    },
    {
      id: 'neuro',
      name: 'NEUROLAB',
      icon: '🧠⛓️',
      title: 'AI Academy',
      description: 'Education Hub',
      position: { top: '15%', right: '25%' },
      route: '/neurolab'
    },
    {
      id: 'bwb',
      name: 'BWB',
      icon: '📰',
      title: 'Digital Motherboard',
      description: 'RSS → AI Pipeline',
      position: { top: '50%', left: '15%' },
      route: '/bwb'
    },
    {
      id: 'vault33',
      name: 'VRG33589',
      icon: '🔐',
      title: 'University',
      description: 'Lore & Gamification',
      position: { top: '50%', right: '15%' },
      route: '/vrg33589'
    },
    {
      id: 'b2b',
      name: 'CONTACT',
      icon: '💼',
      title: 'NEURO Intake',
      description: 'Professional Hub',
      position: { bottom: '15%', left: '25%' },
      route: '/contact'
    },
    {
      id: 'vrg',
      name: 'TINFOIL',
      icon: '👁️',
      title: 'Community Bot',
      description: 'Conspiracy Hub',
      position: { bottom: '15%', right: '25%' },
      route: '/tinfoil'
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
            <div className="node-name">{agent.name}</div>
            <div className="node-description">{agent.description}</div>
            <div className="node-glow"></div>
          </div>
        </Card>
      ))}

      {/* Footer Info */}
      <div className="footer-info">
        <p>Select an agent to enter the network</p>
      </div>
    </div>
  );
};

// CSN - Crypto Spaces Network Page
const CSNPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page csn-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📡 CRYPTO SPACES NETWORK</h1>
        <p>Live radio + onboarding hub at 33.3FM DOGECHAIN</p>
      </div>
      
      <div className="hero-section">
        <h2>Community is Utility</h2>
      </div>
      
      <div className="streaming-section">
        <Card className="stream-player">
          <h3>🔴 LIVE ON 33.3FM</h3>
          <div className="player-embed">
            <div className="radio-display">
              <div className="frequency">33.3 FM</div>
              <div className="station">DOGECHAIN</div>
            </div>
            <p>🎵 Broadcasting Live</p>
            <p>Listen: @cryptospacesnet</p>
            <div className="stream-controls">
              <Button className="listen-btn">🎧 Join Live Stream</Button>
            </div>
          </div>
        </Card>
        
        <Card className="stream-info">
          <h3>📡 NETWORK STATUS</h3>
          <div className="status-indicators">
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Broadcasting Live</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Community Active</span>
            </div>
            <div className="status-item">
              <span className="status-dot active"></span>
              <span>Onboarding Open</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="cta-section">
        <Button 
          onClick={() => window.open('https://cryptospaces.net', '_blank')} 
          className="external-cta"
        >
          Join us live → cryptospaces.net
        </Button>
      </div>
    </div>
  );
};

// NEUROLAB AI Academy Page
const NeuroLabPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page neuro-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🧠⛓️ NEUROLAB AI ACADEMY</h1>
        <p>AI Education without the jargon</p>
      </div>
      
      <div className="hero-section">
        <h2>Front-facing education: AI for Kids, SMB training, Coding Bootcamp</h2>
      </div>
      
      <div className="education-grid">
        <Card className="education-card">
          <div className="card-icon">👶</div>
          <h3>AI for Kids</h3>
          <p>Safe playful intros to artificial intelligence</p>
          <Button className="course-btn">Explore Course</Button>
        </Card>
        
        <Card className="education-card">
          <div className="card-icon">🏢</div>
          <h3>AI for Local Business</h3>
          <p>Group training sessions for small-medium businesses</p>
          <Button className="course-btn">Book Training</Button>
        </Card>
        
        <Card className="education-card">
          <div className="card-icon">💻</div>
          <h3>Coding Plus Bootcamp</h3>
          <p>5 comprehensive modules covering modern development</p>
          <Button className="course-btn">Start Bootcamp</Button>
        </Card>
        
        <Card className="education-card">
          <div className="card-icon">🎯</div>
          <h3>Strength Mapping</h3>
          <p>AI-powered assessment of your skills and potential</p>
          <Button className="course-btn">Take Assessment</Button>
        </Card>
      </div>

      <div className="cta-section">
        <Button onClick={() => navigate('/contact')} className="cta-btn">
          Contact NEURO for Training 🧠
        </Button>
      </div>
    </div>
  );
};

// BWB - Digital Motherboard Tools Page
const BWBPage = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page bwb-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📰 DIGITAL MOTHERBOARD</h1>
        <p>Live feeds in, prompts out — RSS → FreshRSS → briefs → X blasts</p>
      </div>
      
      <div className="hero-section">
        <h2>Build your AI-powered RSS pipeline</h2>
      </div>

      <div className="tools-grid">
        <Card className="tool-card">
          <div className="card-icon">📡</div>
          <h3>RSS Aggregator</h3>
          <p>Collect feeds from multiple sources automatically</p>
          <Button className="tool-btn">Setup Feeds</Button>
        </Card>
        
        <Card className="tool-card">
          <div className="card-icon">🤖</div>
          <h3>AI Brief Generator</h3>
          <p>Transform RSS content into digestible summaries</p>
          <Button className="tool-btn">Generate Briefs</Button>
        </Card>
        
        <Card className="tool-card">
          <div className="card-icon">🚀</div>
          <h3>Social Blaster</h3>
          <p>Automated posting to X and other platforms</p>
          <Button className="tool-btn">Configure Posts</Button>
        </Card>
      </div>

      <div className="pipeline-section">
        <Card className="pipeline-card">
          <h3>📊 Current Pipeline Status</h3>
          <div className="pipeline-flow">
            <div className="flow-step">RSS Feeds <span className="arrow">→</span></div>
            <div className="flow-step">FreshRSS <span className="arrow">→</span></div>
            <div className="flow-step">AI Processing <span className="arrow">→</span></div>
            <div className="flow-step">Social Blast</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// VRG33589 University Page
const VRG33589Page = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page vrg-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🔐 WIRED CHAOS UNIVERSITY — VRG33589</h1>
        <p>Decode the Gamma Vault. Choose your path. Earn whitelist rewards.</p>
      </div>
      
      <div className="hero-section">
        <h2>VRG33589 is the lore vault of WIRED CHAOS</h2>
      </div>

      <div className="paths-grid">
        <Card className="path-card cipher">
          <div className="path-icon">🔢</div>
          <h3>Cipher Path</h3>
          <p>Decode 589 loops and Fibonacci codes</p>
          <Button className="path-btn">Enter Path</Button>
        </Card>
        
        <Card className="path-card chronicle">
          <div className="path-icon">📚</div>
          <h3>Chronicle Path</h3>
          <p>XRPL history, tinfoil timelines</p>
          <Button className="path-btn">Enter Path</Button>
        </Card>
        
        <Card className="path-card vault">
          <div className="path-icon">🏛️</div>
          <h3>Vault Path</h3>
          <p>NFT burns and Akashic puzzles</p>
          <Button className="path-btn">Enter Path</Button>
        </Card>
        
        <Card className="path-card signal">
          <div className="path-icon">📶</div>
          <h3>Signal Path</h3>
          <p>Whitelist gamification + engagement</p>
          <Button className="path-btn">Enter Path</Button>
        </Card>
      </div>

      <div className="vault-section">
        <Card className="gamma-vault">
          <h3>🔮 Access the Gamma Vault</h3>
          <p>589 Akashic essays tied into XRPL NFT lore</p>
          <div className="vault-stats">
            <div className="stat">
              <span className="stat-number">589</span>
              <span className="stat-label">Essays</span>
            </div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Theories</span>
            </div>
            <div className="stat">
              <span className="stat-number">33</span>
              <span className="stat-label">Paths</span>
            </div>
          </div>
          <Button className="vault-btn">🚀 Enter Gamma Vault</Button>
        </Card>
      </div>
    </div>
  );
};

// Contact/B2B Page
const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="agent-page contact-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>💼 CONTACT NEURO</h1>
        <p>All inquiries go through NEURO</p>
      </div>

      <div className="contact-section">
        <Card className="contact-form-card">
          <h3>📋 NEURO Intake System</h3>
          <p>Professional inquiries, partnerships, and service requests</p>
          
          <form onSubmit={handleSubmit} className="contact-form">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="form-input"
              required
            />
            
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="form-input"
              required
            />
            
            <select
              value={formData.service}
              onChange={(e) => setFormData({...formData, service: e.target.value})}
              className="form-select"
              required
            >
              <option value="">Select Service Interest</option>
              <option value="ai-training">AI Training</option>
              <option value="rss-automation">RSS Automation</option>
              <option value="content-creation">Content Creation</option>
              <option value="consultation">Business Consultation</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
            
            <textarea
              placeholder="Tell us about your project or inquiry..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="form-textarea"
              rows="4"
              required
            ></textarea>
            
            <Button type="submit" className="submit-btn">
              Submit to NEURO 🧠
            </Button>
          </form>
          
          <div className="contact-note">
            <p><strong>Note:</strong> No Shibo contact. All requests routed to NEURO.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Tinfoil Community Bot Page
const TinfoilPage = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page tinfoil-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>👁️ TINFOIL COMMUNITY</h1>
        <p>RSS → AI text-to-video with robotic voice</p>
      </div>
      
      <div className="hero-section">
        <h2>Conspiracy theories meet AI automation</h2>
      </div>

      <div className="tinfoil-grid">
        <Card className="tinfoil-card">
          <div className="card-icon">🤖</div>
          <h3>AI Video Generator</h3>
          <p>Transform RSS feeds into conspiracy theory videos</p>
          <Button className="tinfoil-btn">Generate Video</Button>
        </Card>
        
        <Card className="tinfoil-card">
          <div className="card-icon">🎙️</div>
          <h3>Robotic Voice</h3>
          <p>Text-to-speech with that classic conspiracy vibe</p>
          <Button className="tinfoil-btn">Voice Settings</Button>
        </Card>
        
        <Card className="tinfoil-card">
          <div className="card-icon">📡</div>
          <h3>RSS Scanner</h3>
          <p>Monitor feeds for conspiracy-worthy content</p>
          <Button className="tinfoil-btn">Setup Scanner</Button>
        </Card>
      </div>

      <div className="community-section">
        <Card className="community-card">
          <h3>👥 Community Hub</h3>
          <p>Join fellow truth seekers in the tinfoil network</p>
          <div className="community-stats">
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Theories</span>
            </div>
            <div className="stat">
              <span className="stat-number">589</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat">
              <span className="stat-number">33</span>
              <span className="stat-label">Videos/Day</span>
            </div>
          </div>
          <Button className="community-btn">Join Community</Button>
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
          <Route path="/vrg33589" element={<VRG33589Page />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/tinfoil" element={<TinfoilPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;