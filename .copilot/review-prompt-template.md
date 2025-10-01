# GitHub Copilot Review Prompt Template
## Code-Only Commit Review (No Infrastructure Touch)

**Goal:**  
Review code-only changes between commits with infrastructure protection.

**Instructions:**  
1. Only analyze code files (JavaScript, CSS, Python, PowerShell, TypeScript, Solidity)
2. **NEVER modify infrastructure files:**
   - `.github/**`
   - `wrangler.toml`
   - `Dockerfile`
   - `infra/**`, `terraform/**`, `ansible/**`, `deploy/**`
   - `.vscode/` (except settings, tasks, extensions, launch configs)

**Analysis Focus:**
- Logic and structural changes
- Code quality improvements
- Stylistic consistency
- Security considerations
- Performance implications

**VS Code Workflow:**
1. Open Source Control (`Ctrl+Shift+G`)
2. Review each code file
3. For conflicts: Use "Accept Incoming", "Accept Current", or "Compare Changes"
4. Stage resolved files
5. Run validation: `npm run lint`, `pytest`, or `pwsh ./scripts/sanity-check.ps1`

**Commit Message Template:**
```
fix/feat/refactor: brief description

- Specific change 1
- Specific change 2
- Infrastructure files preserved (no touch guarantee)
```

---

**Usage:** Copy this template and modify the commit hashes as needed for your specific review.

**Example:**
> Review commits `abc123` to `def456` following the code-only guidelines above.