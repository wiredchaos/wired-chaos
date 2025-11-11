"""Runtime manager wiring scheduled CODEX PR reviews."""

from codex import schedule


# Schedule a daily CODEX PR review run at 03:33.
schedule.every().day.at("03:33").do("codex.pr.review", batch=None)
