# Data Model: OpenAI Agent MCP Tools

**Feature**: 001-openai-agent-mcp-tools
**Date**: 2026-01-14
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the runtime entities and data flow for the AI agent with MCP tools implementation. Note that these are primarily runtime entities, not new database tables. Existing database models (Task, Conversation, Message) remain unchanged.

---

## Runtime Entities

### 1. AgentConfiguration

**Purpose**: Runtime configuration for agent initialization with provider selection.

**Type**: Runtime configuration object (not persisted to database)

**Attributes**:

| Attribute | Type | Description | Source |
|-----------|------|-------------|--------|
| `provider_type` | `str` | Provider identifier: "gemini", "openrouter", "cohere" | Environment variable `LLM_PROVIDER` |
| `model_name` | `str` | Model identifier (e.g., "gemini-1.5-flash") | Provider-specific default or env var |
| `api_key` | `str` | API key for the provider | Environment variable (provider-specific) |
| `context_window_size` | `int` | Maximum context window in tokens | Provider-specific constant |
| `max_tokens` | `int` | Maximum tokens per response | Provider-specific constant |
| `temperature` | `float` | Sampling temperature (0.0-1.0) | Default: 0.7 |
| `fallback_provider` | `Optional[str]` | Fallback provider if primary fails | Environment variable `FALLBACK_PROVIDER` |

**Example**:

```python
@dataclass
class AgentConfiguration:
    provider_type: str
    model_name: str
    api_key: str
    context_window_size: int
    max_tokens: int
    temperature: float = 0.7
    fallback_provider: Optional[str] = None

    @classmethod
    def from_environment(cls) -> "AgentConfiguration":
        """Load configuration from environment variables."""
        provider_type = os.getenv("LLM_PROVIDER", "gemini")

        if provider_type == "gemini":
            return cls(
                provider_type="gemini",
                model_name="gemini-1.5-flash",
                api_key=os.getenv("GEMINI_API_KEY"),
                context_window_size=1_000_000,
                max_tokens=8192,
                fallback_provider=os.getenv("FALLBACK_PROVIDER")
            )
        # ... other providers
```

---

### 2. ToolExecutionResult

**Purpose**: Represents the outcome of an MCP tool invocation.

**Type**: Runtime result object (not persisted separately, stored in Message.metadata)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| `tool_name` | `str` | Name of the executed tool |
| `success` | `bool` | Whether the tool execution succeeded |
| `data` | `dict` | Tool-specific result data (task object or list of tasks) |
| `error_message` | `Optional[str]` | Error message if execution failed |
| `execution_timestamp` | `datetime` | When the tool was executed |

**Example**:

```python
@dataclass
class ToolExecutionResult:
    tool_name: str
    success: bool
    data: dict
    error_message: Optional[str] = None
    execution_timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict:
        """Convert to dictionary for storage in Message.metadata."""
        return {
            "tool_name": self.tool_name,
            "success": self.success,
            "data": self.data,
            "error_message": self.error_message,
            "execution_timestamp": self.execution_timestamp.isoformat()
        }
```

---

### 3. AgentRequestContext

**Purpose**: Context needed for agent execution, assembled per request.

**Type**: Runtime context object (not persisted)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| `user_id` | `int` | Authenticated user ID from JWT token |
| `conversation_id` | `int` | Conversation ID for this chat session |
| `message_history` | `List[dict]` | Formatted message history for agent |
| `jwt_token` | `str` | JWT token for authentication (not passed to agent) |
| `system_prompt` | `str` | System prompt for agent behavior |

**Example**:

