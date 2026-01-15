# Research Findings: OpenAI Agent MCP Tools

**Date**: 2026-01-14
**Feature**: 001-openai-agent-mcp-tools
**Research Phase**: Phase 0 - Technology Validation

## Executive Summary

This research validates the technical approach for implementing an AI-powered Todo agent with MCP tools using free-tier API providers. Key findings:

1. **OpenAI Agents SDK is NOT suitable** - Has compatibility issues and doesn't support external providers
2. **Custom agent implementation is RECOMMENDED** - Provides full control and works with any provider
3. **Google Gemini is the PRIMARY provider** - Best free-tier offering with full function calling support
4. **MCP SDK (FastMCP) is production-ready** - Already installed, provides clean decorator-based API
5. **Stateless architecture is feasible** - Conversation history trimming handles free-tier constraints

---

## 1. OpenAI Agents SDK External Client Configuration

### Decision: Use Custom Agent Implementation (NOT OpenAI Agents SDK)

**Rationale**:
- OpenAI Agents SDK (v0.4.2) has compatibility issues with current OpenAI SDK
- SDK is NOT designed for external providers (Gemini, OpenRouter, Cohere)
- Custom implementation provides full control over agent logic
- Simpler debugging and maintenance
- Works with any provider supporting function calling

**Alternatives Considered**:
1. **OpenAI Agents SDK with external client** - REJECTED: Not supported by SDK design
2. **LangChain Agents** - REJECTED: Too heavy, unnecessary complexity for our use case
3. **Custom agent orchestration** - SELECTED: Best fit for requirements

**Implementation Approach**:

```python
class AgentRunner:
    """Custom agent orchestration without OpenAI Agents SDK dependency."""

    def __init__(self, provider: LLMProvider, tools: MCPToolRegistry):
        self.provider = provider
        self.tools = tools

    async def execute(self, messages: List[Dict], system_prompt: str, user_id: int) -> Dict:
        """Execute agent reasoning with tool invocation."""

        # 1. Get tool definitions for LLM
        tool_definitions = self.tools.get_tool_definitions()

        # 2. Call LLM with tools
        response = await self.provider.generate_response_with_tools(
            messages=messages,
            system_prompt=system_prompt,
            tools=tool_definitions
        )

        # 3. Execute tool calls if present
        if response.get("tool_calls"):
            tool_results = []
            for tool_call in response["tool_calls"]:
                result = await self.tools.execute_tool(
                    tool_name=tool_call["name"],
                    arguments=tool_call["arguments"],
                    user_id=user_id  # Inject user context for security
                )
                tool_results.append(result)

            # 4. Send results back to LLM for final response
            final_response = await self.provider.generate_response_with_tool_results(
                messages=messages,
                tool_calls=response["tool_calls"],
                tool_results=tool_results
            )
            return final_response

        return response
```

**Key Benefits**:
- No dependency on broken SDK
- Full control over agent logic
- Works with any provider supporting function calling
- Simpler debugging and maintenance
- Follows existing codebase patterns (FastAPI, async/await)

---

## 2. Official MCP SDK Integration

### Decision: Use MCP SDK with FastMCP Server

**Package**: `mcp` version 1.20.0 (already installed in environment)

**Installation**: `pip install mcp`

**Rationale**:
- Official MCP SDK provides production-ready server implementation
- FastMCP offers clean decorator-based API (similar to FastAPI)
- Already installed in the environment
- Well-documented with examples
- Supports stateless tool implementation

**Alternatives Considered**:
1. **Custom MCP server implementation** - REJECTED: Unnecessary complexity, SDK is production-ready
2. **Low-level MCP Server class** - REJECTED: FastMCP provides better developer experience
3. **FastMCP (high-level)** - SELECTED: Best fit for requirements

**Tool Definition Pattern**:

