"""
Authentication business logic: signup, login, JWT token creation.
"""
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.api.schemas.auth import LoginRequest, SignupRequest
from app.core.config import settings
from app.infrastructure.orm_models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_access_token(subject: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def signup(db: Session, req: SignupRequest) -> User:
    """Create a new user. Raises 400 if the email is already registered."""
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    user = User(
        name=req.name,
        email=req.email,
        password_hash=_hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, req: LoginRequest) -> str:
    """Authenticate a user and return a JWT access token."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not _verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _create_access_token(user.id)
