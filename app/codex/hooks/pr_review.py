"""CODEX hook for running WIRED CHAOS pull-request reviews.

The implementation keeps a light dependency surface so it can execute inside
Emergent runtimes as well as local developer shells. The hook consumes the
policy definition stored in ``tools/prbot/policy.yaml`` and coordinates with
GitHub through the CODEX integrations layer.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

from codex.integrations import github
from codex.policy import load_yaml, run_policy
from codex.runtime import register_hook

LOGGER = logging.getLogger(__name__)
POLICY_PATH = Path(__file__).resolve().parents[3] / "tools" / "prbot" / "policy.yaml"


def _load_policy() -> Any:
    """Load the pull-request policy file with a helpful error message."""

    if not POLICY_PATH.exists():
        raise FileNotFoundError(
            f"Expected CODEX policy definition at {POLICY_PATH}. "
            "Create the file or update POLICY_PATH to point to the correct location."
        )
    return load_yaml(str(POLICY_PATH))


def _filter_batch(
    prs: Iterable[Dict[str, Any]], policy: Any, batch: Optional[str]
) -> List[Dict[str, Any]]:
    """Return only pull requests listed in the configured batch.

    The policy structure is assumed to expose a ``batches`` mapping where each
    value is an iterable of pull-request titles.
    """

    if not batch:
        return list(prs)

    batches = getattr(policy, "batches", None) or {}
    batch_titles = set(batches.get(batch, [])) if isinstance(batches, dict) else set()
    if not batch_titles:
        LOGGER.warning("No pull requests configured for batch '%s'", batch)
        return []

    return [pr for pr in prs if pr.get("title") in batch_titles]


def _process_policy_steps(match: Any, policy: Any) -> None:
    """Execute the follow-up steps produced by the policy engine."""

    for step in getattr(match, "steps", []) or []:
        LOGGER.debug("Executing policy step '%s'", step)
        run_policy(step, policy)


def _should_increment_merge_count(pr: Dict[str, Any], match: Any) -> bool:
    """Determine whether the merge counter should be incremented."""

    return bool(getattr(match, "automerge", False) and github.has_label(pr, "automerge"))


def _maybe_merge(pr: Dict[str, Any], match: Any) -> None:
    """Merge pull requests that qualify for auto-merge."""

    if _should_increment_merge_count(pr, match):
        LOGGER.info("Auto-merging PR #%s via squash", pr.get("number"))
        github.merge(pr["number"], method="squash")


@register_hook("codex.pr.review")
def review_open_prs(batch: Optional[str] = None) -> Dict[str, Any]:
    """Review open pull requests per ``tools/prbot/policy.yaml``."""

    policy = _load_policy()
    prs = _filter_batch(github.list_open_prs(), policy, batch)

    if not prs:
        LOGGER.info("No pull requests matched the review criteria")
        return {"processed": 0, "comments": 0, "merged": 0}

    comments = 0
    merged = 0

    for pr in prs:
        LOGGER.debug("Evaluating PR #%s — %s", pr.get("number"), pr.get("title"))
        match = run_policy(pr["title"], policy)
        github.comment(pr["number"], f"CODEX Review → Policy: {match.label}")
        comments += 1

        _process_policy_steps(match, policy)
        _maybe_merge(pr, match)

        if _should_increment_merge_count(pr, match):
            merged += 1

    return {"processed": len(prs), "comments": comments, "merged": merged}


__all__ = ["review_open_prs"]
