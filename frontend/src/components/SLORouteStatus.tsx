// Placeholder for SLORouteStatus component
// Will be updated to display policy violation keys and details

const SLORouteStatus = ({ routes = [] }) => (
  <table className="slo-route-status-table">
    <thead>
      <tr>
        <th>Route</th>
        <th>Status</th>
        <th>Violations</th>
      </tr>
    </thead>
    <tbody>
      {routes.map((route, i) => (
        <tr key={i} className={route.critical ? "critical" : ""}>
          <td>{route.route}</td>
          <td>{route.status}</td>
          <td>
            {route.violations && route.violations.length > 0 ? (
              route.violations.map((v, j) => (
                <span key={j} className="slo-violation-chip">
                  <b>{v.key}</b>: {v.value} (max {v.threshold})
                </span>
              ))
            ) : (
              <span className="slo-violation-chip healthy">None</span>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default SLORouteStatus;
