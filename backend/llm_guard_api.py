from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from llm.gateway import call_model_with_guard

router = APIRouter(prefix="/api/llm", tags=["llm"])


class LLMRequest(BaseModel):
    prompt: str
    grounded_text: Optional[str] = None
    grounded_source_id: Optional[str] = None
    model_kwargs: Optional[Dict[str, Any]] = None


class EpistemicIssueOut(BaseModel):
    code: str
    message: str
    span: Optional[List[int]] = None


class LLMResponse(BaseModel):
    text: str
    raw_text: str
    epistemic_issues: List[EpistemicIssueOut]
    grounded_sources: List[str] = []


@router.post("/answer", response_model=LLMResponse)
async def llm_answer(request: LLMRequest) -> LLMResponse:
    payload = await call_model_with_guard(
        prompt=request.prompt,
        grounded_text=request.grounded_text,
        grounded_source_id=request.grounded_source_id,
        model_kwargs=request.model_kwargs or {},
    )

    return LLMResponse(
        text=payload["text"],
        raw_text=payload["raw_text"],
        grounded_sources=payload.get("grounded_sources", []),
        epistemic_issues=[EpistemicIssueOut(**issue) for issue in payload["epistemic_issues"]],
    )
