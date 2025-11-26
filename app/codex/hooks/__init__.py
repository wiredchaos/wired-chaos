"""CODEX hook registry package.

This module exposes helper utilities for invoking hooks programmatically
so other parts of the WIRED CHAOS stack can depend on a stable import path
without reaching into implementation details.
"""

from __future__ import annotations

from typing import Any, Optional

from codex import dispatch

PR_REVIEW_HOOK = "codex.pr.review"


def run_pr_review(batch: Optional[str] = None, **kwargs: Any) -> Any:
    """Trigger the CODEX pull-request review hook via the dispatch API.

    Parameters
    ----------
    batch:
        Optional policy batch identifier to restrict processing. When omitted
        all pull requests matching the policy configuration are reviewed.
    **kwargs:
        Additional keyword arguments are forwarded to the dispatcher. This
        keeps the helper flexible as the hook signature evolves.
    """

    return dispatch(PR_REVIEW_HOOK, batch=batch, **kwargs)


__all__ = ["PR_REVIEW_HOOK", "run_pr_review"]
