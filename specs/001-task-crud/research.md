# Research: Task CRUD Operations

**Feature**: Task CRUD Operations
**Date**: 2026-01-08
**Status**: Complete

## Overview

This document consolidates technology decisions, best practices, and architectural patterns for implementing the Task CRUD feature. All decisions align with the project constitution and technical constraints defined in the specification.

## Technology Stack Decisions

### Backend Framework: FastAPI 0.104+

**Decision**: Use FastAPI with SQLModel ORM for the backend REST API.

**Rationale**:
- FastAPI provides automatic OpenAPI documentation generation
- Native async/await support for high concurrency (100+ concurrent users target)
- Pydantic v2 integration for robust request/response validation
- SQLModel combines SQLAlchemy ORM with Pydantic models, reducing code duplication
- Type hints throughout enable better IDE support and catch errors early
- Excellent performance characteristics (comparable to Node.js and Go)

**Alternatives Considered**:
- Django REST Framework: More batteries-included but heavier, slower, and less modern async support
- Flask: Lighter but requires more manual setup for validation, documentation, and async
- Express.js (Node): Would require JavaScript/TypeScript on backend, reducing type safety benefits of Python

**Best Practices**:
- Use dependency injection for database sessions and authentication
- Separate Pydantic schemas (request/response) from SQLModel models (database)
- Implement service layer for business logic (keep routes thin)
- Use HTTPException for consistent error responses
- Enable CORS middleware for frontend communication

### Database: Neon Serverless PostgreSQL

**Decision**: Use Neon Serverless PostgreSQL with connection pooling.

**Rationale**:
- Serverless architecture scales automatically with demand
- Built-in connection pooling reduces overhead
- PostgreSQL provides ACID compliance for data integrity
- Native support for indexes, foreign keys, and constraints
- Compatible with SQLModel/SQLAlchemy ORM
- Separation of compute and storage enables cost efficiency

**Alternatives Considered**:
- Traditional PostgreSQL (self-hosted): Requires manual scaling and maintenance
- MySQL: Less feature-rich, weaker JSON support
- MongoDB: NoSQL not suitable for relational data (Task belongs to User)

