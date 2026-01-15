"""Conversation service for CRUD operations."""
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from src.models.conversation import Conversation
from src.models.message import Message
from src.core.config import settings


class ConversationService:
    """Service for managing conversations and messages.

    Handles CRUD operations for conversations and messages,
    including conversation history retrieval and trimming.
    """

    def __init__(self, db: Session):
        """Initialize the conversation service.

        Args:
            db: SQLModel database session
        """
        self.db = db

    def create_conversation(self, user_id: int, title: str | None = None) -> Conversation:
        """Create a new conversation for a user.

        Args:
            user_id: ID of the user creating the conversation
            title: Optional title for the conversation

        Returns:
            Created Conversation object
        """
        conversation = Conversation(
            user_id=user_id,
            title=title or "New Conversation",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def get_conversation(self, conversation_id: int, user_id: int) -> Optional[Conversation]:
        """Get a conversation by ID, ensuring it belongs to the user.

        Args:
            conversation_id: ID of the conversation
            user_id: ID of the user (for authorization)

        Returns:
            Conversation object if found and authorized, None otherwise
        """
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
        return self.db.exec(statement).first()

    def get_user_conversations(self, user_id: int, limit: int = 50) -> List[Conversation]:
        """Get all conversations for a user.

        Args:
            user_id: ID of the user
            limit: Maximum number of conversations to return

        Returns:
            List of Conversation objects
        """
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
        return list(self.db.exec(statement).all())

    def add_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
        token_count: int | None = None
    ) -> Message:
        """Add a message to a conversation.

        Args:
            conversation_id: ID of the conversation
            role: Role of the message sender ("user" or "assistant")
            content: Content of the message
            token_count: Optional token count for the message

        Returns:
            Created Message object
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            token_count=token_count,
            timestamp=datetime.utcnow()
        )
        self.db.add(message)

        # Update conversation's updated_at timestamp
        conversation = self.db.get(Conversation, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(message)
        return message

    def get_conversation_messages(
        self,
        conversation_id: int,
        limit: int | None = None
    ) -> List[Message]:
        """Get all messages for a conversation.

        Args:
            conversation_id: ID of the conversation
            limit: Optional limit on number of messages to return

        Returns:
            List of Message objects ordered by timestamp
        """
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.timestamp.asc())
        )

        if limit:
            statement = statement.limit(limit)

        return list(self.db.exec(statement).all())

    def trim_conversation_history(
        self,
        conversation_id: int,
        max_messages: int | None = None,
        max_tokens: int | None = None
    ) -> List[Message]:
        """Trim conversation history based on message count and token limits.

        Implements hybrid trimming strategy:
        1. Keep most recent N messages (max_messages)
        2. Within those, ensure total tokens don't exceed max_tokens

        Args:
            conversation_id: ID of the conversation
            max_messages: Maximum number of messages to keep (default from settings)
            max_tokens: Maximum total tokens to keep (default from settings)

        Returns:
            List of trimmed Message objects
        """
        max_messages = max_messages or settings.MAX_CONVERSATION_MESSAGES
        max_tokens = max_tokens or settings.MAX_CONVERSATION_TOKENS

        # Get all messages
        all_messages = self.get_conversation_messages(conversation_id)

        # Step 1: Keep only the most recent N messages
        recent_messages = all_messages[-max_messages:] if len(all_messages) > max_messages else all_messages

        # Step 2: Trim by token count if needed
        if max_tokens:
            total_tokens = sum(msg.token_count or 0 for msg in recent_messages)

            # Remove oldest messages until under token limit
            while total_tokens > max_tokens and len(recent_messages) > 1:
                removed_message = recent_messages.pop(0)
                total_tokens -= (removed_message.token_count or 0)

        return recent_messages

    def delete_conversation(self, conversation_id: int, user_id: int) -> bool:
        """Delete a conversation and all its messages.

        Args:
            conversation_id: ID of the conversation
            user_id: ID of the user (for authorization)

        Returns:
            True if deleted, False if not found or unauthorized
        """
        conversation = self.get_conversation(conversation_id, user_id)
        if not conversation:
            return False

        self.db.delete(conversation)
        self.db.commit()
        return True

    def format_messages_for_agent(
        self,
        messages: List[Message],
        max_messages: int = 20,
        max_tokens: int = 8000
    ) -> List[dict]:
        """Format messages for agent consumption with trimming.

        Converts Message objects to the format expected by the agent:
        [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]

        Applies conversation history trimming to stay within free-tier constraints:
        1. Keep only the most recent N messages (max_messages)
        2. Within those, ensure total tokens don't exceed max_tokens

        Args:
            messages: List of Message objects from database
            max_messages: Maximum number of messages to keep (default: 20)
            max_tokens: Maximum total tokens to keep (default: 8000)

        Returns:
            List of formatted message dicts for agent
        """
        # Step 1: Keep only the most recent N messages
        recent_messages = messages[-max_messages:] if len(messages) > max_messages else messages

        # Step 2: Trim by token count if needed
        if max_tokens:
            total_tokens = sum(msg.token_count or 0 for msg in recent_messages)

            # Remove oldest messages until under token limit
            while total_tokens > max_tokens and len(recent_messages) > 1:
                removed_message = recent_messages.pop(0)
                total_tokens -= (removed_message.token_count or 0)

        # Step 3: Convert to agent format
        formatted_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in recent_messages
        ]

        return formatted_messages
