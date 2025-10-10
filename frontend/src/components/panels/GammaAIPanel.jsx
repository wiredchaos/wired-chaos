export default function GammaAIPanel({ tenant = 'business' }) {
  return (
    <div className="gamma-ai-panel motherboard-panel" style={{ borderColor: '#00FFFF' }}>
      <h2 style={{ color: '#00FFFF' }}>GAMMA-Ω AI</h2>
      <div className="tenant-mode">Tenant: {tenant.toUpperCase()}</div>
      <div className="panel-content">
        <p>Executive Intelligence Node. Orchestrates all signal flow and narrative.</p>
        <ul>
          <li>Live deck generation</li>
          <li>Status: <span style={{ color: '#39FF14' }}>Online</span></li>
          <li>Feeds: business/school</li>
        </ul>
      </div>
    </div>
  );
}
