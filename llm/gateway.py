from __future__ import annotations

import importlib
import os
from typing import Any, Awaitable, Callable, Dict, Optional

_openai_spec = importlib.util.find_spec("openai")
if _openai_spec:
    from openai import AsyncOpenAI
else:  # pragma: no cover - executed only when openai is unavailable
    AsyncOpenAI = None  # type: ignore

from .epistemic_guard import EpistemicContext, EpistemicGuard, GroundedSource

ModelCaller = Callable[[str, Dict[str, Any]], Awaitable[str]]

guard = EpistemicGuard()


def _build_context(grounded_text: str | None, grounded_source_id: str | None) -> EpistemicContext:
    context = EpistemicContext()

    if grounded_text and grounded_source_id:
        context.grounded_sources.append(
            GroundedSource(
                source_id=grounded_source_id,
                kind="user_paste",
                metadata={"length": len(grounded_text)},
            )
        )

    return context


async def _call_model(prompt: str, model_kwargs: Dict[str, Any]) -> str:
    if AsyncOpenAI is None:
        return f"[DEV STUB]\n{prompt[:320]}"

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        # Offline-friendly stub for local dev and tests
        return f"[DEV STUB]\n{prompt[:320]}"

    model = model_kwargs.get("model") or os.getenv("MODEL", "gpt-4o-mini")
    temperature = float(model_kwargs.get("temperature", 0.4))

    client = AsyncOpenAI(api_key=api_key)
    response = await client.chat.completions.create(
        model=model,
        temperature=temperature,
        messages=[
            {
                "role": "system",
                "content": "You are WIRED CHAOS. Be concise, neon-cyber, and honest about what you can access.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    return response.choices[0].message.content or ""


async def call_model_with_guard(
    prompt: str,
    *,
    grounded_text: str | None = None,
    grounded_source_id: str | None = None,
    model_kwargs: Optional[Dict[str, Any]] = None,
    model_client: Optional[ModelCaller] = None,
) -> Dict[str, Any]:
    """
    High-assurance wrapper around the base model call.

    Returns a payload with sanitized text, raw text, and any epistemic issues.
    """

    model_kwargs = model_kwargs or {}
    context = _build_context(grounded_text, grounded_source_id)

    prompt_with_context = prompt
    if grounded_text:
        prompt_with_context = f"{prompt}\n\n[Grounded context]\n{grounded_text}"

    llm_caller: ModelCaller = model_client or _call_model
    raw_response_text = await llm_caller(prompt_with_context, model_kwargs)

    result = guard.validate_and_sanitize(raw_response_text, context)

    return {
        "text": result.sanitized_text,
        "raw_text": raw_response_text,
        "epistemic_issues": [
            {
                "code": issue.code,
                "message": issue.message,
                "span": issue.span,
            }
            for issue in result.issues
        ],
        "grounded_sources": context.grounded_ids,
    }