```python
from mcp.server import FastMCP
from typing import Optional

mcp_server = FastMCP("todo-mcp-server")

@mcp_server.tool()
async def add_task(
    user_id: int,
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None
) -> dict:
    """Add a new task to the user's todo list.

    Args:
        user_id: ID of the user creating the task (injected by backend)
        title: Task title (required)
        description: Optional task description
        due_date: Optional due date in ISO format
        priority: Optional priority (low, medium, high)

    Returns:
        dict: {success: bool, task: Task, message: str}
    """
    # Implementation with database access
    async with get_db_session() as db:
        task = Task(
            user_id=user_id,
            title=title,
            description=description,
            # ... other fields
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

        return {
            "success": True,
            "task": task.dict(),
            "message": f"Task '{title}' created successfully"
        }
```

**Stateless Implementation Best Practices**:
1. **No in-memory state** - All state persists in database
2. **Explicit user context** - `user_id` passed to every tool (injected by backend, not LLM)
3. **Database transactions** - Use transactions for consistency
4. **Structured responses** - Always return `{success, data, message}` format
5. **Error handling** - Return structured errors, don't throw exceptions

**Tool Registration**:

```python
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
        """Get tool definitions for LLM in OpenAI function format."""
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
        """Execute a tool with user context injection."""
        if tool_name not in self.tools:
            return {"success": False, "error": f"Tool '{tool_name}' not found"}

        try:
            # SECURITY: Inject user_id, don't trust LLM output
            arguments["user_id"] = user_id
            result = await self.tools[tool_name](**arguments)
            return result
        except Exception as e:
            logger.error(f"Tool execution error: {tool_name}", exc_info=True)
            return {"success": False, "error": str(e)}
```

---

## 3. Free-Tier Provider Capabilities

### Provider Capability Matrix

| Provider | Function Calling | Context Window | Rate Limits | Token Caps | Cost | Recommendation |
|----------|------------------|----------------|-------------|------------|------|----------------|
| **Google Gemini** | ✅ Full support | 1M-2M tokens | 15 RPM, 1500 RPD | 1M tokens/min | Free | **PRIMARY** |
| **OpenRouter** | ✅ Select models | 4k-200k tokens | Varies by model | Varies | Free models available | **FALLBACK** |
| **Cohere** | ✅ Yes | 4k-128k tokens | 100/min (trial) | Limited | Trial only | **NOT RECOMMENDED** |

**Legend**:
- RPM: Requests Per Minute
- RPD: Requests Per Day

### Decision: Google Gemini as Primary Provider

**Primary Provider**: Google Gemini (`gemini-1.5-flash`)

**Rationale**:
- **Best free-tier offering**: No credit card required, true free tier
- **Full function calling support**: Native support for tool invocation
- **Large context window**: 1M tokens (handles long conversations)
- **Generous rate limits**: 15 RPM, 1500 RPD sufficient for development and small-scale production
- **Already integrated**: `google-generativeai` SDK already installed in backend

**Fallback Provider**: OpenRouter (free models)

**Rationale**:
- **Good backup**: When Gemini hits rate limits
- **Free models available**: `google/gemini-flash-1.5:free`, `meta-llama/llama-3.2-3b-instruct:free`
- **No additional cost**: Maintains free-tier requirement

**Cohere NOT Recommended**:
- **Trial only**: Not a true free tier
- **Limited availability**: Trial expires
- **Smaller context window**: 4k-128k tokens insufficient for long conversations

### Implementation: Gemini Provider with Function Calling

