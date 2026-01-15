---
id: 001
title: create-spec-2-openai-agent-mcp-tools
stage: spec
date: 2026-01-14
surface: agent
model: claude-opus-4-5-20251101
feature: 001-openai-agent-mcp-tools
branch: 001-openai-agent-mcp-tools
user: Pcw
command: /sp.specify
labels: ["specification", "openai-agent", "mcp-tools", "ai-execution-layer"]
links:
  spec: specs/001-openai-agent-mcp-tools/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-openai-agent-mcp-tools/spec.md
  - specs/001-openai-agent-mcp-tools/checklists/requirements.md
tests:
  - Specification quality validation passed
---

## Prompt

Feature Name: spec-2-openai-agent-mcp-tools

Context:

This is Spec-2 of Phase III: Todo AI Chatbot.

Spec-2 builds on top of Spec-1 and introduces the AI execution layer, MCP server, and task management tools.

This spec explicitly focuses on:
- Building an AI agent using the OpenAI Agents SDK
- Configuring the agent to run using free-tier API keys via external client configuration
- Integrating Cohere as a supported provider
- Implementing MCP tools for task operations
- Keeping the backend fully stateless with database-backed persistence

Spec-1 (chat UI + basic agent wiring) must already be complete.

---

Objective:

Define the complete specification for an AI-powered Todo agent that can understand natural language, invoke MCP tools to manage tasks, and operate without requiring a paid OpenAI API key by using external client configuration (Gemini / OpenRouter / Cohere).

---

Key Requirements:

1. OpenAI Agent SDK Usage
- Use the OpenAI Agents SDK to define: Agent, Runner, Tool interfaces
- The agent must be capable of reasoning over conversation history and selecting appropriate MCP tools
- Agent behavior must strictly follow the Agent Behavior Specification defined in Phase III

2. External Client Configuration (Free-Tier Support)
- The agent must NOT require a paid OpenAI API key
- Configure the agent using an external_client or equivalent abstraction to support: Gemini, OpenRouter, Cohere
- The configuration must allow switching providers via environment variables
- The agent must work under free-tier constraints: short context windows, rate limits, token caps
- Graceful degradation must be defined for provider errors or limits

3. Cohere API Integration
- Cohere must be supported as a primary provider OR a fallback provider
- Define how the Cohere API key is loaded from environment variables
- Specify how the agent routes requests when Cohere is active
- Ensure compatibility with OpenAI Agent SDK abstractions

4. MCP Server & Tools (Backend)
- Implement an MCP server using the Official MCP SDK
- MCP tools must be stateless and persist all state in the database
- The following tools must be exposed: add_task, list_tasks, complete_task, delete_task, update_task
- Each tool must: validate inputs, enforce user scoping, return structured responses usable by the agent

5. Stateless Architecture Enforcement
- Backend must store NO in-memory state
- Every chat request must: load conversation + messages from DB, execute agent, persist results, return response
- Server restarts must not affect conversation continuity

6. Folder Structure Constraints
- Preserve existing project structure exactly
- All backend logic inside backend/
- MCP server code inside backend/
- No frontend changes in this spec
- No file relocations or renames unless explicitly required and justified

7. Agent Behavior Guarantees
- Agent must map natural language to MCP tools correctly
- Agent must confirm actions in friendly language
- Errors (task not found, invalid input) must be handled gracefully

8. Security & Configuration
- API keys must be loaded via environment variables only
- No secrets may be hardcoded
- Support separate keys for: external LLM provider, Cohere
- Authentication must rely on existing Better Auth setup

---

Out of Scope (Explicit):
- UI/UX changes
- Advanced memory optimization
- Multi-agent orchestration
- Paid OpenAI API usage

---

Deliverables:
- Updated agent specification
- MCP tool specifications
- External client configuration design
- Cohere integration definition
- Clear extension points for future enhancements

---

Success Criteria:
- Agent runs fully using free-tier API keys
- Tasks are managed via MCP tools
- Backend remains stateless
- Conversations persist correctly
- System is ready for /sp.plan execution

## Response snapshot

Created comprehensive specification for Spec-2: OpenAI Agent MCP Tools with the following structure:

**Branch Created**: 001-openai-agent-mcp-tools

**Specification Contents**:
- 5 prioritized user stories (P1-P5) covering complete CRUD workflow for task management via natural language
- 44 functional requirements organized into 6 categories: Agent Configuration, Agent Behavior, MCP Server & Tools, Stateless Architecture, Security & Configuration, Project Structure
- 10 measurable success criteria (technology-agnostic)
- 7 edge cases identified
- Clear assumptions, dependencies, and out-of-scope items
- Key entities defined: Agent Configuration, MCP Tool, Tool Execution Result, Agent Request Context

**Quality Validation**:
- All mandatory sections completed
- No [NEEDS CLARIFICATION] markers (user provided comprehensive requirements)
- All requirements testable and unambiguous
- Success criteria measurable and technology-agnostic
- Specification passed all quality checklist items

**Files Created**:
1. specs/001-openai-agent-mcp-tools/spec.md (249 lines)
2. specs/001-openai-agent-mcp-tools/checklists/requirements.md (validation checklist)

**Status**: ✅ Ready for /sp.plan execution

## Outcome

- ✅ Impact: Complete specification created for AI execution layer with MCP tools, enabling natural language task management with free-tier API support
- 🧪 Tests: Specification quality validation passed all checklist items
- 📁 Files: Created spec.md (249 lines) and requirements.md checklist
- 🔁 Next prompts: /sp.plan to create architectural plan, /sp.tasks to generate implementation tasks
- 🧠 Reflection: Specification is comprehensive and ready for planning phase. No clarifications needed due to detailed user requirements.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification creation completed successfully
- Graders run and results (PASS/FAIL): Quality checklist validation PASSED (all 12 items)
- Prompt variant (if applicable): Standard /sp.specify workflow
- Next experiment (smallest change to try): Proceed to /sp.plan to design architectural approach for agent, MCP server, and tool integration
