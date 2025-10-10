export default function WixNodePanel({ tenant = 'business' }) {
  return (
    <div className="wix-node-panel motherboard-panel" style={{ borderColor: '#FF00FF' }}>
      <h2 style={{ color: '#FF00FF' }}>Wix Node</h2>
      <div className="tenant-mode">Tenant: {tenant.toUpperCase()}</div>
      <div className="panel-content">
        <p>Holographic Gate. Public layer, live dashboards, and partner microsites in the motherboard aesthetic.</p>
        <ul>
          <li>Live Gamma dashboard</li>
          <li>Notion briefings, Product updates</li>
        </ul>
      </div>
    </div>
  );
}