**Best Practices**:
- Use connection pooling (pgbouncer or Neon's built-in pooling)
- Create indexes on user_id and completed columns for filtering
- Use foreign key constraints to enforce Task-User relationship
- Enable automatic timestamps (created_at, updated_at) via SQLModel
- Use Alembic for database migrations (version control for schema)

### Frontend Framework: Next.js 16+ (App Router)

**Decision**: Use Next.js 16+ with App Router, TypeScript, and Tailwind CSS.

**Rationale**:
- App Router provides server/client component separation (better performance)
- Server components reduce JavaScript bundle size sent to client
- Built-in routing, API routes, and optimization features
- TypeScript ensures type safety across frontend
- Tailwind CSS enables rapid, consistent styling without CSS files
- React 18+ with concurrent features for better UX

**Alternatives Considered**:
- Next.js Pages Router: Older pattern, less efficient rendering
- Create React App: No SSR/SSG, requires manual routing setup
- Vue.js/Nuxt: Different ecosystem, team less familiar

**Best Practices**:
- Use Server Components by default (TaskList for data fetching)
- Use Client Components only for interactivity (TaskForm, TaskItem with buttons)
- Implement optimistic UI updates for better perceived performance
- Use React Server Actions for form submissions (optional, can use API routes)
- Organize components by feature (tasks/) and reusability (ui/)
- Use TypeScript interfaces for API response types

## Architecture Patterns

### Three-Layer Architecture

**Decision**: Implement clear separation between database, API, and UI layers.

**Layers**:
1. **Database Layer**: SQLModel models, database connection, migrations
2. **API Layer**: FastAPI routes, Pydantic schemas, service layer
3. **UI Layer**: Next.js components, API client, state management

**Rationale**:
- Clear boundaries enable independent testing and development
- Service layer encapsulates business logic (reusable across endpoints)
- Separation of concerns aligns with Maintainable & Consistent Code principle
- Each layer can be scaled independently

**Implementation**:
```
Database Layer: backend/src/models/task.py (SQLModel)
Service Layer: backend/src/services/task_service.py (business logic)
API Layer: backend/src/api/routes/tasks.py (FastAPI routes)
UI Layer: frontend/src/components/tasks/ (React components)
```

### RESTful API Design

**Decision**: Use REST principles with resource-based URLs and standard HTTP methods.

**Endpoint Pattern**:
```
GET    /api/tasks          - List all tasks for authenticated user
POST   /api/tasks          - Create new task
GET    /api/tasks/{id}     - Get specific task
PUT    /api/tasks/{id}     - Update task (full replacement)
PATCH  /api/tasks/{id}     - Partial update (e.g., toggle completion)
DELETE /api/tasks/{id}     - Delete task
```

**Rationale**:
- Standard REST conventions are widely understood
- HTTP methods map naturally to CRUD operations
- Resource-based URLs are intuitive and cacheable
- Aligns with API Compliance standard in constitution

**Best Practices**:
- Use plural nouns for resources (/tasks not /task)
- Return appropriate HTTP status codes (200, 201, 204, 400, 401, 404, 500)
- Include resource ID in response body after creation
- Use query parameters for filtering (?completed=true) and sorting (?sort=created_at)
- Return consistent error response format

### Data Validation Strategy

**Decision**: Use Pydantic v2 for request/response validation, SQLModel for database constraints.

**Validation Layers**:
1. **API Layer**: Pydantic schemas validate incoming requests
2. **Database Layer**: SQLModel/SQLAlchemy constraints enforce data integrity
3. **Frontend Layer**: TypeScript types + HTML5 validation for UX

**Rationale**:
- Defense in depth: multiple validation layers prevent bad data
- Pydantic provides clear error messages for API consumers
- Database constraints ensure integrity even if API bypassed
- Frontend validation provides immediate user feedback

**Implementation**:
```python
# API Layer (Pydantic)
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)

# Database Layer (SQLModel)
class Task(SQLModel, table=True):
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(max_length=1000)
```

## User Data Isolation Strategy

**Decision**: Filter all database queries by authenticated user ID.

**Implementation Approach**:
1. Extract user_id from JWT token (Spec 2 will implement)
2. Add user_id as dependency in FastAPI routes
3. Include user_id filter in all database queries
4. Validate task ownership before update/delete operations

**Rationale**:
- Enforces Security & Data Privacy principle
- Prevents unauthorized access to other users' tasks
- Simple to implement and audit
- Aligns with 100% data isolation success criterion

**Code Pattern**:
```python
# Service layer
def get_tasks(db: Session, user_id: int) -> List[Task]:
    return db.query(Task).filter(Task.user_id == user_id).all()

def get_task(db: Session, task_id: int, user_id: int) -> Optional[Task]:
    return db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user_id
    ).first()
```

## Performance Optimization

### Database Indexing

**Decision**: Create indexes on frequently queried columns.

**Indexes to Create**:
- `user_id` (foreign key, used in all queries)
- `completed` (used for filtering active/completed tasks)
- Composite index on `(user_id, completed)` for filtered queries
- `created_at` (used for sorting)

**Rationale**:
- Indexes dramatically improve query performance for filtering and sorting
- user_id index essential for data isolation queries
- Composite index optimizes common filter combinations
- Aligns with Scalable Architecture principle

### Frontend Optimization

**Decision**: Use Server Components for data fetching, Client Components for interactivity.

**Strategy**:
- TaskList: Server Component (fetches data, no JavaScript to client)
- TaskItem: Client Component (needs onClick handlers for complete/delete)
- TaskForm: Client Component (needs form state and submission)
- TaskFilters: Client Component (needs interactive filter/sort controls)

**Rationale**:
- Server Components reduce JavaScript bundle size
- Data fetching on server is faster (closer to database)
- Client Components only where interactivity required
- Improves initial page load time and perceived performance

## Error Handling Strategy

**Decision**: Implement consistent error responses across all layers.

**Error Response Format**:
```json
{
  "detail": "Human-readable error message",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "title": ["Title must be between 1 and 200 characters"]
  }
}
```

**HTTP Status Codes**:
- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid JWT)
- 404: Not Found (task doesn't exist or doesn't belong to user)
- 500: Internal Server Error (unexpected errors)

