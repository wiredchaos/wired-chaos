import os, json, glob, shutil, argparse, random
from datetime import datetime

# Minimal training loop using PEFT (LoRA) + Transformers SFTTrainer or supervised causal finetune
# For brevity, we synthesize a small dataset from top self-edits (prompt deltas).

def topk_self_edits(log_dir, k=200):
    files = sorted(glob.glob(os.path.join(log_dir, "self_edits-*.jsonl")))
    rows = []
    for fp in files[-7:]:  # last 7 days
        with open(fp, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    j = json.loads(line)
                    reward = j.get("reward")
                    if reward is not None:
                        rows.append(j)
                except:
                    pass
    rows.sort(key=lambda r: r.get("reward", 0), reverse=True)
    return rows[:k]

def build_sft_pairs(rows):
    pairs = []
    for r in rows:
        user = r.get("input","")
        delta = r.get("generated_edit",{}).get("delta","")
        # Simple heuristic: append delta as instruction augmentation
        prompt = f"Task: {user}\nApply policy tweak: {delta}\nAnswer:"
        pairs.append({"prompt": prompt, "response": ""})
    return pairs

def write_jsonl(pairs, out_path):
    with open(out_path, "w", encoding="utf-8") as f:
        for p in pairs:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--log_dir", default="runtime/self_edits")
    ap.add_argument("--base_model", default="meta-llama/Llama-3.1-8B-Instruct")
    ap.add_argument("--out_dir", default="artifacts/adapters")
    ap.add_argument("--dry_run", action="store_true")
    args = ap.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    rows = topk_self_edits(args.log_dir)
    pairs = build_sft_pairs(rows)
    stamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    workdir = os.path.join(args.out_dir, stamp)
    os.makedirs(workdir, exist_ok=True)
    ds_path = os.path.join(workdir, "train.jsonl")
    write_jsonl(pairs, ds_path)

    if args.dry_run or len(pairs)==0:
        print(f"[self-adapt] Dry-run or no data. Dataset at {ds_path}")
        return

    # NOTE: Keep this minimal — in real runs, plug HuggingFace TRL/SFTTrainer here.
    # To keep PR safe, we mock adapter export with dataset & config.
    with open(os.path.join(workdir, "ADAPTER_MOCK.txt"), "w") as f:
        f.write("Mock adapter generated. Replace with PEFT training run in CI with GPU.\n")

    latest = os.path.join(args.out_dir, "latest")
    if os.path.islink(latest) or os.path.exists(latest):
        try:
            if os.path.islink(latest): os.unlink(latest)
            else: shutil.rmtree(latest)
        except Exception as e:
            print("Failed to remove previous latest:", e)
    os.symlink(workdir, latest)
    print(f"[self-adapt] Adapter ready at {workdir} (mock). 'latest' updated.")

if __name__ == "__main__":
    main()
