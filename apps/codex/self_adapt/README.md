# WIRED CHAOS — Self-Adapt Module

Implements a SEAL-style self-adapting loop:
1) Agents emit **self-edits** after tasks (policy/prompt deltas).
2) Reward Bus receives explicit/implicit scores (engagement, success flags).
3) Nightly job aggregates top edits → updates an adapter (LoRA) → versioned artifact.

### Fast Start
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-self-adapt.txt
export CHAOS_SELF_EDIT_DIR="./runtime/self_edits"
python apps/codex/self_adapt/logger.py --demo
```

### Runtime Attach (Python)
```python
from apps.codex.self_adapt.adapter_manager import AdapterManager
mgr = AdapterManager(
    base_model="meta-llama/Llama-3.1-8B-Instruct",
    adapter_dir="artifacts/adapters/latest"
)
pipe = mgr.pipeline()  # transformers pipeline with adapter loaded if present
print(pipe("Explain Wired Chaos in one sentence."))
```

### Reward POST (Cloudflare Worker)
```
POST /reward
{
  "edit_id": "2025-10-13T05:00:01Z_abcd1234",
  "reward": 0.87,
  "tags": ["x-space","gm-post"],
  "meta": {"agent":"codex","session":"xyz"}
}
```

### Nightly (GitHub Actions)
- aggregates JSONL, computes top-k by reward, exports summary
- optional LoRA update if `SELF_ADAPT_ENABLE_TRAIN=1`

### Data Locations
- `runtime/self_edits/*.jsonl` — append-only event log
- `artifacts/adapters/<date>/` — adapter checkpoints (LoRA/PEFT)

No base weights are modified. Safe to roll back by switching adapter symlink.

