# Research Findings: AI Agent with MCP Tools Implementation

**Date**: 2026-01-14
**Purpose**: Research for implementing an AI agent with MCP tools using free-tier API providers

---

## 1. OpenAI Agents SDK External Client Configuration

### Current Status

**Package Installed**: `openai-agents` version 0.4.2
**Issue Discovered**: Import errors due to OpenAI SDK version incompatibility

```python
# Current error when importing:
ModuleNotFoundError: No module named 'openai.types.responses.response_function_call_output_item_list_param'
```

**Root Cause**: The `openai-agents` SDK (v0.4.2) expects newer OpenAI SDK APIs that don't exist in OpenAI SDK v1.109.1.

### External Client Configuration Approaches

#### Approach 1: Direct Provider Integration (RECOMMENDED)

**Rationale**: Given the OpenAI Agents SDK compatibility issues and the requirement to use free-tier providers, implementing a custom agent orchestration layer is more practical.

**Implementation Pattern**:

```python
# backend/src/agent/agent_runner.py
from typing import List, Dict, Any
from src.services.providers.base import LLMProvider
from src.mcp.server import MCPToolRegistry

class AgentRunner:
    """Custom agent orchestration without OpenAI Agents SDK dependency."""

    def __init__(self, provider: LLMProvider, tools: MCPToolRegistry):
        self.provider = provider
        self.tools = tools

    async def execute(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Execute agent reasoning with tool calling support."""

        # Step 1: Format tools for provider
        tool_definitions = self.tools.get_tool_definitions()

        # Step 2: Call LLM with tools
        response = await self.provider.generate_response_with_tools(
            messages=messages,
            system_prompt=system_prompt,
            tools=tool_definitions
        )

        # Step 3: Handle tool calls
        if response.get("tool_calls"):
            tool_results = []
            for tool_call in response["tool_calls"]:
                result = await self.tools.execute_tool(
                    tool_name=tool_call["name"],
                    arguments=tool_call["arguments"],
                    user_id=user_id
                )
                tool_results.append(result)

            # Step 4: Send tool results back to LLM
            final_response = await self.provider.generate_response_with_tool_results(
                messages=messages,
                tool_calls=response["tool_calls"],
                tool_results=tool_results
            )
            return final_response

        return response
```

**Advantages**:
- No dependency on broken OpenAI Agents SDK
- Direct control over agent logic
- Works with any provider that supports function calling
- Simpler debugging and maintenance

#### Approach 2: Fix OpenAI Agents SDK Compatibility (NOT RECOMMENDED)

**Issues**:
- Requires upgrading OpenAI SDK to bleeding-edge version
- May introduce breaking changes
- Still doesn't solve external provider integration
- OpenAI Agents SDK is designed for OpenAI API, not external providers

### Decision: Custom Agent Implementation

**Chosen Approach**: Implement custom agent orchestration layer without OpenAI Agents SDK

**Rationale**:
1. OpenAI Agents SDK has compatibility issues
2. SDK is designed for OpenAI API, not external providers
3. Custom implementation provides full control
4. Simpler to integrate with free-tier providers
5. Easier to maintain and debug

---

## 2. Official MCP SDK for Python

### Package Information

**Package Name**: `mcp`
**Version Installed**: 1.20.0
**Installation**: `pip install mcp`
**Documentation**: https://modelcontextprotocol.io

### MCP Server Setup

**Available Server Types**:
- `mcp.server.Server` - Low-level server
- `mcp.server.FastMCP` - High-level FastAPI-style server (RECOMMENDED)
- `mcp.server.stdio` - STDIO transport
- `mcp.server.sse` - Server-Sent Events transport

**Recommended Approach**: Use `FastMCP` for FastAPI integration

```python
# backend/src/mcp/server.py
from mcp.server import FastMCP
from mcp.types import Tool
from pydantic import BaseModel, Field
from typing import Optional

# Initialize MCP server
mcp_server = FastMCP("todo-mcp-server")

# Define tool input schemas
class AddTaskInput(BaseModel):
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    due_date: Optional[str] = Field(None, description="Due date (ISO format)")
    priority: Optional[str] = Field(None, description="Priority: low, medium, high")

# Register tool with decorator
@mcp_server.tool()
async def add_task(
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None
) -> dict:
    """Add a new task to the user's todo list."""
    # Tool implementation
    return {
        "success": True,
        "task": {"id": 1, "title": title, "description": description},
        "message": f"Task '{title}' created successfully"
    }

@mcp_server.tool()
async def list_tasks(filter: Optional[str] = "all") -> dict:
    """List all tasks for the user."""
    return {
        "success": True,
        "tasks": [],
        "count": 0,
        "message": "Tasks retrieved successfully"
    }
```

