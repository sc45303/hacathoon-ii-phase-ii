---
id: 002
title: auth-security-implementation-plan
stage: plan
date: 2026-01-09
surface: agent
model: claude-sonnet-4-5
feature: auth-security
branch: 001-auth-security
user: suhail
command: /sp.plan
labels: ["authentication", "security", "jwt", "better-auth", "planning", "architecture"]
links:
  spec: specs/001-auth-security/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-auth-security/plan.md
  - specs/001-auth-security/research.md
  - specs/001-auth-security/data-model.md
  - specs/001-auth-security/quickstart.md
  - specs/001-auth-security/contracts/auth-endpoints.yaml
  - specs/001-auth-security/contracts/jwt-schema.yaml
tests:
  - Constitution Check validation (all principles passed)
  - Technical Context completeness check
  - Research phase completion (7 research questions resolved)
  - Phase 1 design artifacts generated
---

## Prompt

Authentication & API Security – Phase II Todo Web App

Objective:
- Secure the full-stack Todo application using Better Auth and JWT-based authorization, enforcing user isolation on all API endpoints.

Step-by-step Plan:

1. **Better Auth Configuration (Frontend)**
   - Configure Better Auth for email/password signup and signin
   - Enable JWT plugin to issue signed tokens on authentication
   - Set token expiry (e.g., 7 days)
   - Store JWT securely in the frontend session context
   - Ensure `BETTER_AUTH_SECRET` is sourced from environment variables

2. **Frontend API Client Integration**
   - Update `/lib/api.ts` to automatically attach JWT token to all requests
   - Include `Authorization: Bearer <token>` header
   - Handle `401 Unauthorized` responses gracefully (redirect to login)

3. **Backend JWT Verification**
   - Add FastAPI dependency or middleware to:
     - Extract JWT from Authorization header
     - Verify token signature using `BETTER_AUTH_SECRET`
     - Decode token payload (user_id, email)
     - Reject invalid or expired tokens with `401 Unauthorized`

4. **User Identity Enforcement**
   - Match authenticated user ID from JWT with `user_id` in request path
   - Reject requests where token user does not match path user
   - Prevent cross-user data access at all times

5. **API Route Protection**
   - Apply JWT verification dependency to all `/api/*` routes
   - Ensure all task queries are filtered by authenticated user
   - Enforce ownership checks for read, update, delete, and complete operations

6. **Environment & Configuration**
   - Define `BETTER_AUTH_SECRET` in frontend and backend environments
   - Document required environment variables in README or CLAUDE.md
   - Ensure development and production parity

7. **Testing & Validation**
   - Test unauthenticated requests → expect 401
   - Test authenticated requests → expect success
   - Verify user A cannot access user B's tasks
   - Validate token expiry behavior

8. **Documentation Updates**
   - Reference authentication behavior in `@specs/features/authentication.md`
   - Update backend and frontend CLAUDE.md with auth assumptions
   - Note limitations (no refresh tokens, no OAuth)

9. **Success Check**
   - Authentication flow works end-to-end
   - Backend is fully stateless
   - JWT verification is consistent and secure
   - User isolation is enforced across all endpoints

Notes:
- Task CRUD logic remains unchanged from Spec 1
- UI improvements and deployment handled in Spec 3
- No manual code edits; all changes generated via Claude Code

## Response snapshot

Successfully completed implementation planning for Authentication & API Security feature:

**Planning Artifacts Created**:

1. **plan.md** (167 lines)
   - Technical Context: Python 3.11+, TypeScript 5.3+, Better Auth, PyJWT
   - Constitution Check: All 5 principles passed
   - Project Structure: Detailed file tree for backend and frontend
   - Resolved token expiry clarification: 7 days (from research)

2. **research.md** (7 research questions resolved)
   - Token expiry duration: 7 days (balances security with UX)
   - Better Auth integration pattern with JWT plugin
   - Backend JWT verification strategy using PyJWT
   - Password hashing with passlib/bcrypt
   - Frontend token storage in httpOnly cookies
   - Error handling for authentication failures
   - Database schema changes (add password_hash field)

3. **data-model.md** (Entity definitions)
   - User entity: Added password_hash field (String 255, NOT NULL)
   - Task entity: No changes (already has user_id foreign key)
   - JWT Token: Virtual entity with payload structure
   - Database migration: 002_add_user_password.py
   - Security considerations and validation rules

4. **contracts/auth-endpoints.yaml** (OpenAPI 3.0 spec)
   - POST /api/auth/signup: User registration
   - POST /api/auth/signin: User authentication
   - GET /api/auth/me: Current user profile
   - Complete request/response schemas
   - Error response examples

5. **contracts/jwt-schema.yaml** (JWT specification)
   - Token structure: Header, Payload, Signature
   - Claims: sub, email, iat, exp, iss
   - Validation rules and error responses
   - Security considerations
   - Implementation examples

6. **quickstart.md** (Setup guide)
   - Environment configuration (frontend and backend)
   - Dependency installation (PyJWT, passlib, better-auth)
   - Database migration instructions
   - Backend implementation (security.py, deps.py)
   - Frontend implementation (auth.ts, api.ts)
   - Testing procedures and verification checklist

**Key Technical Decisions**:
- Token expiry: 7 days (no refresh tokens in this spec)
- JWT algorithm: HS256 with shared BETTER_AUTH_SECRET
- Password hashing: bcrypt with cost factor 12
- Token storage: httpOnly cookies (prevents XSS)
- Backend verification: FastAPI dependency injection
- Frontend integration: Better Auth with JWT plugin

**Dependencies Added**:
- Backend: PyJWT==2.8.0, passlib[bcrypt]==1.7.4, python-multipart==0.0.6
- Frontend: better-auth, @better-auth/react

**Agent Context Updated**:
- CLAUDE.md updated with Python 3.11+, TypeScript 5.3+, Neon PostgreSQL

## Outcome

- ✅ Impact: Complete implementation plan with 6 artifacts ready for task generation. Defines secure authentication architecture with JWT tokens, user isolation, and comprehensive setup instructions.
- 🧪 Tests: Constitution Check passed (all 5 principles). Research phase resolved 7 technical questions. Phase 1 design artifacts validated.
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, auth-endpoints.yaml, jwt-schema.yaml (6 files, ~1200 lines total)
- 🔁 Next prompts: `/sp.tasks` to generate implementation tasks from this plan
- 🧠 Reflection: Planning phase successfully resolved token expiry ambiguity (7 days chosen for UX without refresh tokens). Architecture follows constitutional principles with stateless JWT design, proper security practices, and clear separation of concerns.

## Evaluation notes (flywheel)

- Failure modes observed: None. All research questions resolved, no constitutional violations.
- Graders run and results (PASS/FAIL): Constitution Check - PASS (all 5 principles), Technical Context completeness - PASS, Research phase - PASS (7 questions resolved)
- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided step-by-step plan
- Next experiment (smallest change to try): Proceed to task generation phase with /sp.tasks command
