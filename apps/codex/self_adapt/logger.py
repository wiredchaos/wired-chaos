"""Minimal self-adaptation logger for WIRED CHAOS Codex."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Iterable, Optional

SELF_EDIT_DIR = os.path.join("runtime", "self_edits")
SELF_EDIT_FILE = os.path.join(SELF_EDIT_DIR, "log.jsonl")


def _ensure_dir() -> None:
    os.makedirs(SELF_EDIT_DIR, exist_ok=True)


def emit_self_edit(
    agent: str,
    user_input: str,
    delta: str,
    delta_type: str,
    tags: Optional[Iterable[str]] = None,
) -> None:
    """Persist a self-edit record for downstream SEAL analysis."""

    _ensure_dir()
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": agent,
        "user_input": user_input,
        "delta": delta,
        "delta_type": delta_type,
        "tags": list(tags or []),
    }
    with open(SELF_EDIT_FILE, "a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False) + "\n")
