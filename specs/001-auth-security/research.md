# Research: Authentication & API Security

**Feature**: 001-auth-security
**Date**: 2026-01-09
**Phase**: 0 - Research & Technical Decisions

## Overview

This document captures research findings and technical decisions for implementing authentication and API security using Better Auth (frontend) and JWT verification (backend).

## Research Questions & Resolutions

### 1. Token Expiry Duration

**Question**: Spec says 1 hour, user input says 7 days - which should we use?

**Decision**: **7 days**

**Rationale**:
- The spec explicitly excludes "Token refresh mechanism and refresh tokens" from scope
- Without refresh tokens, 1-hour expiry creates poor UX (users logged out every hour)
- This is a hackathon/MVP project where simplicity is prioritized
- 7 days balances security with usability for the initial release
- Industry standard for web apps *with refresh tokens* is 1 hour access + long-lived refresh
- Industry standard for web apps *without refresh tokens* is 7-30 days

**Alternatives Considered**:
- 1 hour: Too short without refresh mechanism, poor UX
- 24 hours: Reasonable middle ground, but 7 days is acceptable for MVP
- 30 days: Too long, increases security risk unnecessarily

**Implementation**: Set `exp` claim in JWT to 7 days (604800 seconds) from issuance

---

### 2. Better Auth Integration Pattern

**Question**: How should Better Auth be integrated in Next.js 16 App Router?

**Decision**: Use Better Auth with email/password provider and JWT plugin

**Research Findings**:
- Better Auth supports Next.js App Router with server-side session management
- JWT plugin allows issuing tokens that can be verified by external backends
- Configuration file: `lib/auth.ts` with email provider and JWT plugin
- Session management via Better Auth's built-in session handling
- Token accessible via `auth()` helper in server components

**Implementation Pattern**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
  database: {
    // Database connection for Better Auth's session storage
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt({
      secret: process.env.BETTER_AUTH_SECRET!,
      expiresIn: "7d",
    })
  ],
})
```

**Alternatives Considered**:
- NextAuth.js: More popular but heavier, Better Auth is simpler for JWT use case
- Custom JWT implementation: Reinventing the wheel, Better Auth handles edge cases
- Auth0/Clerk: Third-party services, adds external dependency and cost

---

### 3. Backend JWT Verification Strategy

**Question**: How should FastAPI verify JWT tokens from Better Auth?

**Decision**: Use PyJWT library with FastAPI dependency injection

**Research Findings**:
- PyJWT is the standard Python library for JWT handling
- FastAPI's dependency injection system is ideal for auth middleware
- Better Auth uses HS256 (HMAC-SHA256) by default with shared secret
- Token verification should happen in a reusable dependency

**Implementation Pattern**:
```python
# src/core/security.py
import jwt
from fastapi import HTTPException, status
from src.core.config import settings

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# src/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    token = credentials.credentials
    payload = verify_jwt_token(token)
    user_id = payload.get("sub")  # Better Auth uses 'sub' for user ID
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    return int(user_id)
```

**Alternatives Considered**:
- python-jose: Older library, PyJWT is more actively maintained
- Middleware approach: Less flexible than dependency injection
- Manual token parsing: Error-prone, PyJWT handles edge cases

---

### 4. Password Hashing Strategy

**Question**: How should passwords be hashed and verified?

**Decision**: Use passlib with bcrypt algorithm

**Research Findings**:
- Better Auth handles password hashing on the frontend side
- Backend needs to verify passwords for custom auth endpoints (if any)
- passlib is the standard Python library for password hashing
- bcrypt is industry-standard, resistant to rainbow table attacks
- Cost factor of 12 provides good security/performance balance

**Implementation Pattern**:
```python
# src/core/security.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Note**: Since Better Auth handles authentication, backend password hashing may only be needed for:
- Admin user creation scripts
- Testing utilities
- Future direct authentication endpoints