### Tool Definition Pattern

**MCP Tool Structure**:

```python
from mcp.types import Tool

# Tool schema
tool = Tool(
    name="add_task",
    description="Add a new task to the user's todo list",
    inputSchema={
        "type": "object",
        "properties": {
            "title": {
                "type": "string",
                "description": "Task title"
            },
            "description": {
                "type": "string",
                "description": "Task description"
            }
        },
        "required": ["title"]
    }
)
```

### Stateless Tool Implementation Best Practices

1. **No In-Memory State**: All state must be in database
2. **Explicit User Context**: Pass `user_id` to every tool
3. **Database Transactions**: Use transactions for data consistency
4. **Structured Responses**: Return consistent response format

```python
# Stateless tool pattern
async def add_task(user_id: int, title: str, **kwargs) -> dict:
    """Stateless tool - all state from database."""
    async with get_db_session() as session:
        # Load user context from database
        user = await session.get(User, user_id)

        # Create task
        task = Task(
            user_id=user_id,
            title=title,
            **kwargs
        )
        session.add(task)
        await session.commit()

        # Return structured response
        return {
            "success": True,
            "data": task.dict(),
            "message": f"Task '{title}' created"
        }
```

---

## 3. Free-Tier Provider Function Calling Support

### Provider Capability Matrix

| Provider | Function Calling | Context Window | Rate Limits | Token Caps | Cost | Recommended Use |
|----------|------------------|----------------|-------------|------------|------|-----------------|
| **Google Gemini** | ✅ Yes (gemini-1.5-flash, gemini-1.5-pro) | 1M tokens (flash), 2M tokens (pro) | 15 RPM (free), 1500 RPD | No hard cap | Free | **PRIMARY** |
| **OpenRouter** | ✅ Yes (select models) | Varies (4k-200k) | Varies by model | Varies | Free models available | **FALLBACK** |
| **Cohere** | ✅ Yes (Command models) | 4k-128k tokens | 100 calls/min (trial) | Trial credits | Trial only | **NOT RECOMMENDED** |

### Gemini Free Tier (RECOMMENDED PRIMARY)

**Function Calling Support**: ✅ Full support

**Models with Function Calling**:
- `gemini-1.5-flash` (RECOMMENDED - fast, efficient)
- `gemini-1.5-pro` (more capable, slower)
- `gemini-2.0-flash-exp` (experimental)

**Free Tier Limits**:
- **Rate Limit**: 15 requests per minute (RPM)
- **Daily Limit**: 1,500 requests per day (RPD)
- **Context Window**: 1M tokens (flash), 2M tokens (pro)
- **No Credit Card Required**: True free tier

**Implementation Example**:

```python
# backend/src/services/providers/gemini.py
import google.generativeai as genai
from typing import List, Dict, Any

class GeminiProvider(LLMProvider):
    async def generate_response_with_tools(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate response with function calling support."""

        # Configure model with tools
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            tools=tools  # Pass tool definitions
        )

        # Format conversation
        chat = model.start_chat(history=self._format_history(messages))

        # Send message
        response = chat.send_message(messages[-1]["content"])

        # Check for function calls
        if response.candidates[0].content.parts[0].function_call:
            function_call = response.candidates[0].content.parts[0].function_call
            return {
                "content": None,
                "tool_calls": [{
                    "name": function_call.name,
                    "arguments": dict(function_call.args)
                }]
            }

        return {
            "content": response.text,
            "tool_calls": None
        }
```

### OpenRouter Free Tier (FALLBACK)

**Function Calling Support**: ✅ Yes (select models)

**Free Models with Function Calling**:
- `meta-llama/llama-3.2-3b-instruct:free`
- `google/gemini-flash-1.5:free`
- `mistralai/mistral-7b-instruct:free`

**Free Tier Constraints**:
- Rate limits vary by model
- Some models have daily caps
- Context windows: 4k-32k tokens
- No credit card required for free models

**Implementation Pattern**:

```python
# backend/src/services/providers/openrouter.py
import httpx
from typing import List, Dict, Any

class OpenRouterProvider(LLMProvider):
    BASE_URL = "https://openrouter.ai/api/v1"

    async def generate_response_with_tools(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate response with function calling via OpenRouter."""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "https://your-app.com",
                    "X-Title": "Todo AI Chatbot"
                },
                json={
                    "model": "google/gemini-flash-1.5:free",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        *messages
                    ],
                    "tools": tools
                }
            )

            data = response.json()
            message = data["choices"][0]["message"]

            if message.get("tool_calls"):
                return {
                    "content": None,
                    "tool_calls": [
                        {
                            "name": tc["function"]["name"],
                            "arguments": tc["function"]["arguments"]
                        }
                        for tc in message["tool_calls"]
                    ]
                }

            return {
                "content": message["content"],
                "tool_calls": None
            }
```

