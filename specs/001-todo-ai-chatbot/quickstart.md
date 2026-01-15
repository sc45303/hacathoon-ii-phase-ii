# Quickstart Guide: Todo AI Chatbot - Phase 1

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-14
**Audience**: Developers implementing this feature

---

## Overview

This guide provides step-by-step instructions for implementing the Todo AI Chatbot Phase 1 feature. Follow these steps in order to build a working conversational AI interface with database-persisted state.

---

## Prerequisites

### Required Tools

- Python 3.11+
- Node.js 18+
- PostgreSQL (Neon Serverless)
- Git

### Required Access

- Google Gemini API key (free tier)
- Database connection string (Neon PostgreSQL)
- Better Auth configuration (existing)

### Existing Infrastructure

- ✅ FastAPI backend running
- ✅ Next.js frontend running
- ✅ Database connectivity established
- ✅ Better Auth JWT authentication working

---

## Implementation Steps

### Day 1: Backend Foundation

#### Step 1.1: Install Dependencies

```bash
cd backend
```

Add to `requirements.txt`:

```txt
google-generativeai==0.3.2  # Gemini API client
tiktoken==0.5.2             # Token counting (optional)
```

Install:

```bash
pip install -r requirements.txt
```

#### Step 1.2: Configure Environment Variables

Add to `backend/.env`:

```env
# AI Provider Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Conversation Settings
MAX_CONVERSATION_MESSAGES=20
MAX_CONVERSATION_TOKENS=8000
```

#### Step 1.3: Create Database Models

**File**: `backend/src/models/conversation.py`

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

    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
```

**File**: `backend/src/models/message.py`

```python
from sqlmodel import SQLModel, Field, Relationship, Column, Text
from datetime import datetime
from typing import Optional
from pydantic import validator

class Message(SQLModel, table=True):
    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    role: str = Field(max_length=20)
    content: str = Field(sa_column=Column(Text))
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    token_count: Optional[int] = Field(default=None, ge=0)

    conversation: "Conversation" = Relationship(back_populates="messages")

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

#### Step 1.4: Create Database Migration

```bash
cd backend
alembic revision -m "Add conversation and message tables"
```

Edit the generated migration file:

```python
def upgrade():
    op.create_table(
        'conversation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_conversation_user_id', 'conversation', ['user_id'])
    op.create_index('idx_conversation_updated_at', 'conversation', ['updated_at'])

    op.create_table(
        'message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='check_message_role')
    )
    op.create_index('idx_message_conversation_id', 'message', ['conversation_id'])
    op.create_index('idx_message_timestamp', 'message', ['timestamp'])

def downgrade():
    op.drop_table('message')
    op.drop_table('conversation')
```

Run migration:

```bash
alembic upgrade head
```

#### Step 1.5: Create LLM Provider Abstraction

**File**: `backend/src/services/providers/base.py`

```python
from abc import ABC, abstractmethod
from typing import List, Dict

class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]]
    ) -> str:
        """Generate a response from the LLM."""
        pass
```

**File**: `backend/src/services/providers/gemini.py`

```python
import google.generativeai as genai
from typing import List, Dict
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')

    async def generate_response(self, messages: List[Dict[str, str]]) -> str:
        # Convert messages to Gemini format
        prompt = self._format_messages(messages)

        # Generate response
        response = await self.model.generate_content_async(prompt)
        return response.text

    def _format_messages(self, messages: List[Dict[str, str]]) -> str:
        # Format conversation history as a single prompt
        formatted = []
        for msg in messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            formatted.append(f"{role}: {msg['content']}")
        return "\n\n".join(formatted)
```

#### Step 1.6: Create LLM Service

**File**: `backend/src/services/llm_service.py`

```python
from typing import List, Dict
from ..core.config import settings
from .providers.base import LLMProvider
from .providers.gemini import GeminiProvider

class LLMService:
    def __init__(self):
        self.provider = self._get_provider()

    def _get_provider(self) -> LLMProvider:
        provider_name = settings.AI_PROVIDER.lower()

        if provider_name == "gemini":
            return GeminiProvider(api_key=settings.GEMINI_API_KEY)
        else:
            raise ValueError(f"Unsupported AI provider: {provider_name}")

    async def generate_response(self, messages: List[Dict[str, str]]) -> str:
        return await self.provider.generate_response(messages)
```

#### Step 1.7: Create Conversation Service

**File**: `backend/src/services/conversation_service.py`

```python
from sqlmodel import Session, select
from typing import List, Dict, Optional
from ..models.conversation import Conversation
from ..models.message import Message
from datetime import datetime

class ConversationService:
    def __init__(self, session: Session):
        self.session = session

    def get_or_create_conversation(self, user_id: int) -> Conversation:
        # Get most recent conversation for user
        conversation = self.session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        ).first()

        if not conversation:
            conversation = Conversation(user_id=user_id)
            self.session.add(conversation)
            self.session.commit()
            self.session.refresh(conversation)

        return conversation

    def load_conversation_history(
        self,
        conversation_id: int,
        max_messages: int = 20
    ) -> List[Dict[str, str]]:
        messages = self.session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.timestamp.desc())
            .limit(max_messages)
        ).all()

        # Reverse to chronological order
        messages = list(reversed(messages))

        return [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

    def add_message(
        self,
        conversation_id: int,
        role: str,
        content: str
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        self.session.add(message)

        # Update conversation timestamp
        conversation = self.session.get(Conversation, conversation_id)
        conversation.updated_at = datetime.utcnow()
        self.session.add(conversation)

        self.session.commit()
        self.session.refresh(message)
        return message
```

