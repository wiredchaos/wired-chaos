import argparse, json, os, time, uuid
from datetime import datetime

LOG_DIR = os.environ.get("CHAOS_SELF_EDIT_DIR", "runtime/self_edits")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, f"self_edits-{time.strftime('%Y%m%d')}.jsonl")

def emit_self_edit(agent: str, user_input: str, delta: str, delta_type="prompt_delta", tags=None, reward=None, context=None):
    edit = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "agent": agent,
        "session": str(uuid.uuid4())[:8],
        "input": user_input,
        "context": context or {},
        "generated_edit": {"type": delta_type, "delta": delta},
        "reward": reward,
        "tags": tags or [],
    }
    edit["edit_id"] = f"{edit['timestamp']}_{edit['session']}"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(edit, ensure_ascii=False) + "\n")
    return edit

def cli():
    ap = argparse.ArgumentParser()
    ap.add_argument("--agent", default="codex")
    ap.add_argument("--input", default="Summarize article for WC GM post.")
    ap.add_argument("--delta", default="tone: more analytical; add EI coaching cue at end.")
    ap.add_argument("--type", default="prompt_delta")
    ap.add_argument("--tags", default="gm-post,alpha")
    ap.add_argument("--reward", type=float, default=None)
    ap.add_argument("--demo", action="store_true")
    args = ap.parse_args()

    if args.demo:
        for i in range(3):
            emit_self_edit(args.agent, f"demo_input_{i}", f"rule tweak {i}", tags=["demo"], reward=0.5 + i*0.1)
        print(f"Wrote demo edits to {LOG_FILE}")
        return

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    e = emit_self_edit(args.agent, args.input, args.delta, args.type, tags, args.reward)
    print(json.dumps(e, indent=2))

if __name__ == "__main__":
    cli()
