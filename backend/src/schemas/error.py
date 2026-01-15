"""
Error response schemas for structured error handling.
"""

from typing import Optional, Literal
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Structured error response model."""

    error_code: str
    detail: str
    source: Literal["AI_PROVIDER", "AUTHENTICATION", "VALIDATION", "DATABASE", "INTERNAL"]
    provider: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "error_code": "RATE_LIMIT_EXCEEDED",
                "detail": "AI service rate limit exceeded. Please wait a moment and try again.",
                "source": "AI_PROVIDER",
                "provider": "gemini"
            }
        }


# Error code constants
class ErrorCode:
    """Standard error codes for the application."""

    # AI Provider errors
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    API_KEY_MISSING = "API_KEY_MISSING"
    API_KEY_INVALID = "API_KEY_INVALID"
    PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
    PROVIDER_ERROR = "PROVIDER_ERROR"

    # Authentication errors
    UNAUTHORIZED = "UNAUTHORIZED"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    TOKEN_INVALID = "TOKEN_INVALID"

    # Validation errors
    INVALID_INPUT = "INVALID_INPUT"
    MESSAGE_TOO_LONG = "MESSAGE_TOO_LONG"
    MESSAGE_EMPTY = "MESSAGE_EMPTY"

    # Database errors
    CONVERSATION_NOT_FOUND = "CONVERSATION_NOT_FOUND"
    DATABASE_ERROR = "DATABASE_ERROR"

    # Internal errors
    INTERNAL_ERROR = "INTERNAL_ERROR"
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
