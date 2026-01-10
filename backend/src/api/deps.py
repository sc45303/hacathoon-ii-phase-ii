from sqlmodel import Session
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.database import get_session
from src.core.security import verify_jwt_token
from src.core.config import settings

security = HTTPBearer()


def get_db() -> Generator[Session, None, None]:
    """Get database session dependency."""
    yield from get_session()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """
    Get current user ID from JWT token.

    Extracts and verifies JWT from Authorization header.

    Args:
        credentials: HTTP Bearer credentials from Authorization header

    Returns:
        User ID extracted from validated token

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials

    # Verify token and extract payload
    payload = verify_jwt_token(token, settings.BETTER_AUTH_SECRET)

    # Extract user ID from 'sub' claim
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return int(user_id)
