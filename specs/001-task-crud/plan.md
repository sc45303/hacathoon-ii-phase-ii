# Implementation Plan: Task CRUD Operations

**Branch**: `001-task-crud` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-crud/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement core task management functionality enabling authenticated users to create, view, update, delete, and mark tasks as complete. The feature provides full CRUD operations with user data isolation, responsive UI, and REST API backend. Tasks include title (1-200 chars), description (0-1000 chars), completion status, and timestamps. Implementation follows a three-layer architecture: Neon PostgreSQL database with SQLModel ORM, FastAPI REST API with Pydantic validation, and Next.js 16+ frontend with Tailwind CSS. Authentication integration deferred to Spec 2.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend), Node.js 18+ (frontend runtime)
**Primary Dependencies**: FastAPI 0.104+, SQLModel 0.0.14+, Pydantic 2.x, Next.js 16+, React 18+, Tailwind CSS 3.x
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, connection pooling enabled)
**Testing**: pytest (backend unit/integration), Jest + React Testing Library (frontend), Playwright (E2E - optional)
**Target Platform**: Web application (Linux/Windows server for backend, modern browsers for frontend)
**Project Type**: Web application (monorepo with separate frontend/ and backend/ directories)
**Performance Goals**: Task list load <2s, task creation <10s, updates <1s, completion toggle <500ms, 100 concurrent users
**Constraints**: Stateless API design (JWT-based), responsive design (mobile/tablet/desktop), user data isolation (100%), 95% operation success rate
**Scale/Scope**: Initial target 100 concurrent users, 4 user stories (P1-P4), 15 functional requirements, 6 REST endpoints, 3 main frontend components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. User-Centric Functionality
- **Status**: PASS
- **Validation**: All 4 user stories directly serve end-users with clear task management value. Security enforced through user data isolation (FR-007). UX prioritized with responsive design (FR-015) and error handling (FR-014).

### ✅ II. Spec-Driven Development
- **Status**: PASS
- **Validation**: Implementation references `/specs/001-task-crud/spec.md`. All code generation via Claude Code. No manual coding permitted. Plan, data model, and contracts will be generated before implementation.

### ✅ III. Security & Data Privacy
- **Status**: PASS (with noted dependency)
- **Validation**: User data isolation enforced (FR-007). JWT authentication required (noted in Technical Constraints). User ID filtering on all queries.
- **Note**: JWT verification middleware implementation deferred to Spec 2 (authentication feature). Current spec assumes JWT token available and user ID extractable.

### ✅ IV. Scalable Architecture
- **Status**: PASS
- **Validation**: Stateless API design (JWT-based, no server sessions). Database indexes planned for user_id and completed fields. Frontend components designed as reusable (Task List, Task Form, Task Item). Clear client/server separation (Next.js App Router with server/client components).

### ✅ V. Maintainable & Consistent Code
- **Status**: PASS
- **Validation**: Standardized patterns: FastAPI + SQLModel (backend), Next.js 16+ App Router + Tailwind CSS (frontend). Modular architecture with clear layer boundaries (database/API/UI). Consistent naming conventions planned.

### ✅ API Compliance Standard
- **Status**: PASS
- **Validation**: REST endpoints follow spec. JSON request/response format. Pydantic validation for inputs. Standardized error responses with HTTP status codes. Contracts to be documented in `/specs/001-task-crud/contracts/`.

### ✅ Database Integrity Standard
- **Status**: PASS
- **Validation**: Neon PostgreSQL with SQLModel ORM. Foreign key relationship (Task belongs to User). Indexes for filtering. Timestamps auto-managed. Migrations to be tracked.

### ✅ Frontend Quality Standard
- **Status**: PASS
- **Validation**: Next.js 16+ App Router patterns. Server components by default, client components for interactivity. Responsive design (mobile/tablet/desktop). Tailwind CSS for all styling.

### ⚠️ Authentication Standard
- **Status**: DEFERRED
- **Validation**: Better Auth integration and JWT verification deferred to Spec 2. Current implementation assumes JWT token available in requests.
- **Mitigation**: Endpoints designed with JWT authorization in mind. User ID parameter in API routes prepared for token extraction.

### ✅ Spec Adherence Standard
- **Status**: PASS
- **Validation**: All implementation references `@specs/001-task-crud/`. Plan, data model, contracts, and tasks will be generated before code. No implementation without spec.

### Constitution Check Summary