```python
@dataclass
class AgentRequestContext:
    user_id: int
    conversation_id: int
    message_history: List[dict]
    jwt_token: str
    system_prompt: str

    @classmethod
    async def from_request(
        cls,
        user_id: int,
        conversation_id: Optional[int],
        jwt_token: str,
        db: Session
    ) -> "AgentRequestContext":
        """Build context from request parameters."""
        conversation_service = ConversationService(db)

        # Get or create conversation
        conversation = await conversation_service.get_or_create_conversation(
            user_id=user_id,
            conversation_id=conversation_id
        )

        # Load and format message history
        messages = await conversation_service.get_messages(conversation.id)
        message_history = await conversation_service.format_messages_for_agent(
            messages=messages,
            max_messages=20,
            max_tokens=8000
        )

        return cls(
            user_id=user_id,
            conversation_id=conversation.id,
            message_history=message_history,
            jwt_token=jwt_token,
            system_prompt=get_default_system_prompt()
        )
```

---

## Existing Database Models (No Changes)

### Task Model

**Table**: `tasks`

**Attributes** (existing, no changes):
- `id`: Primary key
- `user_id`: Foreign key to users table (indexed)
- `title`: Task title (max 200 chars)
- `description`: Optional description (max 1000 chars)
- `completed`: Boolean flag (indexed)
- `created_at`: Timestamp (indexed)
- `updated_at`: Timestamp

**Note**: No changes to Task model. MCP tools interact with existing schema.

---

### Conversation Model

**Table**: `conversation`

**Attributes** (existing, no changes):
- `id`: Primary key
- `user_id`: Foreign key to users table (indexed)
- `title`: Optional conversation title
- `created_at`: Timestamp (indexed)
- `updated_at`: Timestamp

**Note**: No changes to Conversation model.

---

### Message Model

**Table**: `message`

**Attributes** (existing, with metadata usage):
- `id`: Primary key
- `conversation_id`: Foreign key to conversation table
- `role`: Message role ("user" or "assistant")
- `content`: Message content (text)
- `metadata`: JSON field for storing tool calls and results (existing field, new usage)
- `created_at`: Timestamp

**Metadata Structure** (new usage of existing field):

```json
{
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {
        "title": "Buy groceries",
        "description": "Milk, eggs, bread"
      }
    }
  ],
  "tool_results": [
    {
      "tool_name": "add_task",
      "success": true,
      "data": {
        "id": 123,
        "title": "Buy groceries",
        "completed": false
      },
      "execution_timestamp": "2026-01-14T12:00:00Z"
    }
  ]
}
```

---

## Stateless Request Cycle Flow

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. Receive Chat Request                      │
│  POST /api/{user_id}/chat                                        │
│  - Validate JWT token                                            │
│  - Extract user_id, conversation_id                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              2. Load Conversation History (Database)             │
│  ConversationService.get_or_create_conversation()                │
│  ConversationService.get_messages()                              │
│  ConversationService.format_messages_for_agent()                 │
│  - Query: SELECT * FROM message WHERE conversation_id = ?        │
│  - Trim to last 20 messages, max 8000 tokens                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   3. Store User Message (Database)               │
│  ConversationService.add_message()                               │
│  - INSERT INTO message (conversation_id, role, content)          │
│  - role = "user"                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. Execute Agent (Stateless)                  │
│  AgentRunner.execute()                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4a. Get tool definitions from MCPToolRegistry            │   │
│  │ 4b. Call LLM with tools (Gemini API)                     │   │
│  │ 4c. If tool_calls present:                               │   │
│  │     - Execute each tool via MCPToolRegistry              │   │
│  │     - Inject user_id for security                        │   │
│  │     - Collect tool results                               │   │
│  │ 4d. Call LLM with tool results                           │   │
│  │ 4e. Return final response                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              5. Persist Agent Response (Database)                │
│  ConversationService.add_message()                               │
│  - INSERT INTO message (conversation_id, role, content, metadata)│
│  - role = "assistant"                                            │
│  - metadata = {tool_calls, tool_results}                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      6. Return Response                          │
│  ChatResponse(message, conversation_id)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Flow Steps

#### Step 1: Receive Chat Request

**Endpoint**: `POST /api/{user_id}/chat`

**Input**: `ChatRequest`
```python
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
```

