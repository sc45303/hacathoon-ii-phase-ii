# Tasks: OpenAI Agent MCP Tools

**Input**: Design documents from `/specs/001-openai-agent-mcp-tools/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are omitted per template guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- All tasks are backend-only per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install MCP SDK and Cohere SDK in backend/requirements.txt
- [ ] T002 [P] Create backend/src/agent/ directory structure with __init__.py
- [ ] T003 [P] Create backend/src/mcp/ directory structure with __init__.py
- [ ] T004 [P] Create backend/src/agent/providers/ directory with __init__.py
- [ ] T005 [P] Create backend/src/mcp/tools/ directory with __init__.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create MCPToolRegistry class in backend/src/mcp/tool_registry.py with user context injection
- [ ] T007 [P] Create LLMProvider base class in backend/src/agent/providers/base.py
- [ ] T008 [P] Implement GeminiProvider with function calling in backend/src/agent/providers/gemini.py
- [ ] T009 [P] Implement OpenRouterProvider as fallback in backend/src/agent/providers/openrouter.py
- [ ] T010 [P] Implement CohereProvider (optional) in backend/src/agent/providers/cohere.py
- [ ] T011 Create AgentConfiguration dataclass in backend/src/agent/agent_config.py
- [ ] T012 Create AgentRunner class with tool invocation in backend/src/agent/agent_runner.py
- [ ] T013 Update ConversationService with format_messages_for_agent method in backend/src/services/conversation_service.py
- [ ] T014 Add environment variable loading for LLM_PROVIDER, GEMINI_API_KEY, OPENROUTER_API_KEY in backend/src/core/config.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Task via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks by sending natural language requests like "Add a task to buy groceries"

**Independent Test**: Send chat message "Add a task to buy groceries" and verify new task appears in database with correct title

**Agent**: Backend Systems Agent
**Skill**: backend-mcp-tools

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement add_task MCP tool in backend/src/mcp/tools/add_task.py with user_id injection and validation
- [ ] T016 [US1] Register add_task tool with MCPToolRegistry in backend/src/mcp/tool_registry.py
- [ ] T017 [US1] Update AgentRunner to support add_task tool invocation in backend/src/agent/agent_runner.py
- [ ] T018 [US1] Modify chat endpoint to use AgentRunner for task creation in backend/src/api/routes/chat.py
- [ ] T019 [US1] Add error handling for task creation failures in backend/src/mcp/tools/add_task.py
- [ ] T020 [US1] Test end-to-end: "Add a task to buy groceries" creates task and returns confirmation

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - List Tasks via Natural Language (Priority: P2)

**Goal**: Enable users to view their tasks by asking "Show me my tasks" or "What do I need to do today?"

**Independent Test**: Create 3 tasks, send "Show me my tasks", verify all 3 tasks are listed in response

**Agent**: Backend Systems Agent
**Skill**: backend-mcp-tools

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement list_tasks MCP tool with filtering in backend/src/mcp/tools/list_tasks.py
- [ ] T022 [US2] Register list_tasks tool with MCPToolRegistry in backend/src/mcp/tool_registry.py
- [ ] T023 [US2] Update AgentRunner to support list_tasks tool invocation in backend/src/agent/agent_runner.py
- [ ] T024 [US2] Add filtering logic for completed/incomplete tasks in backend/src/mcp/tools/list_tasks.py
- [ ] T025 [US2] Test end-to-end: "Show me my tasks" returns all user tasks with correct formatting

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Complete Task via Natural Language (Priority: P3)

**Goal**: Enable users to mark tasks complete by saying "Mark 'buy groceries' as done" or "I finished task 2"

**Independent Test**: Create task, send "Mark task 1 as complete", verify task status changes to completed in database

**Agent**: Backend Systems Agent
**Skill**: backend-mcp-tools

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement complete_task MCP tool with ID/title lookup in backend/src/mcp/tools/complete_task.py
- [ ] T027 [US3] Register complete_task tool with MCPToolRegistry in backend/src/mcp/tool_registry.py
- [ ] T028 [US3] Update AgentRunner to support complete_task tool invocation in backend/src/agent/agent_runner.py
- [ ] T029 [US3] Add task identifier resolution (ID or title) in backend/src/mcp/tools/complete_task.py
- [ ] T030 [US3] Test end-to-end: "Mark task 1 as complete" updates task status and returns confirmation

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Delete Task via Natural Language (Priority: P4)

**Goal**: Enable users to remove tasks by saying "Delete the groceries task" or "Remove task 3"

**Independent Test**: Create task, send "Delete task 1", verify task no longer exists in database

**Agent**: Backend Systems Agent
**Skill**: backend-mcp-tools

### Implementation for User Story 4

- [ ] T031 [P] [US4] Implement delete_task MCP tool with ID/title lookup in backend/src/mcp/tools/delete_task.py
- [ ] T032 [US4] Register delete_task tool with MCPToolRegistry in backend/src/mcp/tool_registry.py
- [ ] T033 [US4] Update AgentRunner to support delete_task tool invocation in backend/src/agent/agent_runner.py
- [ ] T034 [US4] Add task identifier resolution (ID or title) in backend/src/mcp/tools/delete_task.py
- [ ] T035 [US4] Test end-to-end: "Delete task 1" removes task and returns confirmation

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Update Task via Natural Language (Priority: P5)

**Goal**: Enable users to modify tasks by saying "Change the groceries task to 'buy groceries and milk'"

**Independent Test**: Create task, send "Update task 1 title to 'new title'", verify task title changes in database

**Agent**: Backend Systems Agent
**Skill**: backend-mcp-tools

### Implementation for User Story 5

- [ ] T036 [P] [US5] Implement update_task MCP tool with field updates in backend/src/mcp/tools/update_task.py
- [ ] T037 [US5] Register update_task tool with MCPToolRegistry in backend/src/mcp/tool_registry.py
- [ ] T038 [US5] Update AgentRunner to support update_task tool invocation in backend/src/agent/agent_runner.py
- [ ] T039 [US5] Add task identifier resolution and field validation in backend/src/mcp/tools/update_task.py
- [ ] T040 [US5] Test end-to-end: "Update task 1 title to 'new title'" modifies task and returns confirmation

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Add rate limit handling with fallback provider in backend/src/agent/agent_runner.py
- [ ] T042 [P] Add comprehensive error logging for all MCP tools in backend/src/mcp/tools/
- [ ] T043 [P] Add conversation history trimming (20 messages, 8000 tokens) in backend/src/services/conversation_service.py
- [ ] T044 [P] Update LLMService to delegate to AgentRunner in backend/src/services/llm_service.py
- [ ] T045 [P] Add tool call metadata persistence in Message.metadata in backend/src/services/conversation_service.py
- [ ] T046 Validate quickstart.md instructions by running all test scenarios
- [ ] T047 [P] Add system prompt configuration for agent behavior in backend/src/agent/agent_config.py
- [ ] T048 [P] Document environment variables in backend/.env.example

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3/US4

### Within Each User Story

- MCP tool implementation before registration
- Tool registration before AgentRunner integration
- AgentRunner integration before chat endpoint modification
- Core implementation before end-to-end testing

### Parallel Opportunities

- All Setup tasks (T002-T005) marked [P] can run in parallel
- All Foundational provider tasks (T007-T010) marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All MCP tool implementations (T015, T021, T026, T031, T036) marked [P] can run in parallel after Foundational
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: After Foundational Phase

```bash
# Launch all MCP tool implementations together:
Task: "Implement add_task MCP tool in backend/src/mcp/tools/add_task.py"
Task: "Implement list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py"
Task: "Implement complete_task MCP tool in backend/src/mcp/tools/complete_task.py"
Task: "Implement delete_task MCP tool in backend/src/mcp/tools/delete_task.py"
Task: "Implement update_task MCP tool in backend/src/mcp/tools/update_task.py"

