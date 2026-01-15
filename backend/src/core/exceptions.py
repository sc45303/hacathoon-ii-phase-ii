"""
Custom exception classes for structured error handling.
"""

from typing import Optional
from fastapi import HTTPException, status
from src.schemas.error import ErrorCode


class AIProviderException(HTTPException):
    """Base exception for AI provider errors."""

    def __init__(
        self,
        error_code: str,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        provider: Optional[str] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.source = "AI_PROVIDER"
        self.provider = provider


class RateLimitExceededException(AIProviderException):
    """Exception raised when AI provider rate limit is exceeded."""

    def __init__(self, provider: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
            detail="AI service rate limit exceeded. Please wait a moment and try again.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            provider=provider
        )


class APIKeyMissingException(AIProviderException):
    """Exception raised when API key is not configured."""

    def __init__(self, provider: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.API_KEY_MISSING,
            detail="AI service is not configured. Please add an API key.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            provider=provider
        )


class APIKeyInvalidException(AIProviderException):
    """Exception raised when API key is invalid or expired."""

    def __init__(self, provider: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.API_KEY_INVALID,
            detail="Your API key is invalid or expired. Please check your configuration.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            provider=provider
        )


class ProviderUnavailableException(AIProviderException):
    """Exception raised when AI provider is temporarily unavailable."""

    def __init__(self, provider: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.PROVIDER_UNAVAILABLE,
            detail="AI service is temporarily unavailable. Please try again later.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            provider=provider
        )


class ProviderErrorException(AIProviderException):
    """Exception raised for generic AI provider errors."""

    def __init__(self, detail: str, provider: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.PROVIDER_ERROR,
            detail=detail,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            provider=provider
        )


def classify_ai_error(error: Exception, provider: Optional[str] = None) -> AIProviderException:
    """
    Classify an AI provider error and return appropriate exception.

    Args:
        error: The original exception from the AI provider
        provider: Name of the AI provider (gemini, openrouter, cohere)

    Returns:
        Appropriate AIProviderException subclass
    """
    error_message = str(error).lower()

    # Rate limit errors
    if any(keyword in error_message for keyword in ["rate limit", "429", "quota exceeded", "too many requests"]):
        return RateLimitExceededException(provider=provider)

    # API key missing errors
    if any(keyword in error_message for keyword in ["api key not found", "api key is required", "missing api key"]):
        return APIKeyMissingException(provider=provider)

    # API key invalid errors
    if any(keyword in error_message for keyword in [
        "invalid api key", "api key invalid", "unauthorized", "401",
        "authentication failed", "invalid credentials", "api key expired"
    ]):
        return APIKeyInvalidException(provider=provider)

    # Provider unavailable errors
    if any(keyword in error_message for keyword in [
        "503", "service unavailable", "temporarily unavailable",
        "connection refused", "connection timeout", "timeout"
    ]):
        return ProviderUnavailableException(provider=provider)

    # Generic provider error
    return ProviderErrorException(
        detail=f"AI service error: {str(error)}",
        provider=provider
    )