**Authentication**: JWT token validated via `get_current_user` dependency

**Authorization**: Verify `current_user["id"] == user_id`

---

#### Step 2: Load Conversation History

**Service**: `ConversationService`

**Operations**:
1. Get or create conversation:
   ```python
   conversation = await conversation_service.get_or_create_conversation(
       user_id=user_id,
       conversation_id=request.conversation_id
   )
   ```

2. Load messages:
   ```python
   messages = await conversation_service.get_messages(conversation.id)
   ```

3. Format and trim for agent:
   ```python
   message_history = await conversation_service.format_messages_for_agent(
       messages=messages,
       max_messages=20,
       max_tokens=8000
   )
   ```

**Database Queries**:
- `SELECT * FROM conversation WHERE id = ? AND user_id = ?`
- `INSERT INTO conversation (user_id, created_at, updated_at)` (if new)
- `SELECT * FROM message WHERE conversation_id = ? ORDER BY created_at ASC`

---

#### Step 3: Store User Message

**Service**: `ConversationService`

**Operation**:
```python
await conversation_service.add_message(
    conversation_id=conversation.id,
    role="user",
    content=request.message
)
```

**Database Query**:
- `INSERT INTO message (conversation_id, role, content, created_at) VALUES (?, 'user', ?, ?)`

---

#### Step 4: Execute Agent

**Service**: `AgentRunner`

**Sub-steps**:

**4a. Get Tool Definitions**:
```python
tool_definitions = tool_registry.get_tool_definitions()
# Returns: [{"type": "function", "function": {...}}, ...]
```

**4b. First LLM Call**:
```python
response = await provider.generate_response_with_tools(
    messages=message_history + [{"role": "user", "content": request.message}],
    system_prompt=system_prompt,
    tools=tool_definitions
)
# Returns: {"content": str, "tool_calls": [...]} or {"content": str, "tool_calls": None}
```

**4c. Execute Tools** (if tool_calls present):
```python
tool_results = []
for tool_call in response["tool_calls"]:
    result = await tool_registry.execute_tool(
        tool_name=tool_call["name"],
        arguments=tool_call["arguments"],
        user_id=user_id  # SECURITY: Injected by backend
    )
    tool_results.append(result)
```

**4d. Second LLM Call** (with tool results):
```python
final_response = await provider.generate_response_with_tool_results(
    messages=message_history,
    tool_calls=response["tool_calls"],
    tool_results=tool_results
)
# Returns: {"content": str, "tool_calls": [...], "tool_results": [...]}
```

**4e. Return Final Response**:
```python
return {
    "content": final_response["content"],
    "tool_calls": response["tool_calls"],
    "tool_results": tool_results
}
```

---

#### Step 5: Persist Agent Response

**Service**: `ConversationService`

**Operation**:
```python
await conversation_service.add_message(
    conversation_id=conversation.id,
    role="assistant",
    content=agent_response["content"],
    metadata={
        "tool_calls": agent_response.get("tool_calls"),
        "tool_results": agent_response.get("tool_results")
    }
)
```

**Database Query**:
- `INSERT INTO message (conversation_id, role, content, metadata, created_at) VALUES (?, 'assistant', ?, ?, ?)`

---

#### Step 6: Return Response

**Output**: `ChatResponse`
```python
class ChatResponse(BaseModel):
    message: str
    conversation_id: int
```

**HTTP Response**: `200 OK` with JSON body

---

## MCP Tool Execution Flow

### Tool Invocation Sequence

```
Agent → MCPToolRegistry.execute_tool()
         │
         ├─ Validate tool exists
         ├─ Inject user_id (SECURITY)
         ├─ Call tool function
         │   │
         │   └─ Tool Implementation
         │       ├─ Validate inputs
         │       ├─ Query database (with user_id filter)
         │       ├─ Perform operation
         │       └─ Return structured result
         │
         └─ Return result to agent
```

### Tool Result Format (Standard)

All MCP tools MUST return results in this format:

