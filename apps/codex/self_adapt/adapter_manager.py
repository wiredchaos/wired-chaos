import os
from typing import Optional

def _lazy_imports():
    global AutoModelForCausalLM, AutoTokenizer, PeftModel, PeftConfig, pipeline, torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
    from peft import PeftModel, PeftConfig
    import torch

class AdapterManager:
    """
    Wraps a base HF model and optionally attaches a LoRA adapter if found.
    """
    def __init__(self, base_model: str, adapter_dir: Optional[str] = None, device: Optional[str] = None):
        _lazy_imports()
        self.base_model_id = base_model
        self.adapter_dir = adapter_dir
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._pipe = None

    def pipeline(self):
        if self._pipe:
            return self._pipe
        tok = AutoTokenizer.from_pretrained(self.base_model_id)
        model = AutoModelForCausalLM.from_pretrained(self.base_model_id, torch_dtype="auto")

        if self.adapter_dir and os.path.isdir(self.adapter_dir):
            try:
                model = PeftModel.from_pretrained(model, self.adapter_dir)
                print(f"[self-adapt] Loaded adapter from {self.adapter_dir}")
            except Exception as e:
                print(f"[self-adapt] Adapter load failed: {e}")

        model.to(self.device)
        self._pipe = pipeline("text-generation", model=model, tokenizer=tok, device=0 if self.device=="cuda" else -1)
        return self._pipe
