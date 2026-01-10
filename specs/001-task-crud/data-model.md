# Data Model: Task CRUD Operations

**Feature**: Task CRUD Operations
**Date**: 2026-01-08
**Status**: Complete

## Overview

This document defines the database schema, entity relationships, and data validation rules for the Task CRUD feature. The data model supports multi-user task management with user data isolation.

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Task       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────│ id (PK)         │
│ email           │    1:N  │ user_id (FK)    │
│ name            │         │ title           │
│ created_at      │         │ description     │
│ updated_at      │         │ completed       │
└─────────────────┘         │ created_at      │
                            │ updated_at      │
                            └─────────────────┘

Relationship: One User has many Tasks
             One Task belongs to one User
```

## Entities

### Task Entity

**Purpose**: Represents a to-do item belonging to a specific user.

**Table Name**: `tasks`

**Columns**:

| Column Name  | Type         | Constraints                    | Description                                    |
|--------------|--------------|--------------------------------|------------------------------------------------|
| id           | Integer      | PRIMARY KEY, AUTO_INCREMENT    | Unique task identifier                         |
| user_id      | Integer      | FOREIGN KEY (users.id), NOT NULL, INDEX | Owner of the task                        |
| title        | String(200)  | NOT NULL, LENGTH(1-200)        | Task title (required)                          |
| description  | String(1000) | NULLABLE, LENGTH(0-1000)       | Optional task description                      |
| completed    | Boolean      | NOT NULL, DEFAULT FALSE, INDEX | Completion status                              |
| created_at   | DateTime     | NOT NULL, DEFAULT NOW()        | Timestamp when task was created                |
| updated_at   | DateTime     | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Timestamp of last update           |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for filtering tasks by user)
- INDEX on `completed` (for filtering active/completed tasks)
- COMPOSITE INDEX on `(user_id, completed)` (for combined filtering)
- INDEX on `created_at` (for sorting by date)

**Constraints**:
- `user_id` FOREIGN KEY references `users(id)` ON DELETE CASCADE
- `title` must be between 1 and 200 characters
- `description` must be between 0 and 1000 characters (NULL allowed)
- `completed` must be boolean (true/false)

**SQLModel Definition**:

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """Task entity representing a to-do item."""

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship (will be fully implemented in Spec 2)
    # user: Optional["User"] = Relationship(back_populates="tasks")

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-01-08T10:00:00Z",
                "updated_at": "2026-01-08T10:00:00Z"
            }
        }
```

### User Entity (Stub)

**Purpose**: Represents an authenticated user (full implementation in Spec 2).

**Table Name**: `users`

**Columns** (minimal for Spec 1):

| Column Name  | Type         | Constraints                    | Description                                    |
|--------------|--------------|--------------------------------|------------------------------------------------|
| id           | Integer      | PRIMARY KEY, AUTO_INCREMENT    | Unique user identifier                         |
| email        | String(255)  | UNIQUE, NOT NULL               | User email address                             |
| name         | String(100)  | NOT NULL                       | User display name                              |
| created_at   | DateTime     | NOT NULL, DEFAULT NOW()        | Timestamp when user was created                |
| updated_at   | DateTime     | NOT NULL, DEFAULT NOW()        | Timestamp of last update                       |

**SQLModel Definition** (stub for Spec 1):

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """User entity (stub for authentication spec)."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False)
    name: str = Field(max_length=100, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship (will be fully implemented in Spec 2)
    # tasks: List["Task"] = Relationship(back_populates="user")
```

## Pydantic Schemas (Request/Response)

### TaskCreate (Request)

**Purpose**: Validate task creation requests.

```python
from pydantic import BaseModel, Field
from typing import Optional

class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (0-1000 characters)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread"
            }
        }
```

### TaskUpdate (Request)

**Purpose**: Validate task update requests (full replacement).

```python
class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (0-1000 characters)"
    )
    completed: bool = Field(
        description="Task completion status"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries and milk",
                "description": "Updated description",
                "completed": False
            }
        }
```

### TaskPatch (Request)

**Purpose**: Validate partial task updates (e.g., toggle completion).

```python
class TaskPatch(BaseModel):
    """Schema for partially updating a task."""

    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (0-1000 characters)"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Task completion status"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "completed": True
            }
        }
```

### TaskResponse (Response)

**Purpose**: Standardized task response format.

```python
from datetime import datetime

class TaskResponse(BaseModel):
    """Schema for task responses."""

    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 42,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-01-08T10:00:00Z",
                "updated_at": "2026-01-08T10:00:00Z"
            }
        }
```

### TaskListResponse (Response)

**Purpose**: Response format for listing multiple tasks.

```python
from typing import List

class TaskListResponse(BaseModel):
    """Schema for task list responses."""

    tasks: List[TaskResponse]
    total: int

    class Config:
        json_schema_extra = {
            "example": {
                "tasks": [
                    {
                        "id": 1,
                        "user_id": 42,
                        "title": "Buy groceries",
                        "description": "Milk, eggs, bread",
                        "completed": False,
                        "created_at": "2026-01-08T10:00:00Z",
                        "updated_at": "2026-01-08T10:00:00Z"
                    }
                ],
                "total": 1
            }
        }
```

## Data Validation Rules

### Title Validation
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 200 characters
- **Allowed Characters**: Any Unicode characters
- **Trimming**: Leading/trailing whitespace should be trimmed
- **Error Message**: "Title must be between 1 and 200 characters"

### Description Validation
- **Required**: No (optional)
- **Min Length**: 0 characters (empty string or NULL)
- **Max Length**: 1000 characters
- **Allowed Characters**: Any Unicode characters
- **Trimming**: Leading/trailing whitespace should be trimmed
- **Error Message**: "Description must be 1000 characters or less"

### Completed Validation
- **Required**: Yes (defaults to False on creation)
- **Type**: Boolean (true/false)
- **Error Message**: "Completed must be a boolean value"

### User ID Validation
- **Required**: Yes
- **Type**: Integer
- **Validation**: Must reference existing user in users table
- **Error Message**: "Invalid user ID"

## State Transitions

### Task Lifecycle

```
┌────────────┐
│   Created   │ (completed = false)
│  (Initial)  │
└──────┬──────┘
       │
       │ User marks complete
       ▼
┌─────────────┐
│  Completed  │ (completed = true)
└──────┬──────┘
       │
       │ User marks incomplete
       ▼
┌─────────────┐
│   Active    │ (completed = false)
└──────┬──────┘
       │
       │ User deletes
       ▼
┌─────────────┐
│   Deleted   │ (removed from database)
└─────────────┘
```

**Valid Transitions**:
- Created → Completed (mark as done)
- Completed → Active (mark as not done)
- Any state → Deleted (remove task)
- Active → Updated (edit title/description)
- Completed → Updated (edit title/description)

## Database Migration

### Initial Migration (Alembic)

```python
"""Create tasks table

