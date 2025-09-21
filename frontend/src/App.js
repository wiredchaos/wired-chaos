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
      title: 'Crypto Spaces Net',
      description: 'Streaming Hub',
      position: { top: '15%', left: '25%' },
      route: '/csn'
    },
    {
      id: 'neuro',
      name: 'NEURO LAB',
      icon: '🧠⛓️',
      title: 'Neuro Lab',
      description: 'Content Creation Hub',
      position: { top: '15%', right: '25%' },
      route: '/neuro-lab'
    },
    {
      id: 'bwb',
      name: 'BWB',
      icon: '📰',
      title: 'Barbed Wire Broadcast',
      description: 'News & RSS Automation',
      position: { top: '50%', left: '15%' },
      route: '/bwb'
    },
    {
      id: 'vault33',
      name: 'VAULT33',
      icon: '🔐',
      title: 'Vault 33',
      description: 'Gamification Quests',
      position: { top: '50%', right: '15%' },
      route: '/vault33'
    },
    {
      id: 'b2b',
      name: 'B2B HUB',
      icon: '💼',
      title: 'B2B Hub',
      description: 'Professional Intake',
      position: { bottom: '15%', left: '25%' },
      route: '/b2b'
    },
    {
      id: 'vrg',
      name: 'VRG-33-589',
      icon: '👁️',
      title: 'VRG-33-589',
      description: 'Tinfoil Community Bot',
      position: { bottom: '15%', right: '25%' },
      route: '/vrg'
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

// CSN Streaming Page
const CSNPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page csn-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>📡 CRYPTO SPACES NET</h1>
        <p>33.3 FM Digital Stream</p>
      </div>
      
      <div className="streaming-section">
        <Card className="stream-player">
          <h3>🔴 LIVE STREAM</h3>
          <div className="player-embed">
            <p>🎵 33.3 FM Broadcasting</p>
            <p>Listen daily on X: @cryptospacesnet</p>
            <p>Or visit: cryptospaces.net/</p>
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
              <span>RSS Feed Active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <Button onClick={() => navigate('/neuro-lab')} className="cta-btn">
          Connect with NEURO LAB 🧠⛓️
        </Button>
      </div>
    </div>
  );
};

// NEURO LAB Page
const NeuroLabPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="agent-page neuro-page">
      <div className="page-header">
        <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
        <h1>🧠⛓️ NEURO LAB</h1>
        <p>Content Creation & Social Integration Hub</p>
      </div>
      
      <div className="content-grid">
        <Card className="neuro-avatar">
          <img src="https://customer-assets.emergentagent.com/job_12016c5c-ea36-4ec1-9821-d285cb81d3ef/artifacts/hf8y8elb_IMG_4539.jpeg" alt="Neuro Avatar" className="avatar-img" />
          <h3>@neurometax</h3>
          <div className="social-stats">
            <span className="verified">✓ Verified</span>
          </div>
        </Card>
        
        <Card className="shibo-integration">
          <h3>🐕 SHIBO INTEGRATION</h3>
          <p>Connected AI personality system</p>
          <Button className="shibo-btn">Connect with Shibo</Button>
        </Card>
        
        <Card className="chirp-follow">
          <h3>🔔 CHIRP FOLLOW</h3>
          <p>Social media automation</p>
          <Button className="chirp-btn">Follow Updates</Button>
        </Card>
      </div>

      {/* Referral Intake Form */}
      <Card className="intake-form">
        <h3>📋 NEURO INTAKE SYSTEM</h3>
        <p>All leads funnel through here for tracking & monetization</p>
        <div className="form-fields">
          <input type="text" placeholder="Name" className="intake-input" />
          <input type="email" placeholder="Email" className="intake-input" />
          <select className="intake-select">
            <option>Select Service Interest</option>
            <option>Bark Integration</option>
            <option>Shibo Collaboration</option>
            <option>Content Creation</option>
            <option>Other</option>
          </select>
          <Button className="submit-btn">Submit to NEURO</Button>
        </div>
      </Card>
    </div>
  );
};

// Other Agent Pages (Placeholder for now)
const BWBPage = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page">
      <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      <h1>📰 BARBED WIRE BROADCAST</h1>
      <p>Newsletter & RSS Automation Coming Soon...</p>
    </div>
  );
};

const Vault33Page = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page">
      <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      <h1>🔐 VAULT 33</h1>
      <p>Gamification Quests Coming Soon...</p>
    </div>
  );
};

const B2BPage = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page">
      <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      <h1>💼 B2B HUB</h1>
      <p>Professional Intake & Referral Tracking Coming Soon...</p>
    </div>
  );
};

const VRGPage = () => {
  const navigate = useNavigate();
  return (
    <div className="agent-page">
      <Button onClick={() => navigate('/')} className="back-btn">← Back to Hub</Button>
      <h1>👁️ VRG-33-589</h1>
      <p>Tinfoil Community Bot Coming Soon...</p>
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
          <Route path="/neuro-lab" element={<NeuroLabPage />} />
          <Route path="/bwb" element={<BWBPage />} />
          <Route path="/vault33" element={<Vault33Page />} />
          <Route path="/b2b" element={<B2BPage />} />
          <Route path="/vrg" element={<VRGPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;