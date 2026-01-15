# Data Model: Todo AI Chatbot - Phase 1

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-14
**Phase**: Phase 1 - Design & Contracts

---

## Overview

This document defines the database schema for the Todo AI Chatbot feature. The data model supports stateless conversational AI with database-persisted state, enabling conversation continuity across page refreshes and server restarts.

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│ (existing)  │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────────┐
│   Conversation      │
│                     │
│ - id (PK)          │
│ - user_id (FK)     │
│ - created_at       │
│ - updated_at       │
│ - title (optional) │
└──────┬──────────────┘
       │ 1
       │
       │ N
┌──────▼──────────────┐
│     Message         │
│                     │
│ - id (PK)          │
│ - conversation_id  │
│ - role             │
│ - content          │
│ - timestamp        │
│ - token_count      │
└─────────────────────┘
```

---

## Entities

### 1. Conversation

**Purpose**: Represents a conversation session between a user and the AI assistant.

**Table Name**: `conversation`

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique conversation identifier |
| `user_id` | Integer | FOREIGN KEY (user.id), NOT NULL, INDEX | Reference to authenticated user |
| `created_at` | DateTime | NOT NULL, DEFAULT NOW() | Conversation creation timestamp |
| `updated_at` | DateTime | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last message timestamp |
| `title` | String(255) | NULLABLE | Optional conversation title (for future UI) |

**Relationships**:
- **User**: Many-to-One (Many conversations belong to one user)
- **Message**: One-to-Many (One conversation has many messages)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for efficient user conversation queries)
- INDEX on `updated_at` (for sorting by recency)

**Validation Rules**:
- `user_id` must reference an existing user
- `created_at` must be <= `updated_at`
- `title` max length: 255 characters

**State Transitions**: None (conversations are created and persist indefinitely)

**SQLModel Implementation**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, Optional

class Conversation(SQLModel, table=True):
    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
    title: Optional[str] = Field(default=None, max_length=255)

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
```

---

### 2. Message

**Purpose**: Represents an individual message within a conversation (user or assistant).

**Table Name**: `message`

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique message identifier |
| `conversation_id` | Integer | FOREIGN KEY (conversation.id), NOT NULL, INDEX | Reference to parent conversation |
| `role` | String(20) | NOT NULL, CHECK IN ('user', 'assistant') | Message sender role |
| `content` | Text | NOT NULL | Message content (unlimited length) |
| `timestamp` | DateTime | NOT NULL, DEFAULT NOW() | Message creation timestamp |
| `token_count` | Integer | NULLABLE | Estimated token count (for context management) |

**Relationships**:
- **Conversation**: Many-to-One (Many messages belong to one conversation)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `conversation_id` (for efficient conversation message queries)
- INDEX on `timestamp` (for chronological ordering)
- COMPOSITE INDEX on `(conversation_id, timestamp)` (for efficient conversation history retrieval)

**Validation Rules**:
- `conversation_id` must reference an existing conversation
- `role` must be either 'user' or 'assistant'
- `content` must not be empty (min length: 1 character)
- `token_count` must be >= 0 if provided

**State Transitions**: None (messages are immutable once created)

**SQLModel Implementation**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Message(SQLModel, table=True):
    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        foreign_key="conversation.id",
        index=True
    )
    role: str = Field(max_length=20)
    content: str = Field(sa_column=Column(Text))
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    token_count: Optional[int] = Field(default=None, ge=0)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")

    # Validation
    @validator("role")
    def validate_role(cls, v):
        if v not in ["user", "assistant"]:
            raise ValueError("role must be 'user' or 'assistant'")
        return v

    @validator("content")
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError("content must not be empty")
        return v
```

---

## Database Constraints

### Foreign Key Constraints

1. **Conversation.user_id → User.id**
   - ON DELETE: CASCADE (delete conversations when user is deleted)
   - ON UPDATE: CASCADE

2. **Message.conversation_id → Conversation.id**
   - ON DELETE: CASCADE (delete messages when conversation is deleted)
   - ON UPDATE: CASCADE

### Check Constraints

1. **Message.role**: Must be 'user' or 'assistant'
2. **Message.token_count**: Must be >= 0 if not NULL
3. **Conversation.created_at**: Must be <= updated_at

---

## Migration Strategy

### Initial Migration (Phase 1)

**Migration File**: `backend/alembic/versions/001_add_conversation_tables.py`

**Operations**:
1. Create `conversation` table
2. Create `message` table
3. Add foreign key constraints
4. Add indexes
5. Add check constraints

**Rollback Strategy**:
1. Drop `message` table (cascade will handle foreign keys)
2. Drop `conversation` table

**SQL Preview**:
```sql
-- Create conversation table
CREATE TABLE conversation (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    title VARCHAR(255),
    CONSTRAINT check_conversation_dates CHECK (created_at <= updated_at)
);

CREATE INDEX idx_conversation_user_id ON conversation(user_id);
CREATE INDEX idx_conversation_updated_at ON conversation(updated_at);

-- Create message table
CREATE TABLE message (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    token_count INTEGER CHECK (token_count >= 0),
    CONSTRAINT check_message_content CHECK (LENGTH(TRIM(content)) > 0)
);

