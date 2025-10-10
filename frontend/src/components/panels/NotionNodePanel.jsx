export default function NotionNodePanel({ tenant = 'business' }) {
  return (
    <div className="notion-node-panel motherboard-panel" style={{ borderColor: '#39FF14' }}>
      <h2 style={{ color: '#39FF14' }}>Notion Node</h2>
      <div className="tenant-mode">Tenant: {tenant.toUpperCase()}</div>
      <div className="panel-content">
        <p>Mother Memory Core. All swarm intelligence, logs, and dashboards archived and live-synced here.</p>
        <ul>
          <li>Health View, Neural Wiki</li>
          <li>PR Queue, Cross-chain docs</li>
        </ul>
      </div>
    </div>
  );
}
