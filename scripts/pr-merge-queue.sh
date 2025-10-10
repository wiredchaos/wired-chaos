#!/usr/bin/env bash
set -euo pipefail

REPO="wiredchaos/wired-chaos"   # change if running per-repo
MERGE_METHOD="${MERGE_METHOD:-squash}" # squash|merge|rebase

# Label gates
REQUIRED_LABEL=""               # e.g. "automerge-ok" (optional)
BLOCK_LABEL="do-not-merge"

# Fetch open PRs oldest→newest (excluding drafts)
prs=$(gh pr list -R "$REPO" --state open --json number,createdAt,isDraft,labels,headRefName,baseRefName --jq \
  '[.[] | select(.isDraft==false) | {n:.number, t:.createdAt, labels:([.labels[].name]), head:.headRefName, base:.baseRefName}] | sort_by(.t)')

count=$(echo "$prs" | jq 'length')
echo "Found $count open PRs."

for i in $(seq 0 $((count-1))); do
  pr=$(echo "$prs" | jq ".[$i]")
  number=$(echo "$pr" | jq -r '.n')
  labels=$(echo "$pr" | jq -r '.labels | join(",")')
  head=$(echo "$pr" | jq -r '.head')
  base=$(echo "$pr" | jq -r '.base')

  [[ -n "$REQUIRED_LABEL" ]] && [[ "$labels" != *"$REQUIRED_LABEL"* ]] && { echo "PR #$number missing $REQUIRED_LABEL → skip"; continue; }
  [[ "$labels" == *"$BLOCK_LABEL"* ]] && { echo "PR #$number has $BLOCK_LABEL → skip"; continue; }

  echo "→ Processing PR #$number ($head → $base)"

  # Ensure CI green
  gh pr checks -R "$REPO" "$number" --watch --interval 10 || { echo "✗ Checks failed on #$number"; continue; }

  # Try merge with selected strategy
  if gh pr merge -R "$REPO" "$number" --"$MERGE_METHOD" --auto --delete-branch; then
    echo "✓ Merged #$number"
  else
    echo "⚠ Merge failed for #$number. Attempting rebase…"
    # Rebase onto base and re-push
    gh pr checkout -R "$REPO" "$number"
    git fetch origin "$base"
    if git rebase "origin/$base"; then
      git push --force-with-lease
      echo "→ Re-run checks after rebase"
      gh pr checks -R "$REPO" "$number" --watch --interval 10 || { echo "✗ Checks failed post-rebase for #$number"; git rebase --abort || true; gh pr ready -R "$REPO" "$number"; continue; }
      gh pr merge -R "$REPO" "$number" --"$MERGE_METHOD" --auto --delete-branch && echo "✓ Merged after rebase #$number"
    else
      echo "✗ Rebase conflict for #$number — apply 'needs-rebase' label"
      gh pr edit -R "$REPO" "$number" --add-label "needs-rebase" || true
      git rebase --abort || true
    fi
    git switch -
  fi

done