CREATE INDEX idx_message_conversation_id ON message(conversation_id);
CREATE INDEX idx_message_timestamp ON message(timestamp);
CREATE INDEX idx_message_conversation_timestamp ON message(conversation_id, timestamp);
```

---

## Data Access Patterns

### 1. Create New Conversation

**Use Case**: User starts a new chat session

**Query Pattern**:
```python
conversation = Conversation(user_id=user_id)
session.add(conversation)
session.commit()
session.refresh(conversation)
```

**Performance**: O(1) - Single INSERT

---

### 2. Get or Create Conversation

**Use Case**: Chat endpoint retrieves or creates conversation for user

**Query Pattern**:
```python
conversation = session.exec(
    select(Conversation)
    .where(Conversation.user_id == user_id)
    .order_by(Conversation.updated_at.desc())
).first()

if not conversation:
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    session.commit()
```

**Performance**: O(1) with index on user_id

---

### 3. Load Conversation History

**Use Case**: Load all messages for a conversation (for AI context)

**Query Pattern**:
```python
messages = session.exec(
    select(Message)
    .where(Message.conversation_id == conversation_id)
    .order_by(Message.timestamp.asc())
).all()
```

**Performance**: O(N) where N = number of messages, optimized by composite index

---

### 4. Add Message to Conversation

**Use Case**: Save user or assistant message

**Query Pattern**:
```python
message = Message(
    conversation_id=conversation_id,
    role=role,
    content=content,
    token_count=estimate_tokens(content)
)
session.add(message)

# Update conversation timestamp
conversation.updated_at = datetime.utcnow()
session.add(conversation)

session.commit()
```

**Performance**: O(1) - Two UPDATEs

---

### 5. Trim Old Messages (Future Enhancement)

**Use Case**: Delete old messages to manage database size

**Query Pattern**:
```python
# Keep only last N messages per conversation
subquery = (
    select(Message.id)
    .where(Message.conversation_id == conversation_id)
    .order_by(Message.timestamp.desc())
    .limit(MAX_MESSAGES)
)

session.exec(
    delete(Message)
    .where(Message.conversation_id == conversation_id)
    .where(Message.id.not_in(subquery))
)
```

**Performance**: O(N) where N = total messages in conversation

---

## Data Retention Policy

### Phase 1 (Current)

- **Conversations**: Retained indefinitely
- **Messages**: Retained indefinitely
- **Rationale**: Hackathon scope; no retention policy needed

### Phase 2 (Future Consideration)

- **Conversations**: Retain for 90 days of inactivity
- **Messages**: Retain last 100 messages per conversation
- **Archived Data**: Move to cold storage after 1 year

---

## Scalability Considerations

### Current Scale (Phase 1)

- **Expected Users**: 10-100 (hackathon scope)
- **Expected Conversations**: 100-1,000
- **Expected Messages**: 1,000-10,000
- **Database Size**: <10 MB

### Future Scale (Phase 2+)

- **Target Users**: 10,000+
- **Target Conversations**: 100,000+
- **Target Messages**: 1,000,000+
- **Database Size**: 1-10 GB

### Optimization Strategies

1. **Partitioning**: Partition `message` table by `conversation_id` or `timestamp`
2. **Archiving**: Move old messages to archive table
3. **Caching**: Cache recent conversation history in Redis
4. **Read Replicas**: Use read replicas for conversation history queries

---

## Security Considerations

### Data Access Control

1. **User Isolation**: All queries MUST filter by authenticated `user_id`
2. **JWT Verification**: Backend MUST verify JWT before accessing conversation data
3. **Authorization**: Users can only access their own conversations and messages

### Data Privacy

1. **PII Handling**: Message content may contain PII; treat as sensitive data
2. **Encryption**: Database connection MUST use SSL/TLS
3. **Audit Logging**: Log all conversation access for security auditing (future)

### SQL Injection Prevention

1. **Parameterized Queries**: SQLModel uses parameterized queries by default
2. **Input Validation**: Validate all user inputs before database operations
3. **ORM Usage**: Use SQLModel ORM; avoid raw SQL queries

---

## Testing Strategy

### Unit Tests

1. **Model Validation**: Test Conversation and Message model validation rules
2. **Relationship Tests**: Test cascade deletes and foreign key constraints
3. **Timestamp Tests**: Test created_at and updated_at behavior

### Integration Tests

1. **CRUD Operations**: Test create, read, update, delete for both entities
2. **Query Performance**: Test query performance with sample data
3. **Constraint Enforcement**: Test foreign key and check constraints

### Test Data

```python
# Sample test data
test_user_id = 1

test_conversation = Conversation(
    user_id=test_user_id,
    title="Test Conversation"
)

test_messages = [
    Message(
        conversation_id=test_conversation.id,
        role="user",
        content="Hello, AI assistant!"
    ),
    Message(
        conversation_id=test_conversation.id,
        role="assistant",
        content="Hello! How can I help you today?"
    )
]
```

---

## Summary

This data model provides:

✅ **Stateless Architecture**: All state persisted to database
✅ **Conversation Continuity**: History survives page refreshes and server restarts
✅ **User Isolation**: Conversations scoped to authenticated users
✅ **Scalability**: Indexed for efficient queries
✅ **Simplicity**: Minimal schema for Phase 1 requirements
✅ **Extensibility**: Easy to add fields for Phase 2 (e.g., tool calls, metadata)

**Next Steps**: Create API contracts (contracts/chat-api.yaml)
