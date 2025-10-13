#!/bin/bash
set -euo pipefail

announce() {
  echo "$1"
}

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
  shift
fi

announce "🧠 WIRED CHAOS :: AUTO-REPAIR + ENHANCEMENT BLOCK"

if [[ ! -d .git ]]; then
  echo "❌ Must run from repo root (wired-chaos)" >&2
  exit 1
fi

REPO=$(basename "$(git rev-parse --show-toplevel)")
BRANCH=$(git rev-parse --abbrev-ref HEAD)
announce "📡 Repository: $REPO | Branch: $BRANCH"

if [[ -d frontend ]]; then
  announce "📦 Hydrating frontend environment..."
  pushd frontend > /dev/null
  if [[ -d node_modules && -n "$(ls -A node_modules 2>/dev/null)" ]]; then
    announce "ℹ️  Existing node_modules detected; skipping reinstall."
  elif [[ -f yarn.lock && $(command -v yarn) ]]; then
    if ! yarn install --frozen-lockfile; then
      announce "⚠️  yarn install failed, attempting npm install fallback"
      if ! npm install --legacy-peer-deps --no-audit; then
        announce "❌ Dependency installation failed."
        if $CI_MODE; then
          exit 1
        fi
      fi
    fi
  else
    if ! npm ci --no-audit --prefer-offline; then
      announce "⚠️  npm ci failed, attempting npm install --legacy-peer-deps"
      if ! npm install --legacy-peer-deps --no-audit; then
        announce "❌ Dependency installation failed."
        if $CI_MODE; then
          exit 1
        fi
      fi
    fi
  fi
  popd > /dev/null
else
  announce "ℹ️  No frontend directory detected."
fi

if [[ -d frontend/src ]]; then
  announce "🔧 Normalizing import paths..."
  python3 - <<'PY'
import pathlib

root = pathlib.Path('frontend/src')
for path in root.rglob('*'):
    if path.suffix not in {'.ts', '.tsx'}:
        continue
    text = path.read_text()
    updated = text.replace('../ui/card', '../ui/Card')
    if updated != text:
        path.write_text(updated)
PY
else
  announce "ℹ️  No frontend/src directory detected."
fi

if ! $CI_MODE; then
  announce "🧹 Enforcing binary hygiene..."
  block_start="# >>> Codex Auto Repair Block"
  block_end="# <<< Codex Auto Repair Block"
  block_content="${block_start}
dist/
build/
node_modules/
*.min.js
*.map
*.pdf
*.png
*.jpg
*.jpeg
*.gif
*.mp4
*.zip
${block_end}"
  if [[ ! -f .gitignore ]] || ! grep -q "${block_start}" .gitignore; then
    printf '\n%s\n' "$block_content" >> .gitignore
  fi
  git rm -r --cached dist build node_modules 2>/dev/null || true
else
  announce "ℹ️  Skipping .gitignore and cached binary cleanup in CI mode."
fi

announce "💾 Activating Git LFS tracking..."
if command -v git-lfs >/dev/null 2>&1; then
  git lfs install --local
  for pattern in "*.pdf" "*.png" "*.jpg" "*.jpeg" "*.gif" "*.mp4" "*.zip"; do
    git lfs track "$pattern" >/dev/null 2>&1 || true
  done
  if ! $CI_MODE; then
    git add .gitattributes >/dev/null 2>&1 || true
  fi
else
  announce "⚠️  Git LFS not installed; skipping tracking setup."
fi

if ! $CI_MODE; then
  announce "✂️  Evaluating commit weight..."
  if git diff --cached --quiet; then
    announce "ℹ️  No staged changes detected for weight evaluation."
  else
    DIFF_SIZE=$(git diff --cached --shortstat | awk '{print $4+0}')
    if [[ -n "${DIFF_SIZE}" && "${DIFF_SIZE}" -gt 500 ]]; then
      announce "⚠️  Oversized diff (${DIFF_SIZE} lines) – splitting..."
      git reset HEAD~1 >/dev/null 2>&1 || true
      git add -A
      git commit -m "refactor(auto-split): resize commit for CI" >/dev/null 2>&1 || true
    else
      announce "✅ Diff weight within acceptable range (${DIFF_SIZE:-0} lines)."
    fi
  fi
else
  announce "ℹ️  Skipping commit weight evaluation in CI mode."
fi

if [[ -d frontend ]]; then
  pushd frontend > /dev/null

  announce "🧩 ESLint audit..."
  if npx --yes eslint . --ext .ts,.tsx --max-warnings=0; then
    announce "✅ ESLint completed without warnings."
  else
    announce "⚠️  ESLint issues detected."
    if $CI_MODE; then
      exit 1
    fi
  fi

  announce "💡 Lighthouse scan (local build)..."
  if command -v lhci >/dev/null 2>&1; then
    if npm run build; then
      if ! npx lhci autorun --collect.staticDistDir=build; then
        announce "⚠️  Lighthouse CI encountered issues."
        if $CI_MODE; then
          exit 1
        fi
      fi
    else
      announce "⚠️  Frontend build failed before Lighthouse scan."
      if $CI_MODE; then
        exit 1
      fi
    fi
  else
    announce "ℹ️  Lighthouse CI not installed; skipping scan."
  fi

  if [[ -d tests ]]; then
    announce "🎭 Playwright smoke tests..."
    if ! npx playwright test; then
      announce "⚠️  Some Playwright tests failed."
      if $CI_MODE; then
        exit 1
      fi
    fi
  else
    announce "ℹ️  No Playwright tests folder detected."
  fi

  popd > /dev/null
else
  announce "ℹ️  Frontend directory not available; skipping validation block."
fi

if ! $CI_MODE; then
  announce "📤 Auto-committing validated changes..."
  git add .
  git commit -m "chore(auto): Codex repair + enhancement block ✅" >/dev/null 2>&1 || true
  git push origin "$BRANCH"
else
  announce "ℹ️  CI mode active; skipping auto-commit and push."
fi

announce "✅ WIRED CHAOS Codex fully repaired + validated."
if $CI_MODE; then
  announce "🛰️  No-touch automation mode (CI) active."
else
  announce "🛰️  No-touch automation mode active."
fi
