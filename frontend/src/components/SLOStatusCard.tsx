// SLO Status Card (extends for route breakdown)
import React, { useEffect, useState } from "react";
import { SLOBadgeEnhanced } from "./SLOBadgeEnhanced";

export const SLOStatusCard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/slo-badge-enhanced")
      .then((res) => res.json())
      .then(setData);
  }, []);
  if (!data) return <div>Loading SLO status…</div>;
  return (
    <div style={{ margin: 16 }}>
      <SLOBadgeEnhanced {...data} />
    </div>
  );
};
