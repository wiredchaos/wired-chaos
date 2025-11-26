from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class StepRecord:
    name: str
    status: str
    started_at: str
    ended_at: str
    duration_seconds: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    outputs: List[str] = field(default_factory=list)
    error: Optional[str] = None


class PipelineMonitor:
    """Lightweight pipeline monitoring to track step timings and status."""

    def __init__(self) -> None:
        self.started_at: datetime = datetime.now(timezone.utc)
        self.ended_at: Optional[datetime] = None
        self.steps: List[StepRecord] = []

    def start_step(self, name: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return {
            "name": name,
            "started_at": datetime.now(timezone.utc),
            "metadata": metadata or {},
        }

    def end_step(
        self,
        step: Dict[str, Any],
        status: str = "success",
        *,
        error: Optional[BaseException] = None,
        outputs: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        ended_at = datetime.now(timezone.utc)
        merged_metadata = {**step.get("metadata", {}), **(metadata or {})}
        self.steps.append(
            StepRecord(
                name=step["name"],
                status=status,
                started_at=step["started_at"].isoformat(),
                ended_at=ended_at.isoformat(),
                duration_seconds=(ended_at - step["started_at"]).total_seconds(),
                metadata=merged_metadata,
                outputs=outputs or [],
                error=str(error) if error else None,
            )
        )

    def skip_step(self, name: str, reason: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        now = datetime.now(timezone.utc)
        merged_metadata = {"reason": reason, **(metadata or {})}
        self.steps.append(
            StepRecord(
                name=name,
                status="skipped",
                started_at=now.isoformat(),
                ended_at=now.isoformat(),
                duration_seconds=0.0,
                metadata=merged_metadata,
                outputs=[],
                error=None,
            )
        )

    def finalize(self) -> None:
        self.ended_at = datetime.now(timezone.utc)

    def as_dict(self) -> Dict[str, Any]:
        ended_at = self.ended_at or datetime.now(timezone.utc)
        return {
            "started_at": self.started_at.isoformat(),
            "ended_at": ended_at.isoformat(),
            "duration_seconds": (ended_at - self.started_at).total_seconds(),
            "steps": [step.__dict__ for step in self.steps],
        }
