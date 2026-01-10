---

description: "Task list for Task CRUD Operations feature implementation"
---

# Tasks: Task CRUD Operations

**Input**: Design documents from `/specs/001-task-crud/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: Not requested in specification - implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` for source code, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source code
- Paths shown below follow monorepo structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure with src/, tests/, alembic/ folders
- [x] T002 Create frontend directory structure with src/app/, src/components/, src/lib/ folders
- [x] T003 [P] Initialize Python project with requirements.txt (FastAPI, SQLModel, Pydantic, uvicorn, alembic, psycopg2-binary, python-dotenv)
- [x] T004 [P] Initialize Node.js project with package.json (Next.js 16+, React 18+, TypeScript, Tailwind CSS)
- [x] T005 [P] Configure Tailwind CSS in frontend/tailwind.config.ts and frontend/src/styles/globals.css
- [x] T006 [P] Create backend/.env.example with DATABASE_URL, APP_NAME, DEBUG, CORS_ORIGINS placeholders
- [x] T007 [P] Create frontend/.env.local.example with NEXT_PUBLIC_API_URL placeholder

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create database configuration in backend/src/core/config.py with Settings class
- [x] T009 Create database connection setup in backend/src/core/database.py with engine and session
- [x] T010 [P] Create User model stub in backend/src/models/user.py (id, email, name, timestamps)
- [x] T011 [P] Create Task model in backend/src/models/task.py (id, user_id, title, description, completed, timestamps)
- [x] T012 Initialize Alembic in backend/alembic/ and configure env.py with SQLModel metadata
- [x] T013 Generate initial migration for users and tasks tables with indexes
- [x] T014 Create FastAPI application entry point in backend/src/main.py with CORS middleware
- [x] T015 [P] Create API dependencies in backend/src/api/deps.py (get_db session, get_current_user stub)
- [x] T016 [P] Create TypeScript types in frontend/src/lib/types.ts (Task, TaskCreate, TaskUpdate interfaces)
- [x] T017 [P] Create API client base in frontend/src/lib/api.ts with fetch wrapper and error handling

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Create Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can view their task list and create new tasks

**Independent Test**: Log in, view empty task list, create task with title, see it appear in list

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create TaskCreate Pydantic schema in backend/src/schemas/task.py
- [ ] T019 [P] [US1] Create TaskResponse Pydantic schema in backend/src/schemas/task.py
- [ ] T020 [P] [US1] Create TaskListResponse Pydantic schema in backend/src/schemas/task.py
- [ ] T021 [US1] Create TaskService with get_tasks() and create_task() methods in backend/src/services/task_service.py
- [ ] T022 [US1] Implement GET /api/tasks endpoint in backend/src/api/routes/tasks.py
- [ ] T023 [US1] Implement POST /api/tasks endpoint in backend/src/api/routes/tasks.py
- [ ] T024 [US1] Register task routes in backend/src/main.py
- [ ] T025 [P] [US1] Create TaskList server component in frontend/src/components/tasks/TaskList.tsx
- [ ] T026 [P] [US1] Create TaskForm client component in frontend/src/components/tasks/TaskForm.tsx
- [ ] T027 [P] [US1] Create TaskItem client component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T028 [US1] Implement getTasks() API function in frontend/src/lib/api.ts
- [ ] T029 [US1] Implement createTask() API function in frontend/src/lib/api.ts
- [ ] T030 [US1] Create home page in frontend/src/app/page.tsx integrating TaskList and TaskForm

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Update and Complete Tasks (Priority: P2)

**Goal**: Users can edit tasks and mark them as complete

**Independent Test**: Create task (from P1), edit title/description, toggle completion status

### Implementation for User Story 2

- [ ] T031 [P] [US2] Create TaskUpdate Pydantic schema in backend/src/schemas/task.py
- [ ] T032 [P] [US2] Create TaskPatch Pydantic schema in backend/src/schemas/task.py
- [ ] T033 [US2] Add get_task(), update_task(), and patch_task() methods to TaskService in backend/src/services/task_service.py
- [ ] T034 [US2] Implement GET /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T035 [US2] Implement PUT /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T036 [US2] Implement PATCH /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T037 [US2] Add edit mode state and handlers to TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T038 [US2] Add completion toggle handler to TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T039 [US2] Implement updateTask() API function in frontend/src/lib/api.ts
- [ ] T040 [US2] Implement patchTask() API function in frontend/src/lib/api.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Delete Tasks (Priority: P3)

**Goal**: Users can delete tasks they no longer need

**Independent Test**: Create task (from P1), delete it, verify it no longer appears

### Implementation for User Story 3

- [ ] T041 [US3] Add delete_task() method to TaskService in backend/src/services/task_service.py
- [ ] T042 [US3] Implement DELETE /api/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py
- [ ] T043 [US3] Add delete button and confirmation dialog to TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T044 [US3] Implement deleteTask() API function in frontend/src/lib/api.ts

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional

---

## Phase 6: User Story 4 - Filter and Sort Tasks (Priority: P4)

**Goal**: Users can filter by completion status and sort by date

**Independent Test**: Create multiple tasks, apply filters (all/active/completed), verify correct subset displayed

### Implementation for User Story 4

- [ ] T045 [US4] Add filtering and sorting logic to get_tasks() in TaskService (backend/src/services/task_service.py)
- [ ] T046 [US4] Update GET /api/tasks endpoint to accept query parameters (completed, sort, limit, offset) in backend/src/api/routes/tasks.py
- [ ] T047 [P] [US4] Create TaskFilters client component in frontend/src/components/tasks/TaskFilters.tsx
- [ ] T048 [US4] Update getTasks() API function to accept filter/sort parameters in frontend/src/lib/api.ts
- [ ] T049 [US4] Integrate TaskFilters component into home page in frontend/src/app/page.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T050 [P] Add error handling and user-friendly error messages across all API endpoints in backend/src/api/routes/tasks.py
- [ ] T051 [P] Add loading states and error displays to frontend components in frontend/src/components/tasks/
- [ ] T052 [P] Add input validation and error messages to TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [ ] T053 [P] Create reusable UI components (Button, Input, Checkbox) in frontend/src/components/ui/
- [ ] T054 [P] Add responsive design styles with Tailwind CSS breakpoints to all task components
- [ ] T055 [P] Add visual distinction for completed vs incomplete tasks in TaskItem component
- [ ] T056 Create backend README.md with setup instructions
- [ ] T057 Create frontend README.md with setup instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable

### Within Each User Story

- Pydantic schemas before service methods
- Service methods before API endpoints
- API endpoints before frontend components
- API client functions alongside frontend components
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Tasks within a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch Pydantic schemas together:
Task: "Create TaskCreate schema in backend/src/schemas/task.py"
Task: "Create TaskResponse schema in backend/src/schemas/task.py"
Task: "Create TaskListResponse schema in backend/src/schemas/task.py"

# Launch frontend components together (after API is ready):
Task: "Create TaskList component in frontend/src/components/tasks/TaskList.tsx"
Task: "Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx"
Task: "Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 57
- Phase 1 (Setup): 7 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (User Story 1 - P1): 13 tasks
- Phase 4 (User Story 2 - P2): 10 tasks
- Phase 5 (User Story 3 - P3): 4 tasks
- Phase 6 (User Story 4 - P4): 5 tasks
- Phase 7 (Polish): 8 tasks

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (30 tasks) deliver User Story 1 - View and Create Tasks

**Independent Test Criteria**:
- US1: Create and view tasks in list
- US2: Edit task and toggle completion
- US3: Delete task from list
- US4: Filter and sort task list
