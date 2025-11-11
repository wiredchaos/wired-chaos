"""Hook for running CODEX PR review automation."""

from codex.runtime import register_hook, run_policy
from codex.integrations import github
from codex.policy import load_yaml


@register_hook("codex.pr.review")
def review_open_prs(batch=None):
    """Review open pull requests per tools/prbot/policy.yaml."""
    policy = load_yaml("tools/prbot/policy.yaml")
    prs = github.list_open_prs()
    if batch:
        prs = [p for p in prs if p["title"] in policy.batches.get(batch, [])]

    for pr in prs:
        match = run_policy(pr["title"], policy)
        github.comment(pr["number"], f"CODEX Review → Policy: {match.label}")
        for step in match.steps:
            run_policy(step, policy)
        if match.automerge and github.has_label(pr, "automerge"):
            github.merge(pr["number"], method="squash")
    return {"processed": len(prs)}
