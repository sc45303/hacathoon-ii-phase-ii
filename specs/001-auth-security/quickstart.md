# Quickstart: Authentication & API Security

**Feature**: 001-auth-security
**Date**: 2026-01-09

## Overview

This guide provides step-by-step instructions for setting up and testing the authentication and API security feature. Follow these steps to configure Better Auth on the frontend and JWT verification on the backend.

## Prerequisites

- Node.js 18+ and npm installed
- Python 3.11+ installed
- PostgreSQL database (Neon Serverless) accessible
- Git repository cloned
- Existing task CRUD functionality working (from Spec 001-task-crud)

## Setup Instructions

### 1. Environment Configuration

#### Backend Environment Variables

Create or update `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long-and-random

# Application
APP_NAME=Task CRUD API
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

**Important**: Generate a strong random secret for `BETTER_AUTH_SECRET`:
```bash
# Generate a secure random secret (32+ characters)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Frontend Environment Variables

Create or update `frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (MUST match backend secret)
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long-and-random

# Better Auth Database (optional - uses same as backend)
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Critical**: The `BETTER_AUTH_SECRET` must be **identical** in both frontend and backend.

---

### 2. Install Dependencies

#### Backend Dependencies

```bash
cd backend

# Add new dependencies to requirements.txt
echo "PyJWT==2.8.0" >> requirements.txt
echo "passlib[bcrypt]==1.7.4" >> requirements.txt
echo "python-multipart==0.0.6" >> requirements.txt

# Install all dependencies
pip install -r requirements.txt
```

#### Frontend Dependencies

```bash
cd frontend

# Install Better Auth
npm install better-auth @better-auth/react

# Install development dependencies (if not already installed)
npm install --save-dev @types/node @types/react @types/react-dom
```

---

### 3. Database Migration

#### Run Migration to Add Password Field

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "Add password_hash to users"

# Review the generated migration file in alembic/versions/
# Ensure it adds password_hash column to users table

# Apply migration
alembic upgrade head
```

**Expected Migration**:
```python
def upgrade():
    op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=False))

def downgrade():
    op.drop_column('users', 'password_hash')
```

---

### 4. Backend Implementation

#### Create Security Module

Create `backend/src/core/security.py`:

```python
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, status
from src.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(user_id: int, email: str) -> str:
    """Create a JWT token for a user."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7),
        "iss": "better-auth"
    }
    return jwt.encode(payload, settings.BETTER_AUTH_SECRET, algorithm="HS256")

def verify_jwt_token(token: str) -> dict:
    """Verify and decode a JWT token."""
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
```

#### Update Dependencies

Modify `backend/src/api/deps.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from src.core.database import get_session
from src.core.security import verify_jwt_token

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
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    return int(user_id)
```

#### Update Configuration

Modify `backend/src/core/config.py`:

```python
class Settings(BaseSettings):
    # ... existing fields ...

    # Authentication
    BETTER_AUTH_SECRET: str  # Remove Optional, make required
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 7
```

---

### 5. Frontend Implementation

#### Configure Better Auth

Create `frontend/src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    jwt({
      secret: process.env.BETTER_AUTH_SECRET!,
      expiresIn: "7d",
    })
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
})
```

#### Update API Client

Modify `frontend/src/lib/api.ts`:

```typescript
import { auth } from './auth'

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await auth()
  const token = session?.token

  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (response.status === 401) {
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin'
    }
    throw new APIError('Authentication required', 401)
  }

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }))

    throw new APIError(
      errorData.detail,
      response.status,
      errorData.error_code,
      errorData.field_errors
    )
  }

  return response.json()
}
```

---

### 6. Testing

#### Backend Tests

```bash
cd backend

# Test authentication endpoints
pytest tests/test_auth.py -v

# Test JWT protection on task endpoints
pytest tests/test_tasks.py -v

# Run all tests
pytest -v
```

#### Manual Testing with curl

**Sign Up**:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

**Sign In**:
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Access Protected Endpoint**:
```bash
# Save token from signin response
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Test Unauthorized Access**:
```bash
# Should return 401
curl -X GET http://localhost:8000/api/tasks
```

---

### 7. Running the Application

#### Start Backend

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

#### Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Verification Checklist

### Backend Verification

- [ ] `BETTER_AUTH_SECRET` is set in backend/.env
- [ ] PyJWT, passlib, python-multipart installed
- [ ] Database migration applied (password_hash column exists)
- [ ] `src/core/security.py` created with JWT functions
- [ ] `src/api/deps.py` updated with JWT verification
- [ ] Backend starts without errors: `uvicorn src.main:app --reload`
- [ ] API docs accessible at http://localhost:8000/docs

### Frontend Verification

- [ ] `BETTER_AUTH_SECRET` matches backend (identical value)
- [ ] better-auth and @better-auth/react installed
- [ ] `src/lib/auth.ts` created with Better Auth config
- [ ] `src/lib/api.ts` updated to include JWT in headers
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Can access http://localhost:3000

### Integration Verification

- [ ] User can sign up with email/password
- [ ] User can sign in and receive JWT token
- [ ] Authenticated requests to /api/tasks succeed
- [ ] Unauthenticated requests to /api/tasks return 401
- [ ] User can only see their own tasks
- [ ] Token expires after 7 days (test with modified exp claim)

---

## Troubleshooting

### "Invalid token" errors

**Cause**: BETTER_AUTH_SECRET mismatch between frontend and backend

**Solution**: Verify both .env files have identical BETTER_AUTH_SECRET values

### "Token has expired" immediately

**Cause**: System clock skew or incorrect exp claim

**Solution**: Check system time, verify token exp claim is 7 days in future

### "Not authenticated" on all requests

**Cause**: Token not being included in Authorization header

**Solution**: Check frontend api.ts includes `Authorization: Bearer ${token}` header

### Database connection errors

**Cause**: DATABASE_URL incorrect or database not accessible

**Solution**: Verify DATABASE_URL format and database is running

### Import errors for better-auth

**Cause**: Package not installed or wrong version

**Solution**: Run `npm install better-auth @better-auth/react` in frontend directory

---

## Next Steps

After completing this setup:

1. Run `/sp.tasks` to generate implementation tasks
2. Implement authentication endpoints (signup, signin)
3. Implement JWT verification middleware
4. Update task endpoints to require authentication
5. Create frontend auth pages (signin, signup)
6. Test end-to-end authentication flow
7. Deploy to production with HTTPS enabled

---

## Security Reminders

- ✅ Never commit .env files to git
- ✅ Use HTTPS in production
- ✅ Rotate BETTER_AUTH_SECRET periodically
- ✅ Use strong passwords (min 8 chars, complexity requirements)
- ✅ Monitor for suspicious authentication attempts
- ✅ Keep dependencies updated for security patches

---

## Reference Documentation

- Better Auth: https://better-auth.com/docs
- PyJWT: https://pyjwt.readthedocs.io/
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- JWT.io: https://jwt.io/ (for debugging tokens)
