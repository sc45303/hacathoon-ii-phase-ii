"""Authentication service for user signup and signin."""
from sqlmodel import Session, select
from fastapi import HTTPException, status
from src.models.user import User
from src.schemas.auth import SignupRequest, SigninRequest, SignupResponse, TokenResponse, UserProfile
from src.core.security import hash_password, verify_password, create_jwt_token
from src.core.config import settings
from datetime import datetime
import re


class AuthService:
    """Service for handling authentication operations."""

    def __init__(self, db: Session):
        self.db = db

    def signup(self, signup_data: SignupRequest) -> SignupResponse:
        """
        Create a new user account.

        Args:
            signup_data: User signup information

        Returns:
            SignupResponse with created user details

        Raises:
            HTTPException: 409 if email already exists
            HTTPException: 400 if validation fails
        """
        # Validate email format (RFC 5322)
        if not self._validate_email(signup_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format",
            )

        # Validate password strength
        password_errors = self._validate_password(signup_data.password)
        if password_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet requirements",
                headers={"X-Password-Errors": ", ".join(password_errors)}
            )

        # Check if email already exists
        existing_user = self.db.exec(
            select(User).where(User.email == signup_data.email)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        # Hash password
        password_hash = hash_password(signup_data.password)

        # Create user
        user = User(
            email=signup_data.email,
            name=signup_data.name,
            password_hash=password_hash,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return SignupResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            created_at=user.created_at,
        )

    def signin(self, signin_data: SigninRequest) -> TokenResponse:
        """
        Authenticate user and issue JWT token.

        Args:
            signin_data: User signin credentials

        Returns:
            TokenResponse with JWT token and user profile

        Raises:
            HTTPException: 401 if credentials are invalid
        """
        # Find user by email
        user = self.db.exec(
            select(User).where(User.email == signin_data.email)
        ).first()

        # Verify password
        if not user or not verify_password(signin_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Create JWT token
        token = create_jwt_token(
            user_id=user.id,
            email=user.email,
            secret=settings.BETTER_AUTH_SECRET,
            expiration_days=settings.JWT_EXPIRATION_DAYS,
        )

        # Calculate expiration in seconds (7 days = 604800 seconds)
        expires_in = settings.JWT_EXPIRATION_DAYS * 24 * 60 * 60

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=expires_in,
            user=UserProfile(
                id=user.id,
                email=user.email,
                name=user.name,
                created_at=user.created_at,
            ),
        )

    def _validate_email(self, email: str) -> bool:
        """
        Validate email format (RFC 5322).

        Args:
            email: Email address to validate

        Returns:
            True if valid, False otherwise
        """
        # Simplified RFC 5322 email validation
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    def _validate_password(self, password: str) -> list[str]:
        """
        Validate password strength.

        Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number

        Args:
            password: Password to validate

        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []

        if len(password) < 8:
            errors.append("Password must be at least 8 characters")

        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")

        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")

        if not re.search(r'\d', password):
            errors.append("Password must contain at least one number")

        return errors
