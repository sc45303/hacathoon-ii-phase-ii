# """Security utilities for authentication and authorization."""
# import jwt
# from datetime import datetime, timedelta
# from passlib.context import CryptContext
# from fastapi import HTTPException, status
# from typing import Optional

# # Password hashing context
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# def hash_password(password: str) -> str:
#     if len(password.encode("utf-8")) > 72:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Password must be at most 72 characters"
#         )
#     return pwd_context.hash(password)


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     """
#     Verify a password against its hash.

#     Args:
#         plain_password: Plain text password to verify
#         hashed_password: Hashed password to compare against

#     Returns:
#         True if password matches, False otherwise
#     """
#     return pwd_context.verify(plain_password, hashed_password)


# def create_jwt_token(user_id: int, email: str, secret: str, expiration_days: int = 7) -> str:
#     """
#     Create a JWT token for a user.

#     Args:
#         user_id: User's unique identifier
#         email: User's email address
#         secret: Secret key for signing the token
#         expiration_days: Number of days until token expires (default: 7)

#     Returns:
#         Encoded JWT token string
#     """
#     now = datetime.utcnow()
#     payload = {
#         "sub": str(user_id),
#         "email": email,
#         "iat": now,
#         "exp": now + timedelta(days=expiration_days),
#         "iss": "better-auth"
#     }
#     return jwt.encode(payload, secret, algorithm="HS256")


# def verify_jwt_token(token: str, secret: str) -> dict:
#     """
#     Verify and decode a JWT token.

#     Args:
#         token: JWT token string to verify
#         secret: Secret key used to sign the token

#     Returns:
#         Decoded token payload as dictionary

#     Raises:
#         HTTPException: 401 if token is expired or invalid
#     """
#     try:
#         payload = jwt.decode(
#             token,
#             secret,
#             algorithms=["HS256"],
#             options={
#                 "verify_signature": True,
#                 "verify_exp": True,
#                 "require": ["sub", "email", "iat", "exp", "iss"]
#             }
#         )

#         # Validate issuer
#         if payload.get("iss") != "better-auth":
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Invalid token issuer",
#                 headers={"WWW-Authenticate": "Bearer"}
#             )

#         return payload

#     except jwt.ExpiredSignatureError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token has expired",
#             headers={"WWW-Authenticate": "Bearer"}
#         )
#     except jwt.InvalidTokenError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token",
#             headers={"WWW-Authenticate": "Bearer"}
#         )



"""Security utilities for authentication and authorization."""
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from src.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
import hashlib
MAX_BCRYPT_BYTES = 72


def _normalize_password(password: str) -> bytes:
    """
    bcrypt only supports 72 bytes.
    This guarantees no runtime crash in any environment.
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > MAX_BCRYPT_BYTES:
        password_bytes = password_bytes[:MAX_BCRYPT_BYTES]
    return password_bytes


def hash_password(password: str) -> str:
    # SHA-256 produces 64 hex chars = 64 bytes < 72-byte limit
    pre_hashed = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return pwd_context.hash(pre_hashed)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pre_hashed = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return pwd_context.verify(pre_hashed, hashed_password)

def create_jwt_token(user_id: int, email: str, secret: str, expiration_days: int = 7) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + timedelta(days=expiration_days),
        "iss": "better-auth",
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def verify_jwt_token(token: str, secret: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_exp": True},
        )
        if payload.get("iss") != "better-auth":
            raise HTTPException(status_code=401, detail="Invalid token issuer")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and validate JWT token from Authorization header.

    Args:
        credentials: HTTP Bearer token credentials from request header

    Returns:
        Dictionary containing user information from token payload:
        - id: User ID (parsed from 'sub' claim)
        - email: User email
        - iat: Token issued at timestamp
        - exp: Token expiration timestamp

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    token = credentials.credentials

    try:
        payload = verify_jwt_token(token, settings.BETTER_AUTH_SECRET)

        # Extract user ID from 'sub' claim and convert to integer
        user_id = int(payload.get("sub"))

        return {
            "id": user_id,
            "email": payload.get("email"),
            "iat": payload.get("iat"),
            "exp": payload.get("exp")
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )
