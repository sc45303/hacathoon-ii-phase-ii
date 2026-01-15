# Feature Specification: OpenAI Agent MCP Tools

**Feature Branch**: `001-openai-agent-mcp-tools`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Spec-2: OpenAI Agent MCP Tools - AI execution layer with MCP server and task management tools"

## Context

This is Spec-2 of Phase III: Todo AI Chatbot. This specification builds on top of Spec-1 (chat UI + basic agent wiring) and introduces the AI execution layer, MCP server, and task management tools. Spec-1 must already be complete before implementing this specification.

This specification explicitly focuses on:
- Building an AI agent using the OpenAI Agents SDK
- Configuring the agent to run using free-tier API keys via external client configuration
- Integrating Cohere as a supported provider
- Implementing MCP tools for task operations
- Keeping the backend fully stateless with database-backed persistence

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Task via Natural Language (Priority: P1)

A user wants to create a new task by typing a natural language request to the AI agent, such as "Add a task to buy groceries" or "Remind me to call mom tomorrow."

**Why this priority**: This is the core value proposition of the AI-powered todo system. Without the ability to create tasks via natural language, the AI agent provides no functional value. This is the minimum viable feature that demonstrates the agent's capability.

**Independent Test**: Can be fully tested by sending a chat message with a task creation intent and verifying that a new task appears in the user's task list with the correct title and details.

**Acceptance Scenarios**:

1. **Given** a logged-in user with an active conversation, **When** the user sends "Add a task to buy groceries", **Then** the agent creates a new task with title "Buy groceries" and confirms the creation in natural language
2. **Given** a logged-in user, **When** the user sends "Create a task: finish project report by Friday", **Then** the agent creates a task with appropriate title and due date, and responds with confirmation
3. **Given** a logged-in user, **When** the user sends an ambiguous request like "todo something", **Then** the agent asks for clarification about what task to create

---

### User Story 2 - List Tasks via Natural Language (Priority: P2)

A user wants to view their tasks by asking the AI agent in natural language, such as "Show me my tasks" or "What do I need to do today?"

**Why this priority**: After creating tasks, users need to view them. This is the second most critical feature for a functional todo system. It validates that the agent can retrieve and present information.

**Independent Test**: Can be fully tested by creating several tasks, then asking the agent to list them, and verifying that all tasks are returned in a readable format.

**Acceptance Scenarios**:

1. **Given** a user with 3 existing tasks, **When** the user asks "Show me my tasks", **Then** the agent lists all 3 tasks with their titles and status
2. **Given** a user with no tasks, **When** the user asks "What are my tasks?", **Then** the agent responds that there are no tasks currently
3. **Given** a user with completed and incomplete tasks, **When** the user asks "Show me my incomplete tasks", **Then** the agent filters and shows only incomplete tasks

---

### User Story 3 - Complete Task via Natural Language (Priority: P3)

A user wants to mark a task as complete by telling the AI agent, such as "Mark 'buy groceries' as done" or "I finished the project report."

**Why this priority**: Completing tasks is a core workflow in any todo system. This feature demonstrates the agent's ability to modify existing data based on user intent.

**Independent Test**: Can be fully tested by creating a task, asking the agent to mark it complete, and verifying the task's status changes to completed.

**Acceptance Scenarios**:

1. **Given** a user with an incomplete task "Buy groceries", **When** the user says "Mark 'buy groceries' as complete", **Then** the agent marks the task as complete and confirms the action
2. **Given** a user with multiple tasks, **When** the user says "I finished task 2", **Then** the agent identifies the correct task by ID and marks it complete
3. **Given** a user referencing a non-existent task, **When** the user says "Complete task 'xyz'", **Then** the agent responds that the task was not found and asks for clarification

---

### User Story 4 - Delete Task via Natural Language (Priority: P4)

A user wants to remove a task by asking the AI agent, such as "Delete the groceries task" or "Remove task 3."

**Why this priority**: Users need the ability to remove tasks that are no longer relevant. This is less critical than creation, viewing, and completion, but still important for task management.

**Independent Test**: Can be fully tested by creating a task, asking the agent to delete it, and verifying the task no longer appears in the task list.

**Acceptance Scenarios**:

1. **Given** a user with a task "Buy groceries", **When** the user says "Delete the groceries task", **Then** the agent removes the task and confirms deletion
2. **Given** a user with multiple tasks, **When** the user says "Remove task 2", **Then** the agent deletes the correct task by ID
3. **Given** a user referencing a non-existent task, **When** the user says "Delete task 'xyz'", **Then** the agent responds that the task was not found