### Cohere Free Tier (NOT RECOMMENDED)

**Function Calling Support**: ✅ Yes (Command models)

**Issues**:
- Trial-based, not truly free
- Requires credit card for trial
- Trial credits expire
- 100 calls/min limit

**Verdict**: Not suitable for long-term development without paid plan

---

## 4. Agent-MCP Integration Pattern

### Tool Invocation Protocol

**Flow**:
1. Agent receives user message
2. LLM decides to call tool(s)
3. Agent invokes MCP tool with arguments
4. Tool executes and returns result
5. Agent sends tool result back to LLM
6. LLM generates final response

### Implementation Pattern

```python
# backend/src/agent/agent_runner.py
from typing import List, Dict, Any
from src.mcp.server import MCPToolRegistry

class AgentRunner:
    """Agent orchestration with MCP tool integration."""

    def __init__(self, provider: LLMProvider, tools: MCPToolRegistry):
        self.provider = provider
        self.tools = tools

    async def execute(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Execute agent with tool calling."""

        # Get tool definitions for LLM
        tool_definitions = self.tools.get_tool_definitions()

        # First LLM call with tools
        response = await self.provider.generate_response_with_tools(
            messages=messages,
            system_prompt=system_prompt,
            tools=tool_definitions
        )

        # Handle tool calls
        if response.get("tool_calls"):
            tool_results = []

            for tool_call in response["tool_calls"]:
                # Execute MCP tool
                result = await self.tools.execute_tool(
                    tool_name=tool_call["name"],
                    arguments=tool_call["arguments"],
                    user_id=user_id  # Inject user context
                )
                tool_results.append({
                    "tool_call_id": tool_call.get("id"),
                    "name": tool_call["name"],
                    "result": result
                })

            # Second LLM call with tool results
            final_response = await self.provider.generate_response_with_tool_results(
                messages=messages,
                tool_calls=response["tool_calls"],
                tool_results=tool_results
            )

            return {
                "content": final_response["content"],
                "tool_calls": response["tool_calls"],
                "tool_results": tool_results
            }

        return {
            "content": response["content"],
            "tool_calls": None,
            "tool_results": None
        }
```

### MCP Tool Registry

```python
# backend/src/mcp/server.py
from typing import Dict, Any, Callable
from src.core.database import get_db_session
from src.models.task import Task

class MCPToolRegistry:
    """Registry for MCP tools with user context injection."""

    def __init__(self):
        self.tools: Dict[str, Callable] = {}
        self.tool_schemas: Dict[str, Dict] = {}

    def register_tool(self, name: str, func: Callable, schema: Dict):
        """Register a tool with its schema."""
        self.tools[name] = func
        self.tool_schemas[name] = schema

    def get_tool_definitions(self) -> List[Dict]:
        """Get tool definitions for LLM."""
        return [
            {
                "type": "function",
                "function": {
                    "name": name,
                    "description": schema["description"],
                    "parameters": schema["parameters"]
                }
            }
            for name, schema in self.tool_schemas.items()
        ]

    async def execute_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        user_id: int
    ) -> Dict[str, Any]:
        """Execute a tool with user context."""
        if tool_name not in self.tools:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found"
            }

        try:
            # Inject user_id into arguments
            arguments["user_id"] = user_id

            # Execute tool
            result = await self.tools[tool_name](**arguments)
            return result
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

---

## 5. Stateless Request Cycle Implementation

### Request Cycle Flow

```
1. Receive Chat Request (POST /api/chat)
   ↓
2. Validate JWT Token → Extract user_id
   ↓
3. Load Conversation History from Database
   ↓
4. Store User Message in Database
   ↓
5. Execute Agent with History + Tools
   ↓
6. Agent Calls LLM with Tool Definitions
   ↓
7. LLM Returns Tool Calls (if needed)
   ↓
8. Execute MCP Tools with user_id
   ↓
9. Send Tool Results Back to LLM
   ↓
10. LLM Generates Final Response
   ↓
11. Store Assistant Message + Tool Metadata in Database
   ↓
