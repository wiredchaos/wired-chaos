import pytest

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))


@pytest.fixture
def anyio_backend():
    return "asyncio"


from llm.epistemic_guard import EpistemicContext, EpistemicGuard
from llm.gateway import call_model_with_guard


def test_guard_flags_false_read_when_no_grounding():
    guard = EpistemicGuard()
    ctx = EpistemicContext()

    resp = "Thanks for the link, I have now read the paper and here is my analysis."
    result = guard.validate_and_sanitize(resp, ctx)

    assert not result.is_valid
    assert any(issue.code == "EP_INVALID_READ_CLAIM" for issue in result.issues)
    assert "I do not have direct access to that document" in result.sanitized_text


def test_guard_allows_plain_text_response():
    guard = EpistemicGuard()
    ctx = EpistemicContext()

    resp = "Based on what you described, this sounds like a study of model hallucinations."
    result = guard.validate_and_sanitize(resp, ctx)

    assert result.is_valid
    assert not result.issues
    assert result.sanitized_text == resp


@pytest.mark.anyio("asyncio")
async def test_call_model_with_guard_sanitizes_via_stubbed_llm():
    async def fake_model(prompt: str, _: dict):
        return "Thank you for the PDF link. I have now read the paper and here is my summary..."

    payload = await call_model_with_guard(
        prompt="Summarize the document", model_client=fake_model
    )

    assert "I do not have direct access" in payload["text"]
    assert payload["raw_text"].startswith("Thank you for the PDF link")
    assert any(issue["code"] == "EP_INVALID_READ_CLAIM" for issue in payload["epistemic_issues"])
