import json
import glob
import math
from dataclasses import dataclass
from typing import List, Dict, Any

# Light deps only; all available via requirements-context.txt
import numpy as np
try:
    import tiktoken
except:
    tiktoken = None

from sentence_transformers import SentenceTransformer

from apps.codex.self_adapt import logger as selfadapt_logger


def _read_text(path: str, limit: int = 20000) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            txt = f.read()
            return txt[:limit]
    except Exception as e:
        return f"[cannot read {path}: {e}]"


def _approx_tokens(s: str) -> int:
    if not s:
        return 0
    if tiktoken:
        try:
            enc = tiktoken.get_encoding("cl100k_base")
            return len(enc.encode(s))
        except:
            pass
    # heuristic ~4 chars per token
    return max(1, math.ceil(len(s) / 4))


@dataclass
class CuratorItem:
    kind: str
    id: str
    text: str
    meta: Dict[str, Any]
    score: float


class ContextCurator:
    def __init__(self, config_path: str):
        with open(config_path, "r", encoding="utf-8") as f:
            import yaml
            self.cfg = yaml.safe_load(f)
        emb_model = self.cfg.get("embedding", {}).get("model", "sentence-transformers/all-MiniLM-L6-v2")
        device = self.cfg.get("embedding", {}).get("device", "auto")
        self.model = SentenceTransformer(emb_model, device=device)
        self._load_registries()

    def _load_registries(self):
        reg = self.cfg["registries"]
        with open(reg["tools"], "r", encoding="utf-8") as f:
            self.tools = json.load(f)
        with open(reg["system_prompts"], "r", encoding="utf-8") as f:
            self.system_prompts = json.load(f)

    def _embed(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, 384))
        return self.model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)

    def _rank_paths(self, query: str, paths: List[str], kind: str, topk: int) -> List[CuratorItem]:
        corpus = [_read_text(p) for p in paths]
        embs = self._embed([query] + corpus)
        if embs.shape[0] <= 1:
            return []
        q = embs[0]
        docs = embs[1:]
        sims = docs @ q
        idx = np.argsort(-sims)[:topk]
        items: List[CuratorItem] = []
        for i in idx:
            p = paths[i]
            items.append(
                CuratorItem(
                    kind=kind,
                    id=p,
                    text=corpus[i],
                    meta={"path": p},
                    score=float(sims[i]),
                )
            )
        return items

    def _rank_tools(self, query: str, topk: int) -> List[CuratorItem]:
        texts = [f"{t['name']} :: {t['desc']} :: {','.join(t.get('tags', []))}" for t in self.tools]
        embs = self._embed([query] + texts)
        if embs.shape[0] <= 1:
            return []
        q = embs[0]
        sims = embs[1:] @ q
        idx = np.argsort(-sims)[:topk]
        out = []
        for i in idx:
            t = self.tools[i]
            out.append(
                CuratorItem(
                    kind="tool",
                    id=t["name"],
                    text=t["desc"],
                    meta=t,
                    score=float(sims[i]),
                )
            )
        return out

    def curate(self, agent: str, user_message: str) -> Dict[str, Any]:
        p = self.cfg["paths"]
        topk = self.cfg["topk"]
        docs = sorted(glob.glob(p["docs_glob"]))
        mems = sorted(glob.glob(p["memory_glob"]))
        hist = sorted(glob.glob(p["history_glob"]))

        ranked_docs = self._rank_paths(user_message, docs, "doc", topk["docs"])
        ranked_mems = self._rank_paths(user_message, mems, "memory", topk["memory"])
        ranked_hist = self._rank_paths(user_message, hist, "history", topk["history"])
        ranked_tools = self._rank_tools(user_message, topk["tools"])

        system = self.system_prompts.get(agent, self.system_prompts.get(self.cfg["default_agent"], ""))

        # Pack under budget
        budget = int(self.cfg["token_budget"])
        reserve = int(self.cfg["reserve_for_user"])
        order = self.cfg["packing"]["order"]
        packed: Dict[str, Any] = {
            "system": system,
            "docs": [],
            "memory": [],
            "history": [],
            "tools": [],
            "user": user_message,
        }

        used = 0
        used += _approx_tokens(system)

        def add_list(key: str, items: List[CuratorItem]):
            nonlocal used
            for it in items:
                tok = _approx_tokens(it.text)
                if used + tok + reserve >= budget:
                    break
                packed[key].append(
                    {"id": it.id, "text": it.text, "meta": it.meta, "score": it.score}
                )
                used += tok

        # obey packing order
        for stage in order:
            if stage == "system":
                continue
            if stage == "docs":
                add_list("docs", ranked_docs)
            elif stage == "memory":
                add_list("memory", ranked_mems)
            elif stage == "tools":
                add_list("tools", ranked_tools)
            elif stage == "history":
                add_list("history", ranked_hist)
            elif stage == "user":
                pass

        # Emit a self-edit record describing the context composition
        delta = (
            f"context_mix: docs={len(packed['docs'])}, memory={len(packed['memory'])}, "
            f"history={len(packed['history'])}, tools={[t['id'] for t in packed['tools']]}; budget_used={used}"
        )
        selfadapt_logger.emit_self_edit(
            agent=agent,
            user_input=user_message,
            delta=delta,
            delta_type="policy_rule",
            tags=["context_engine", "curate"],
        )
        return {
            "packed": packed,
            "tokens_used": used,
            "budget": budget,
            "reserved_for_user": reserve,
        }
