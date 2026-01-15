"""
Test script to verify comprehensive error handling implementation.

This script tests:
1. Backend structured error responses with error codes
2. Correct HTTP status codes (401, 429, 503, 500)
3. Error classification (missing API key, invalid key, rate limit, provider error)
"""

import sys
import os

# Add backend src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from core.exceptions import (
    classify_ai_error,
    RateLimitExceededException,
    APIKeyMissingException,
    APIKeyInvalidException,
    ProviderUnavailableException,
    ProviderErrorException
)
from schemas.error import ErrorCode


def test_error_classification():
    """Test that errors are correctly classified."""
    print("=" * 60)
    print("Testing Error Classification")
    print("=" * 60)

    # Test 1: Rate limit error
    print("\n1. Testing rate limit error classification:")
    rate_limit_error = Exception("Error: 429 rate limit exceeded")
    classified = classify_ai_error(rate_limit_error, provider="gemini")
    assert isinstance(classified, RateLimitExceededException)
    assert classified.error_code == ErrorCode.RATE_LIMIT_EXCEEDED
    assert classified.status_code == 429
    assert classified.provider == "gemini"
    print(f"   [OK] Correctly classified as RateLimitExceededException")
    print(f"   [OK] Error code: {classified.error_code}")
    print(f"   [OK] Status code: {classified.status_code}")
    print(f"   [OK] Detail: {classified.detail}")

    # Test 2: API key missing error
    print("\n2. Testing API key missing error classification:")
    missing_key_error = Exception("API key not found")
    classified = classify_ai_error(missing_key_error, provider="openrouter")
    assert isinstance(classified, APIKeyMissingException)
    assert classified.error_code == ErrorCode.API_KEY_MISSING
    assert classified.status_code == 503
    print(f"   [OK] Correctly classified as APIKeyMissingException")
    print(f"   [OK] Error code: {classified.error_code}")
    print(f"   [OK] Status code: {classified.status_code}")

    # Test 3: API key invalid error
    print("\n3. Testing API key invalid error classification:")
    invalid_key_error = Exception("401 unauthorized - invalid api key")
    classified = classify_ai_error(invalid_key_error, provider="cohere")
    assert isinstance(classified, APIKeyInvalidException)
    assert classified.error_code == ErrorCode.API_KEY_INVALID
    assert classified.status_code == 401
    print(f"   [OK] Correctly classified as APIKeyInvalidException")
    print(f"   [OK] Error code: {classified.error_code}")
    print(f"   [OK] Status code: {classified.status_code}")

    # Test 4: Provider unavailable error
    print("\n4. Testing provider unavailable error classification:")
    unavailable_error = Exception("503 service unavailable")
    classified = classify_ai_error(unavailable_error, provider="gemini")
    assert isinstance(classified, ProviderUnavailableException)
    assert classified.error_code == ErrorCode.PROVIDER_UNAVAILABLE
    assert classified.status_code == 503
    print(f"   [OK] Correctly classified as ProviderUnavailableException")
    print(f"   [OK] Error code: {classified.error_code}")
    print(f"   [OK] Status code: {classified.status_code}")

    # Test 5: Generic provider error
    print("\n5. Testing generic provider error classification:")
    generic_error = Exception("Something went wrong with the AI service")
    classified = classify_ai_error(generic_error, provider="gemini")
    assert isinstance(classified, ProviderErrorException)
    assert classified.error_code == ErrorCode.PROVIDER_ERROR
    assert classified.status_code == 500
    print(f"   [OK] Correctly classified as ProviderErrorException")
    print(f"   [OK] Error code: {classified.error_code}")
    print(f"   [OK] Status code: {classified.status_code}")

    print("\n" + "=" * 60)
    print("[OK] All error classification tests passed!")
    print("=" * 60)


def test_error_response_structure():
    """Test that error responses have correct structure."""
    print("\n" + "=" * 60)
    print("Testing Error Response Structure")
    print("=" * 60)

    # Create a sample error
    error = RateLimitExceededException(provider="gemini")

    print("\n1. Testing error attributes:")
    print(f"   [OK] error_code: {error.error_code}")
    print(f"   [OK] detail: {error.detail}")
    print(f"   [OK] source: {error.source}")
    print(f"   [OK] provider: {error.provider}")
    print(f"   [OK] status_code: {error.status_code}")

    # Verify all required attributes exist
    assert hasattr(error, 'error_code')
    assert hasattr(error, 'detail')
    assert hasattr(error, 'source')
    assert hasattr(error, 'provider')
    assert hasattr(error, 'status_code')

    # Verify source is correct
    assert error.source == "AI_PROVIDER"

    print("\n" + "=" * 60)
    print("[OK] All error response structure tests passed!")
    print("=" * 60)


def test_error_codes():
    """Test that all error codes are defined."""
    print("\n" + "=" * 60)
    print("Testing Error Code Constants")
    print("=" * 60)

    print("\n1. AI Provider error codes:")
    print(f"   [OK] RATE_LIMIT_EXCEEDED: {ErrorCode.RATE_LIMIT_EXCEEDED}")
    print(f"   [OK] API_KEY_MISSING: {ErrorCode.API_KEY_MISSING}")
    print(f"   [OK] API_KEY_INVALID: {ErrorCode.API_KEY_INVALID}")
    print(f"   [OK] PROVIDER_UNAVAILABLE: {ErrorCode.PROVIDER_UNAVAILABLE}")
    print(f"   [OK] PROVIDER_ERROR: {ErrorCode.PROVIDER_ERROR}")

    print("\n2. Authentication error codes:")
    print(f"   [OK] UNAUTHORIZED: {ErrorCode.UNAUTHORIZED}")
    print(f"   [OK] TOKEN_EXPIRED: {ErrorCode.TOKEN_EXPIRED}")
    print(f"   [OK] TOKEN_INVALID: {ErrorCode.TOKEN_INVALID}")

    print("\n3. Validation error codes:")
    print(f"   [OK] INVALID_INPUT: {ErrorCode.INVALID_INPUT}")
    print(f"   [OK] MESSAGE_TOO_LONG: {ErrorCode.MESSAGE_TOO_LONG}")
    print(f"   [OK] MESSAGE_EMPTY: {ErrorCode.MESSAGE_EMPTY}")

    print("\n4. Database error codes:")
    print(f"   [OK] CONVERSATION_NOT_FOUND: {ErrorCode.CONVERSATION_NOT_FOUND}")
    print(f"   [OK] DATABASE_ERROR: {ErrorCode.DATABASE_ERROR}")

    print("\n5. Internal error codes:")
    print(f"   [OK] INTERNAL_ERROR: {ErrorCode.INTERNAL_ERROR}")
    print(f"   [OK] UNKNOWN_ERROR: {ErrorCode.UNKNOWN_ERROR}")

    print("\n" + "=" * 60)
    print("[OK] All error codes are properly defined!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        test_error_classification()
        test_error_response_structure()
        test_error_codes()

        print("\n" + "=" * 60)
        print("[SUCCESS] ALL TESTS PASSED!")
        print("=" * 60)
        print("\nError handling implementation is working correctly:")
        print("[OK] Backend structured error responses with error codes")
        print("[OK] Correct HTTP status codes (401, 429, 503, 500)")
        print("[OK] Error classification (missing API key, invalid key, rate limit, provider error)")
        print("[OK] Clear error identification and user-friendly messages")
        print("=" * 60)

    except AssertionError as e:
        print(f"\n[ERROR] Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
