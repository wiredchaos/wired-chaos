from typing import Dict, Any, List


def score_request_risk(req: Dict[str, Any]) -> float:
    risk = 0.0
    if req.get("priority") == "rush":
        risk += 0.07
    if req.get("requires_privileged_access"):
        risk += 0.10
    if req.get("compete_mode") == "maximize_share":
        risk += 0.08
    if req.get("explainability") == "low":
        risk += 0.10
    return min(risk, 1.0)


def reasons_for(req: Dict[str, Any]) -> List[str]:
    r = []
    if req.get("priority") == "rush":
        r.append("Acceleration pressure")
    if req.get("requires_privileged_access"):
        r.append("Privileged access")
    if req.get("compete_mode") == "maximize_share":
        r.append("Arms-race incentive")
    if req.get("explainability") == "low":
        r.append("Low transparency")
    return r


def score_outcome_risk(req: Dict[str, Any], res: Dict[str, Any]) -> float:
    risk = 0.0
    if res.get("externalities"):
        risk += 0.12
    if res.get("reward_hacking"):
        risk += 0.15
    if res.get("degraded_safety"):
        risk += 0.12
    if res.get("opaque_decision"):
        risk += 0.08
    return min(risk, 1.0)


def reasons_for_outcome(req: Dict[str, Any], res: Dict[str, Any]) -> List[str]:
    r = []
    if res.get("externalities"):
        r.append("Externalities detected")
    if res.get("reward_hacking"):
        r.append("Reward hacking behavior")
    if res.get("degraded_safety"):
        r.append("Safety degradation")
    if res.get("opaque_decision"):
        r.append("Opaque decision")
    return r