**Alternatives Considered**:
- argon2: More modern but requires C dependencies, complicates deployment
- scrypt: Good but bcrypt is more widely supported
- Plain SHA256: Insecure, vulnerable to rainbow tables

---

### 5. Frontend Token Storage

**Question**: Where should JWT tokens be stored in the frontend?

**Decision**: Use Better Auth's built-in session management (httpOnly cookies)

**Research Findings**:
- Better Auth stores session tokens in httpOnly cookies by default
- This prevents XSS attacks (JavaScript cannot access the token)
- Better Auth's `auth()` helper automatically includes token in requests
- For API calls to backend, extract token from Better Auth session

**Implementation Pattern**:
```typescript
// lib/api.ts
import { auth } from './auth'

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const session = await auth()
  const token = session?.token // Better Auth provides token in session

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // Handle 401 responses
  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/auth/signin'
  }

  return response.json()
}
```

**Alternatives Considered**:
- localStorage: Vulnerable to XSS attacks
- sessionStorage: Same XSS vulnerability as localStorage
- Memory only: Lost on page refresh, poor UX

---

### 6. Error Handling for Authentication Failures

**Question**: How should authentication errors be communicated to users?

**Decision**: Use standardized error responses with appropriate HTTP status codes

**Research Findings**:
- 401 Unauthorized: Authentication required or failed
- 403 Forbidden: Authenticated but not authorized (not used in this spec)
- Generic error messages prevent information leakage
- Specific errors only in development mode

**Implementation Pattern**:
```python
# Backend error responses
{
    "detail": "Invalid credentials",  # Generic, doesn't reveal if email or password wrong
    "error_code": "AUTH_FAILED"
}

{
    "detail": "Token has expired",
    "error_code": "TOKEN_EXPIRED"
}

{
    "detail": "Invalid token",
    "error_code": "TOKEN_INVALID"
}
```

**Security Considerations**:
- Never reveal whether email exists in database
- Never reveal which field (email/password) was incorrect
- Log detailed errors server-side for debugging
- Return generic errors to client

---

### 7. Database Schema Changes

**Question**: What changes are needed to the existing User model?

**Decision**: Add `password_hash` field to users table

**Research Findings**:
- Current User model has: id, email, name, created_at, updated_at
- Need to add: password_hash (string, nullable=False)
- Better Auth may also need its own tables for session management
- Migration should be reversible

**Implementation**:
```python
# alembic/versions/002_add_user_password.py
def upgrade():
    op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=False))

def downgrade():
    op.drop_column('users', 'password_hash')
```

**Note**: Better Auth may create its own tables (sessions, accounts, etc.) - these should be in a separate migration or handled by Better Auth's migration system.

---

## Dependencies to Add

### Backend
- `PyJWT==2.8.0` - JWT encoding/decoding
- `passlib[bcrypt]==1.7.4` - Password hashing
- `python-multipart==0.0.6` - Form data parsing (for login forms)

### Frontend
- `better-auth` - Authentication library
- `@better-auth/react` - React hooks for Better Auth

---

## Environment Variables

### Backend (.env)
```
BETTER_AUTH_SECRET=<shared-secret-min-32-chars>
DATABASE_URL=<neon-postgres-url>
```

### Frontend (.env.local)
```
BETTER_AUTH_SECRET=<same-shared-secret>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Critical**: BETTER_AUTH_SECRET must be identical in both frontend and backend.

---

## Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT tokens signed with HS256 and shared secret
- [x] Tokens expire after 7 days
- [x] httpOnly cookies prevent XSS attacks
- [x] Generic error messages prevent information leakage
- [x] HTTPS required in production (documented in assumptions)
- [x] User ID extracted from validated token, not request parameters
- [x] All task endpoints require authentication
- [x] Database queries filtered by authenticated user ID

---

## Next Steps

Phase 1 will use these research findings to:
1. Create data-model.md with User entity updates
2. Generate API contracts for auth endpoints
3. Create quickstart.md with setup instructions
4. Update agent context files with new dependencies
