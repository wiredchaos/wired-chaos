// Enhanced SLO Badge API Endpoint
// Returns global and route-specific SLO status for dashboard consumption
import { NextApiRequest, NextApiResponse } from "next";

// Example: Replace with real data source or service
const SLO_POLICIES = {
  "/": { ada_min: 0.95, p95_delta_ms_max: 20, ttfb_var_pct_max: 3, critical: true },
  "/tax": { ada_min: 0.96, p95_delta_ms_max: 18, regress_pct: 25, critical: true },
  "/about": { ada_min: 0.93, p95_delta_ms_max: 25, ttfb_var_pct_max: 4, critical: false },
  // ...other routes
};

const ROUTE_METRICS = {
  "/": { ada: 0.97, p95: 18, ttfb_var: 2.1 },
  "/tax": { ada: 0.94, p95: 22, ttfb_var: 3.5 },
  "/about": { ada: 0.95, p95: 20, ttfb_var: 3.2 },
  // ...other routes
};

function evaluateRoute(route: string) {
  const policy = SLO_POLICIES[route];
  const metrics = ROUTE_METRICS[route];
  if (!policy || !metrics) return { healthy: false, policy_violation: true };
  const adaOk = metrics.ada >= policy.ada_min;
  const p95Ok = metrics.p95 <= policy.p95_delta_ms_max;
  const ttfbOk = metrics.ttfb_var <= (policy.ttfb_var_pct_max || 100);
  const healthy = adaOk && p95Ok && ttfbOk;
  return {
    healthy,
    policy_violation: !healthy,
    ada: metrics.ada,
    p95: metrics.p95,
    ttfb_var: metrics.ttfb_var,
    critical: policy.critical,
    adaOk,
    p95Ok,
    ttfbOk,
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const routes = Object.keys(SLO_POLICIES);
  let healthyCount = 0;
  let criticalViolation = false;
  let nonCriticalViolation = false;
  const routeStatus: Record<string, any> = {};
  routes.forEach((route) => {
    const status = evaluateRoute(route);
    routeStatus[route] = status;
    if (status.healthy) healthyCount++;
    if (status.policy_violation && status.critical) criticalViolation = true;
    if (status.policy_violation && !status.critical) nonCriticalViolation = true;
  });
  let badge = "green";
  if (criticalViolation) badge = "red";
  else if (nonCriticalViolation) badge = "yellow";
  res.status(200).json({
    badge,
    healthyCount,
    totalRoutes: routes.length,
    routeStatus,
    timestamp: new Date().toISOString(),
  });
}
