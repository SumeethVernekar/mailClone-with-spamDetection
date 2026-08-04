from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.infrastructure.database import get_db
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    user = auth_service.signup(db, req)
    return user


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    token = auth_service.login(db, req)
    return TokenResponse(access_token=token)
