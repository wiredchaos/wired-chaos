from apps.codex.context_engine.context_curator import ContextCurator
import json
import os

CFG = "apps/codex/context_engine/context_config.yaml"

if __name__ == "__main__":
    os.makedirs("runtime/self_edits", exist_ok=True)
    curator = ContextCurator(CFG)
    result = curator.curate(
        agent="codex",
        user_message="Draft a WIRED CHAOS GM post about RSS-powered AI automation.",
    )
    print(json.dumps(result["packed"], ensure_ascii=False, indent=2)[:2000])
