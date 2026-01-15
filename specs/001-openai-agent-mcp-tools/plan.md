# Implementation Plan: OpenAI Agent MCP Tools

**Branch**: `001-openai-agent-mcp-tools` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-openai-agent-mcp-tools/spec.md`

## Summary

This plan implements an AI-powered Todo agent using the OpenAI Agents SDK with external client configuration to support free-tier API providers (Gemini, OpenRouter, Cohere). The agent will execute natural language task management operations through stateless MCP tools that persist all state in the database. The implementation maintains a fully stateless backend architecture where every chat request loads conversation history from the database, executes the agent with MCP tools, persists results, and returns responses.

**Primary Requirement**: Enable users to manage tasks via natural language by implementing an OpenAI Agent that maps user intents to MCP tool invocations (add_task, list_tasks, complete_task, delete_task, update_task).

**Technical Approach**:
1. Configure OpenAI Agents SDK with external client abstraction for free-tier providers
2. Implement MCP server using Official MCP SDK with 5 stateless task tools
3. Integrate agent execution into existing stateless chat endpoint
4. Ensure all state persists in Neon PostgreSQL database

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**:
- OpenAI Agents SDK (agent reasoning and orchestration)
- Official MCP SDK (tool server implementation)
- FastAPI 0.104.1 (existing backend framework)
- SQLModel 0.0.14 (existing ORM)
- google-generativeai 0.3.2 (Gemini provider - already installed)
- Cohere SDK (to be added for Cohere provider support)

**Storage**: Neon Serverless PostgreSQL (existing: tasks, conversations, messages tables)
**Testing**: pytest 7.4.3 (existing)
**Target Platform**: Linux server (FastAPI backend)
**Project Type**: Web application (backend-only changes for this spec)
**Performance Goals**:
- Agent response within 5 seconds (excluding external API latency)
- MCP tool invocations <100ms (database operations)
- Support 50 concurrent users

**Constraints**:
- Free-tier API constraints (short context windows, rate limits, token caps)
- Stateless architecture (no in-memory state)
- No frontend changes permitted
- All backend code inside backend/ directory

**Scale/Scope**:
- 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- 3 external LLM providers (Gemini, OpenRouter, Cohere)
- Multi-user support with JWT-based user scoping

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase II Constitutional Compliance

✅ **User-Centric Functionality**: Agent enables natural language task management, improving UX
✅ **Spec-Driven Development**: All implementation follows approved spec in `/specs/001-openai-agent-mcp-tools/`
✅ **Security & Data Privacy**: JWT authentication enforced; MCP tools validate user scoping
✅ **Scalable Architecture**: Stateless design with database-backed persistence
✅ **Maintainable & Consistent Code**: Follows existing FastAPI + SQLModel patterns

### Phase III Constitutional Compliance

✅ **Mandatory Development Framework**: Using Spec-Kit Plus workflow with Claude Code
✅ **Stateless FastAPI Backend**: No in-memory state; all state persists in database
✅ **MCP Server Implementation**: Using Official MCP SDK for all tool implementations
✅ **OpenAI Agents SDK**: Required for agent reasoning and orchestration
✅ **Database-Persisted State**: All conversations, messages, and tasks in Neon PostgreSQL

### Agent & Skill Governance

✅ **Conversational AI Architect Agent**: Required for agent design, reasoning workflows, intent detection
  - **Mandatory Skill**: `agent-behavior-reasoning`
  - **Domain**: AI agent design, tool selection logic, response quality optimization

✅ **Backend Systems Agent**: Required for MCP tool design, API implementation, database operations
  - **Mandatory Skill**: `backend-mcp-tools`
  - **Domain**: Server-side architecture, MCP tool contracts, stateless backend logic

### MCP Tool Constitutional Rules

✅ **Tool Implementation Requirements**: All 5 required tools defined (add_task, list_tasks, complete_task, delete_task, update_task)
✅ **Statelessness**: Tools operate statelessly with explicit inputs
✅ **State Persistence**: All modifications persist to Neon PostgreSQL
✅ **Agent Access Control**: AI agents ONLY modify tasks through MCP tools
✅ **Tool Contracts**: Each tool defines clear contracts with structured responses

### Chat & Conversation Rules

✅ **Stateless Request Cycle**: Load history → Execute agent → Invoke tools → Store results → Return response
✅ **Server Restart Resilience**: All state recoverable from database
✅ **Conversation Continuity Mandate**: Conversation context maintained across turns

### Error Handling & Confirmation Law

✅ **User-Facing Confirmations**: Agent returns friendly confirmations for all actions
✅ **Graceful Error Handling**: Task not found, invalid requests, system errors handled gracefully
✅ **Silent Failure Prohibition**: All errors logged and communicated to users

**GATE STATUS**: ✅ PASSED - All constitutional requirements satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-openai-agent-mcp-tools/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (MCP tool contracts)
│   ├── add_task.json
│   ├── list_tasks.json
│   ├── complete_task.json
│   ├── delete_task.json
│   └── update_task.json
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── agent/                    # NEW: Agent configuration and execution
│   │   ├── __init__.py
│   │   ├── agent_config.py       # Agent setup with external client
│   │   ├── agent_runner.py       # Agent execution logic
│   │   └── providers/            # External LLM provider configurations
│   │       ├── __init__.py
│   │       ├── gemini.py         # Gemini provider config
│   │       ├── openrouter.py     # OpenRouter provider config
│   │       └── cohere.py         # Cohere provider config
│   │
│   ├── mcp/                      # NEW: MCP server and tools
│   │   ├── __init__.py
│   │   ├── server.py             # MCP server setup
│   │   └── tools/                # MCP tool implementations
│   │       ├── __init__.py
│   │       ├── add_task.py       # add_task tool
│   │       ├── list_tasks.py     # list_tasks tool
│   │       ├── complete_task.py  # complete_task tool
│   │       ├── delete_task.py    # delete_task tool
│   │       └── update_task.py    # update_task tool
│   │
│   ├── api/
│   │   └── routes/
│   │       └── chat.py           # MODIFIED: Integrate agent execution
│   │
│   ├── services/
│   │   ├── llm_service.py        # MODIFIED: Delegate to agent_runner
│   │   └── conversation_service.py  # EXISTING: Conversation persistence
│   │
│   ├── models/                   # EXISTING: No changes
│   │   ├── task.py
│   │   ├── conversation.py
│   │   └── message.py
│   │
│   ├── schemas/                  # EXISTING: No changes
│   │   ├── chat_request.py
│   │   └── chat_response.py
│   │
│   └── core/                     # EXISTING: No changes
│       ├── config.py
│       ├── database.py
│       └── security.py
│
└── requirements.txt              # MODIFIED: Add OpenAI Agents SDK, MCP SDK, Cohere SDK
```

