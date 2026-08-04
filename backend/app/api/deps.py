from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.infrastructure.database import get_db
from app.infrastructure.orm_models import User

# HTTPBearer makes the /docs "Authorize" popup a plain "paste your token" field -
# unlike OAuth2PasswordBearer, it does NOT try to call /auth/login itself with a
# username/password form (which doesn't match our JSON-based login endpoint).
bearer_scheme = HTTPBearer(bearerFormat="JWT", description="Paste the access_token from /auth/login here")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_error

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_error

    return user