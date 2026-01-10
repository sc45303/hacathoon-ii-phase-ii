"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from src.api.deps import get_db, get_current_user
from src.schemas.auth import SignupRequest, SigninRequest, SignupResponse, TokenResponse, UserProfile
from src.services.auth_service import AuthService
from src.models.user import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(
    signup_data: SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.

    Args:
        signup_data: User signup information (email, password, name)
        db: Database session

    Returns:
        SignupResponse: Created user details

    Raises:
        HTTPException: 400 if validation fails
        HTTPException: 409 if email already exists
    """
    service = AuthService(db)
    return service.signup(signup_data)


@router.post("/signin", response_model=TokenResponse)
def signin(
    signin_data: SigninRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and issue JWT token.

    Args:
        signin_data: User signin credentials (email, password)
        db: Database session

    Returns:
        TokenResponse: JWT token and user profile

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    service = AuthService(db)
    return service.signin(signin_data)


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user's profile.

    Args:
        current_user_id: ID of authenticated user from JWT token
        db: Database session

    Returns:
        UserProfile: Current user's profile information

    Raises:
        HTTPException: 404 if user not found
    """
    user = db.exec(select(User).where(User.id == current_user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserProfile(
        id=user.id,
        email=user.email,
        name=user.name,
        created_at=user.created_at
    )