**Structure Decision**: Web application structure (backend-only changes). All new code resides in `backend/src/agent/` and `backend/src/mcp/` directories. Existing chat endpoint (`backend/src/api/routes/chat.py`) is modified to integrate agent execution. No frontend changes per spec requirements.

## Complexity Tracking

> **No constitutional violations requiring justification**

All complexity introduced is justified by constitutional requirements:
- OpenAI Agents SDK: Required by Phase III constitution for agent reasoning
- MCP Server: Required by Phase III constitution for tool implementation
- External client abstraction: Required by spec to support free-tier providers
- Stateless architecture: Required by Phase III constitution for scalability

---

## Phase 0: Research & Technology Validation

### Research Objectives

The following unknowns must be resolved before design:

1. **OpenAI Agents SDK External Client Configuration**
   - How to configure OpenAI Agents SDK with non-OpenAI providers
   - External client abstraction patterns
   - Compatibility with Gemini, OpenRouter, Cohere APIs

2. **Official MCP SDK Integration**
   - MCP SDK installation and setup for Python
   - Tool registration patterns
   - Stateless tool implementation best practices

3. **Free-Tier Provider Capabilities**
   - Function calling support in Gemini free tier
   - Function calling support in OpenRouter free tier
   - Function calling support in Cohere free tier
   - Context window limits and token caps

4. **Agent-MCP Integration Pattern**
   - How OpenAI Agents SDK invokes MCP tools
   - Tool result handling and response formatting
   - Error propagation from tools to agent

5. **Stateless Request Cycle Implementation**
   - Loading conversation history for agent context
   - Persisting tool calls and results
   - Maintaining conversation continuity

### Research Tasks

