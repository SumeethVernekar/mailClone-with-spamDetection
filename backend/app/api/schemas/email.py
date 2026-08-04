from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.domain.enums import Folder


class EmailCreateRequest(BaseModel):
    recipient_email: EmailStr
    subject: str = Field(default="", max_length=998)
    body: str = Field(default="")


class EmailResponse(BaseModel):
    id: int
    subject: str
    body: str
    folder: Folder
    is_read: bool
    priority_score: float
    sender_name: str
    sender_email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EmailListResponse(BaseModel):
    total: int
    items: list[EmailResponse]
