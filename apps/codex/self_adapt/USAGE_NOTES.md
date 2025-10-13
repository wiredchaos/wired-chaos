## Wiring into Agents

Emit a self-edit after each task:
```python
from apps.codex.self_adapt import logger
logger.emit_self_edit(
    agent="codex",
    user_input=prompt_text,
    delta="add EI cue and brevity; prefer bullets",
    tags=["gm-post","x-space"]
)
```

When a UI or bot has feedback, POST to the Reward Bus:
```
POST https://<worker>/reward  (auth: Bearer <AUTH_TOKEN>)
{ "edit_id": "<timestamp>_<session>", "reward": 0.92, "tags": ["gm-post"] }
```

Nightly job produces:
- `artifacts/self_edit_summary.json` overview
- `artifacts/adapters/latest` symlink → newest adapter folder

Attach adapter in serving process using `AdapterManager`.
