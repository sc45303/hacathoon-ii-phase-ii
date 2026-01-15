# Research Findings: Todo AI Chatbot - Phase 1

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-14
**Phase**: Phase 0 - Research & Clarifications

---

## Research Questions

This document consolidates research findings for unknowns identified in the Technical Context:

1. Frontend Testing Setup
2. AI Agent SDK Selection
3. OpenAI ChatKit Compatibility
4. Free-Tier AI Provider Integration
5. Conversation History Trimming Strategy

---

## 1. Frontend Testing Setup

### Current State

**Findings from package.json analysis:**
- No testing framework currently installed
- No test scripts defined in package.json
- Frontend uses Next.js 16+ with TypeScript

### Decision

**DEFERRED TO IMPLEMENTATION**: Testing setup will be configured during implementation phase. Recommended stack:
- Jest + React Testing Library for component tests
- Playwright or Cypress for E2E tests (if needed)

**Rationale**: Testing infrastructure is not blocking for Phase 1 planning. Can be added incrementally during implementation.

---

## 2. AI Agent SDK Selection

### Research Summary

Evaluated four options for AI agent implementation:

| Option | Free-Tier Support | Stateless | FastAPI Integration | Tool Calling | Complexity |
|--------|------------------|-----------|---------------------|--------------|------------|
| OpenAI Agents SDK | ❌ No | ⚠️ Custom | ⚠️ Moderate | ✅ Excellent | Low |
| LangChain | ✅ Yes | ⚠️ Custom | ✅ Good | ✅ Excellent | High |
| LlamaIndex | ✅ Yes | ⚠️ Custom | ✅ Good | ✅ Good | High |
| Custom Implementation | ✅ Yes | ✅ Native | ✅ Excellent | ⚠️ Manual | Low |

### Decision

**SELECTED: Custom Implementation with Direct API Calls**

**Rationale**:
1. **Meets all Phase 1 requirements**: Supports free-tier providers (Gemini, OpenRouter, Cohere), stateless operation, FastAPI integration
2. **Fastest implementation**: Can build working chat in 1-2 days (critical for hackathon timeline)
3. **Minimal complexity**: No framework abstractions to learn; transparent behavior
4. **Perfect for stateless requirement**: Native database-driven state management (FR-018)
5. **Aligns with constraints**: TC-007 (free-tier), BC-001 (time constraints)

**Implementation Approach**:
```python
# Abstract provider interface
class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]]
    ) -> str:
        pass

# Provider implementations
class GeminiProvider(LLMProvider): ...
class CohereProvider(LLMProvider): ...
class OpenRouterProvider(LLMProvider): ...
```

**Phase 2 Consideration**: If tool orchestration becomes complex in Spec-2, re-evaluate migration to LangChain for built-in agent patterns.

### Alternatives Considered

**LangChain**:
- **Pros**: Excellent tool calling, large ecosystem, multi-provider support
- **Cons**: Steep learning curve, requires custom stateless implementation, may be over-engineered for Phase 1
- **Verdict**: Good for Phase 2 if tool complexity justifies it

**OpenAI Agents SDK**:
- **Pros**: Excellent documentation, native tool calling
- **Cons**: No free-tier support (critical blocker), OpenAI-only
- **Verdict**: Rejected due to FR-025 violation

**LlamaIndex**:
- **Pros**: Multi-provider support, good tool calling
- **Cons**: Focused on RAG/document search (not pure chat), less mature chat features
- **Verdict**: Misaligned with requirements

---

## 3. OpenAI ChatKit Compatibility

### Research Summary

**OpenAI ChatKit (@openai/chatkit-react v1.4.1)**:
- ✅ React 18.2.0 compatible
- ✅ TypeScript support
- ⚠️ **CRITICAL ISSUE**: Web component architecture incompatible with Next.js App Router
- ❌ Requires CDN script loading
- ❌ Cannot be used in Server Components
- ❌ No official Next.js documentation

**Compatibility Issues**:
1. Uses custom web component (`<openai-chatkit>`) requiring browser APIs
2. Requires external CDN script: `https://cdn.platform.openai.com/deployments/chatkit/chatkit.js`
3. All official examples use Vite, not Next.js
4. Potential SSR/hydration issues

