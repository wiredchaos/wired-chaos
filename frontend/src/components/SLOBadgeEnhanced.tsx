// Route-Aware SLO Badge Component
import React from "react";

interface RouteStatus {
  healthy: boolean;
  policy_violation: boolean;
  ada: number;
  p95: number;
  ttfb_var: number;
  critical: boolean;
  adaOk: boolean;
  p95Ok: boolean;
  ttfbOk: boolean;
}

interface SLOBadgeEnhancedProps {
  badge: "green" | "yellow" | "red";
  healthyCount: number;
  totalRoutes: number;
  routeStatus: Record<string, RouteStatus>;
}

const palette = {
  green: "#39FF14",
  yellow: "#FF00FF", // Accent Pink for yellow state
  red: "#FF3131",
  bg: "#000000",
  cyan: "#00FFFF",
};

export const SLOBadgeEnhanced: React.FC<SLOBadgeEnhancedProps> = ({
  badge,
  healthyCount,
  totalRoutes,
  routeStatus,
}) => {
  return (
    <div
      style={{
        background: palette.bg,
        color: palette.cyan,
        borderRadius: 8,
        padding: 16,
        minWidth: 220,
        boxShadow: `0 0 8px ${palette.cyan}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            display: "inline-block",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: palette[badge],
            border: `2px solid ${palette.cyan}`,
            marginRight: 8,
          }}
        />
        <strong style={{ fontSize: 18 }}>SLO Health</strong>
        <span style={{ marginLeft: "auto", fontWeight: 600 }}>
          {healthyCount}/{totalRoutes} routes healthy
        </span>
      </div>
      <div style={{ marginTop: 12 }}>
        {Object.entries(routeStatus).map(([route, status]) => (
          <div
            key={route}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              color: status.healthy
                ? palette.green
                : status.critical
                ? palette.red
                : palette.yellow,
            }}
          >
            <span style={{ fontWeight: 600 }}>{route}</span>
            <span>
              ADA: {status.ada} {status.adaOk ? "✅" : "❌"}
            </span>
            <span>
              P95: {status.p95}ms {status.p95Ok ? "✅" : "❌"}
            </span>
            <span>
              TTFB: {status.ttfb_var}% {status.ttfbOk ? "✅" : "❌"}
            </span>
            {status.policy_violation && (
              <span style={{ fontWeight: 700, color: palette.red }}>Policy Violation</span>
            )}
            {status.critical && (
              <span style={{ fontWeight: 700, color: palette.cyan }}>Critical</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
