# Comprehensive Error Handling Implementation

## Overview

This document describes the complete error handling system implemented across the backend (FastAPI) and frontend (Next.js) for the AI chat application.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ERROR FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. AI Provider Error (e.g., rate limit, invalid key)           │
│                    ↓                                             │
│  2. classify_ai_error() → Specific Exception                    │
│                    ↓                                             │
│  3. Global Exception Handler → ErrorResponse                    │
│                    ↓                                             │
│  4. HTTP Response (JSON with error_code, detail, source)        │
│                    ↓                                             │
│  5. Frontend chatService.ts → ApiError                          │
│                    ↓                                             │
│  6. ChatInterface.tsx → User-Friendly Message                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Implementation

### 1. Error Response Schema (`backend/src/schemas/error.py`)

**Structured Error Response:**
```python
class ErrorResponse(BaseModel):
    error_code: str              # Machine-readable error code
    detail: str                  # Human-readable error message
    source: Literal[...]         # Error source (AI_PROVIDER, AUTHENTICATION, etc.)
    provider: Optional[str]      # AI provider name (gemini, openrouter, cohere)
```

**Error Code Constants:**
```python
class ErrorCode:
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
```

### 2. Custom Exception Classes (`backend/src/core/exceptions.py`)

**Exception Hierarchy:**
```python
AIProviderException (base)
├── RateLimitExceededException (429)
├── APIKeyMissingException (503)
├── APIKeyInvalidException (401)
├── ProviderUnavailableException (503)
└── ProviderErrorException (500)
```

**Example Exception:**
```python
class RateLimitExceededException(AIProviderException):
    def __init__(self, provider: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
            detail="AI service rate limit exceeded. Please wait a moment and try again.",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            provider=provider
        )
```

### 3. Error Classification (`backend/src/core/exceptions.py`)

**Automatic Error Classification:**
```python
def classify_ai_error(error: Exception, provider: Optional[str] = None) -> AIProviderException:
    """
    Classify an AI provider error and return appropriate exception.

    Analyzes error message for keywords:
    - "rate limit", "429", "quota exceeded" → RateLimitExceededException
    - "api key not found", "missing api key" → APIKeyMissingException
    - "invalid api key", "unauthorized", "401" → APIKeyInvalidException
    - "503", "service unavailable", "timeout" → ProviderUnavailableException
    - Everything else → ProviderErrorException
    """
```

### 4. Global Exception Handler (`backend/src/main.py`)

**Converts Exceptions to Structured Responses:**
```python
@app.exception_handler(AIProviderException)
async def ai_provider_exception_handler(request: Request, exc: AIProviderException):
    error_response = ErrorResponse(
        error_code=exc.error_code,
        detail=exc.detail,
        source=exc.source,
        provider=exc.provider
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )
```

### 5. Updated Chat Endpoint (`backend/src/api/routes/chat.py`)

**Uses Custom Exceptions:**
```python
try:
    agent_result = await agent_runner.execute(...)
except Exception as e:
    # Automatically classify and raise appropriate exception
    raise classify_ai_error(e, provider=settings.LLM_PROVIDER)
```

## Frontend Implementation

### 1. Error Types (`frontend/src/types/error.ts`)

**TypeScript Error Response Interface:**
```typescript
export interface ErrorResponse {
  error_code: string;
  detail: string;
  source: 'AI_PROVIDER' | 'AUTHENTICATION' | 'VALIDATION' | 'DATABASE' | 'INTERNAL';
  provider?: string;
}
```

**Custom ApiError Class:**
```typescript
export class ApiError extends Error {
  public readonly errorCode: string;
  public readonly source: ErrorResponse['source'];
  public readonly provider?: string;
  public readonly statusCode: number;

  getUserFriendlyMessage(): string {
    // Returns user-friendly message based on error code
  }

  shouldLogout(): boolean {
    // Returns true for authentication errors
  }

  isRetryable(): boolean {
    // Returns true for temporary failures
  }
}
```

### 2. Service Layer Error Parsing (`frontend/src/services/chatService.ts`)

**Structured Error Handling:**
```typescript
async function handleApiError(response: Response): Promise<never> {
  const errorData: ErrorResponse = await response.json();

  // Log technical details to console for debugging
  console.error('API Error:', {
    status: response.status,
    errorCode: errorData.error_code,
    detail: errorData.detail,
    source: errorData.source,
    provider: errorData.provider,
  });

  // Throw structured ApiError
  throw new ApiError(errorData, response.status);
}
```

### 3. UI Layer Error Display (`frontend/src/components/chat/ChatInterface.tsx`)

**User-Friendly Error Messages:**
```typescript
catch (err) {
  if (err instanceof ApiError) {
    // Log technical details to console
    console.error('API Error:', {
      errorCode: err.errorCode,
      source: err.source,
      provider: err.provider,
      statusCode: err.statusCode,
      detail: err.message,
    });

    // Get user-friendly message
    const userFriendlyMessage = err.getUserFriendlyMessage();
    setError(userFriendlyMessage);
  } else {
    // Handle generic errors
    const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
    setError(errorMessage);
  }
}
```

## Error Message Mapping

