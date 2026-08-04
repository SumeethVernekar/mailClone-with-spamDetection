from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.schemas.email import EmailCreateRequest, EmailListResponse, EmailResponse
from app.domain.enums import Folder
from app.infrastructure.database import get_db
from app.infrastructure.orm_models import Email, User
from app.services import email_service

router = APIRouter(prefix="/emails", tags=["emails"])


def _to_response(email: Email) -> EmailResponse:
    return EmailResponse(
        id=email.id,
        subject=email.subject,
        body=email.body,
        folder=Folder(email.folder),
        is_read=email.is_read,
        priority_score=email.priority_score,
        sender_name=email.sender.name,
        sender_email=email.sender.email,
        created_at=email.created_at,
    )


@router.post("", response_model=EmailResponse, status_code=201)
def create_email(
    req: EmailCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = email_service.send_email(db, current_user, req)
    return _to_response(email)


@router.get("", response_model=EmailListResponse)
def list_emails(
    folder: Folder = Query(Folder.inbox),
    sort: str | None = Query(None, description="'priority' to sort by priority_score desc"),
    q: str | None = Query(None, description="search subject/body"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, emails = email_service.list_emails(db, current_user, folder, sort, q)
    return EmailListResponse(total=total, items=[_to_response(e) for e in emails])


@router.get("/{email_id}", response_model=EmailResponse)
def get_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    email = email_service.get_email(db, current_user, email_id)
    return _to_response(email)