**Rationale**:
- Consistent format enables frontend to handle errors uniformly
- Clear error messages improve developer experience
- Appropriate status codes enable proper HTTP caching and client behavior
- Aligns with API Compliance standard

## Testing Strategy

**Decision**: Implement unit tests for services, integration tests for API endpoints.

**Test Coverage**:
- **Backend Unit Tests**: Service layer business logic (pytest)
- **Backend Integration Tests**: API endpoints with test database (pytest + TestClient)
- **Frontend Component Tests**: React components in isolation (Jest + React Testing Library)
- **E2E Tests**: Full user flows (optional, Playwright)

**Rationale**:
- Unit tests catch logic errors early
- Integration tests validate API contracts
- Component tests ensure UI behaves correctly
- Pyramid approach: many unit tests, fewer integration tests, minimal E2E

**Test Database**:
- Use SQLite in-memory database for fast test execution
- Or use separate PostgreSQL test database with cleanup between tests
- Fixtures provide consistent test data

## Migration Strategy

**Decision**: Use Alembic for database schema migrations.

**Workflow**:
1. Define/modify SQLModel models
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration file
4. Apply migration: `alembic upgrade head`
5. Commit migration file to version control

**Rationale**:
- Alembic integrates seamlessly with SQLAlchemy/SQLModel
- Auto-generation reduces manual migration writing
- Version control for database schema changes
- Enables rollback if needed
- Aligns with Database Integrity standard

## Security Considerations

### Input Validation

**Measures**:
- Pydantic validation for all API inputs
- SQL injection prevention via SQLModel ORM (parameterized queries)
- XSS prevention via React's automatic escaping
- CSRF protection via SameSite cookies (when auth implemented)

### Data Isolation

**Measures**:
- User ID filtering on all queries
- Ownership validation before update/delete
- No direct task ID access without user verification
- 401 responses for unauthorized access

### Secrets Management

**Measures**:
- Database credentials in environment variables
- `.env` files excluded from version control (.gitignore)
- `.env.example` templates for required variables
- Production secrets in secure secret management (AWS Secrets Manager, etc.)

## Dependencies and Versions

### Backend (Python 3.11+)
```
fastapi==0.104.1
sqlmodel==0.0.14
pydantic==2.5.0
uvicorn[standard]==0.24.0
alembic==1.13.0
psycopg2-binary==2.9.9  # PostgreSQL driver
python-dotenv==1.0.0
pytest==7.4.3
httpx==0.25.2  # For TestClient
```

### Frontend (Node.js 18+)
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.0"
  }
}
```

## Deferred Decisions (Spec 2)

The following decisions are deferred to the authentication specification:
- JWT token generation and validation
- Better Auth integration
- User registration and login flows
- Token refresh mechanism
- Session management

**Current Approach**: API endpoints will accept user_id as a parameter (to be replaced with JWT extraction in Spec 2).

## Summary

All technology decisions align with the project constitution and technical constraints. The three-layer architecture with FastAPI, Neon PostgreSQL, and Next.js 16+ provides a solid foundation for scalable, maintainable task management. User data isolation is enforced at the database query level. Performance optimizations include database indexing and Server Component usage. Error handling is consistent across all layers. Testing strategy covers unit, integration, and component tests.

**Ready for Phase 1**: Data model design and API contract generation.