---

### User Story 5 - Update Task via Natural Language (Priority: P5)

A user wants to modify an existing task by telling the AI agent, such as "Change the groceries task to 'buy groceries and milk'" or "Update task 1 title to 'finish report by Monday'."

**Why this priority**: Task updates are useful but less critical than the core CRUD operations. Users can work around this by deleting and recreating tasks if needed.

**Independent Test**: Can be fully tested by creating a task, asking the agent to update it, and verifying the task's details have changed.

**Acceptance Scenarios**:

1. **Given** a user with a task "Buy groceries", **When** the user says "Change the groceries task to 'buy groceries and milk'", **Then** the agent updates the task title and confirms the change
2. **Given** a user with a task, **When** the user says "Update task 1 description to 'urgent'", **Then** the agent updates the task description field
3. **Given** a user referencing a non-existent task, **When** the user says "Update task 'xyz'", **Then** the agent responds that the task was not found

---

### Edge Cases

- What happens when the agent receives a request while the external API provider (Gemini/OpenRouter/Cohere) is rate-limited or unavailable?
- How does the system handle ambiguous natural language requests that could map to multiple operations (e.g., "do something with task 1")?
- What happens when a user tries to complete or delete a task that was already completed or deleted by another session?
- How does the agent behave when the conversation history becomes very long and approaches the context window limit of free-tier models?
- What happens when the MCP server is unavailable or a tool call fails due to database connectivity issues?
- How does the system handle concurrent requests from the same user in multiple browser tabs?
- What happens when a user references a task by title but multiple tasks have similar titles?

## Requirements *(mandatory)*

### Functional Requirements

#### Agent Configuration

- **FR-001**: System MUST use the OpenAI Agents SDK to define the AI agent, including Agent, Runner, and Tool interfaces
- **FR-002**: System MUST configure the agent using an external client abstraction that supports free-tier API providers (Gemini, OpenRouter, Cohere)
- **FR-003**: System MUST allow switching between API providers via environment variables without code changes
- **FR-004**: System MUST support Cohere as either a primary provider or fallback provider
- **FR-005**: System MUST load all API keys from environment variables only (no hardcoded secrets)
- **FR-006**: System MUST handle free-tier constraints including short context windows, rate limits, and token caps
- **FR-007**: System MUST degrade gracefully when API provider errors occur or rate limits are hit

#### Agent Behavior

- **FR-008**: Agent MUST correctly map natural language task creation requests to the add_task MCP tool
- **FR-009**: Agent MUST correctly map natural language task listing requests to the list_tasks MCP tool
- **FR-010**: Agent MUST correctly map natural language task completion requests to the complete_task MCP tool
- **FR-011**: Agent MUST correctly map natural language task deletion requests to the delete_task MCP tool
- **FR-012**: Agent MUST correctly map natural language task update requests to the update_task MCP tool
- **FR-013**: Agent MUST confirm actions in friendly, natural language after executing MCP tools
- **FR-014**: Agent MUST handle errors (task not found, invalid input) gracefully and provide helpful error messages to users
- **FR-015**: Agent MUST ask clarifying questions when user intent is ambiguous
- **FR-016**: Agent MUST follow the Agent Behavior Specification defined in Phase III

#### MCP Server & Tools

- **FR-017**: System MUST implement an MCP server using the Official MCP SDK
- **FR-018**: MCP server MUST expose exactly 5 tools: add_task, list_tasks, complete_task, delete_task, update_task
- **FR-019**: Each MCP tool MUST validate all inputs before processing
- **FR-020**: Each MCP tool MUST enforce user scoping (users can only access their own tasks)
- **FR-021**: Each MCP tool MUST return structured responses that the agent can interpret
- **FR-022**: MCP tools MUST be stateless and persist all state in the database
- **FR-023**: add_task tool MUST accept task title and optional description, due date, and priority
- **FR-024**: list_tasks tool MUST return all tasks for the authenticated user with filtering options (completed/incomplete)
- **FR-025**: complete_task tool MUST accept a task identifier (ID or title) and mark the task as completed
- **FR-026**: delete_task tool MUST accept a task identifier (ID or title) and remove the task
- **FR-027**: update_task tool MUST accept a task identifier and fields to update (title, description, due date, priority, status)

#### Stateless Architecture

- **FR-028**: Backend MUST store NO in-memory state related to conversations or agent execution
- **FR-029**: Every chat request MUST load conversation and messages from the database
- **FR-030**: Every chat request MUST execute the agent with loaded context
- **FR-031**: Every chat request MUST persist agent responses and tool results to the database
- **FR-032**: Every chat request MUST return the response to the client
- **FR-033**: System MUST maintain conversation continuity across server restarts
- **FR-034**: System MUST support concurrent requests from multiple users without state conflicts