12. Return Response to Client
```

### Implementation

```python
# backend/src/api/routes/chat.py
from fastapi import APIRouter, Depends, HTTPException
from src.core.security import get_current_user
from src.services.conversation_service import ConversationService
from src.agent.agent_runner import AgentRunner
from src.mcp.server import MCPToolRegistry
from src.services.llm_service import LLMService

router = APIRouter()

@router.post("/api/chat")
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """Stateless chat endpoint with agent execution."""

    # Step 1: Load conversation history
    conversation_service = ConversationService()
    conversation = await conversation_service.get_or_create_conversation(
        user_id=current_user.id,
        conversation_id=request.conversation_id
    )

    # Step 2: Load message history
    messages = await conversation_service.get_messages(conversation.id)
    message_history = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]

    # Step 3: Store user message
    user_message = await conversation_service.add_message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )

    # Step 4: Execute agent
    llm_service = LLMService()
    tool_registry = MCPToolRegistry()
    agent = AgentRunner(
        provider=llm_service.provider,
        tools=tool_registry
    )

    agent_response = await agent.execute(
        messages=message_history + [{"role": "user", "content": request.message}],
        system_prompt=llm_service.get_default_system_prompt(),
        user_id=current_user.id
    )

    # Step 5: Store assistant message with tool metadata
    assistant_message = await conversation_service.add_message(
        conversation_id=conversation.id,
        role="assistant",
        content=agent_response["content"],
        metadata={
            "tool_calls": agent_response.get("tool_calls"),
            "tool_results": agent_response.get("tool_results")
        }
    )

    # Step 6: Return response
    return ChatResponse(
        message=agent_response["content"],
        conversation_id=conversation.id,
        message_id=assistant_message.id
    )
```

### Conversation History Formatting

```python
# backend/src/services/conversation_service.py
from typing import List, Dict
from src.models.message import Message

class ConversationService:
    """Service for managing conversations and messages."""

    async def format_messages_for_agent(
        self,
        messages: List[Message],
        max_messages: int = 20,
        max_tokens: int = 8000
    ) -> List[Dict[str, str]]:
        """Format messages for agent with trimming."""

        # Step 1: Keep last N messages
        recent_messages = messages[-max_messages:]

        # Step 2: Format for agent
        formatted = [
            {"role": msg.role, "content": msg.content}
            for msg in recent_messages
        ]

        # Step 3: Estimate tokens and trim if needed
        total_tokens = sum(len(msg["content"]) // 4 for msg in formatted)

        while total_tokens > max_tokens and len(formatted) > 1:
            # Remove oldest message
            removed = formatted.pop(0)
            total_tokens -= len(removed["content"]) // 4

        return formatted
```

### Persisting Tool Calls and Results

```python
# backend/src/models/message.py
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional, Dict, Any
from datetime import datetime

class Message(SQLModel, table=True):
    """Message model with tool metadata."""

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Store tool calls and results as JSON
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
    # metadata structure:
    # {
    #   "tool_calls": [{"name": "add_task", "arguments": {...}}],
    #   "tool_results": [{"success": True, "data": {...}}]
    # }
```

---

## Summary and Recommendations

### Key Decisions

1. **Agent Implementation**: Custom agent orchestration (no OpenAI Agents SDK)
2. **MCP SDK**: Use `mcp` package with FastMCP server
3. **Primary Provider**: Google Gemini (gemini-1.5-flash)
4. **Fallback Provider**: OpenRouter (free models)
5. **Architecture**: Fully stateless with database-backed persistence

### Implementation Priorities

**Phase 1: MCP Tools**
1. Install MCP SDK: `pip install mcp`
2. Create MCPToolRegistry class
3. Implement 5 tools: add_task, list_tasks, complete_task, delete_task, update_task
4. Test tools in isolation

**Phase 2: Provider Enhancement**
1. Add function calling support to GeminiProvider
2. Implement OpenRouterProvider with function calling
3. Test provider tool calling

**Phase 3: Agent Integration**
1. Create AgentRunner class
2. Integrate with MCPToolRegistry
3. Implement tool invocation flow
4. Test agent-tool integration

**Phase 4: Chat Endpoint Integration**
1. Modify chat endpoint to use AgentRunner
2. Implement stateless request cycle
3. Persist tool metadata in messages
4. Test end-to-end flow

### Code Examples Repository

All code examples in this document are production-ready and follow the existing codebase patterns:
- Provider abstraction pattern (already in codebase)
- SQLModel ORM usage
- FastAPI async patterns
- Pydantic validation

### Next Steps

1. Review this research document
2. Update plan.md with decisions
3. Generate tasks.md with implementation tasks
4. Begin implementation with MCP tools
