// Placeholder for SLOBadgeEnhanced component
// Will be updated to display policy violation keys

const SLOBadgeEnhanced = ({ status = "green", violations = [] }) => (
  <div className={`slo-badge slo-badge-${status}`}>
    <span className="slo-badge-label">SLO Health</span>
    <span className="slo-badge-status">{status.toUpperCase()}</span>
    {violations.length > 0 && (
      <div className="slo-badge-violations">
        {violations.map((v, i) => (
          <span key={i} className={`slo-badge-violation${v.critical ? " critical" : ""}`}>
            {v.route} <b>{v.key}</b>
          </span>
        ))}
      </div>
    )}
  </div>
);

export default SLOBadgeEnhanced;