#### Security & Configuration

- **FR-035**: System MUST authenticate users using the existing Better Auth setup before allowing agent access
- **FR-036**: System MUST load external LLM provider API keys from environment variables
- **FR-037**: System MUST load Cohere API key from environment variables
- **FR-038**: System MUST support separate configuration for different API providers
- **FR-039**: System MUST NOT expose API keys in logs, error messages, or API responses
- **FR-040**: System MUST validate JWT tokens before processing any agent requests

#### Project Structure

- **FR-041**: All backend logic MUST remain inside the backend/ directory
- **FR-042**: MCP server code MUST be located inside the backend/ directory
- **FR-043**: No frontend changes are permitted in this specification
- **FR-044**: No file relocations or renames are permitted unless explicitly required and justified

### Key Entities

- **Agent Configuration**: Represents the AI agent setup including provider selection, API keys, model parameters, and tool registrations. Attributes include provider type (Gemini/OpenRouter/Cohere), model name, context window size, and tool list.

- **MCP Tool**: Represents a callable function that the agent can invoke to perform task operations. Attributes include tool name, input schema, output schema, and validation rules.

- **Tool Execution Result**: Represents the outcome of an MCP tool invocation. Attributes include success status, data payload (task object or list of tasks), error message (if failed), and execution timestamp.

- **Agent Request Context**: Represents the context needed for agent execution. Attributes include user ID, conversation ID, message history, and authentication token.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create tasks using natural language with 95% success rate for clear, unambiguous requests
- **SC-002**: Users can list, complete, delete, and update tasks using natural language with 90% success rate
- **SC-003**: System operates successfully using free-tier API keys without requiring paid subscriptions
- **SC-004**: Conversations persist correctly across server restarts with 100% continuity
- **SC-005**: Agent responds to user requests within 5 seconds under normal conditions (excluding API provider delays)
- **SC-006**: System handles at least 50 concurrent users without degradation
- **SC-007**: MCP tool invocations succeed 99% of the time when inputs are valid
- **SC-008**: Agent correctly interprets user intent and selects the appropriate MCP tool 90% of the time
- **SC-009**: System gracefully handles API provider rate limits and errors without crashing
- **SC-010**: All task operations enforce user scoping with 100% accuracy (no cross-user data leaks)

## Assumptions

- Spec-1 (chat UI + basic agent wiring) is already complete and functional
- Database schema for conversations and messages already exists from Spec-1
- Database schema for tasks already exists from Phase II
- Better Auth is already configured and issuing JWT tokens
- Frontend already has a chat interface that can send messages and display responses
- Users are already authenticated before accessing the chat interface
- The OpenAI Agents SDK is compatible with external client configurations for non-OpenAI providers
- Free-tier API providers (Gemini, OpenRouter, Cohere) support the necessary features for agent execution (function calling, structured outputs)
- The Official MCP SDK is available and compatible with the backend technology stack

## Dependencies

- Spec-1 (chat UI + basic agent wiring) must be complete
- OpenAI Agents SDK must be installed and configured
- Official MCP SDK must be installed and configured
- External API provider accounts (Gemini, OpenRouter, Cohere) must be created and API keys obtained
- Database must be accessible and contain the necessary tables for conversations, messages, and tasks
- Better Auth must be functional and issuing valid JWT tokens

## Out of Scope

The following items are explicitly excluded from this specification:

- UI/UX changes to the chat interface
- Advanced memory optimization or conversation summarization
- Multi-agent orchestration or agent-to-agent communication
- Paid OpenAI API usage or GPT-4 integration
- Voice input or speech-to-text capabilities
- Task sharing or collaboration features
- Task reminders or notifications
- Task categories or tags
- Task search or filtering beyond basic completed/incomplete status
- Performance optimization beyond basic functionality
- Advanced error recovery or retry mechanisms
- Monitoring, logging, or observability infrastructure
- Load testing or stress testing
- Deployment or infrastructure changes

## Notes

- The agent behavior must strictly follow the Agent Behavior Specification defined in Phase III (reference to be provided during planning)
- The choice between using Cohere as primary or fallback provider should be configurable via environment variables
- The MCP server should be designed to allow easy addition of new tools in future specifications
- Error handling should prioritize user experience over technical accuracy (friendly messages, not stack traces)
- The stateless architecture is critical for scalability and must not be compromised
