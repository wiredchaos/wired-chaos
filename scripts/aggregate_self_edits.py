import os, json, glob, statistics

LOG_DIR = os.environ.get("CHAOS_SELF_EDIT_DIR", "runtime/self_edits")
OUT = os.environ.get("CHAOS_SELF_EDIT_SUMMARY", "artifacts/self_edit_summary.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

def main():
    files = sorted(glob.glob(os.path.join(LOG_DIR, "self_edits-*.jsonl")))
    rows = []
    for fp in files[-14:]:
        with open(fp, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    rows.append(json.loads(line))
                except: pass
    stats = {
        "total": len(rows),
        "with_reward": sum(1 for r in rows if r.get("reward") is not None),
        "avg_reward": round(statistics.mean([r["reward"] for r in rows if r.get("reward") is not None]) ,4) if any(r.get("reward") is not None for r in rows) else None,
        "by_agent": {}
    }
    for r in rows:
        a = r.get("agent","unknown")
        stats["by_agent"].setdefault(a, 0)
        stats["by_agent"][a]+=1
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"stats": stats, "sample": rows[:10]}, f, ensure_ascii=False, indent=2)
    print(f"Wrote {OUT}")

if __name__ == "__main__":
    main()