**Overall Status**: ✅ PASS (1 deferred dependency noted)

**Violations**: None

**Deferred Items**:
- JWT authentication implementation (Spec 2 dependency - explicitly documented in spec.md Out of Scope section)

**Justification**: Authentication deferral is intentional and documented. Task CRUD feature can be implemented with placeholder user_id parameter, then integrated with JWT middleware in Spec 2.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-crud/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   ├── tasks-api.yaml   # OpenAPI specification for task endpoints
│   └── README.md        # Contract documentation
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── task.py          # Task SQLModel definition
│   │   └── user.py          # User model (stub for Spec 2)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies (DB session, auth stub)
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── tasks.py     # Task CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py  # Business logic layer
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings (database URL, etc.)
│   │   └── database.py      # Database connection setup
│   └── main.py              # FastAPI application entry point
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_task_api.py     # API endpoint tests
│   └── test_task_service.py # Service layer tests
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
└── README.md                # Backend setup instructions

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page (task list)
│   │   └── tasks/
│   │       └── [id]/
│   │           └── page.tsx # Task detail page (optional)
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx      # Server component - displays tasks
│   │   │   ├── TaskItem.tsx      # Client component - interactive task
│   │   │   ├── TaskForm.tsx      # Client component - create/edit form
│   │   │   └── TaskFilters.tsx   # Client component - filter/sort controls
│   │   └── ui/
│   │       ├── Button.tsx        # Reusable button component
│   │       ├── Input.tsx         # Reusable input component
│   │       └── Checkbox.tsx      # Reusable checkbox component
│   ├── lib/
│   │   ├── api.ts           # API client functions
│   │   ├── types.ts         # TypeScript type definitions
│   │   └── utils.ts         # Utility functions
│   └── styles/
│       └── globals.css      # Global styles (Tailwind imports)
├── public/
│   └── assets/              # Static assets
├── tests/
│   └── components/          # Component tests
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
├── .env.local.example       # Environment variables template
└── README.md                # Frontend setup instructions
```

**Structure Decision**: Web application monorepo structure selected based on:
- Feature requires both frontend UI and backend API
- Next.js 16+ App Router for frontend (server/client component separation)
- FastAPI for backend REST API
- Clear separation of concerns: database models, API routes, business logic, UI components
- Modular organization enables independent development and testing of layers
- Aligns with constitution's Maintainable & Consistent Code principle

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. Complexity tracking not required.

---

## Phase 0: Research & Technology Decisions

**Status**: ✅ Complete

**Objective**: Resolve all technical unknowns and establish architectural patterns.

**Output**: [research.md](./research.md)

### Key Decisions Made

1. **Backend Framework**: FastAPI 0.104+ with SQLModel ORM
   - Rationale: Automatic OpenAPI docs, async support, Pydantic v2 integration
   - Alternatives considered: Django REST Framework, Flask

2. **Database**: Neon Serverless PostgreSQL
   - Rationale: Serverless scaling, built-in connection pooling, ACID compliance
   - Alternatives considered: Traditional PostgreSQL, MySQL, MongoDB

3. **Frontend Framework**: Next.js 16+ (App Router) with TypeScript and Tailwind CSS
   - Rationale: Server/client component separation, built-in optimization, type safety
   - Alternatives considered: Next.js Pages Router, Create React App, Vue.js

4. **Architecture Pattern**: Three-layer architecture (Database → API → UI)
   - Clear separation of concerns enables independent testing and development
   - Service layer encapsulates business logic

5. **RESTful API Design**: Resource-based URLs with standard HTTP methods
   - GET /api/tasks, POST /api/tasks, PUT /api/tasks/{id}, etc.
   - Aligns with API Compliance standard

6. **Data Validation**: Multi-layer validation (Pydantic → SQLModel → Frontend)
   - Defense in depth prevents bad data at multiple levels

7. **User Data Isolation**: Filter all queries by authenticated user ID
   - Enforces 100% data isolation success criterion

8. **Performance Optimization**: Database indexing + Server Components
   - Indexes on user_id, completed, created_at
   - Server Components reduce JavaScript bundle size

9. **Error Handling**: Consistent error response format across all layers
   - Standard HTTP status codes (200, 201, 400, 401, 404, 500)

10. **Testing Strategy**: Unit tests (services) + Integration tests (API) + Component tests (UI)

### Dependencies and Versions

**Backend (Python 3.11+)**:
- fastapi==0.104.1
- sqlmodel==0.0.14
- pydantic==2.5.0
- uvicorn[standard]==0.24.0
- alembic==1.13.0
- psycopg2-binary==2.9.9

**Frontend (Node.js 18+)**:
- next: ^16.0.0
- react: ^18.2.0
- typescript: ^5.3.0
- tailwindcss: ^3.4.0

### Deferred to Spec 2

- JWT token generation and validation
- Better Auth integration
- User registration and login flows
- Token refresh mechanism

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Objective**: Define data model, API contracts, and setup instructions.

**Outputs**:
- [data-model.md](./data-model.md) - Database schema and entity definitions
- [contracts/tasks-api.yaml](./contracts/tasks-api.yaml) - OpenAPI 3.1.0 specification
- [contracts/README.md](./contracts/README.md) - API contract documentation
- [quickstart.md](./quickstart.md) - Setup and development guide

### Data Model Summary

**Task Entity**:
- Table: `tasks`
- Columns: id, user_id (FK), title, description, completed, created_at, updated_at
- Indexes: user_id, completed, (user_id, completed), created_at
- Constraints: Foreign key to users.id, title length 1-200, description length 0-1000

**User Entity** (stub for Spec 2):
- Table: `users`
- Columns: id, email, name, created_at, updated_at
- Minimal implementation for Task foreign key relationship

**Pydantic Schemas**:
- TaskCreate: Request schema for creating tasks
- TaskUpdate: Request schema for full task updates
- TaskPatch: Request schema for partial updates
- TaskResponse: Response schema for single task
- TaskListResponse: Response schema for task lists

**Validation Rules**:
- Title: Required, 1-200 characters
- Description: Optional, 0-1000 characters
- Completed: Boolean, defaults to false

### API Contracts Summary

**6 REST Endpoints**:
1. GET /api/tasks - List tasks (with filtering and sorting)
2. POST /api/tasks - Create task
3. GET /api/tasks/{task_id} - Get specific task
4. PUT /api/tasks/{task_id} - Update task (full replacement)
5. PATCH /api/tasks/{task_id} - Partial update (e.g., toggle completion)
6. DELETE /api/tasks/{task_id} - Delete task

**Authentication**: All endpoints require JWT Bearer token (Spec 2)

**Query Parameters**:
- completed (boolean): Filter by completion status
- sort (string): Sort order (created_at_desc, created_at_asc)
- limit (integer): Pagination limit (default 50, max 100)
- offset (integer): Pagination offset (default 0)

**Error Responses**:
- 400: Validation error with field-specific messages
- 401: Unauthorized (missing/invalid JWT)
- 404: Task not found or doesn't belong to user
- 500: Internal server error

### Quickstart Guide Summary

**Backend Setup**:
1. Create Python virtual environment
2. Install dependencies (requirements.txt)
3. Configure .env with DATABASE_URL
4. Run Alembic migrations
5. Start uvicorn server on port 8000

**Frontend Setup**:
1. Install Node dependencies (npm install)
2. Configure .env.local with NEXT_PUBLIC_API_URL
3. Configure Tailwind CSS
4. Start Next.js dev server on port 3000

**Development Workflow**:
- Run backend and frontend concurrently in separate terminals
- Backend auto-reloads on file changes
- Frontend hot-reloads on file changes
- Use Swagger UI at http://localhost:8000/docs for API testing

---

## Phase 2: Task Generation

**Status**: ⏳ Pending

**Objective**: Generate actionable task list organized by user story.

**Command**: `/sp.tasks` (to be run after this plan is complete)

**Expected Output**: [tasks.md](./tasks.md)

**Task Organization**:
- Phase 1: Setup (project initialization)
- Phase 2: Foundational (database, core infrastructure)
- Phase 3: User Story 1 - View and Create Tasks (P1 - MVP)
- Phase 4: User Story 2 - Update and Complete Tasks (P2)
- Phase 5: User Story 3 - Delete Tasks (P3)
- Phase 6: User Story 4 - Filter and Sort Tasks (P4)
- Phase N: Polish & Cross-Cutting Concerns

**Task Format**: `[ID] [P?] [Story] Description`
- [P] indicates tasks that can run in parallel
- [Story] indicates which user story the task belongs to (US1, US2, US3, US4)

---

## Implementation Readiness

### Pre-Implementation Checklist

- [x] Feature specification complete (spec.md)
- [x] Constitution check passed
- [x] Technical context defined
- [x] Research complete (technology decisions made)
- [x] Data model designed (database schema)
- [x] API contracts defined (OpenAPI specification)
- [x] Quickstart guide created (setup instructions)
- [ ] Task list generated (run `/sp.tasks`)
- [ ] Implementation executed (run `/sp.implement`)

### Architecture Decision Records (ADRs)

**Significant Decisions Requiring ADR Documentation**:

1. **Three-Layer Architecture** (Database → API → UI)
   - Impact: Long-term maintainability and testability
   - Alternatives: Monolithic architecture, microservices
   - Scope: Cross-cutting, influences all development

2. **Next.js App Router vs Pages Router**
   - Impact: Frontend performance and development patterns
   - Alternatives: Pages Router, other frameworks
   - Scope: All frontend development

3. **SQLModel vs Pure SQLAlchemy**
   - Impact: Backend code structure and type safety
   - Alternatives: Pure SQLAlchemy, Django ORM
   - Scope: All database interactions

**Recommendation**: Run `/sp.adr` after implementation to document these decisions.

---

## Risk Analysis

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Database connection pooling issues with Neon | Medium | High | Use Neon's built-in pooling, monitor connections |
| JWT authentication integration complexity | Low | Medium | Well-documented in Spec 2, standard patterns |
| Next.js 16+ App Router learning curve | Medium | Low | Extensive documentation, clear server/client separation |
| Data isolation bugs (user accessing others' tasks) | Low | Critical | Comprehensive testing, query-level filtering |
| Performance degradation with large task lists | Medium | Medium | Implement pagination, database indexes |

### Mitigation Strategies

1. **Database Connection Issues**:
   - Use connection pooling from day one
   - Monitor connection metrics in development
   - Test with concurrent users early

2. **Authentication Integration**:
   - Design endpoints with JWT in mind (user_id parameter)
   - Defer full implementation to Spec 2
   - Use placeholder authentication for testing

3. **App Router Complexity**:
   - Follow Next.js best practices (server components by default)
   - Use client components only for interactivity
   - Reference official documentation

4. **Data Isolation**:
   - Always include user_id in WHERE clauses
   - Write comprehensive tests for ownership checks
   - Code review all database queries

5. **Performance**:
   - Implement pagination from the start
   - Create database indexes before testing
   - Monitor query performance in development

---

## Success Metrics

### Implementation Success Criteria

From spec.md Success Criteria section:

**Performance**:
- [ ] Task creation completes in <10 seconds
- [ ] Task list loads in <2 seconds
- [ ] Task updates reflect in <1 second
- [ ] Completion toggle responds in <500ms

**Data Integrity**:
- [ ] 100% user data isolation (no cross-user access)
- [ ] 100% data persistence (tasks survive page refresh)
- [ ] 95% operation success rate on first attempt

**Scalability**:
- [ ] System handles 100 concurrent users without errors

**User Experience**:
- [ ] Intuitive UI (no documentation needed)
- [ ] Clear error messages
- [ ] Immediate visual feedback for all actions
- [ ] Visual distinction between completed/incomplete tasks

**Technical**:
- [ ] All endpoints follow OpenAPI specification
- [ ] All database queries use proper indexes
- [ ] Frontend uses Server Components appropriately
- [ ] Code passes linting and formatting checks

### Validation Plan

1. **Unit Tests**: Service layer business logic
2. **Integration Tests**: API endpoints with test database
3. **Component Tests**: React components in isolation
4. **Manual Testing**: Full user flows in browser
5. **Performance Testing**: Load testing with 100 concurrent users

---

## Next Steps

1. **Generate Task List**: Run `/sp.tasks` to create tasks.md
2. **Review Tasks**: Validate task breakdown matches user stories
3. **Execute Implementation**: Run `/sp.implement` to build the feature
4. **Test Implementation**: Verify all success criteria met
5. **Document ADRs**: Run `/sp.adr` for architectural decisions
6. **Create Pull Request**: Commit changes and create PR for review

---

## References

- **Feature Specification**: [spec.md](./spec.md)
- **Research Document**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/tasks-api.yaml](./contracts/tasks-api.yaml)
- **Quickstart Guide**: [quickstart.md](./quickstart.md)
- **Project Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Plan Status**: ✅ Complete - Ready for task generation (`/sp.tasks`)

**Branch**: `001-task-crud`

**Last Updated**: 2026-01-08
