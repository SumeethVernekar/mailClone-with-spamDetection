"""The ENTIRE integration surface between ML and Backend.

Per the project plan, ML is not a separate service - it's just Python
code living inside the FastAPI app. Backend imports predict_spam() and
predict_priority() directly inside the POST /emails handler. That's it -
no HTTP calls, no microservice.

Deployment: this file is meant to be dropped in as app/ml/inference.py,
sitting next to app/ml/artifacts/ (the three .pkl files produced by
train_spam.py and train_priority.py). It deliberately does NOT import
anything from src/ (the training code) - training and inference are
separate concerns, and inference should have no dependency on how the
models were built, only on the saved artifacts.

Contract:
  predict_spam(subject, body) -> bool
  predict_priority(features: dict) -> float, in [0, 1]

  features dict must contain exactly these keys (see src/priority_features.py
  for the full rationale of each):
    sender_frequency: int    - total emails received from this sender
    reply_rate: float        - 0-1, how often user replied to this sender
    has_urgent_keyword: int  - 1 if subject/body has an urgency keyword, else 0
    hour_of_day: int         - 0-23, hour email was received

  Backend computes these from the DB and passes the dict in; ML never
  touches the DB.
"""
from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"

# Models are loaded once, at import time, not on every call - loading a
# .pkl file from disk is relatively slow, and the same model object can
# safely serve many predictions.
_spam_model = joblib.load(ARTIFACT_DIR / "spam_model.pkl")
_vectorizer = joblib.load(ARTIFACT_DIR / "vectorizer.pkl")
_priority_model = joblib.load(ARTIFACT_DIR / "priority_model.pkl")

# Must exactly match the column order used in src/train_priority.py /
# src/priority_features.py - if these drift apart, the model will silently
# read "reply_rate" values into what it thinks is "sender_frequency", etc.
_PRIORITY_FEATURE_ORDER = ["sender_frequency", "reply_rate", "has_urgent_keyword", "hour_of_day"]


def predict_spam(subject: str, body: str) -> bool:
    """Return True if the email looks like spam, else False.

    subject/body are combined into one string because that's how the
    model was trained (see data_loader.py's `text` column) - the
    vectorizer's vocabulary was learned on subject+body concatenated, so
    inference must feed it text in the same shape.
    """
    text = f"{subject or ''} {body or ''}".strip()
    vector = _vectorizer.transform([text])  # reuses vectorizer's learned vocabulary
    prediction = _spam_model.predict(vector)[0]  # 0 or 1
    return bool(prediction)


def predict_priority(features: dict) -> float:
    """Return a priority score in [0, 1] - higher means show near the top
    of the inbox.

    Raises ValueError if `features` is missing a required key, so a
    backend/ML contract mismatch fails loudly at integration time instead
    of silently corrupting predictions.
    """
    missing = [k for k in _PRIORITY_FEATURE_ORDER if k not in features]
    if missing:
        raise ValueError(f"predict_priority() missing required feature(s): {missing}")

    vector = np.array([[features[k] for k in _PRIORITY_FEATURE_ORDER]], dtype=float)
    raw_score = _priority_model.predict(vector)[0]
    # Ridge Regression has no built-in awareness that scores should stay in
    # [0, 1] - it can output slightly outside that range, so we clip here to
    # guarantee the contract holds no matter what the model predicts.
    return float(np.clip(raw_score, 0.0, 1.0))


if __name__ == "__main__":
    # Quick manual smoke test - mirrors the kind of integration test the
    # plan calls for before wiring this into the live POST /emails endpoint.
    spam_example = predict_spam(
        "FREE MONEY - Act now!!!",
        "Click here to claim your prize, limited time offer, no risk!",
    )
    ham_example = predict_spam(
        "Project timeline update",
        "Hi, wanted to check in on the timeline for the client deliverable. "
        "Can we sync briefly this week? Thanks.",
    )
    print("spam-looking email -> predict_spam():", spam_example)
    print("normal email        -> predict_spam():", ham_example)

    score = predict_priority(
        {
            "sender_frequency": 12,
            "reply_rate": 0.8,
            "has_urgent_keyword": 1,
            "hour_of_day": 10,
        }
    )
    print("engaged sender, urgent, work hours -> predict_priority():", round(score, 3))

    score_low = predict_priority(
        {
            "sender_frequency": 1,
            "reply_rate": 0.0,
            "has_urgent_keyword": 0,
            "hour_of_day": 3,
        }
    )
    print("cold sender, no reply history, 3am -> predict_priority():", round(score_low, 3))
