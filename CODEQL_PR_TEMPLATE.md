# 🔧 CodeQL Workflow Hardening - PR Template

## **PR Title:** `fix/codeql-yaml: Multi-language CodeQL hardening (JS/TS + Python)`

---

## 🔧 CodeQL Workflow Hardening (JS/TS + Python)

This PR updates `.github/workflows/codeql.yml` to a fully hardened, multi-language configuration for the WIRED CHAOS repository.

### ✅ Key Improvements

* **Languages Covered:** `javascript-typescript` and `python` (CRA frontend + FastAPI backend)
* **Triggers:** `push`, `pull_request` on `main`, and weekly cron (`0 3 * * 1`)
* **Permissions:** `security-events: write`, `contents: read`, `actions: read`
* **Concurrency:** Prevent overlapping runs on the same ref (`cancel-in-progress: true`)
* **Autobuild Stability:** Node setup with Corepack enabled; Yarn build optional if monorepo quirks occur
* **Security:** Minimal CORS headers for command endpoints; no wildcard on sensitive routes

### ⚡ Next Steps Post-Merge

1. **Validate Workflow Run**
   * CodeQL on `main` completes without YAML or permission errors
   * SARIF results visible in **Security → Code scanning alerts**

2. **Autobuild Checks**
   * JS/TS: setup-node + corepack; fallback to manual build if Yarn monorepo quirks appear
   * Python: optional `setup-python + pip install -r backend/requirements.txt` if autobuild fails

3. **Weekly Schedule:** Confirm next run visible in **Actions → CodeQL**

### 📋 Additional Recommendations

* **Dependabot Security Updates:** Track GitHub Actions and workflow dependencies; reviewers aware of updates without modifying code
* **CodeQL Alerts Guidance:** Add a short section in `docs/SECURITY.md` describing how to read and triage CodeQL alerts for JS/TS and Python

---

## **PR Comment Template**

```markdown
🚨 **Attention Reviewers / Health Bot / VSCode Automation**

This PR implements a fully hardened, multi-language CodeQL workflow. Please review with the following checklist in mind:

* [ ] `.github/workflows/codeql.yml` syntax is valid
* [ ] JS/TS and Python codebases scanned correctly
* [ ] Permissions (`security-events: write`) are correct
* [ ] Concurrency and autobuild steps run without blocking
* [ ] Weekly schedule visible in **Actions → CodeQL**
* [ ] No plaintext secrets; stub values safe for staging
* [ ] Post-merge SARIF results appear in Security → Code scanning alerts

Once merged, the Health Bot will automatically validate staging and production runs. 🚀
```

---

## **Post-Merge Validation Commands**

```bash
# Check CodeQL workflow status
gh workflow run codeql.yml --ref main

# Monitor SARIF upload
gh api repos/wiredchaos/wired-chaos/code-scanning/alerts

# Verify security tab visibility
gh browse --settings security
```

**Ready to create PR and proceed with unified processor deployment!** ✅