**Agent**: Conversational AI Architect Agent
**Skill**: `agent-behavior-reasoning`

#### Task 1: Research OpenAI Agents SDK External Client Configuration

**Objective**: Determine how to configure OpenAI Agents SDK to use external LLM providers (Gemini, OpenRouter, Cohere) instead of OpenAI API.

**Research Questions**:
- Does OpenAI Agents SDK support external client configuration?
- What is the abstraction layer for provider switching?
- How to implement custom client adapters for non-OpenAI providers?
- Are there existing examples or libraries for this pattern?

**Deliverable**: Document external client configuration approach with code examples

---

#### Task 2: Research Official MCP SDK for Python

**Objective**: Understand how to implement MCP server and tools using the Official MCP SDK in Python.

**Research Questions**:
- What is the Official MCP SDK package name and installation method?
- How to define MCP tools with input/output schemas?
- How to register tools with the MCP server?
- How to handle tool invocation and return structured responses?
- Best practices for stateless tool implementation?

**Deliverable**: Document MCP SDK setup, tool definition patterns, and server configuration

---

#### Task 3: Research Free-Tier Provider Function Calling Support

**Objective**: Validate that Gemini, OpenRouter, and Cohere free tiers support function calling (required for MCP tool invocation).

**Research Questions**:
- Does Gemini free tier support function calling?
- Does OpenRouter free tier support function calling?
- Does Cohere free tier support function calling?
- What are the context window limits for each provider?
- What are the rate limits and token caps?
- How to handle rate limit errors gracefully?

**Deliverable**: Provider capability matrix with function calling support, limits, and constraints

---

#### Task 4: Research Agent-MCP Integration Pattern

**Objective**: Understand how OpenAI Agents SDK integrates with MCP tools for function calling.

**Research Questions**:
- How does OpenAI Agents SDK invoke external tools?
- What is the tool invocation protocol?
- How to map MCP tool schemas to agent tool definitions?
- How to handle tool results and format responses?
- How to propagate errors from tools to agent?

**Deliverable**: Document agent-MCP integration pattern with code examples

---

#### Task 5: Research Stateless Request Cycle Implementation

**Objective**: Design the stateless request cycle for loading conversation history, executing agent, and persisting results.

**Research Questions**:
- How to format conversation history for agent context?
- How to persist tool calls and results in the database?
- How to maintain conversation continuity across requests?
- How to handle concurrent requests from the same user?

**Deliverable**: Document stateless request cycle flow with database interaction patterns

---

### Research Output

**File**: `specs/001-openai-agent-mcp-tools/research.md`