```python
import google.generativeai as genai
from typing import List, Dict, Any, Optional

class GeminiProvider(LLMProvider):
    """Google Gemini provider with function calling support."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        genai.configure(api_key=api_key)
        self.model_name = model_name

    async def generate_response_with_tools(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate response with function calling support."""

        # Convert tools to Gemini format
        gemini_tools = self._convert_tools_to_gemini_format(tools)

        # Initialize model with tools
        model = genai.GenerativeModel(
            model_name=self.model_name,
            tools=gemini_tools,
            system_instruction=system_prompt
        )

        # Start chat with history
        chat = model.start_chat(history=self._format_history(messages[:-1]))

        # Send latest message
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

        # Regular text response
        return {
            "content": response.text,
            "tool_calls": None
        }

    async def generate_response_with_tool_results(
        self,
        messages: List[Dict[str, str]],
        tool_calls: List[Dict],
        tool_results: List[Dict]
    ) -> Dict[str, Any]:
        """Generate final response after tool execution."""

        # Format tool results for Gemini
        function_responses = [
            genai.protos.FunctionResponse(
                name=tool_call["name"],
                response={"result": tool_result}
            )
            for tool_call, tool_result in zip(tool_calls, tool_results)
        ]

        # Send tool results back to model
        model = genai.GenerativeModel(model_name=self.model_name)
        chat = model.start_chat(history=self._format_history(messages))

        response = chat.send_message(
            genai.protos.Content(parts=[
                genai.protos.Part(function_response=fr)
                for fr in function_responses
            ])
        )

        return {
            "content": response.text,
            "tool_calls": tool_calls,
            "tool_results": tool_results
        }

    def _convert_tools_to_gemini_format(self, tools: List[Dict]) -> List:
        """Convert OpenAI function format to Gemini format."""
        gemini_tools = []
        for tool in tools:
            func = tool["function"]
            gemini_tools.append(
                genai.protos.Tool(
                    function_declarations=[
                        genai.protos.FunctionDeclaration(
                            name=func["name"],
                            description=func["description"],
                            parameters=func["parameters"]
                        )
                    ]
                )
            )
        return gemini_tools

    def _format_history(self, messages: List[Dict]) -> List:
        """Format messages for Gemini chat history."""
        return [
            genai.protos.Content(
                role="user" if msg["role"] == "user" else "model",
                parts=[genai.protos.Part(text=msg["content"])]
            )
            for msg in messages
        ]
```

### Rate Limit Handling

```python
class RateLimitHandler:
    """Handle rate limits with fallback provider."""

    def __init__(self, primary_provider: LLMProvider, fallback_provider: Optional[LLMProvider] = None):
        self.primary = primary_provider
        self.fallback = fallback_provider
        self.rate_limit_count = 0

    async def generate_response(self, *args, **kwargs):
        """Generate response with automatic fallback."""
        try:
            return await self.primary.generate_response_with_tools(*args, **kwargs)
        except Exception as e:
            if "rate limit" in str(e).lower() or "429" in str(e):
                self.rate_limit_count += 1
                logger.warning(f"Rate limit hit on primary provider, using fallback")

                if self.fallback:
                    return await self.fallback.generate_response_with_tools(*args, **kwargs)
                else:
                    raise HTTPException(
                        status_code=429,
                        detail="Rate limit exceeded. Please try again in a few minutes."
                    )
            raise
```

---

## 4. Agent-MCP Integration Pattern

### Decision: Tool Registry with User Context Injection

**Rationale**:
- **Security**: User context (`user_id`) injected by backend, never trusted from LLM
- **Stateless**: Tools receive all context explicitly
- **Testable**: Tools can be tested independently
- **Maintainable**: Clear separation between agent logic and tool execution

**Tool Invocation Flow**:

```
User Message → LLM (with tools) → Tool Calls → Execute MCP Tools →
Tool Results → LLM (with results) → Final Response
```

**Implementation Pattern**:

```python
class AgentRunner:
    """Agent orchestration with MCP tool integration."""

    async def execute(
        self,
        messages: List[Dict],
        system_prompt: str,
        user_id: int
    ) -> Dict[str, Any]:
        """Execute agent with tool invocation."""

        # 1. Get tool definitions
        tool_definitions = self.tools.get_tool_definitions()

        # 2. First LLM call with tools
        response = await self.provider.generate_response_with_tools(
            messages=messages,
            system_prompt=system_prompt,
            tools=tool_definitions
        )

        # 3. If no tool calls, return response
        if not response.get("tool_calls"):
            return {
                "content": response["content"],
                "tool_calls": None,
                "tool_results": None
            }

        # 4. Execute tool calls
        tool_results = []
        for tool_call in response["tool_calls"]:
            result = await self.tools.execute_tool(
                tool_name=tool_call["name"],
                arguments=tool_call["arguments"],
                user_id=user_id  # SECURITY: Inject user context
            )
            tool_results.append(result)

        # 5. Second LLM call with tool results
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
```

