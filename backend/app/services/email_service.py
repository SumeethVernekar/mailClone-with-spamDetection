from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.schemas.email import EmailCreateRequest
from app.domain.enums import Folder
from app.domain.rules import has_urgent_keyword
from app.infrastructure.orm_models import Email, User
from app.ml.inference import predict_priority, predict_spam


def _compute_priority_features(db: Session, sender: User, recipient: User, subject: str, body: str) -> dict:
    """
    Builds the exact feature dict predict_priority() expects, computed from
    the recipient's perspective (they're the one whose inbox gets sorted by it).
    """
    # "Total emails received from this sender" (by the recipient), prior to this one
    sender_frequency = (
        db.query(Email)
        .filter(Email.sender_id == sender.id, Email.recipient_id == recipient.id)
        .count()
    )

    # "Emails sent by the current user (recipient) to this sender" / sender_frequency
    replies_sent = (
        db.query(Email)
        .filter(Email.sender_id == recipient.id, Email.recipient_id == sender.id)
        .count()
    )
    reply_rate = (replies_sent / sender_frequency) if sender_frequency > 0 else 0.0
    reply_rate = max(0.0, min(1.0, reply_rate))

    return {
        "sender_frequency": sender_frequency,
        "reply_rate": reply_rate,
        "has_urgent_keyword": 1 if has_urgent_keyword(subject, body) else 0,
        "hour_of_day": datetime.now(timezone.utc).hour,
    }


def send_email(db: Session, sender: User, req: EmailCreateRequest) -> Email:
    recipient = db.query(User).filter(User.email == req.recipient_email).first()
    if not recipient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

    is_spam = predict_spam(req.subject, req.body)
    folder = Folder.spam.value if is_spam else Folder.inbox.value

    features = _compute_priority_features(db, sender, recipient, req.subject, req.body)
    priority_score = predict_priority(features)

    email = Email(
        sender_id=sender.id,
        recipient_id=recipient.id,
        subject=req.subject,
        body=req.body,
        folder=folder,
        is_read=False,
        priority_score=priority_score,
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return email


def list_emails(
    db: Session,
    current_user: User,
    folder: Folder,
    sort: str | None,
    q: str | None,
) -> tuple[int, list[Email]]:

    query = db.query(Email)
    if folder == Folder.sent:
        query = query.filter(Email.sender_id == current_user.id)
    else:
        query = query.filter(Email.recipient_id == current_user.id, Email.folder == folder.value)

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Email.subject.ilike(like), Email.body.ilike(like)))

    total = query.count()
    

    if sort == "priority":
        query = query.order_by(Email.priority_score.desc())
    else:
        query = query.order_by(Email.created_at.desc())

    return total, query.all()


def get_email(db: Session, current_user: User, email_id: int) -> Email:
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email or (email.sender_id != current_user.id and email.recipient_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not found")

    if email.recipient_id == current_user.id and not email.is_read:
        email.is_read = True
        db.commit()
        db.refresh(email)

    return email