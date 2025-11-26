from typing import Any, Dict, Callable
from emergent.message_bus import publish_event, subscribe, get_metrics_snapshot
from emergent.runtime_manager import register_policy_hook, get_run_context


def register_policy(name: str, policy_obj: Any) -> None:
    register_policy_hook(name, policy_obj)


def broadcast_alert(event: str, data: Dict[str, Any]) -> None:
    publish_event(topic="governance.anti_moloch.alert", payload={"event": event, **data})


def collect_metrics() -> Dict[str, Any]:
    return get_metrics_snapshot()


def get_context() -> Dict[str, Any]:
    return get_run_context()


def on(topic: str, handler: Callable[[Dict[str, Any]], None]) -> None:
    subscribe(topic=topic, handler=handler)