| Error Code | HTTP Status | User-Friendly Message |
|-----------|-------------|----------------------|
| `RATE_LIMIT_EXCEEDED` | 429 | "Too many requests. Please wait a moment and try again." |
| `API_KEY_MISSING` | 503 | "AI service is not configured. Please contact support." |
| `API_KEY_INVALID` | 401 | "AI service authentication failed. Please contact support." |
| `PROVIDER_UNAVAILABLE` | 503 | "AI service is temporarily unavailable. Please try again in a few moments." |
| `PROVIDER_ERROR` | 500 | "AI service encountered an error. Please try again." |
| `UNAUTHORIZED` | 401 | "You are not authorized to perform this action." |
| `TOKEN_EXPIRED` | 401 | "Your session has expired. Please log in again." |
| `TOKEN_INVALID` | 401 | "Invalid authentication. Please log in again." |
| `MESSAGE_TOO_LONG` | 400 | "Your message is too long. Please shorten it and try again." |
| `MESSAGE_EMPTY` | 400 | "Please enter a message before sending." |
| `CONVERSATION_NOT_FOUND` | 404 | "Conversation not found. Please start a new conversation." |
| `DATABASE_ERROR` | 500 | "A database error occurred. Please try again." |
| `INTERNAL_ERROR` | 500 | "An unexpected error occurred. Please try again." |

## Example Error Flow

### Scenario: Rate Limit Exceeded

**1. AI Provider Returns Error:**
```
Exception: "Error: 429 rate limit exceeded - quota exhausted"
```

**2. Backend Classifies Error:**
```python
classify_ai_error(error, provider="gemini")
# Returns: RateLimitExceededException(provider="gemini")
```

**3. Global Handler Converts to ErrorResponse:**
```json
{
  "error_code": "RATE_LIMIT_EXCEEDED",
  "detail": "AI service rate limit exceeded. Please wait a moment and try again.",
  "source": "AI_PROVIDER",
  "provider": "gemini"
}
```

**4. Frontend Parses Error:**
```typescript
const apiError = new ApiError(errorData, 429);
// apiError.errorCode = "RATE_LIMIT_EXCEEDED"
// apiError.source = "AI_PROVIDER"
// apiError.provider = "gemini"
```

**5. UI Displays User-Friendly Message:**
```
Error Banner: "Too many requests. Please wait a moment and try again."
Console Log: {
  errorCode: "RATE_LIMIT_EXCEEDED",
  source: "AI_PROVIDER",
  provider: "gemini",
  statusCode: 429,
  detail: "AI service rate limit exceeded..."
}
```

## Testing

### Backend Tests (`backend/test_error_handling.py`)

**Test Coverage:**
- ✅ Error classification (rate limit, missing key, invalid key, unavailable, generic)
- ✅ Error response structure (error_code, detail, source, provider, status_code)
- ✅ Error code constants (all error codes defined)
- ✅ HTTP status codes (401, 429, 503, 500)

**Test Results:**
```
============================================================
[SUCCESS] ALL TESTS PASSED!
============================================================

Error handling implementation is working correctly:
[OK] Backend structured error responses with error codes
[OK] Correct HTTP status codes (401, 429, 503, 500)
[OK] Error classification (missing API key, invalid key, rate limit, provider error)
[OK] Clear error identification and user-friendly messages
============================================================
```

### Frontend Build

**TypeScript Compilation:**
```
✓ Compiled successfully
✓ Running TypeScript
✓ Generating static pages
```

## Benefits

### 1. **Structured Error Responses**
- Machine-readable error codes for programmatic handling
- Consistent error format across all endpoints
- Clear error source identification

### 2. **User-Friendly Messages**
- Technical details hidden from users
- Clear, actionable error messages
- No duplicate error banners

### 3. **Debugging Support**
- Technical details logged to console
- Error source and provider tracked
- Full error context preserved

### 4. **Type Safety**
- TypeScript interfaces for error responses
- Compile-time error checking
- IntelliSense support

### 5. **Maintainability**
- Centralized error handling logic
- Easy to add new error types
- Consistent error handling patterns

## Files Modified/Created

### Backend
- ✅ `backend/src/schemas/error.py` (NEW)
- ✅ `backend/src/core/exceptions.py` (NEW)
- ✅ `backend/src/main.py` (MODIFIED - added global exception handlers)
- ✅ `backend/src/api/routes/chat.py` (MODIFIED - uses custom exceptions)
- ✅ `backend/test_error_handling.py` (NEW - test suite)

### Frontend
- ✅ `frontend/src/types/error.ts` (NEW)
- ✅ `frontend/src/services/chatService.ts` (MODIFIED - structured error parsing)
- ✅ `frontend/src/components/chat/ChatInterface.tsx` (MODIFIED - user-friendly messages)

## Summary

The comprehensive error handling system is now fully implemented and tested. It provides:

1. **Backend**: Structured error responses with error codes, correct HTTP status codes, and clear error identification
2. **Frontend**: Service layer error parsing, UI layer user-friendly messages, and debugging support
3. **Testing**: All backend tests passing, frontend builds successfully
4. **Documentation**: Complete error flow, message mapping, and example scenarios

The system is production-ready and provides excellent user experience while maintaining full debugging capabilities for developers.