# Then register all tools together:
Task: "Register add_task tool with MCPToolRegistry"
Task: "Register list_tasks tool with MCPToolRegistry"
Task: "Register complete_task tool with MCPToolRegistry"
Task: "Register delete_task tool with MCPToolRegistry"
Task: "Register update_task tool with MCPToolRegistry"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T014) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T015-T020)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Send "Add a task to buy groceries"
   - Verify task created in database
   - Verify agent returns confirmation
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T014)
2. Once Foundational is done:
   - Developer A: User Story 1 (T015-T020)
   - Developer B: User Story 2 (T021-T025)
   - Developer C: User Story 3 (T026-T030)
   - Developer D: User Story 4 (T031-T035)
   - Developer E: User Story 5 (T036-T040)
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 48 tasks

**Tasks per Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 9 tasks (BLOCKING)
- Phase 3 (US1 - Create Task): 6 tasks
- Phase 4 (US2 - List Tasks): 5 tasks
- Phase 5 (US3 - Complete Task): 5 tasks
- Phase 6 (US4 - Delete Task): 5 tasks
- Phase 7 (US5 - Update Task): 5 tasks
- Phase 8 (Polish): 8 tasks

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- US1: Send "Add a task to buy groceries" → Task created in DB
- US2: Send "Show me my tasks" → All tasks listed
- US3: Send "Mark task 1 as complete" → Task status updated
- US4: Send "Delete task 1" → Task removed from DB
- US5: Send "Update task 1 title to 'new title'" → Task title changed

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 20 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Research.md indicates custom agent implementation (NOT OpenAI Agents SDK)
- All MCP tools must inject user_id for security (never trust LLM output)
- Stateless architecture: load conversation history from DB on every request
- Free-tier constraints: trim history to 20 messages, 8000 tokens