**Error Propagation**:

```python
async def execute_tool(self, tool_name: str, arguments: Dict, user_id: int) -> Dict:
    """Execute tool with error handling."""
    try:
        # Inject user_id
        arguments["user_id"] = user_id

        # Execute tool
        result = await self.tools[tool_name](**arguments)

        # Validate result format
        if not isinstance(result, dict) or "success" not in result:
            return {
                "success": False,
                "error": "Tool returned invalid response format"
            }

        return result

    except KeyError:
        return {
            "success": False,
            "error": f"Tool '{tool_name}' not found"
        }
    except TypeError as e:
        return {
            "success": False,
            "error": f"Invalid arguments for tool '{tool_name}': {str(e)}"
        }
    except Exception as e:
        logger.error(f"Tool execution error: {tool_name}", exc_info=True)
        return {
            "success": False,
            "error": f"Tool execution failed: {str(e)}"
        }
```

---

## 5. Stateless Request Cycle Implementation

### Decision: Database-Backed Conversation History with Trimming

**Rationale**:
- **Stateless**: Every request loads conversation history from database
- **Scalable**: No in-memory state, supports horizontal scaling
- **Restart-safe**: Server restarts don't affect conversation continuity
- **Free-tier compatible**: Conversation history trimming handles token limits

**Complete Request Flow**:

```python
@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: int,
    request: ChatRequest,
    db: Session = Depends(get_session),
    current_user: Dict = Depends(get_current_user)
) -> ChatResponse:
    """Stateless chat endpoint with agent execution."""

    # 1. Validate user authorization
    if current_user["id"] != user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # 2. Load or create conversation
    conversation_service = ConversationService(db)
    conversation = await conversation_service.get_or_create_conversation(
        user_id=user_id,
        conversation_id=request.conversation_id
    )

    # 3. Load message history from database
    messages = await conversation_service.get_messages(conversation.id)

    # 4. Format and trim history for agent
    message_history = await conversation_service.format_messages_for_agent(
        messages=messages,
        max_messages=20,  # Keep last 20 messages
        max_tokens=8000   # Trim to fit free-tier context window
    )

    # 5. Store user message
    await conversation_service.add_message(
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )

    # 6. Execute agent with tools
    llm_service = LLMService()
    tool_registry = MCPToolRegistry()
    agent = AgentRunner(provider=llm_service.provider, tools=tool_registry)

    agent_response = await agent.execute(
        messages=message_history + [{"role": "user", "content": request.message}],
        system_prompt=llm_service.get_default_system_prompt(),
        user_id=user_id
    )

    # 7. Store assistant message with tool metadata
    await conversation_service.add_message(
        conversation_id=conversation.id,
        role="assistant",
        content=agent_response["content"],
        metadata={
            "tool_calls": agent_response.get("tool_calls"),
            "tool_results": agent_response.get("tool_results")
        }
    )

    # 8. Return response
    return ChatResponse(
        message=agent_response["content"],
        conversation_id=conversation.id
    )
```

**Conversation History Trimming**:

```python
async def format_messages_for_agent(
    self,
    messages: List[Message],
    max_messages: int = 20,
    max_tokens: int = 8000
) -> List[Dict[str, str]]:
    """Format messages with trimming for free-tier constraints."""

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
        formatted.pop(0)  # Remove oldest
        total_tokens = sum(len(msg["content"]) // 4 for msg in formatted)

    return formatted
```

**Concurrent Request Handling**:

