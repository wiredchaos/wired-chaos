// Placeholder for enhanced SLO badge API endpoint
// This file will be updated to include the `violations[i].key` field in the JSON response

// Simulated SLO badge API with policy key in violations
export default async function handler(req, res) {
  // Simulate some SLO violation data
  const violations = [
    {
      route: "/tax",
      key: "p95_delta_ms_max",
      value: 1200,
      threshold: 1000,
      critical: true,
    },
    {
      route: "/university",
      key: "ada_min",
      value: 0.85,
      threshold: 0.9,
      critical: false,
    },
  ];
  const status = violations.some((v) => v.critical)
    ? "red"
    : violations.length > 0
    ? "yellow"
    : "green";
  res.status(200).json({
    status,
    violations,
  });
}
