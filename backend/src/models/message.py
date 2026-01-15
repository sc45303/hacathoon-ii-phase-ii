"""Message model for AI chatbot conversations."""
from datetime import datetime
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship, Column
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .conversation import Conversation


class Message(SQLModel, table=True):
    """Message model representing a single message in a conversation."""

    __tablename__ = "message"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", nullable=False, index=True)
    role: str = Field(max_length=50, nullable=False)  # "user" or "assistant"
    content: str = Field(nullable=False)
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    token_count: Optional[int] = Field(default=None)
    tool_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
