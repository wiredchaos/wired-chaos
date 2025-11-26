"""Utility helpers for deterministic hashing."""
from __future__ import annotations

import hashlib
import json
from typing import Any, Mapping


def sha256_dict(payload: Mapping[str, Any]) -> str:
    """Generate a deterministic SHA-256 hash for a mapping."""
    normalized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

