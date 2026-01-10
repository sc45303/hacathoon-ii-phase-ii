# Tasks: Full-Stack Integration & UI Experience

**Input**: Design documents from `/specs/002-fullstack-ui-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Note**: Tests are not included as they were not explicitly requested in the feature specification. This feature focuses on integration and polish of existing functionality.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- All paths are relative to repository root

---

## Phase 1: Setup (6 tasks)

**Purpose**: Verify project structure and dependencies

- [x] T001 Verify backend project structure matches plan.md (backend/src/ with api/, core/, models/, schemas/, services/)
- [x] T002 Verify frontend project structure matches plan.md (frontend/src/ with app/, components/, lib/, providers/)
- [x] T003 [P] Verify backend dependencies installed (FastAPI, SQLModel, PyJWT, passlib, alembic)
- [x] T004 [P] Verify frontend dependencies installed (Next.js 16+, React 18+, TypeScript 5.x, Tailwind CSS 3.x)
- [x] T005 [P] Verify database connection works (backend can connect to PostgreSQL)
- [x] T006 [P] Verify environment variables exist (backend/.env and frontend/.env.local)

**Checkpoint**: Project structure and dependencies verified

---

## Phase 2: Foundational (7 tasks)

**Purpose**: Verify core infrastructure from Specs 1 & 2 works correctly

**⚠️ CRITICAL**: These tasks verify existing implementations are functional before adding UI polish

- [x] T007 Verify auth router is registered in backend/src/main.py (POST /api/auth/signup, POST /api/auth/signin, GET /api/auth/me)
- [x] T008 Verify task router is registered in backend/src/main.py (GET/POST /api/tasks, GET/PUT/PATCH/DELETE /api/tasks/{id})
- [x] T009 [P] Verify JWT token generation works in backend/src/core/security.py (create_access_token function)
- [x] T010 [P] Verify JWT token verification works in backend/src/api/deps.py (get_current_user dependency)
- [x] T011 [P] Verify API client exists in frontend/src/lib/api.ts with fetchAPI function
- [x] T012 [P] Verify AuthProvider exists in frontend/src/providers/AuthProvider.tsx with session management
- [x] T013 Test end-to-end flow: signup → signin → create task → signout (manual verification)

**Checkpoint**: Foundation verified - all existing implementations functional

---

## Phase 3: User Story 1 - Complete Authentication Flow (Priority: P1) 🎯 MVP (8 tasks)

**Goal**: Ensure seamless authentication experience from signup to task management

**Independent Test**: Navigate to application URL, complete signup, signin, and land on task management page with user profile displayed

### Implementation for User Story 1

- [x] T014 [P] [US1] Verify signup page exists at frontend/src/app/auth/signup/page.tsx with validation
- [x] T015 [P] [US1] Verify signin page exists at frontend/src/app/auth/signin/page.tsx with validation
- [x] T016 [US1] Verify protected route redirect in frontend/src/app/page.tsx (redirects unauthenticated users to signin)
- [x] T017 [US1] Add user profile display to header in frontend/src/app/layout.tsx (show "Welcome, {name}" when authenticated)
- [x] T018 [US1] Add signout button to header in frontend/src/app/layout.tsx (clears session and redirects to signin)
- [x] T019 [US1] Verify inline validation errors display in frontend/src/components/auth/SignUpForm.tsx (email, password, name)
- [x] T020 [US1] Verify inline validation errors display in frontend/src/components/auth/SignInForm.tsx (email, password)
- [x] T021 [US1] Test complete authentication flow: signup → signin → home page → signout (manual validation per quickstart.md)

**Checkpoint**: User Story 1 complete - authentication flow works end-to-end with proper UI feedback

---

## Phase 4: User Story 2 - Responsive UI States (Priority: P2) (8 tasks)

**Goal**: Provide clear visual feedback during all application states

**Independent Test**: Sign in, observe loading spinner, create first task and see empty state disappear, disconnect network and see error state

### Implementation for User Story 2

- [x] T022 [P] [US2] Add loading state to TaskList in frontend/src/components/tasks/TaskList.tsx (spinner with "Loading tasks..." message)
- [x] T023 [P] [US2] Add empty state to TaskList in frontend/src/components/tasks/TaskList.tsx (centered "No tasks yet" with CTA)
- [x] T024 [P] [US2] Add error state to TaskList in frontend/src/components/tasks/TaskList.tsx (error message with retry button)
- [x] T025 [P] [US2] Add loading state to TaskForm in frontend/src/components/tasks/TaskForm.tsx (disable submit button, show "Creating...")
- [x] T026 [US2] Add token expiration handling in frontend/src/lib/api.ts (redirect to signin with "Session expired" message on 401)
- [x] T027 [US2] Implement optimistic update for task completion in frontend/src/components/tasks/TaskItem.tsx (immediate UI update with rollback on error)
- [x] T028 [US2] Add loading state to task update operations in frontend/src/components/tasks/TaskItem.tsx (disable buttons during update)
- [x] T029 [US2] Test all UI states: loading, empty, error, token expiration (manual validation per quickstart.md)

**Checkpoint**: User Story 2 complete - all UI states provide clear feedback

---

## Phase 5: User Story 3 - Responsive Design (Priority: P3) (8 tasks)

**Goal**: Ensure application works seamlessly across desktop, tablet, and mobile devices

**Independent Test**: Open application at 1920px, 768px, and 375px viewports - verify layouts adjust appropriately

### Implementation for User Story 3

- [x] T030 [P] [US3] Verify/refine desktop layout in frontend/src/app/page.tsx (3-column: form, filters, list at ≥1024px)
- [x] T031 [P] [US3] Verify/refine tablet layout in frontend/src/app/page.tsx (2-column: form+filters, list at 768px-1023px)
- [x] T032 [P] [US3] Verify/refine mobile layout in frontend/src/app/page.tsx (1-column: stacked at <768px)
- [x] T033 [P] [US3] Verify touch target sizes in all buttons (min-h-[44px] min-w-[44px] classes)
- [x] T034 [P] [US3] Verify form responsiveness in frontend/src/components/auth/SignInForm.tsx (centered, readable on mobile)
- [x] T035 [P] [US3] Verify form responsiveness in frontend/src/components/auth/SignUpForm.tsx (centered, readable on mobile)
- [x] T036 [US3] Test responsive layouts at breakpoints: 375px (mobile), 768px (tablet), 1920px (desktop) using browser DevTools
- [x] T037 [US3] Verify no horizontal scrolling at any viewport width (manual validation per quickstart.md)

**Checkpoint**: User Story 3 complete - responsive design works across all devices

---

## Phase 6: User Story 4 - Centralized API Communication (Priority: P4) (7 tasks)

**Goal**: Ensure all API communication flows through unified client with consistent error handling

**Independent Test**: Review codebase to verify all API calls use fetchAPI, test JWT inclusion and 401 handling

### Implementation for User Story 4

- [x] T038 [P] [US4] Verify fetchAPI includes JWT token automatically in frontend/src/lib/api.ts (Authorization: Bearer header)
- [x] T039 [P] [US4] Verify 401 handling redirects to signin in frontend/src/lib/api.ts (clear session and redirect)
- [x] T040 [P] [US4] Verify error formatting consistency in frontend/src/lib/api.ts (APIError with detail, error_code, field_errors)
- [x] T041 [US4] Audit all components to ensure they use fetchAPI (TaskList, TaskForm, TaskItem, SignUpForm, SignInForm)
- [x] T042 [US4] Add timeout handling to fetchAPI in frontend/src/lib/api.ts (show "Unable to connect to server" on timeout)
- [x] T043 [US4] Test error scenarios: 401 Unauthorized, 500 Internal Server Error, network timeout (manual validation)
- [x] T044 [US4] Verify no unhandled promise rejections in browser console during error scenarios

**Checkpoint**: User Story 4 complete - API communication is centralized and consistent

---

## Phase 7: User Story 5 - Environment Coordination (Priority: P5) (6 tasks)

**Goal**: Ensure developers can set up and run the application easily

**Independent Test**: Follow README instructions to set up environment variables, start servers, and verify end-to-end functionality

### Implementation for User Story 5

- [x] T045 [P] [US5] Update backend/README.md with setup instructions (database setup, environment variables, migrations, server start)
- [x] T046 [P] [US5] Update frontend/README.md with setup instructions (environment variables, dependencies, server start)
- [x] T047 [P] [US5] Document all environment variables in backend/README.md (DATABASE_URL, BETTER_AUTH_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_DAYS)
- [x] T048 [P] [US5] Document all environment variables in frontend/README.md (NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET)
- [x] T049 [US5] Add environment variable validation on backend startup in backend/src/main.py (check required vars, show clear errors)
- [x] T050 [US5] Test setup from scratch: clone repo, follow README, verify application works (manual validation per quickstart.md)

**Checkpoint**: User Story 5 complete - environment setup is documented and validated

---

## Phase 8: Polish & Cross-Cutting Concerns (4 tasks)

**Purpose**: Final refinements and validation

- [x] T051 [P] Code cleanup: Remove console.logs, unused imports, commented code across frontend/src/
- [x] T052 [P] Verify all Tailwind CSS classes are used correctly (no inline styles) across frontend/src/
- [ ] T053 Manual testing: Complete all test scenarios in specs/002-fullstack-ui-integration/quickstart.md
- [ ] T054 Final validation: Run through all 5 user stories end-to-end and verify acceptance criteria

**Checkpoint**: Feature complete and ready for demo/review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but builds on existing components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Independent of all other stories

### Within Each User Story

- Tasks marked [P] can run in parallel (different files)
- Tasks without [P] may have dependencies on previous tasks in the same story
- Complete all tasks in a story before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003, T004, T005, T006 can run in parallel
- **Phase 2**: T009, T010, T011, T012 can run in parallel
- **Phase 3 (US1)**: T014, T015 can run in parallel
- **Phase 4 (US2)**: T022, T023, T024, T025 can run in parallel
- **Phase 5 (US3)**: T030, T031, T032, T033, T034, T035 can run in parallel
- **Phase 6 (US4)**: T038, T039, T040 can run in parallel
- **Phase 7 (US5)**: T045, T046, T047, T048 can run in parallel
- **Phase 8**: T051, T052 can run in parallel

---

## Parallel Example: User Story 2 (Responsive UI States)

```bash
# Launch all UI state additions in parallel:
Task: "Add loading state to TaskList in frontend/src/components/tasks/TaskList.tsx"
Task: "Add empty state to TaskList in frontend/src/components/tasks/TaskList.tsx"
Task: "Add error state to TaskList in frontend/src/components/tasks/TaskList.tsx"
Task: "Add loading state to TaskForm in frontend/src/components/tasks/TaskForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (6 tasks)
2. Complete Phase 2: Foundational (7 tasks) - CRITICAL
3. Complete Phase 3: User Story 1 (8 tasks)
4. **STOP and VALIDATE**: Test authentication flow end-to-end
5. Demo/review if ready

