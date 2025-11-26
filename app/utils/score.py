"""Scoring logic for strategy optimization."""
from __future__ import annotations

from typing import Iterable


def risk_penalty(risk_score: int, multiplier: float = 0.5) -> float:
    """Convert a risk score into a penalty value."""
    return max(risk_score * multiplier, 0.0)


def composite_score(savings: float, risk_score: int, cash_outlay: float = 0.0) -> float:
    penalty = risk_penalty(risk_score)
    liquidity_penalty = cash_outlay * 0.1
    return savings - penalty - liquidity_penalty


def normalize_scores(results: Iterable[dict]) -> list[dict]:
    """Attach normalized ranking metadata to strategy results."""
    ranked = sorted(results, key=lambda item: item["risk_adjusted_benefit"], reverse=True)
    for idx, item in enumerate(ranked, start=1):
        item["rank"] = idx
    return ranked

