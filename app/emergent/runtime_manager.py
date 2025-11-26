"""Runtime manager wiring scheduled CODEX PR reviews."""

from __future__ import annotations

from codex import schedule

from app.codex.hooks import PR_REVIEW_HOOK, run_pr_review


# Schedule a daily CODEX PR review run at 03:33.
schedule.every().day.at("03:33").do(PR_REVIEW_HOOK, batch=None)

# Provide a convenience alias so other modules can trigger the review cycle.
dispatch_pr_review = run_pr_review


__all__ = ["dispatch_pr_review"]