**Format**:
```markdown
# Research Findings: OpenAI Agent MCP Tools

## 1. OpenAI Agents SDK External Client Configuration

**Decision**: [Chosen approach]
**Rationale**: [Why chosen]
**Alternatives Considered**: [Other options evaluated]
**Implementation Notes**: [Key details]

## 2. Official MCP SDK Integration

**Decision**: [Chosen approach]
**Rationale**: [Why chosen]
**Alternatives Considered**: [Other options evaluated]
**Implementation Notes**: [Key details]

## 3. Free-Tier Provider Capabilities

**Provider Capability Matrix**:

| Provider | Function Calling | Context Window | Rate Limits | Token Caps | Recommended Use |
|----------|------------------|----------------|-------------|------------|-----------------|
| Gemini   | [Yes/No]         | [Size]         | [Limits]    | [Caps]     | [Primary/Fallback] |
| OpenRouter | [Yes/No]       | [Size]         | [Limits]    | [Caps]     | [Primary/Fallback] |
| Cohere   | [Yes/No]         | [Size]         | [Limits]    | [Caps]     | [Primary/Fallback] |

**Decision**: [Primary provider choice]
**Rationale**: [Why chosen]

## 4. Agent-MCP Integration Pattern

**Decision**: [Chosen integration approach]
**Rationale**: [Why chosen]
**Implementation Notes**: [Key details]

## 5. Stateless Request Cycle Implementation

**Decision**: [Chosen request cycle design]
**Rationale**: [Why chosen]
**Implementation Notes**: [Key details]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all decisions documented

### Design Objectives

1. Define data models for agent configuration and tool execution results
2. Generate MCP tool contracts (input/output schemas)
3. Design agent configuration and provider selection logic
4. Design stateless request cycle flow
5. Create quickstart guide for local development

### Design Tasks

**Agent**: Backend Systems Agent
**Skill**: `backend-mcp-tools`

#### Task 1: Generate Data Model

**Objective**: Define entities for agent configuration, tool execution, and provider management.

**Entities to Define**:

1. **AgentConfiguration** (runtime configuration, not persisted)
   - provider_type: str (gemini, openrouter, cohere)
   - model_name: str
   - api_key: str (from environment)
   - context_window_size: int
   - max_tokens: int
   - temperature: float

2. **ToolExecutionResult** (runtime result, not persisted separately)
   - tool_name: str
   - success: bool
   - data: dict (task object or list of tasks)
   - error_message: Optional[str]
   - execution_timestamp: datetime

3. **AgentRequestContext** (runtime context, not persisted)
   - user_id: int
   - conversation_id: int
   - message_history: List[dict]
   - jwt_token: str

**Note**: These are runtime entities, not database tables. Existing database models (Task, Conversation, Message) remain unchanged.

**Deliverable**: `specs/001-openai-agent-mcp-tools/data-model.md`

---

#### Task 2: Generate MCP Tool Contracts

**Objective**: Define input/output schemas for all 5 MCP tools.

**Tools to Define**:

1. **add_task**
   - Input: title (required), description (optional), due_date (optional), priority (optional), user_id (required)
   - Output: success (bool), task (Task object), message (str)

2. **list_tasks**
   - Input: user_id (required), filter (optional: "all", "completed", "incomplete")
   - Output: success (bool), tasks (List[Task]), count (int), message (str)

3. **complete_task**
   - Input: user_id (required), task_identifier (int or str - ID or title)
   - Output: success (bool), task (Task object), message (str)

4. **delete_task**
   - Input: user_id (required), task_identifier (int or str - ID or title)
   - Output: success (bool), message (str)

5. **update_task**
   - Input: user_id (required), task_identifier (int or str), updates (dict with title, description, due_date, priority, completed)
   - Output: success (bool), task (Task object), message (str)

**Deliverable**: `specs/001-openai-agent-mcp-tools/contracts/` directory with 5 JSON schema files

---

#### Task 3: Design Agent Configuration Logic

**Objective**: Design provider selection and agent initialization logic.

**Design Elements**:

1. **Environment Variables**:
   - `LLM_PROVIDER`: Primary provider (gemini, openrouter, cohere)
   - `GEMINI_API_KEY`: Gemini API key
   - `OPENROUTER_API_KEY`: OpenRouter API key
   - `COHERE_API_KEY`: Cohere API key
   - `FALLBACK_PROVIDER`: Fallback provider (optional)

2. **Provider Configuration**:
   - Each provider has a configuration class (GeminiProvider, OpenRouterProvider, CohereProvider)
   - Configuration includes model name, context window, token limits
   - Provider classes implement a common interface for agent initialization

3. **Agent Initialization**:
   - Load provider configuration from environment
   - Initialize external client for selected provider
   - Register MCP tools with agent
   - Return configured agent instance

**Deliverable**: Design documented in `research.md` or `data-model.md`

---

#### Task 4: Design Stateless Request Cycle Flow

**Objective**: Design the complete request cycle from chat endpoint to agent execution to database persistence.

**Flow Steps**:

1. **Receive Chat Request** (chat.py endpoint)
   - Validate JWT token
   - Extract user_id and conversation_id
   - Validate user authorization

2. **Load Conversation History** (conversation_service.py)
   - Query database for conversation and messages
   - Format messages for agent context
   - Return message history

3. **Store User Message** (conversation_service.py)
   - Create new Message record with role="user"
   - Persist to database
   - Return message ID

4. **Execute Agent** (agent_runner.py)
   - Initialize agent with provider configuration
   - Load conversation history into agent context
   - Execute agent reasoning with user message
   - Agent selects and invokes MCP tools
   - Collect tool results
   - Generate final response

5. **Persist Agent Response** (conversation_service.py)
   - Create new Message record with role="assistant"
   - Store tool calls and results in message metadata
   - Persist to database
   - Return message ID

6. **Return Response** (chat.py endpoint)
   - Format ChatResponse with agent message
   - Return to client

**Deliverable**: Flow diagram and implementation notes in `data-model.md`

---

#### Task 5: Create Quickstart Guide

**Objective**: Document local development setup for testing agent and MCP tools.

**Quickstart Sections**:

1. **Prerequisites**:
   - Python 3.11+
   - Neon PostgreSQL database
   - API keys for Gemini/OpenRouter/Cohere

2. **Installation**:
   - Install dependencies: `pip install -r backend/requirements.txt`
   - Set environment variables in `.env`
   - Run database migrations: `alembic upgrade head`

3. **Configuration**:
   - Configure LLM provider in `.env`
   - Set API keys
   - Configure database connection

4. **Running the Server**:
   - Start FastAPI server: `uvicorn src.main:app --reload`
   - Test chat endpoint: `curl -X POST http://localhost:8000/api/{user_id}/chat`