```python
{
    "success": bool,           # True if operation succeeded
    "data": dict,              # Tool-specific result data
    "message": str,            # User-friendly message
    "error": Optional[str]     # Error message if success=False
}
```

**Success Example**:
```python
{
    "success": True,
    "data": {
        "id": 123,
        "title": "Buy groceries",
        "completed": False,
        "created_at": "2026-01-14T12:00:00Z"
    },
    "message": "Task 'Buy groceries' created successfully"
}
```

**Error Example**:
```python
{
    "success": False,
    "data": {},
    "message": "Task not found",
    "error": "No task found with ID 999 for user 42"
}
```

---

## Security Model

### User Context Injection

**Critical Security Pattern**: User context (`user_id`) is ALWAYS injected by the backend, NEVER trusted from LLM output.

**Implementation**:

```python
async def execute_tool(
    self,
    tool_name: str,
    arguments: Dict[str, Any],
    user_id: int  # From JWT token, not LLM
) -> Dict[str, Any]:
    """Execute tool with user context injection."""

    # SECURITY: Inject user_id, overwrite if present in arguments
    arguments["user_id"] = user_id

    # Execute tool
    result = await self.tools[tool_name](**arguments)
    return result
```

**Why This Matters**:
- Prevents cross-user data access
- LLM cannot manipulate user_id
- All database queries filtered by authenticated user_id

---

## Performance Considerations

### Conversation History Trimming

**Strategy**: Keep last 20 messages, max 8000 tokens

**Rationale**:
- Free-tier context window limits (Gemini: 1M tokens, but trimming for efficiency)
- Faster LLM responses with shorter context
- Reduced API costs

**Implementation**:
```python
async def format_messages_for_agent(
    self,
    messages: List[Message],
    max_messages: int = 20,
    max_tokens: int = 8000
) -> List[Dict[str, str]]:
    """Format and trim messages for agent context."""

    # Keep last N messages
    recent_messages = messages[-max_messages:]

    # Format for agent
    formatted = [
        {"role": msg.role, "content": msg.content}
        for msg in recent_messages
    ]

    # Estimate tokens (rough: 1 token ≈ 4 characters)
    total_tokens = sum(len(msg["content"]) // 4 for msg in formatted)

    # Trim oldest messages if over limit
    while total_tokens > max_tokens and len(formatted) > 1:
        formatted.pop(0)
        total_tokens = sum(len(msg["content"]) // 4 for msg in formatted)

    return formatted
```

---

## Error Handling

### Tool Execution Errors

**Pattern**: Return structured errors, don't throw exceptions

**Example**:
```python
try:
    result = await tool_function(**arguments)
    return result
except ValueError as e:
    return {
        "success": False,
        "data": {},
        "message": "Invalid input",
        "error": str(e)
    }
except Exception as e:
    logger.error(f"Tool execution error: {tool_name}", exc_info=True)
    return {
        "success": False,
        "data": {},
        "message": "Tool execution failed",
        "error": "An unexpected error occurred"
    }
```

### Provider Errors

**Pattern**: Fallback to secondary provider or return user-friendly error

**Example**:
```python
try:
    response = await primary_provider.generate_response_with_tools(...)
except RateLimitError:
    if fallback_provider:
        response = await fallback_provider.generate_response_with_tools(...)
    else:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again in a few minutes."
        )
```

---

## Summary

This data model defines:
- ✅ Runtime entities for agent configuration and execution
- ✅ Stateless request cycle flow with database persistence
- ✅ MCP tool execution flow with user context injection
- ✅ Security model preventing cross-user data access
- ✅ Performance optimizations for free-tier constraints
- ✅ Error handling patterns for reliability

**Key Principles**:
1. **Stateless**: No in-memory state, all state in database
2. **Secure**: User context injected by backend, not LLM
3. **Restart-safe**: Server restarts don't affect conversations
4. **Free-tier compatible**: Conversation history trimming
5. **Structured**: All tools return consistent format
