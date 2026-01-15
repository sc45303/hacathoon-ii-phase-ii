"""Conversation response schemas."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    """Response schema for a single message."""

    id: int
    role: str = Field(..., description="Role of the message sender (user or assistant)")
    content: str = Field(..., description="Content of the message")
    timestamp: datetime = Field(..., description="When the message was created")
    token_count: Optional[int] = Field(None, description="Estimated token count")

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    """Summary of a conversation for list view."""

    id: int
    title: Optional[str] = Field(None, description="Title of the conversation")
    created_at: datetime = Field(..., description="When the conversation was created")
    updated_at: datetime = Field(..., description="When the conversation was last updated")
    message_count: int = Field(0, description="Number of messages in the conversation")
    last_message_preview: Optional[str] = Field(None, description="Preview of the last message (first 100 chars)")

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """Response schema for listing conversations."""

    conversations: List[ConversationSummary]
    total: int = Field(..., description="Total number of conversations")


class ConversationDetail(BaseModel):
    """Detailed conversation information."""

    id: int
    user_id: int
    title: Optional[str] = Field(None, description="Title of the conversation")
    created_at: datetime = Field(..., description="When the conversation was created")
    updated_at: datetime = Field(..., description="When the conversation was last updated")

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Response schema for conversation messages."""

    conversation_id: int
    messages: List[MessageResponse]
    total: int = Field(..., description="Total number of messages")


class UpdateConversationRequest(BaseModel):
    """Request schema for updating a conversation."""

    title: str = Field(..., min_length=1, max_length=255, description="New title for the conversation")


class UpdateConversationResponse(BaseModel):
    """Response schema for updating a conversation."""

    id: int
    title: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True
