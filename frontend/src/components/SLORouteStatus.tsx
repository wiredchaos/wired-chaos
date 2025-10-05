// Route-Specific SLO Status Widget
import React from "react";

interface RouteStatusProps {
  route: string;
  status: {
    healthy: boolean;
    policy_violation: boolean;
    ada: number;
    p95: number;
    ttfb_var: number;
    critical: boolean;
    adaOk: boolean;
    p95Ok: boolean;
    ttfbOk: boolean;
  };
}

const palette = {
  green: "#39FF14",
  yellow: "#FF00FF",
  red: "#FF3131",
  bg: "#000000",
  cyan: "#00FFFF",
};

export const SLORouteStatus: React.FC<RouteStatusProps> = ({ route, status }) => (
  <div
    style={{
      background: palette.bg,
      color: status.healthy ? palette.green : status.critical ? palette.red : palette.yellow,
      border: `1px solid ${palette.cyan}`,
      borderRadius: 6,
      padding: 10,
      marginBottom: 6,
      minWidth: 180,
      fontSize: 15,
    }}
  >
    <strong>{route}</strong> — ADA: {status.ada} {status.adaOk ? "✅" : "❌"} | P95: {status.p95}ms{" "}
    {status.p95Ok ? "✅" : "❌"} | TTFB: {status.ttfb_var}% {status.ttfbOk ? "✅" : "❌"}
    {status.policy_violation && (
      <span style={{ color: palette.red, fontWeight: 700 }}> Policy Violation</span>
    )}
    {status.critical && <span style={{ color: palette.cyan, fontWeight: 700 }}> Critical</span>}
  </div>
);