### Decision

**REJECTED: OpenAI ChatKit**
**SELECTED: @assistant-ui/react**

**Rationale**:
1. **Next.js App Router native**: Built specifically for Next.js with full SSR support
2. **No CDN dependencies**: Pure React components, no external scripts
3. **Tailwind CSS integration**: Matches existing frontend stack
4. **Vercel AI SDK compatible**: Enables streaming responses and tool calls
5. **Shadcn UI style**: Compatible with existing Radix UI components
6. **Active development**: Well-maintained with strong community support

**Implementation Approach**:
```bash
npm install @assistant-ui/react ai
```

```tsx
// app/chat/page.tsx
'use client';
import { Thread } from '@assistant-ui/react';
import { useChat } from 'ai/react';

export default function ChatPage() {
  const chat = useChat({ api: '/api/chat' });
  return <Thread />;
}
```

### Alternatives Considered

**@chatscope/chat-ui-kit-react**:
- **Pros**: Pure React, extensive customization
- **Cons**: Less Next.js-specific, more manual setup
- **Verdict**: Good alternative but @assistant-ui/react is better fit

**stream-chat-react**:
- **Pros**: Enterprise-grade, real-time messaging
- **Cons**: Overkill for requirements, external service dependency
- **Verdict**: Too complex for hackathon scope

---

## 4. Free-Tier AI Provider Integration

### Research Summary

**Supported Providers**:

| Provider | Free Tier | Rate Limits | Context Window | Best For |
|----------|-----------|-------------|----------------|----------|
| **Google Gemini** | ✅ Yes | 60 req/min | 32k tokens | General chat, fast responses |
| **OpenRouter** | ✅ Yes (some models) | Varies by model | Varies | Model flexibility, fallback |
| **Cohere** | ✅ Yes (trial) | 100 req/min | 4k tokens | Command models, structured output |

### Decision

**PRIMARY: Google Gemini (gemini-pro)**
**FALLBACK: OpenRouter (free models)**

**Rationale**:
1. **Gemini**: Best free-tier offering (60 req/min, 32k context, no credit card required)
2. **OpenRouter**: Good fallback with multiple free models
3. **Cohere**: Trial-based, less suitable for long-term development

**Implementation Strategy**:
```python
# backend/src/core/config.py
class Settings(BaseSettings):
    AI_PROVIDER: str = "gemini"  # gemini | openrouter | cohere
    GEMINI_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    COHERE_API_KEY: Optional[str] = None
```

**Provider Selection Logic**:
- Environment variable determines active provider
- Easy switching for testing and rate limit management
- No code changes required to switch providers

---

## 5. Conversation History Trimming Strategy

### Research Summary

**Free-Tier Context Limits**:
- Gemini: 32k tokens (~24k words)
- OpenRouter: Varies (4k-32k depending on model)
- Cohere: 4k tokens (~3k words)

**Trimming Strategies Evaluated**:

1. **Fixed Message Count**: Keep last N messages
   - **Pros**: Simple, predictable
   - **Cons**: Doesn't account for message length variance

2. **Token-Based Trimming**: Keep messages within token budget
   - **Pros**: Precise, maximizes context usage
   - **Cons**: Requires token counting library

3. **Sliding Window**: Keep recent messages + system prompt
   - **Pros**: Balances context and recency
   - **Cons**: May lose important context

4. **Summarization**: Summarize old messages
   - **Pros**: Preserves context semantically
   - **Cons**: Requires additional API calls, complexity

### Decision

**SELECTED: Hybrid Approach (Fixed Count + Token Budget)**

**Implementation**:
```python
MAX_MESSAGES = 20  # Keep last 20 messages
MAX_TOKENS = 8000  # Conservative limit for free-tier

def trim_conversation_history(messages: List[Message]) -> List[Dict]:
    # Step 1: Keep only last MAX_MESSAGES
    recent_messages = messages[-MAX_MESSAGES:]

    # Step 2: Estimate tokens (rough: 1 token ≈ 4 chars)
    formatted = [{"role": m.role, "content": m.content} for m in recent_messages]

    # Step 3: Trim from oldest if exceeding token budget
    while estimate_tokens(formatted) > MAX_TOKENS and len(formatted) > 1:
        formatted.pop(0)  # Remove oldest message

    return formatted
```