**Total MVP tasks**: 21 tasks

### Incremental Delivery

1. Complete Setup + Foundational → Foundation verified (13 tasks)
2. Add User Story 1 → Test independently → Demo (MVP!) (8 tasks)
3. Add User Story 2 → Test independently → Demo (8 tasks)
4. Add User Story 3 → Test independently → Demo (8 tasks)
5. Add User Story 4 → Test independently → Demo (7 tasks)
6. Add User Story 5 → Test independently → Demo (6 tasks)
7. Polish → Final validation → Demo (4 tasks)

**Total tasks**: 54 tasks

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (13 tasks)
2. Once Foundational is done:
   - Developer A: User Story 1 (8 tasks)
   - Developer B: User Story 2 (8 tasks)
   - Developer C: User Story 3 (8 tasks)
3. Then:
   - Developer A: User Story 4 (7 tasks)
   - Developer B: User Story 5 (6 tasks)
   - Developer C: Polish (4 tasks)

---

## Task Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| Phase 1: Setup | - | 6 | 4 |
| Phase 2: Foundational | - | 7 | 4 |
| Phase 3: US1 (MVP) | Complete Authentication Flow | 8 | 2 |
| Phase 4: US2 | Responsive UI States | 8 | 4 |
| Phase 5: US3 | Responsive Design | 8 | 6 |
| Phase 6: US4 | Centralized API Communication | 7 | 3 |
| Phase 7: US5 | Environment Coordination | 6 | 4 |
| Phase 8: Polish | Cross-Cutting Concerns | 4 | 2 |
| **TOTAL** | **5 User Stories** | **54** | **29** |

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Most tasks are verification/refinement since Specs 1 & 2 already implemented core functionality
- Focus is on UI polish (loading states, empty states, error handling) and integration
- Manual testing per quickstart.md is critical for validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
