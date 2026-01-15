# Implementation Tasks: Todo AI Chatbot - Phase 1

**Feature**: 001-todo-ai-chatbot
**Branch**: `001-todo-ai-chatbot`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Overview

This document defines the implementation tasks for the Todo AI Chatbot Phase 1 feature. Tasks are organized by user story to enable independent implementation and testing.

**Total Tasks**: 28
**Estimated Timeline**: 2-3 days

---

## Task Summary by User Story

| User Story | Priority | Task Count | Parallel Opportunities |
|------------|----------|------------|------------------------|
| Setup | N/A | 5 | 2 parallel tasks |
| Foundational | N/A | 4 | 3 parallel tasks |
| US1 + US4: Basic Chat + Free-Tier | P1 | 11 | 6 parallel tasks |
| US2: Intent Recognition | P2 | 3 | 2 parallel tasks |
| US3: Multi-Turn Conversations | P3 | 2 | 1 parallel task |
| Polish & Cross-Cutting | N/A | 3 | 2 parallel tasks |

---

## Dependencies & Execution Order

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Models & Base Abstractions)
    ↓
Phase 3: US1 + US4 (Basic Chat + Free-Tier) ← MVP Scope
    ↓
Phase 4: US2 (Intent Recognition)
    ↓
Phase 5: US3 (Multi-Turn Conversations)
    ↓
Phase 6: Polish & Cross-Cutting
```

**MVP Recommendation**: Complete Phase 1-3 only (Setup + Foundational + US1+US4) for minimum viable product.

---

## Phase 1: Setup

**Goal**: Configure project dependencies and environment for AI chatbot development.

**Agent**: Backend Systems Agent (`backend-mcp-tools`)

### Tasks

- [X] T001 Install backend dependencies in backend/requirements.txt (google-generativeai==0.3.2, tiktoken==0.5.2)
- [X] T002 [P] Install frontend dependencies in frontend/package.json (@assistant-ui/react, ai)
- [X] T003 Configure environment variables in backend/.env (AI_PROVIDER, GEMINI_API_KEY, MAX_CONVERSATION_MESSAGES, MAX_CONVERSATION_TOKENS)
- [X] T004 Create database migration for conversation and message tables in backend/alembic/versions/
- [X] T005 Run database migration with alembic upgrade head

**Parallel Execution**: T002 can run in parallel with T001.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Implement core database models and base abstractions required by all user stories.

**Agent**: Backend Systems Agent (`backend-mcp-tools`)

### Tasks

- [X] T006 [P] Create Conversation SQLModel in backend/src/models/conversation.py
- [X] T007 [P] Create Message SQLModel in backend/src/models/message.py
- [X] T008 [P] Create LLMProvider abstract base class in backend/src/services/providers/base.py
- [X] T009 Create GeminiProvider implementation in backend/src/services/providers/gemini.py

**Parallel Execution**: T006, T007, T008 can run in parallel (different files, no dependencies).

---

## Phase 3: User Story 1 + 4 - Basic Chat Interaction + Free-Tier API Compatibility (P1)

**Story Goal**: Enable users to interact with an AI chatbot through a conversational interface that works reliably with free-tier AI providers.

**Why Combined**: Both are P1 priority and tightly coupled - basic chat requires free-tier provider integration from the start.

**Independent Test Criteria**:
- ✅ User can open chat page and send a message
- ✅ AI responds with relevant reply using Gemini free-tier API
- ✅ Conversation history persists across page refreshes
- ✅ Typing indicator shows while AI is processing
- ✅ UI is responsive on mobile and desktop
- ✅ System respects rate limits and handles errors gracefully

**Agents**:
- Backend Systems Agent (`backend-mcp-tools`) - Backend implementation
- Frontend UI Builder Agent (`nextjs-ui-generator`) - Frontend components
- Design & Theme Agent (`design-theme`) - UI styling

### Backend Tasks

- [X] T010 [P] [US1] Create LLMService with provider factory in backend/src/services/llm_service.py
- [X] T011 [P] [US1] Create ConversationService for CRUD operations in backend/src/services/conversation_service.py
- [X] T012 [P] [US1] Create ChatRequest Pydantic schema in backend/src/schemas/chat_request.py
- [X] T013 [P] [US1] Create ChatResponse Pydantic schema in backend/src/schemas/chat_response.py
- [X] T014 [US1] Create chat API endpoint POST /api/{user_id}/chat in backend/src/api/routes/chat.py
- [X] T015 [US1] Register chat router in backend/src/main.py

### Frontend Tasks

- [X] T016 [P] [US1] Create chat service API client in frontend/src/services/chatService.ts
- [X] T017 [P] [US1] Create TypeScript types for chat in frontend/src/types/chat.ts
- [X] T018 [US1] Create ChatInterface component in frontend/src/components/chat/ChatInterface.tsx
- [X] T019 [US1] Create MessageList component in frontend/src/components/chat/MessageList.tsx
- [X] T020 [US1] Create MessageInput component in frontend/src/components/chat/MessageInput.tsx
- [X] T021 [US1] Create TypingIndicator component in frontend/src/components/chat/TypingIndicator.tsx
- [X] T022 [US1] Create chat page in frontend/src/app/chat/page.tsx

**Parallel Execution**:
- Backend: T010, T011, T012, T013 can run in parallel
- Frontend: T016, T017 can run in parallel
- After T014-T015 complete (backend), all frontend tasks T016-T022 can proceed in parallel

---

## Phase 4: User Story 2 - Todo Intent Recognition (P2)

**Story Goal**: AI understands and acknowledges todo-related requests, providing user confidence that the system recognizes their intent.

**Independent Test Criteria**:
- ✅ AI acknowledges "add a task" intent with appropriate response
- ✅ AI explains task management will be available in Phase 2
- ✅ AI asks clarifying questions for ambiguous requests
- ✅ AI maintains conversational and helpful tone

**Agent**: Conversational AI Architect Agent (`agent-behavior-reasoning`)

### Tasks

- [X] T023 [P] [US2] Add intent detection prompt engineering to GeminiProvider in backend/src/services/providers/gemini.py
- [X] T024 [P] [US2] Create system prompt for todo intent recognition in backend/src/services/llm_service.py
- [X] T025 [US2] Add intent acknowledgment response templates in backend/src/services/llm_service.py

**Parallel Execution**: T023 and T024 can run in parallel (different concerns).

---

## Phase 5: User Story 3 - Multi-Turn Conversations (P3)

**Story Goal**: Enable multi-turn conversations where AI remembers context from earlier messages for natural, flowing discussions.

**Independent Test Criteria**:
- ✅ AI understands references to previous messages ("that task")
- ✅ AI responds based on full conversation history
- ✅ System gracefully trims older messages when approaching context limit

**Agent**: Backend Systems Agent (`backend-mcp-tools`)

### Tasks

- [X] T026 [P] [US3] Implement conversation history trimming logic in backend/src/services/conversation_service.py
- [X] T027 [US3] Add context window management to LLMService in backend/src/services/llm_service.py

**Parallel Execution**: T026 can be implemented independently and integrated in T027.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Enhance error handling, responsive design, and documentation.

**Agents**:
- Backend Systems Agent (`backend-mcp-tools`) - Error handling
- Design & Theme Agent (`design-theme`) - Responsive design

### Tasks

- [X] T028 [P] Add comprehensive error handling to chat endpoint in backend/src/api/routes/chat.py (400, 401, 429, 500 errors)
- [X] T029 [P] Verify responsive design for mobile (320px) and desktop (1920px) in frontend/src/components/chat/
- [X] T030 Update README with setup instructions and API documentation in backend/README.md

**Parallel Execution**: T028 and T029 can run in parallel (backend vs frontend).

---

## Parallel Execution Examples

### Phase 1: Setup
```bash
# Terminal 1: Backend dependencies
cd backend && pip install -r requirements.txt