#### Step 1.8: Create Pydantic Schemas

**File**: `backend/src/schemas/chat_request.py`

```python
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[int] = None
```

**File**: `backend/src/schemas/chat_response.py`

```python
from pydantic import BaseModel
from datetime import datetime

class ChatResponse(BaseModel):
    response: str
    conversation_id: int
    timestamp: datetime
```

#### Step 1.9: Create Chat API Endpoint

**File**: `backend/src/api/routes/chat.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ...core.database import get_session
from ...core.security import get_current_user
from ...schemas.chat_request import ChatRequest
from ...schemas.chat_response import ChatResponse
from ...services.conversation_service import ConversationService
from ...services.llm_service import LLMService
from datetime import datetime

router = APIRouter()

@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: int,
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    # Verify user_id matches authenticated user
    if current_user.id != user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Initialize services
    conversation_service = ConversationService(session)
    llm_service = LLMService()

    # Get or create conversation
    conversation = conversation_service.get_or_create_conversation(user_id)

    # Load conversation history
    history = conversation_service.load_conversation_history(conversation.id)

    # Add user message to history
    history.append({"role": "user", "content": request.message})

    # Generate AI response
    try:
        ai_response = await llm_service.generate_response(history)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate AI response")

    # Save messages to database
    conversation_service.add_message(conversation.id, "user", request.message)
    conversation_service.add_message(conversation.id, "assistant", ai_response)

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation.id,
        timestamp=datetime.utcnow()
    )
```

Register the router in `backend/src/main.py`:

```python
from .api.routes import chat

app.include_router(chat.router)
```

---

### Day 2: Frontend Integration

#### Step 2.1: Install Dependencies

```bash
cd frontend
npm install @assistant-ui/react ai
```

#### Step 2.2: Create Chat Service

**File**: `frontend/src/services/chatService.ts`

```typescript
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
  timestamp: string;
}

export async function sendChatMessage(
  userId: number,
  message: string,
  token: string
): Promise<ChatResponse> {
  const response = await fetch(`/api/${userId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}
```

#### Step 2.3: Create Chat Components

**File**: `frontend/src/components/chat/ChatInterface.tsx`

```tsx
"use client";

import { useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { sendChatMessage } from "@/services/chatService";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface({
  userId,
  token,
}: {
  userId: number;
  token: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message optimistically
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userId, content, token);

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg">
      <MessageList messages={messages} />
      {isLoading && <TypingIndicator />}
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
```

**File**: `frontend/src/components/chat/MessageList.tsx`

```tsx
interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**File**: `frontend/src/components/chat/MessageInput.tsx`

```tsx
"use client";

import { useState } from "react";

export function MessageInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
```

**File**: `frontend/src/components/chat/TypingIndicator.tsx`

```tsx
export function TypingIndicator() {
  return <div className="px-4 py-2 text-gray-500 text-sm">AI is typing...</div>;
}
```

#### Step 2.4: Create Chat Page

**File**: `frontend/src/app/chat/page.tsx`

```tsx
import { ChatInterface } from "@/components/chat/ChatInterface";
import { auth } from "@/lib/auth"; // Your Better Auth instance
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">AI Chat Assistant</h1>
      <ChatInterface userId={session.user.id} token={session.token} />
    </main>
  );
}
```

---

### Day 3: Testing & Polish

#### Step 3.1: Test Backend

```bash
cd backend
pytest tests/integration/test_chat_api.py -v
```

#### Step 3.2: Test Frontend

```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:3000/chat` and test:

- ✅ Send a message
- ✅ Receive AI response
- ✅ Conversation persists on page refresh
- ✅ Multiple messages maintain context

#### Step 3.3: Test Error Handling

- Test with invalid JWT token (should return 401)
- Test with empty message (should return 400)
- Test with rate limit exceeded (should return 429)

---

## Verification Checklist

- [ ] Database tables created (conversation, message)
- [ ] Backend API endpoint responds at POST /api/{user_id}/chat
- [ ] Frontend chat interface renders correctly
- [ ] Messages persist to database
- [ ] Conversation history loads on page refresh
- [ ] AI responses are generated successfully
- [ ] JWT authentication works correctly
- [ ] Error handling works for common scenarios

---

## Troubleshooting

### Issue: "Gemini API key invalid"

**Solution**: Verify GEMINI_API_KEY in backend/.env

### Issue: "Database connection failed"

**Solution**: Check DATABASE_URL in backend/.env

### Issue: "401 Unauthorized"

**Solution**: Verify JWT token is being sent in Authorization header

### Issue: "Chat interface not rendering"

**Solution**: Ensure 'use client' directive is present in client components

---

## Next Steps

After completing Phase 1:

1. Review implementation against spec.md acceptance criteria
2. Create PHR (Prompt History Record) documenting implementation
3. Prepare for Phase 2 (Spec-2): MCP tools and task CRUD operations

---

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
