"""Conversation model for AI chatbot."""
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .message import Message
    from .user import User


class Conversation(SQLModel, table=True):
    """Conversation model representing a chat session between user and AI."""

    __tablename__ = "conversation"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation", cascade_delete=True)