# Terminal 2: Frontend dependencies (parallel)
cd frontend && npm install
```

### Phase 2: Foundational
```bash
# All three models can be created in parallel
# Terminal 1: Conversation model
# Terminal 2: Message model
# Terminal 3: LLMProvider base class
```

### Phase 3: User Story 1 + 4
```bash
# Backend tasks T010-T013 in parallel
# Then T014-T015 sequentially
# Then all frontend tasks T016-T022 in parallel
```

---

## Implementation Strategy

### MVP Scope (Phases 1-3)

**Recommended for initial delivery**:
- Phase 1: Setup (T001-T005)
- Phase 2: Foundational (T006-T009)
- Phase 3: US1 + US4 (T010-T022)

**Delivers**:
- Working chat interface
- AI responses via Gemini free-tier
- Conversation persistence
- Responsive UI
- Basic error handling

**Timeline**: 2 days

### Full Feature Scope (All Phases)

**Includes MVP + enhancements**:
- Phase 4: US2 - Intent Recognition (T023-T025)
- Phase 5: US3 - Multi-Turn Conversations (T026-T027)
- Phase 6: Polish (T028-T030)

**Timeline**: 3 days

---

## Acceptance Criteria

### Phase 1-3 (MVP) Acceptance

- [ ] User can navigate to /chat page
- [ ] User can send a message and receive AI response
- [ ] Conversation history persists on page refresh
- [ ] Typing indicator shows during AI processing
- [ ] UI is responsive on mobile and desktop
- [ ] System works with Gemini free-tier API
- [ ] JWT authentication protects chat endpoint
- [ ] Errors are handled gracefully

### Phase 4-6 (Full Feature) Acceptance

- [ ] AI acknowledges todo-related intents
- [ ] AI maintains context across multiple messages
- [ ] System trims conversation history appropriately
- [ ] All error scenarios return user-friendly messages
- [ ] Documentation is complete and accurate

---

## Risk Mitigation

| Risk | Mitigation Task |
|------|----------------|
| Gemini API rate limits | T003 (configure rate limit handling), T028 (error handling) |
| Frontend-backend integration issues | T016 (API client with proper error handling) |
| Conversation history growth | T026 (history trimming logic) |
| Mobile responsiveness issues | T029 (responsive design verification) |

---

## Next Steps After Task Completion

1. Run full integration test (send message, verify response, check persistence)
2. Test with different free-tier providers (Gemini, OpenRouter)
3. Verify responsive design on actual mobile devices
4. Create PHR documenting implementation
5. Prepare for Phase 2 (Spec-2): MCP tools and task CRUD operations

---

## Notes

- **No tests requested**: Spec does not explicitly request TDD approach, so test tasks are omitted
- **Agent-skill alignment**: All tasks reference appropriate agents from Agent-Skill Enforcement Matrix
- **File paths**: All tasks include specific file paths for implementation
- **Parallelization**: 15 tasks marked [P] for parallel execution opportunities
- **User story mapping**: All implementation tasks mapped to user stories for traceability
