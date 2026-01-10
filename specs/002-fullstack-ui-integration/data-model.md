# Data Model: Full-Stack Integration & UI Experience

**Feature**: 002-fullstack-ui-integration
**Date**: 2026-01-09
**Status**: Reference Only (No New Entities)

## Overview

This feature does not introduce new data entities. It integrates and polishes existing functionality from Specs 1 (Task CRUD) and 2 (Authentication & API Security). This document references the existing data model for completeness.

## Existing Entities

### User (from Spec 2: Authentication & API Security)

**Purpose**: Represents an authenticated user with task management capabilities

**Attributes**:
- `id` (integer, primary key): Unique identifier for the user
- `email` (string, unique, required): User's email address for authentication
- `name` (string, required): User's display name
- `password_hash` (string, required): Bcrypt-hashed password (never exposed in API)
- `created_at` (datetime, auto): Timestamp of account creation
- `updated_at` (datetime, auto): Timestamp of last profile update

**Relationships**:
- One-to-Many with Task: A user can have multiple tasks

**Validation Rules**:
- Email must be valid RFC 5322 format
- Email must be unique across all users
- Password must be at least 8 characters with uppercase, lowercase, and number
- Name must be 1-100 characters

**Security**:
- Password is hashed with bcrypt (cost factor 12) before storage
- Password hash is never returned in API responses
- User ID is extracted from JWT token for all authenticated requests

**Database Table**: `users`

**Indexes**:
- Primary key on `id`
- Unique index on `email`

**Source**: `backend/src/models/user.py`

---

### Task (from Spec 1: Task CRUD)

**Purpose**: Represents a todo item belonging to a specific user

**Attributes**:
- `id` (integer, primary key): Unique identifier for the task
- `user_id` (integer, foreign key, required): Owner of the task (references User.id)
- `title` (string, required): Task title (max 200 characters)
- `description` (string, optional): Task description (max 1000 characters)
- `completed` (boolean, default false): Completion status
- `created_at` (datetime, auto): Timestamp of task creation
- `updated_at` (datetime, auto): Timestamp of last task update

**Relationships**:
- Many-to-One with User: Each task belongs to exactly one user

**Validation Rules**:
- Title is required and must be 1-200 characters
- Description is optional, max 1000 characters
- Completed defaults to false
- User ID must reference an existing user

**Business Rules**:
- Users can only access their own tasks (enforced by JWT authentication)
- Tasks are automatically filtered by authenticated user_id in all queries
- Deleting a user cascades to delete all their tasks

**Database Table**: `tasks`

**Indexes**:
- Primary key on `id`
- Index on `user_id` (for filtering by user)
- Index on `completed` (for filtering by status)
- Composite index on `(user_id, completed)` (for combined filtering)
- Index on `created_at` (for sorting)

**Source**: `backend/src/models/task.py`

---

### AuthSession (Frontend Only - from Spec 2)

**Purpose**: Client-side session state for authenticated users

**Attributes**:
- `token` (string, nullable): JWT token from backend
- `user` (object, nullable): User profile information
  - `id` (integer): User ID
  - `email` (string): User email
  - `name` (string): User display name

**Storage**: Browser localStorage (key: `auth_session`)

**Lifecycle**:
- Created on successful signin (POST /api/auth/signin)
- Persisted across page refreshes
- Cleared on signout or 401 Unauthorized response
- Expires when JWT token expires (7 days)

**Security**:
- Token is included in Authorization header for all API requests
- Session is cleared on any authentication error
- No sensitive data stored (password never stored client-side)

**Source**: `frontend/src/lib/auth.ts`

---

## Entity Relationships

```
User (1) ----< (Many) Task
  |
  | JWT Token (stateless)
  |
  v
AuthSession (Frontend)
```

**Relationship Details**:

1. **User → Task** (One-to-Many):
   - A user can have zero or more tasks
   - Each task belongs to exactly one user
   - Foreign key: `Task.user_id` references `User.id`
   - Cascade delete: Deleting a user deletes all their tasks

