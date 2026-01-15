"""Pydantic schema for chat response."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatResponse(BaseModel):
    """Response schema for chat endpoint.

    Represents the AI assistant's response to a user's message.
    """

    conversation_id: int = Field(
        ...,
        description="ID of the conversation (new or existing)"
    )

    message: str = Field(
        ...,
        description="AI assistant's response message"
    )

    role: str = Field(
        default="assistant",
        description="Role of the message sender (always 'assistant' for responses)"
    )

    timestamp: datetime = Field(
        ...,
        description="Timestamp when the response was generated"
    )

    token_count: Optional[int] = Field(
        default=None,
        description="Number of tokens used in the response"
    )

    model: Optional[str] = Field(
        default=None,
        description="AI model used to generate the response"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 123,
                "message": "I'd be happy to help you organize your tasks! Let me know what you need to accomplish today.",
                "role": "assistant",
                "timestamp": "2026-01-14T10:30:00Z",
                "token_count": 25,
                "model": "gemini-pro"
            }
        }