**Rationale**:
1. **Simple to implement**: No external token counting library needed
2. **Conservative limits**: Ensures compatibility with all providers
3. **Predictable behavior**: Users understand "last 20 messages" concept
4. **Room for growth**: Can add token counting library later if needed

**Phase 2 Enhancement**: Consider adding conversation summarization for long-running conversations.

---

## Architectural Decisions Summary

### Backend Architecture

**AI Agent Implementation**: Custom implementation with provider abstraction
- `backend/src/services/providers/base.py` - Abstract provider interface
- `backend/src/services/providers/gemini.py` - Gemini implementation
- `backend/src/services/providers/openrouter.py` - OpenRouter implementation
- `backend/src/services/llm_service.py` - LLM service layer with provider factory

**Conversation Management**: Stateless with database persistence
- Load conversation history from database on each request
- Execute AI agent with full history
- Save new messages to database
- Return response to frontend

**Provider Configuration**: Environment-based selection
- `AI_PROVIDER` environment variable determines active provider
- API keys stored in environment variables
- No code changes required to switch providers

### Frontend Architecture

**Chat UI Library**: @assistant-ui/react
- Native Next.js App Router support
- Tailwind CSS integration
- Vercel AI SDK compatibility
- No CDN dependencies

**Component Structure**:
- `frontend/src/app/chat/page.tsx` - Chat page (App Router)
- `frontend/src/components/chat/ChatInterface.tsx` - Main chat component
- `frontend/src/services/chatService.ts` - API client

**State Management**: React hooks + Vercel AI SDK
- `useChat` hook for message state
- Streaming responses support
- Optimistic UI updates

### Database Schema

**Conversation Model**:
```python
class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime
    updated_at: datetime
    messages: List["Message"] = Relationship(back_populates="conversation")
```

**Message Model**:
```python
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime
    conversation: Conversation = Relationship(back_populates="messages")
```

---

## Technology Stack Finalized

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Frontend Framework** | Next.js | 16+ | Existing stack, App Router support |
| **Frontend UI** | @assistant-ui/react | Latest | Next.js native, Tailwind integration |
| **Frontend State** | Vercel AI SDK | Latest | Streaming, tool calls, React hooks |
| **Backend Framework** | FastAPI | 0.104.1 | Existing stack, async support |
| **AI Provider** | Google Gemini | gemini-pro | Best free-tier offering |
| **AI Implementation** | Custom | N/A | Stateless, simple, fast |
| **Database** | Neon PostgreSQL | N/A | Existing stack, serverless |
| **ORM** | SQLModel | 0.0.14 | Existing stack, type-safe |
| **Authentication** | Better Auth | 1.0.0 | Existing stack, JWT tokens |

---

## Implementation Priorities

### Phase 1 (Current Spec) - Days 1-3

1. **Day 1: Backend Foundation**
   - Create Conversation and Message models
   - Implement Gemini provider
   - Create LLM service layer
   - Build chat API endpoint

2. **Day 2: Frontend Integration**
   - Install @assistant-ui/react
   - Create chat page and components
   - Integrate with backend API
   - Implement conversation persistence

3. **Day 3: Testing & Polish**
   - Test with Gemini API
   - Add error handling
   - Implement history trimming
   - Test responsive design

### Phase 2 (Spec-2) - Future

- MCP server implementation
- Task CRUD tools
- Tool execution capabilities
- Advanced agent orchestration

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Gemini API rate limits** | High | Implement OpenRouter fallback, aggressive history trimming |
| **@assistant-ui/react learning curve** | Medium | Allocate time for documentation review, use examples |
| **Custom AI implementation complexity** | Medium | Start simple, iterate based on needs |
| **Conversation history growth** | Low | Implement trimming from day 1, monitor database size |

---

## Open Questions

**None remaining.** All critical unknowns have been resolved through research.

---

## Next Steps

1. ✅ Research complete
2. ⏭️ Update plan.md with architectural decisions
3. ⏭️ Create data-model.md
4. ⏭️ Create API contracts (contracts/chat-api.yaml)
5. ⏭️ Create quickstart.md
6. ⏭️ Generate tasks.md (/sp.tasks command)