2. **User → AuthSession** (Stateless):
   - JWT token contains user_id and email
   - No server-side session storage
   - Frontend stores token and user profile in localStorage
   - Token is verified on every API request

## Data Flow

### Authentication Flow

```
1. User signs up/signs in
   ↓
2. Backend creates JWT token with user_id
   ↓
3. Frontend stores token + user profile in AuthSession
   ↓
4. Frontend includes token in Authorization header
   ↓
5. Backend verifies token and extracts user_id
   ↓
6. Backend filters all queries by user_id
```

### Task Management Flow

```
1. User creates/updates/deletes task
   ↓
2. Frontend sends request with JWT token
   ↓
3. Backend verifies token → extracts user_id
   ↓
4. Backend performs operation (filtered by user_id)
   ↓
5. Backend returns result
   ↓
6. Frontend updates UI (optimistic or after response)
```

## Data Isolation

**Critical Security Requirement**: All task queries MUST be filtered by authenticated user_id

**Implementation**:
- JWT token contains user_id in 'sub' claim
- `get_current_user()` dependency extracts user_id from token
- All task endpoints use `current_user_id = Depends(get_current_user)`
- SQLModel queries include `.where(Task.user_id == current_user_id)`

**Verification**:
- User A cannot access User B's tasks
- API returns 404 (not 403) for unauthorized task access
- No data leakage through error messages

## State Transitions

### Task State Transitions

```
[New Task]
    ↓
[Active] ←→ [Completed]
    ↓
[Deleted]
```

**Transitions**:
- New → Active: Task created with `completed=false`
- Active → Completed: User marks task as done (`completed=true`)
- Completed → Active: User marks task as not done (`completed=false`)
- Any → Deleted: User deletes task (hard delete from database)

**No Soft Deletes**: Tasks are permanently deleted (no `deleted_at` field)

### User State Transitions

```
[New User]
    ↓
[Active]
    ↓
[Deleted] (future - not implemented)
```

**Current Implementation**:
- New → Active: User signs up successfully
- No user deletion implemented yet (out of scope)

## Schema Migrations

**Existing Migrations**:
1. `001_initial.py`: Created users and tasks tables (Spec 1)
2. `002_add_user_password.py`: Added password_hash to users table (Spec 2)

**No New Migrations Required**: This feature does not modify the database schema

## Data Validation

### Backend Validation (Pydantic Schemas)

**User Validation** (`backend/src/schemas/auth.py`):
- Email: RFC 5322 format validation
- Password: Min 8 chars, uppercase, lowercase, number
- Name: 1-100 characters

**Task Validation** (`backend/src/schemas/task.py`):
- Title: Required, 1-200 characters
- Description: Optional, max 1000 characters
- Completed: Boolean (defaults to false)

### Frontend Validation

**Client-Side Validation**:
- Email format validation (regex)
- Password strength validation (min 8 chars, complexity)
- Form field required/optional indicators
- Inline error messages

**Note**: Backend validation is authoritative - frontend validation is for UX only

## Performance Considerations

**Indexes** (already implemented):
- `users.email` (unique): Fast user lookup during signin
- `tasks.user_id`: Fast filtering of user's tasks
- `tasks.completed`: Fast filtering by completion status
- `tasks.(user_id, completed)`: Fast combined filtering
- `tasks.created_at`: Fast sorting by creation date

**Query Patterns**:
- Most common: Get all tasks for user (filtered by user_id)
- Second most common: Get active/completed tasks for user
- Sorting: By created_at or updated_at

**No N+1 Queries**: All queries are direct (no nested loops)

## Summary

This feature reuses the existing data model from Specs 1 and 2:
- **User**: Authentication and ownership
- **Task**: Todo items with user isolation
- **AuthSession**: Frontend session state

No new entities, relationships, or migrations are required. The focus is on UI integration and polish rather than data model changes.