Revision ID: 001_create_tasks
Revises:
Create Date: 2026-01-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001_create_tasks'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table (stub for Spec 2)
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_completed', 'tasks', ['completed'])
    op.create_index('ix_tasks_user_id_completed', 'tasks', ['user_id', 'completed'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])

def downgrade():
    op.drop_index('ix_tasks_created_at', table_name='tasks')
    op.drop_index('ix_tasks_user_id_completed', table_name='tasks')
    op.drop_index('ix_tasks_completed', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
    op.drop_table('users')
```

## Data Integrity Rules

### Foreign Key Constraints
- `tasks.user_id` MUST reference valid `users.id`
- ON DELETE CASCADE: Deleting a user deletes all their tasks
- Prevents orphaned tasks in database

### Uniqueness Constraints
- No uniqueness constraint on task titles (users can have duplicate titles)
- `users.email` must be unique (enforced in users table)

### NOT NULL Constraints
- `tasks.id`: Always required (auto-generated)
- `tasks.user_id`: Always required (task must belong to user)
- `tasks.title`: Always required (empty tasks not allowed)
- `tasks.completed`: Always required (defaults to false)
- `tasks.created_at`: Always required (auto-generated)
- `tasks.updated_at`: Always required (auto-updated)

### Check Constraints (Optional)
```sql
-- Ensure title is not empty after trimming
ALTER TABLE tasks ADD CONSTRAINT check_title_not_empty
    CHECK (LENGTH(TRIM(title)) > 0);

-- Ensure description length if provided
ALTER TABLE tasks ADD CONSTRAINT check_description_length
    CHECK (description IS NULL OR LENGTH(description) <= 1000);
```

## Query Patterns

### Common Queries

**Get all tasks for a user**:
```sql
SELECT * FROM tasks
WHERE user_id = ?
ORDER BY created_at DESC;
```

**Get active tasks for a user**:
```sql
SELECT * FROM tasks
WHERE user_id = ? AND completed = false
ORDER BY created_at DESC;
```

**Get completed tasks for a user**:
```sql
SELECT * FROM tasks
WHERE user_id = ? AND completed = true
ORDER BY created_at DESC;
```

**Get specific task with ownership check**:
```sql
SELECT * FROM tasks
WHERE id = ? AND user_id = ?;
```

**Update task with timestamp**:
```sql
UPDATE tasks
SET title = ?, description = ?, completed = ?, updated_at = NOW()
WHERE id = ? AND user_id = ?;
```

**Delete task with ownership check**:
```sql
DELETE FROM tasks
WHERE id = ? AND user_id = ?;
```

## Performance Considerations

### Index Usage
- `user_id` index: Used in all queries (data isolation)
- `completed` index: Used for filtering active/completed
- Composite `(user_id, completed)` index: Optimizes filtered queries
- `created_at` index: Used for sorting by date

### Query Optimization
- Always include `user_id` in WHERE clause (uses index)
- Limit result sets for large task lists (pagination)
- Use `SELECT *` sparingly in production (specify columns)
- Avoid N+1 queries (use joins if fetching related data)

### Connection Pooling
- Use Neon's built-in connection pooling
- Configure pool size based on expected concurrent users
- Reuse database sessions across requests

## Data Seeding (Development)

### Sample Data for Testing

```python
# Sample users
users = [
    {"id": 1, "email": "alice@example.com", "name": "Alice"},
    {"id": 2, "email": "bob@example.com", "name": "Bob"}
]

# Sample tasks
tasks = [
    {
        "user_id": 1,
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": False
    },
    {
        "user_id": 1,
        "title": "Finish project report",
        "description": None,
        "completed": True
    },
    {
        "user_id": 2,
        "title": "Call dentist",
        "description": "Schedule appointment",
        "completed": False
    }
]
```

## Summary

The data model defines two entities: Task (full implementation) and User (stub for Spec 2). Tasks have a many-to-one relationship with Users, enforced via foreign key constraint. Validation rules ensure data integrity at both API and database layers. Indexes optimize query performance for filtering and sorting. The schema supports all functional requirements from the specification while maintaining user data isolation.

**Ready for**: API contract generation (contracts/).
