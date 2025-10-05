// Placeholder for SLOStatusCard component
// Will be updated to display policy violation keys in summary

const SLOStatusCard = ({ status = "green", summary = "", violations = [] }) => (
  <div className={`slo-status-card slo-status-${status}`}>
    <div className="slo-status-header">
      <span className="slo-status-label">SLO Health</span>
      <span className="slo-status-state">{status.toUpperCase()}</span>
    </div>
    <div className="slo-status-summary">{summary}</div>
    {violations.length > 0 && (
      <div className="slo-status-violations">
        {violations.map((v, i) => (
          <span key={i} className={`slo-status-violation${v.critical ? " critical" : ""}`}>
            {v.route} <b>{v.key}</b>
          </span>
        ))}
      </div>
    )}
  </div>
);

export default SLOStatusCard;
