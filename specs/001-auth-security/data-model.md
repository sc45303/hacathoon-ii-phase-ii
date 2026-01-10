# Data Model: Authentication & API Security

**Feature**: 001-auth-security
**Date**: 2026-01-09
**Phase**: 1 - Design

## Overview

This document defines the data entities and their relationships for the authentication and API security feature. The primary entity is the User, which will be extended to support password-based authentication.

## Entities

### User (Modified)

**Purpose**: Represents a registered user account with authentication credentials.

**Table**: `users`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | String(255) | UNIQUE, NOT NULL, INDEX | User's email address (used for login) |
| name | String(100) | NOT NULL | User's display name |
| password_hash | String(255) | NOT NULL | Bcrypt-hashed password (NEW) |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `created_at` (for sorting/filtering)

**Relationships**:
- One-to-Many with Task (one user has many tasks)

**Validation Rules**:
- Email must be valid RFC 5322 format
- Email must be unique (enforced at database level)
- Password must be hashed with bcrypt before storage
- Name must be 1-100 characters
- password_hash must be exactly 60 characters (bcrypt output length)

**State Transitions**: None (users don't have state in this spec)

**Security Considerations**:
- Password is never stored in plain text
- Password hash uses bcrypt with cost factor 12
- Email is indexed for fast lookup during authentication
- created_at and updated_at track account lifecycle

---

### Task (Existing - No Changes)

**Purpose**: Represents a to-do item owned by a user.

**Table**: `tasks`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique task identifier |
| user_id | Integer | FOREIGN KEY(users.id), NOT NULL, INDEX | Owner of the task |
| title | String(200) | NOT NULL | Task title |
| description | String(1000) | NULLABLE | Task description |
| completed | Boolean | NOT NULL, DEFAULT FALSE, INDEX | Completion status |
| created_at | DateTime | NOT NULL, DEFAULT NOW(), INDEX | Creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Relationships**:
- Many-to-One with User (many tasks belong to one user)

**Security Note**: All task queries MUST filter by authenticated user_id to enforce data isolation.

---

### JWT Token (Virtual Entity - Not Stored)

**Purpose**: Represents an authentication token issued by Better Auth and verified by the backend.

**Storage**: Not persisted in database (stateless authentication)

**Structure** (JWT Payload):

| Claim | Type | Description |
|-------|------|-------------|
| sub | String | User ID (subject) |
| email | String | User's email address |
| iat | Integer | Issued at timestamp (Unix epoch) |
| exp | Integer | Expiration timestamp (Unix epoch, iat + 7 days) |
| iss | String | Issuer (Better Auth) |

**Validation Rules**:
- Token must be signed with BETTER_AUTH_SECRET using HS256
- Token must not be expired (exp > current time)
- Token must contain valid sub (user ID)
- Token signature must be valid

**Lifecycle**:
1. Issued by Better Auth upon successful authentication
2. Included in Authorization header for API requests
3. Verified by backend on every protected endpoint
4. Expires after 7 days (no refresh in this spec)

---

## Database Migrations

### Migration 002: Add User Password Field

**File**: `backend/alembic/versions/002_add_user_password.py`

**Changes**:
- Add `password_hash` column to `users` table
- Column is NOT NULL (existing users will need password set)

**Upgrade**:
```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL;
```

**Downgrade**:
```sql
ALTER TABLE users DROP COLUMN password_hash;
```

**Data Migration Note**: If existing users exist without passwords, they will need to be handled separately (e.g., force password reset on first login, or seed with temporary passwords).

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────┐
│ User                                │
├─────────────────────────────────────┤
│ id (PK)                             │
│ email (UNIQUE)                      │
│ name                                │
│ password_hash (NEW)                 │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────────────────┐
│ Task                                │
├─────────────────────────────────────┤
│ id (PK)                             │
│ user_id (FK → User.id)              │
│ title                               │
│ description                         │
│ completed                           │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
```

---

## Data Access Patterns

### Authentication Flow
1. User submits email + password to Better Auth
2. Better Auth verifies credentials against users table
3. Better Auth issues JWT token with user_id in `sub` claim
4. Frontend stores token in httpOnly cookie

### API Request Flow
1. Frontend includes JWT in Authorization header
2. Backend extracts token from header
3. Backend verifies token signature and expiration
4. Backend extracts user_id from `sub` claim
5. Backend filters data by user_id

### Task Query Pattern
```sql
-- All task queries MUST include user_id filter
SELECT * FROM tasks WHERE user_id = :authenticated_user_id;

-- Example: Get user's completed tasks
SELECT * FROM tasks
WHERE user_id = :authenticated_user_id
  AND completed = true
ORDER BY created_at DESC;
```

---

## Validation Summary

### User Entity
- ✅ Email format validation (RFC 5322)
- ✅ Email uniqueness (database constraint)
- ✅ Password strength (minimum 8 chars, complexity rules)
- ✅ Password hashing (bcrypt, cost 12)
- ✅ Name length (1-100 characters)

### JWT Token
- ✅ Signature validation (HS256 with shared secret)
- ✅ Expiration validation (exp claim)
- ✅ Required claims present (sub, email, iat, exp)
- ✅ User ID extraction (from sub claim)

### Task Entity (Security)
- ✅ User ownership validation (user_id matches token)
- ✅ Query filtering (all queries include user_id)
- ✅ Authorization checks (prevent cross-user access)

---

## Performance Considerations

### Indexes
- `users.email` - UNIQUE INDEX for fast authentication lookups
- `tasks.user_id` - INDEX for fast user task queries
- `tasks.completed` - INDEX for filtering by status
- `tasks.created_at` - INDEX for sorting

### Query Optimization
- JWT verification is stateless (no database lookup)
- User lookup by email is O(1) with index
- Task queries filtered by indexed user_id
- Pagination supported for large task lists

---

## Security Checklist

- [x] Passwords never stored in plain text
- [x] Bcrypt hashing with appropriate cost factor
- [x] Email uniqueness enforced at database level
- [x] JWT tokens contain minimal claims (no sensitive data)
- [x] Token expiration enforced (7 days)
- [x] User ID extracted from validated token only
- [x] All task queries filtered by authenticated user
- [x] Foreign key constraints prevent orphaned tasks
