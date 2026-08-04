from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import Folder
from app.infrastructure.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    sent_emails: Mapped[list["Email"]] = relationship(
        "Email", foreign_keys="Email.sender_id", back_populates="sender"
    )
    received_emails: Mapped[list["Email"]] = relationship(
        "Email", foreign_keys="Email.recipient_id", back_populates="recipient"
    )


class Email(Base):
    __tablename__ = "emails"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    subject: Mapped[str] = mapped_column(String(998), default="")  # RFC 2822 subject limit
    body: Mapped[str] = mapped_column(Text, default="")

    folder: Mapped[str] = mapped_column(String(20), default=Folder.inbox.value, index=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    priority_score: Mapped[float] = mapped_column(Float, default=0.5)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)

    sender: Mapped["User"] = relationship("User", foreign_keys=[sender_id], back_populates="sent_emails")
    recipient: Mapped["User"] = relationship(
        "User", foreign_keys=[recipient_id], back_populates="received_emails"
    )
