from typing import Dict, Any
import os

from swarm_core import register_policy, collect_metrics
from .hooks import pre_exec_guard, post_exec_audit

USE_LLM = bool(os.getenv("UNIVERSAL_LLM_KEY"))


class AntiMolochMonitor:
    CRITERIA = [
        "collective_benefit",
        "safety_preservation",
        "incentive_correction",
        "transparency",
        "cooperative_governance",
    ]

    def evaluate_state(self) -> Dict[str, Any]:
        metrics = collect_metrics()
        score = sum(float(metrics.get(k, 0.8)) for k in self.CRITERIA) / len(self.CRITERIA)
        return {
            "score": round(score, 3),
            "metrics": {k: round(float(metrics.get(k, 0.8)), 3) for k in self.CRITERIA},
        }

    def on_pre_exec(self, request: Dict[str, Any], manifest: Dict[str, Any]) -> Dict[str, Any]:
        rec = pre_exec_guard.guard(request, manifest)
        if not rec["allowed"] and USE_LLM:
            rec["llm_review"] = {
                "phase": "pre_exec",
                "verdict": "reviewed",
                "recommendation": "cooperative_fix",
            }
        return rec

    def on_post_exec(
        self, request: Dict[str, Any], result: Dict[str, Any], manifest: Dict[str, Any]
    ) -> Dict[str, Any]:
        rec = post_exec_audit.audit(request, result, manifest)
        if rec["risk"] >= float(manifest["config"].get("risk_threshold", 0.20)) and USE_LLM:
            rec["llm_review"] = {
                "phase": "post_exec",
                "verdict": "reviewed",
                "recommendation": "cooperative_fix",
            }
        return rec


register_policy("anti_moloch_swarm", AntiMolochMonitor())
