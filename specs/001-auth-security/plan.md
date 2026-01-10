# Implementation Plan: Authentication & API Security

**Branch**: `001-auth-security` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-security/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure user authentication using Better Auth on the frontend and JWT-based authorization on the backend. The system will enforce stateless authentication where Better Auth issues JWT tokens upon successful login, and the backend verifies these tokens on every API request to ensure users can only access their own data.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.3+ (frontend)
**Primary Dependencies**:
- Frontend: Next.js 16+, React 18, Better Auth (to be added), Tailwind CSS
- Backend: FastAPI 0.104+, SQLModel 0.0.14, PyJWT (to be added), Pydantic 2.5+

**Storage**: Neon Serverless PostgreSQL (existing users table needs password field)
**Testing**: pytest (backend), Jest/React Testing Library (frontend - to be configured)
**Target Platform**: Web application (Linux/Docker backend, browser frontend)
**Project Type**: Web (monorepo with separate frontend/ and backend/ directories)
**Performance Goals**:
- Token verification: <50ms per request
- Authentication flow: <5 seconds end-to-end
- Support 100+ concurrent authentication requests

**Constraints**:
- Stateless backend (no server-side session storage)
- Shared secret (BETTER_AUTH_SECRET) must be identical in frontend and backend
- JWT tokens must include user_id and email claims
- All task API endpoints must require valid JWT
- Token expiry: 7 days (resolved in research.md - balances security with UX without refresh tokens)

**Scale/Scope**:
- Multi-user application (100+ users initially)
- 5 authentication-related endpoints (signup, signin, token verification)
- All existing task endpoints (6) require JWT protection

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: User-Centric Functionality
✅ **PASS** - Authentication directly serves end-users by securing their data and enabling personalized task management. JWT-based authorization ensures each user only accesses their own tasks.

### Principle II: Spec-Driven Development
✅ **PASS** - This plan follows the Spec-Kit Plus workflow. All implementation will reference `/specs/001-auth-security/spec.md` and generated artifacts (data-model.md, contracts/).

### Principle III: Security & Data Privacy
✅ **PASS** - Core focus of this feature:
- JWT authentication on all task endpoints
- BETTER_AUTH_SECRET managed via environment variables
- User data filtered by authenticated user ID
- 401 responses for unauthorized requests
- No hardcoded secrets

### Principle IV: Scalable Architecture
✅ **PASS** - Stateless JWT design enables horizontal scaling:
- No server-side session storage
- Backend remains stateless
- Token verification is fast (<50ms target)
- Database queries use indexed user_id field

### Principle V: Maintainable & Consistent Code
✅ **PASS** - Follows established patterns:
- FastAPI dependency injection for JWT verification
- Better Auth integration on frontend
- Consistent error handling (401 for auth failures)
- Modular authentication middleware

### Key Standards Compliance

**API Compliance**: ✅ All authentication endpoints will be documented in `/specs/001-auth-security/contracts/`

**Database Integrity**: ✅ Users table already exists; will add password_hash field with proper constraints

**Frontend Quality**: ✅ Better Auth integration follows Next.js App Router patterns

**Authentication**: ✅ Core requirement - Better Auth + JWT as specified

**Spec Adherence**: ✅ All implementation references spec.md

### Gate Result: ✅ PASS - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-security/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-endpoints.yaml
│   └── jwt-schema.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── deps.py              # JWT verification dependency (modify)
│   │   └── routes/
│   │       ├── auth.py          # New: signup, signin endpoints
│   │       └── tasks.py         # Existing: already uses get_current_user
│   ├── core/
│   │   ├── config.py            # Add BETTER_AUTH_SECRET (modify)
│   │   ├── database.py          # Existing
│   │   └── security.py          # New: JWT verification logic
│   ├── models/
│   │   ├── user.py              # Add password_hash field (modify)
│   │   └── task.py              # Existing
│   ├── schemas/
│   │   ├── auth.py              # New: signup, signin, token schemas
│   │   └── task.py              # Existing
│   └── services/
│       ├── auth_service.py      # New: authentication business logic
│       └── task_service.py      # Existing
├── alembic/
│   └── versions/
│       └── 002_add_user_password.py  # New migration
└── tests/
    ├── test_auth.py             # New: authentication tests
    └── test_tasks.py            # Existing: update to test JWT protection

frontend/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx     # New: sign-in page
│   │   │   └── signup/
│   │   │       └── page.tsx     # New: sign-up page
│   │   ├── layout.tsx           # Modify: add auth provider
│   │   └── page.tsx             # Existing: task list (protect)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx   # New: sign-in form
│   │   │   └── SignUpForm.tsx   # New: sign-up form
│   │   └── tasks/               # Existing components
│   ├── lib/
│   │   ├── api.ts               # Modify: add JWT to headers
│   │   ├── auth.ts              # New: Better Auth configuration
│   │   └── types.ts             # Existing
│   └── providers/
│       └── AuthProvider.tsx     # New: auth context provider
└── tests/
    └── auth/                    # New: authentication tests
```

**Structure Decision**: Web application (Option 2) with separate backend/ and frontend/ directories. This is a monorepo structure where:
- Backend handles JWT verification and API protection
- Frontend handles Better Auth integration and token management
- Both share BETTER_AUTH_SECRET via environment variables

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations detected. All complexity is justified by security requirements and follows established patterns.
