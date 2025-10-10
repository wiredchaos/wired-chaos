export default function ZapierNodePanel({ tenant = 'business' }) {
  return (
    <div className="zapier-node-panel motherboard-panel" style={{ borderColor: '#FF3131' }}>
      <h2 style={{ color: '#FF3131' }}>Zapier Node</h2>
      <div className="tenant-mode">Tenant: {tenant.toUpperCase()}</div>
      <div className="panel-content">
        <p>Automation Conduit. All events, deploys, and updates routed and logged with zero touch.</p>
        <ul>
          <li>CI/CD Zaps, Status relay</li>
          <li>Swarm Event Routing</li>
        </ul>
      </div>
    </div>
  );
}
