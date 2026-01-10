# Tasks: Authentication & API Security

**Input**: Design documents from `/specs/001-auth-security/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Add PyJWT==2.8.0, passlib[bcrypt]==1.7.4, python-multipart==0.0.6 to backend/requirements.txt
- [x] T002 Install backend dependencies with pip install -r backend/requirements.txt
- [x] T003 [P] Add better-auth and @better-auth/react to frontend/package.json
- [x] T004 [P] Install frontend dependencies with npm install in frontend/
- [x] T005 [P] Add BETTER_AUTH_SECRET to backend/.env (generate 32+ char random string)
- [x] T006 [P] Add BETTER_AUTH_SECRET to frontend/.env.local (same value as backend)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create backend/src/core/security.py with password hashing and JWT functions
- [x] T008 Update backend/src/core/config.py to add BETTER_AUTH_SECRET (required, not optional)
- [x] T009 Add password_hash field to User model in backend/src/models/user.py
- [x] T010 Create database migration backend/alembic/versions/002_add_user_password.py
- [x] T011 Run alembic upgrade head to apply password_hash migration
- [x] T012 Create backend/src/schemas/auth.py with SignupRequest, SigninRequest, TokenResponse schemas
- [x] T013 Create frontend/src/lib/auth.ts with Better Auth configuration (email/password + JWT plugin)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Sign Up (Priority: P1) 🎯 MVP

**Goal**: New users can create accounts with email and password

**Independent Test**: Submit signup form with valid credentials and verify account creation in database

### Implementation for User Story 1

- [x] T014 [P] [US1] Create backend/src/services/auth_service.py with signup method (hash password, create user)
- [x] T015 [P] [US1] Create backend/src/api/routes/auth.py with POST /api/auth/signup endpoint
- [x] T016 [US1] Add email validation (RFC 5322 format) in signup endpoint
- [x] T017 [US1] Add password validation (min 8 chars, uppercase, lowercase, number) in signup endpoint
- [x] T018 [US1] Handle duplicate email error (409 Conflict) in signup endpoint
- [x] T019 [P] [US1] Create frontend/src/components/auth/SignUpForm.tsx with form fields and validation
- [x] T020 [P] [US1] Create frontend/src/app/auth/signup/page.tsx using SignUpForm component
- [x] T021 [US1] Connect SignUpForm to Better Auth signup API

**Checkpoint**: Users can successfully sign up and create accounts

---

## Phase 4: User Story 2 - User Sign In (Priority: P2)

**Goal**: Registered users can sign in and receive JWT tokens

**Independent Test**: Submit signin form with valid credentials and verify JWT token is issued

### Implementation for User Story 2

- [x] T022 [US2] Add signin method to backend/src/services/auth_service.py (verify password, create JWT)
- [x] T023 [US2] Add POST /api/auth/signin endpoint to backend/src/api/routes/auth.py
- [x] T024 [US2] Return JWT token with 7-day expiration in signin response
- [x] T025 [US2] Handle invalid credentials with generic error (401 Unauthorized)
- [x] T026 [P] [US2] Create frontend/src/components/auth/SignInForm.tsx with email/password fields
- [x] T027 [P] [US2] Create frontend/src/app/auth/signin/page.tsx using SignInForm component
- [x] T028 [US2] Connect SignInForm to Better Auth signin API
- [x] T029 [US2] Store JWT token in httpOnly cookie via Better Auth session

**Checkpoint**: Users can sign in and receive valid JWT tokens

---

## Phase 5: User Story 3 - Protected API Access (Priority: P3)

**Goal**: Authenticated users can access API with JWT tokens and only see their own data

**Independent Test**: Make API request with valid token and verify only authenticated user's tasks are returned

### Implementation for User Story 3

- [x] T030 [US3] Update backend/src/api/deps.py get_current_user to extract and verify JWT from Authorization header
- [x] T031 [US3] Add HTTPBearer security scheme to get_current_user dependency
- [x] T032 [US3] Extract user_id from JWT 'sub' claim in get_current_user
- [x] T033 [US3] Return 401 Unauthorized if token is missing in get_current_user
- [x] T034 [P] [US3] Update frontend/src/lib/api.ts fetchAPI to include Authorization: Bearer header
- [x] T035 [P] [US3] Get JWT token from Better Auth session in fetchAPI
- [x] T036 [US3] Verify all task endpoints filter by authenticated user_id (already implemented, just verify)
- [x] T037 [US3] Add GET /api/auth/me endpoint to return current user profile

**Checkpoint**: API requests require valid JWT tokens and enforce user data isolation

---

## Phase 6: User Story 4 - Invalid Token Handling (Priority: P4)

**Goal**: System rejects invalid, expired, or missing tokens with clear error responses

**Independent Test**: Make API requests with invalid/missing tokens and verify 401 responses

### Implementation for User Story 4

- [x] T038 [P] [US4] Handle expired token error (jwt.ExpiredSignatureError) in backend/src/core/security.py
- [x] T039 [P] [US4] Handle invalid signature error (jwt.InvalidTokenError) in backend/src/core/security.py
- [x] T040 [P] [US4] Handle malformed token error in backend/src/api/deps.py get_current_user
- [x] T041 [US4] Return 401 with error_code TOKEN_EXPIRED for expired tokens
- [x] T042 [US4] Return 401 with error_code TOKEN_INVALID for invalid tokens
- [x] T043 [US4] Return 401 with error_code TOKEN_MISSING for missing tokens
- [x] T044 [US4] Add 401 error handling in frontend/src/lib/api.ts to redirect to /auth/signin

**Checkpoint**: All authentication errors are handled gracefully with appropriate responses

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration, testing, and documentation

- [x] T045 [P] Create frontend/src/providers/AuthProvider.tsx to wrap app with Better Auth context
- [x] T046 [P] Update frontend/src/app/layout.tsx to include AuthProvider
- [x] T047 Protect frontend/src/app/page.tsx (task list) to require authentication
- [x] T047.1 Register auth router in backend/src/main.py (bugfix)
- [ ] T048 Test signup flow end-to-end (frontend → backend → database)
- [ ] T049 Test signin flow end-to-end (frontend → backend → JWT issuance)
- [ ] T050 Test protected API access (valid token → success, invalid → 401)
- [ ] T051 Test user data isolation (user A cannot access user B's tasks)
- [x] T052 Verify BETTER_AUTH_SECRET is identical in frontend and backend .env files
- [x] T053 Update backend/README.md with authentication setup instructions
- [x] T054 Update frontend/README.md with Better Auth configuration notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Depends on US1 (needs User model with password_hash)
- **User Story 3 (P3)**: Can start after Foundational - Depends on US2 (needs JWT tokens to be issued)
- **User Story 4 (P4)**: Can start after US3 - Depends on JWT verification being implemented

### Within Each User Story

- Backend services before endpoints
- Backend endpoints before frontend components
- Frontend components before frontend pages
- Core implementation before error handling

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T006 can run in parallel
- **Phase 3 (US1)**: T014, T015 (backend) can run parallel with T019, T020 (frontend)
- **Phase 4 (US2)**: T026, T027 (frontend) can run parallel with backend work
- **Phase 5 (US3)**: T034, T035 (frontend) can run parallel with backend work
- **Phase 6 (US4)**: T038, T039, T040 can run in parallel
- **Phase 7**: T045, T046, T053, T054 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend and frontend tasks together:
Task: "Create backend/src/services/auth_service.py with signup method"
Task: "Create backend/src/api/routes/auth.py with POST /api/auth/signup endpoint"
Task: "Create frontend/src/components/auth/SignUpForm.tsx"
Task: "Create frontend/src/app/auth/signup/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T021)
4. **STOP and VALIDATE**: Test signup independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Test independently → Deploy
4. Add User Story 3 → Test independently → Deploy
5. Add User Story 4 → Test independently → Deploy
6. Polish → Final deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (signup)
   - Developer B: User Story 2 (signin) - starts after US1 model is ready
   - Developer C: User Story 3 (API protection) - starts after US2 tokens are ready
3. Stories integrate independently

---

## Notes

- Total tasks: 54
- MVP scope: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 21 tasks
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story should be independently testable
- Commit after each task or logical group
- Verify BETTER_AUTH_SECRET matches in both .env files
- Test authentication flow end-to-end before moving to next story