```python
# Use database transactions for consistency
async def add_message(
    self,
    conversation_id: int,
    role: str,
    content: str,
    metadata: Optional[Dict] = None
) -> Message:
    """Add message with transaction for concurrent safety."""

    async with self.db.begin():  # Transaction
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            metadata=metadata,
            created_at=datetime.utcnow()
        )
        self.db.add(message)
        await self.db.flush()  # Get ID before commit
        await self.db.refresh(message)
        return message
```

---

## Implementation Recommendations

### Phase 1: MCP Tools (Priority 1)

**Files to Create**:
- `backend/src/mcp/server.py` - MCP server setup
- `backend/src/mcp/tools/add_task.py` - add_task tool
- `backend/src/mcp/tools/list_tasks.py` - list_tasks tool
- `backend/src/mcp/tools/complete_task.py` - complete_task tool
- `backend/src/mcp/tools/delete_task.py` - delete_task tool
- `backend/src/mcp/tools/update_task.py` - update_task tool
- `backend/src/mcp/tool_registry.py` - MCPToolRegistry class

**Testing Strategy**:
- Unit tests for each tool in isolation
- Test with mock database
- Validate user scoping (users can only access their own tasks)

### Phase 2: Provider Enhancement (Priority 2)

**Files to Modify**:
- `backend/src/services/llm_service.py` - Add function calling support to GeminiProvider
- `backend/src/services/providers/gemini.py` - Implement tool invocation methods
- `backend/src/services/providers/openrouter.py` - Create OpenRouter fallback provider

**Testing Strategy**:
- Test function calling with Gemini API
- Test tool definition conversion
- Test rate limit handling with fallback

### Phase 3: Agent Integration (Priority 3)

**Files to Create**:
- `backend/src/agent/agent_runner.py` - AgentRunner class
- `backend/src/agent/agent_config.py` - Agent configuration

**Files to Modify**:
- `backend/src/services/llm_service.py` - Integrate AgentRunner

**Testing Strategy**:
- Test agent-tool integration
- Test tool invocation flow
- Test error handling

### Phase 4: Chat Endpoint Integration (Priority 4)

**Files to Modify**:
- `backend/src/api/routes/chat.py` - Integrate AgentRunner
- `backend/src/services/conversation_service.py` - Add message formatting and trimming

**Testing Strategy**:
- End-to-end tests for chat flow
- Test conversation history loading
- Test tool metadata persistence
- Test concurrent requests

---

## Risk Mitigation

### Technical Risks

1. **Rate Limit Exhaustion**
   - **Mitigation**: Implement fallback to OpenRouter
   - **Monitoring**: Track rate limit hits
   - **User Communication**: Display friendly error messages

2. **Context Window Overflow**
   - **Mitigation**: Conversation history trimming
   - **Strategy**: Keep last 20 messages, max 8000 tokens
   - **Fallback**: Summarize old messages if needed

3. **Tool Execution Failures**
   - **Mitigation**: Structured error responses
   - **Logging**: Comprehensive error logging
   - **User Experience**: Friendly error messages

### Architectural Risks

1. **Database Performance**
   - **Mitigation**: Proper indexing on conversation_id, user_id
   - **Optimization**: Limit message history queries
   - **Monitoring**: Track query performance

2. **Concurrent Requests**
   - **Mitigation**: Database transactions
   - **Testing**: Concurrent request tests
   - **Validation**: Ensure no race conditions

---

## Conclusion

All research objectives have been met. The technical approach is validated and ready for implementation:

✅ **Custom agent implementation** (not OpenAI Agents SDK)
✅ **MCP SDK with FastMCP** (production-ready)
✅ **Google Gemini as primary provider** (best free-tier offering)
✅ **Tool registry with user context injection** (secure and stateless)
✅ **Database-backed conversation history** (stateless and restart-safe)

**Next Steps**:
1. Update `plan.md` with research decisions
2. Generate Phase 1 design artifacts (data-model.md, contracts/, quickstart.md)
3. Execute `/sp.tasks` to generate implementation tasks
4. Begin implementation starting with MCP tools
