// Ops Dashboard Home — Integrates Enhanced SLO Status
import React from "react";
import { SLOStatusCard } from "../components/SLOStatusCard";

const OpsHome: React.FC = () => (
  <main style={{ background: "#000", minHeight: "100vh", color: "#00FFFF", padding: 32 }}>
    <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Ops Dashboard</h1>
    <SLOStatusCard />
    {/* Add more ops widgets here */}
  </main>
);

export default OpsHome;
