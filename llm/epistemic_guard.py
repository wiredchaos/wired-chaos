from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import re


@dataclass
class GroundedSource:
    """
    Represents a concrete piece of content the model is allowed to reference
    as 'seen' or 'read' (e.g. pasted PDF text, retrieved document chunks).
    """

    source_id: str
    kind: str  # e.g. "user_paste", "retrieval_chunk"
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class EpistemicContext:
    """
    Captures what the model actually has access to this turn.
    Anything not listed here MUST NOT be described as 'read', 'opened', etc.
    """

    grounded_sources: List[GroundedSource] = field(default_factory=list)

    @property
    def grounded_ids(self) -> List[str]:
        return [source.source_id for source in self.grounded_sources]


@dataclass
class ValidationIssue:
    code: str
    message: str
    span: Optional[Tuple[int, int]] = None  # character indices in the response


@dataclass
class ValidationResult:
    is_valid: bool
    issues: List[ValidationIssue] = field(default_factory=list)
    sanitized_text: str = ""


class EpistemicGuard:
    """
    EpistemicGuard enforces grounding rules on LLM responses, with a focus on
    preventing the "False-Correction Loop" failure mode.

    It implements conservative, high-signal rules:
      - The model may not claim to have 'read' or 'opened' any document
        that is not present in EpistemicContext.grounded_sources.
      - The model must not pretend to have followed links.
    """

    _READ_PATTERNS = [
        r"\bI (have )?(now )?read\b",
        r"\bafter reading\b",
        r"\bI just reviewed\b",
        r"\bI opened\b",
        r"\bI accessed\b",
        r"\bI followed the link\b",
        r"\bI checked the PDF\b",
        r"\bI checked the document\b",
        r"\bI looked at (the )?paper\b",
    ]

    _LINK_REF_PATTERNS = [
        r"\bthe link you provided\b",
        r"\bthat URL\b",
        r"\bthe PDF you shared\b",
        r"\bthe document you linked\b",
    ]

    def __init__(self) -> None:
        self._read_regex = re.compile("|".join(self._READ_PATTERNS), re.IGNORECASE)
        self._link_ref_regex = re.compile("|".join(self._LINK_REF_PATTERNS), re.IGNORECASE)

    def validate_and_sanitize(
        self,
        llm_response: str,
        context: EpistemicContext,
    ) -> ValidationResult:
        """
        Validates an LLM response against epistemic rules and, where possible,
        rewrites unsafe language into safe, honest statements.

        Strategy:
          1. Detect forbidden 'I read/opened the document' style claims.
          2. If no grounded sources exist, such claims are always invalid.
          3. Replace offending segments with honest language while preserving
             as much content as possible.
        """

        issues: List[ValidationIssue] = []
        sanitized_text = llm_response

        has_grounding = bool(context.grounded_sources)

        if not has_grounding:
            for match in self._read_regex.finditer(llm_response):
                issues.append(
                    ValidationIssue(
                        code="EP_INVALID_READ_CLAIM",
                        message=(
                            "Model claims to have read/opened external content "
                            "without any grounded sources."
                        ),
                        span=(match.start(), match.end()),
                    )
                )
            for match in self._link_ref_regex.finditer(llm_response):
                issues.append(
                    ValidationIssue(
                        code="EP_INVALID_LINK_ACCESS",
                        message=(
                            "Model claims to have followed or accessed a link "
                            "that it cannot actually open."
                        ),
                        span=(match.start(), match.end()),
                    )
                )

            if issues:
                sanitized_text = self._sanitize_no_access_claims(llm_response)

        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            sanitized_text=sanitized_text,
        )

    @staticmethod
    def _sanitize_no_access_claims(text: str) -> str:
        """Conservatively sanitize false access claims."""

        replacements = {
            "I have now read": "I do not have direct access to that document; based on what you have shared",
            "I have read": "I do not have direct access to that document; based on what you have shared",
            "I just reviewed": "I do not have direct access to that document; based on the information you provided",
            "I opened": "I cannot open links or files directly, but from your description",
            "I accessed": "I cannot directly access external systems, but using your description",
            "I followed the link": "I cannot follow links directly; using only the text you provided",
            "I checked the PDF": "I cannot see the PDF directly; based on your excerpt",
            "I checked the document": "I cannot see the document directly; based on your excerpt",
            "I looked at the paper": "I cannot see the paper directly; based on your summary",
            "I looked at paper": "I cannot see the paper directly; based on your summary",
            "the link you provided": "the information you wrote in your message",
            "that URL": "the details you shared",
            "the PDF you shared": "the PDF excerpt you shared in text form",
            "the document you linked": "the document content you pasted here",
        }

        sanitized = text
        for src, dst in replacements.items():
            sanitized = re.sub(src, dst, sanitized, flags=re.IGNORECASE)

        return sanitized
