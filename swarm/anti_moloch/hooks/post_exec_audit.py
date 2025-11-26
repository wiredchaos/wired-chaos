from typing import Dict, Any
import json
import hashlib
import time

from ._shared_rules import score_outcome_risk, reasons_for_outcome
from swarm_core import broadcast_alert


def audit(request: Dict[str, Any], result: Dict[str, Any], manifest: Dict[str, Any]) -> Dict[str, Any]:
    risk = score_outcome_risk(request, result)
    reasons = reasons_for_outcome(request, result)
    record = {
        "ts": int(time.time()),
        "phase": "post_exec",
        "risk": round(risk, 3),
        "reasons": reasons,
        "request_digest": hashlib.sha256(
            json.dumps(request, sort_keys=True).encode()
        ).hexdigest(),
        "result_digest": hashlib.sha256(
            json.dumps(result, sort_keys=True).encode()
        ).hexdigest(),
    }
    if risk >= float(manifest["config"].get("risk_threshold", 0.20)):
        broadcast_alert(
            "post_exec_risk",
            {"risk": record["risk"], "reasons": reasons, "agent": request.get("agent")},
        )
    return record
