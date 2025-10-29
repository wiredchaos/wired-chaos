from typing import Dict, Any
import json
import hashlib
import time

from ._shared_rules import score_request_risk, reasons_for
from swarm_core import broadcast_alert


def guard(request: Dict[str, Any], manifest: Dict[str, Any]) -> Dict[str, Any]:
    risk = score_request_risk(request)
    reasons = reasons_for(request)
    block_threshold = float(manifest["config"].get("block_threshold", 0.35))
    allowed = risk < block_threshold

    record = {
        "ts": int(time.time()),
        "phase": "pre_exec",
        "allowed": allowed,
        "risk": round(risk, 3),
        "reasons": reasons,
        "request_digest": hashlib.sha256(
            json.dumps(request, sort_keys=True).encode()
        ).hexdigest(),
    }

    if not allowed:
        broadcast_alert(
            "pre_exec_blocked",
            {"risk": record["risk"], "reasons": reasons, "agent": request.get("agent")},
        )
    return record
