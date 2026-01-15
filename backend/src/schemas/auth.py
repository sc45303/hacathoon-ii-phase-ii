"""Authentication schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional



class SignupRequest(BaseModel):
    email: EmailStr
    name: str
    password: str = Field(
        min_length=8,
        max_length=72,
        description="Password must be between 8 and 72 characters"
    )


class SigninRequest(BaseModel):
    """Request schema for user signin."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserProfile(BaseModel):
    """User profile response schema."""
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response schema for authentication with JWT token."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserProfile


class SignupResponse(BaseModel):
    """Response schema for successful signup."""
    id: int
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True
