"""
Pure business rules with no DB / ML / framework dependency - safe to unit test
in isolation. Per BACKEND_INTEGRATION.md, `has_urgent_keyword` is explicitly
called out as simplest to compute on the backend side, right before calling
predict_priority().
"""

URGENT_KEYWORDS = ("urgent", "asap", "important", "deadline", "action required")


def has_urgent_keyword(subject: str | None, body: str | None) -> bool:
    text = f"{subject or ''} {body or ''}".lower()
    return any(keyword in text for keyword in URGENT_KEYWORDS)