5. **Testing MCP Tools**:
   - Test add_task tool
   - Test list_tasks tool
   - Test complete_task tool
   - Test delete_task tool
   - Test update_task tool

**Deliverable**: `specs/001-openai-agent-mcp-tools/quickstart.md`

---

#### Task 6: Update Agent Context

**Objective**: Update Claude Code agent context with new technologies from this plan.

**Command**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`

**Technologies to Add**:
- OpenAI Agents SDK
- Official MCP SDK
- Cohere SDK
- External client configuration patterns
- MCP tool implementation patterns

**Deliverable**: Updated agent context file

---

### Phase 1 Outputs

**Files Created**:
1. `specs/001-openai-agent-mcp-tools/research.md` - Research findings and decisions
2. `specs/001-openai-agent-mcp-tools/data-model.md` - Entity definitions and flow diagrams
3. `specs/001-openai-agent-mcp-tools/contracts/` - MCP tool JSON schemas (5 files)
4. `specs/001-openai-agent-mcp-tools/quickstart.md` - Local development guide
5. Updated agent context file

---

## Phase 2: Implementation Planning (Not Executed by /sp.plan)

**Note**: Phase 2 (task generation) is executed by the `/sp.tasks` command, NOT by `/sp.plan`. This section provides guidance for task generation.

### Implementation Phases

#### Phase 2.1: MCP Server & Tools Implementation

**Agent**: Backend Systems Agent
**Skill**: `backend-mcp-tools`

**Tasks**:
1. Install Official MCP SDK and Cohere SDK
2. Implement MCP server setup (`backend/src/mcp/server.py`)
3. Implement add_task tool (`backend/src/mcp/tools/add_task.py`)
4. Implement list_tasks tool (`backend/src/mcp/tools/list_tasks.py`)
5. Implement complete_task tool (`backend/src/mcp/tools/complete_task.py`)
6. Implement delete_task tool (`backend/src/mcp/tools/delete_task.py`)
7. Implement update_task tool (`backend/src/mcp/tools/update_task.py`)
8. Test MCP tools in isolation

#### Phase 2.2: Agent Configuration & Provider Setup

**Agent**: Conversational AI Architect Agent
**Skill**: `agent-behavior-reasoning`

**Tasks**:
1. Install OpenAI Agents SDK
2. Implement provider configuration classes (`backend/src/agent/providers/`)
3. Implement agent configuration logic (`backend/src/agent/agent_config.py`)
4. Implement agent runner (`backend/src/agent/agent_runner.py`)
5. Test agent initialization with each provider

#### Phase 2.3: Agent-MCP Integration

**Agent**: Backend Systems Agent
**Skill**: `backend-mcp-tools`

**Tasks**:
1. Register MCP tools with agent
2. Implement tool invocation handling
3. Implement tool result processing
4. Test agent-MCP integration

#### Phase 2.4: Chat Endpoint Integration

**Agent**: Backend Systems Agent
**Skill**: `backend-mcp-tools`

**Tasks**:
1. Modify chat endpoint to use agent_runner
2. Implement stateless request cycle
3. Persist tool calls and results
4. Test end-to-end chat flow

#### Phase 2.5: Error Handling & Edge Cases

**Agent**: Backend Systems Agent
**Skill**: `backend-mcp-tools`

**Tasks**:
1. Implement provider error handling
2. Implement rate limit handling
3. Implement tool error handling
4. Test edge cases (task not found, invalid input, concurrent requests)

#### Phase 2.6: Testing & Validation

**Agent**: Backend Systems Agent
**Skill**: `backend-mcp-tools`

**Tasks**:
1. Write unit tests for MCP tools
2. Write integration tests for agent execution
3. Write end-to-end tests for chat flow
4. Validate all acceptance criteria from spec

---

## Acceptance Criteria

### Phase 0 Acceptance

- [ ] All research questions answered
- [ ] Provider capability matrix complete
- [ ] External client configuration approach documented
- [ ] MCP SDK integration approach documented
- [ ] Stateless request cycle design documented

### Phase 1 Acceptance

- [ ] Data model entities defined
- [ ] All 5 MCP tool contracts defined with JSON schemas
- [ ] Agent configuration logic designed
- [ ] Stateless request cycle flow documented
- [ ] Quickstart guide created
- [ ] Agent context updated

### Phase 2 Acceptance (Guidance for /sp.tasks)

- [ ] MCP server implemented and running
- [ ] All 5 MCP tools implemented and tested
- [ ] Agent configured with external client
- [ ] Agent-MCP integration working
- [ ] Chat endpoint integrated with agent
- [ ] Stateless request cycle functional
- [ ] All error handling implemented
- [ ] All tests passing
- [ ] All spec acceptance criteria met

---

## Risk Analysis

### Technical Risks

1. **OpenAI Agents SDK External Client Compatibility**
   - **Risk**: OpenAI Agents SDK may not support external clients
   - **Mitigation**: Research alternative agent frameworks if needed
   - **Fallback**: Implement custom agent logic without SDK

2. **Free-Tier Function Calling Support**
   - **Risk**: Free-tier providers may not support function calling
   - **Mitigation**: Validate provider capabilities in Phase 0
   - **Fallback**: Use prompt-based tool selection if function calling unavailable

3. **MCP SDK Python Availability**
   - **Risk**: Official MCP SDK may not have Python implementation
   - **Mitigation**: Research MCP SDK availability in Phase 0
   - **Fallback**: Implement custom MCP server if SDK unavailable

4. **Rate Limit Handling**
   - **Risk**: Free-tier rate limits may impact user experience
   - **Mitigation**: Implement graceful degradation and retry logic
   - **Fallback**: Queue requests or display rate limit messages

### Architectural Risks

1. **Stateless Architecture Complexity**
   - **Risk**: Loading conversation history on every request may impact performance
   - **Mitigation**: Optimize database queries with proper indexing
   - **Fallback**: Implement conversation history pagination if needed

2. **Concurrent Request Handling**
   - **Risk**: Concurrent requests from same user may cause race conditions
   - **Mitigation**: Use database transactions and optimistic locking
   - **Fallback**: Implement request queuing per user

---

## Dependencies

### External Dependencies

1. **OpenAI Agents SDK**: Required for agent reasoning and orchestration
2. **Official MCP SDK**: Required for MCP server and tool implementation
3. **Cohere SDK**: Required for Cohere provider support
4. **External API Accounts**: Gemini, OpenRouter, Cohere accounts with API keys

### Internal Dependencies

1. **Spec-1 Completion**: Chat UI and basic chat endpoint must be functional
2. **Database Schema**: Conversations and messages tables must exist
3. **Better Auth**: JWT authentication must be functional
4. **Existing Models**: Task, Conversation, Message models must be available

---

## Next Steps

1. **Execute Phase 0**: Run research tasks to resolve all unknowns
2. **Execute Phase 1**: Generate design artifacts (data-model.md, contracts/, quickstart.md)
3. **Re-evaluate Constitution Check**: Verify all constitutional requirements still satisfied
4. **Execute /sp.tasks**: Generate implementation tasks based on this plan
5. **Execute /sp.implement**: Implement tasks in dependency order

---

## Notes

- This plan focuses exclusively on backend implementation; no frontend changes
- All code must reside in `backend/` directory per constitutional requirements
- Agent behavior must follow Agent Behavior Specification (to be referenced in tasks)
- MCP tools must be stateless and database-backed per constitutional requirements
- Error handling must prioritize user experience with friendly messages
- Provider selection must be configurable via environment variables
- Fallback provider support is optional but recommended for reliability
