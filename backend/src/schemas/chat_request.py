"""Pydantic schema for chat request."""
from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """Request schema for chat endpoint.

    Represents a user's message to the AI chatbot.
    """

    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User's message to the AI assistant"
    )

    conversation_id: Optional[int] = Field(
        default=None,
        description="ID of existing conversation (null to start new conversation)"
    )

    system_prompt: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Optional custom system prompt to override default"
    )

    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Sampling temperature for response generation (0.0 to 1.0)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Can you help me organize my tasks for today?",
                "conversation_id": 123,
                "temperature": 0.7
            }
        }
