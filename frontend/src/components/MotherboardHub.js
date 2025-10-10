// MotherboardHub.js - Demo-ready 6-node panel config

import GammaAIPanel from './panels/GammaAIPanel';
import NotionNodePanel from './panels/NotionNodePanel';
import WixNodePanel from './panels/WixNodePanel';
import ZapierNodePanel from './panels/ZapierNodePanel';

// Placeholder panel components for Cloudflare and VS Code
function CloudflareCopilotPanel() {
  return (
    <div className="cloudflare-copilot-panel motherboard-panel" style={{ borderColor: '#00FFFF' }}>
      <h2 style={{ color: '#00FFFF' }}>Cloudflare Copilot</h2>
      <div className="panel-content">Edge Sentinel. Global perimeter, firewall, and analytics.</div>
    </div>
  );
}

function VSCodeNodePanel() {
  return (
    <div className="vscode-node-panel motherboard-panel" style={{ borderColor: '#FF3131' }}>
      <h2 style={{ color: '#FF3131' }}>VS Code Node</h2>
      <div className="panel-content">Neural Forge. Developer core, code authoring, and SWARM sync.</div>
    </div>
  );
}

const PANEL_CONFIGS = {
  gamma: { component: GammaAIPanel, title: 'GAMMA-Ω', color: '#00FFFF' },
  notion: { component: NotionNodePanel, title: 'NOTION NODE', color: '#39FF14' },
  zapier: { component: ZapierNodePanel, title: 'ZAPIER NODE', color: '#FF3131' },
  wix: { component: WixNodePanel, title: 'WIX NODE', color: '#FF00FF' },
  cloudflare: { component: CloudflareCopilotPanel, title: 'CLOUDFLARE COPILOT', color: '#00FFFF' },
  vscode: { component: VSCodeNodePanel, title: 'VS CODE NODE', color: '#FF3131' }
};

export default function MotherboardHub({ tenant = 'business' }) {
  return (
    <div className="motherboard-hub">
      <h1>WIRED CHAOS Motherboard Hub</h1>
      <div className="panel-grid">
        {Object.entries(PANEL_CONFIGS).map(([key, cfg]) => {
          const Panel = cfg.component;
          return (
            <div key={key} className="panel-wrapper" style={{ borderColor: cfg.color }}>
              <Panel tenant={tenant} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
