"""Conversations API endpoints for managing chat conversations."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import Dict, Any, List
import logging

from src.core.database import get_session
from src.core.security import get_current_user
from src.services.conversation_service import ConversationService
from src.schemas.conversation import (
    ConversationListResponse,
    ConversationSummary,
    MessageListResponse,
    MessageResponse,
    UpdateConversationRequest,
    UpdateConversationResponse
)

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["conversations"])


@router.get("/{user_id}/conversations", response_model=ConversationListResponse)
async def list_conversations(
    user_id: int,
    limit: int = Query(50, ge=1, le=100, description="Maximum number of conversations to return"),
    db: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ConversationListResponse:
    """List all conversations for a user.

    Args:
        user_id: ID of the user
        limit: Maximum number of conversations to return (default: 50, max: 100)
        db: Database session
        current_user: Authenticated user from JWT token

    Returns:
        ConversationListResponse with list of conversations

    Raises:
        HTTPException 401: If user is not authenticated or user_id doesn't match
    """
    # Verify user authorization
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to access this user's conversations"
        )

    try:
        conversation_service = ConversationService(db)
        conversations = conversation_service.get_user_conversations(user_id, limit=limit)

        # Build conversation summaries with message count and preview
        summaries: List[ConversationSummary] = []
        for conv in conversations:
            # Get messages for this conversation
            messages = conversation_service.get_conversation_messages(conv.id)
            message_count = len(messages)

            # Get last message preview
            last_message_preview = None
            if messages:
                last_msg = messages[-1]
                # Take first 100 characters of the last message
                last_message_preview = last_msg.content[:100]
                if len(last_msg.content) > 100:
                    last_message_preview += "..."

            summaries.append(ConversationSummary(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=message_count,
                last_message_preview=last_message_preview
            ))

        return ConversationListResponse(
            conversations=summaries,
            total=len(summaries)
        )

    except Exception as e:
        logger.exception(f"Failed to list conversations for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversations. Please try again."
        )


@router.get("/{user_id}/conversations/{conversation_id}/messages", response_model=MessageListResponse)
async def get_conversation_messages(
    user_id: int,
    conversation_id: int,
    offset: int = Query(0, ge=0, description="Number of messages to skip"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of messages to return"),
    db: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> MessageListResponse:
    """Get message history for a conversation.

    Args:
        user_id: ID of the user
        conversation_id: ID of the conversation
        offset: Number of messages to skip (for pagination)
        limit: Maximum number of messages to return (default: 50, max: 200)
        db: Database session
        current_user: Authenticated user from JWT token

    Returns:
        MessageListResponse with list of messages

    Raises:
        HTTPException 401: If user is not authenticated or user_id doesn't match
        HTTPException 404: If conversation not found or user doesn't have access
    """
    # Verify user authorization
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to access this user's conversations"
        )

    try:
        conversation_service = ConversationService(db)

        # Verify conversation exists and belongs to user
        conversation = conversation_service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found or you don't have access to it"
            )

        # Get all messages (we'll handle pagination manually)
        all_messages = conversation_service.get_conversation_messages(conversation_id)
        total = len(all_messages)

        # Apply pagination
        paginated_messages = all_messages[offset:offset + limit]

        # Convert to response format
        message_responses = [
            MessageResponse(
                id=msg.id,
                role=msg.role,
                content=msg.content,
                timestamp=msg.timestamp,
                token_count=msg.token_count
            )
            for msg in paginated_messages
        ]

        return MessageListResponse(
            conversation_id=conversation_id,
            messages=message_responses,
            total=total
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to get messages for conversation {conversation_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve messages. Please try again."
        )


@router.patch("/{user_id}/conversations/{conversation_id}", response_model=UpdateConversationResponse)
async def update_conversation(
    user_id: int,
    conversation_id: int,
    request: UpdateConversationRequest,
    db: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UpdateConversationResponse:
    """Update a conversation's title.

    Args:
        user_id: ID of the user
        conversation_id: ID of the conversation
        request: UpdateConversationRequest with new title
        db: Database session
        current_user: Authenticated user from JWT token

    Returns:
        UpdateConversationResponse with updated conversation

    Raises:
        HTTPException 401: If user is not authenticated or user_id doesn't match
        HTTPException 404: If conversation not found or user doesn't have access
    """
    # Verify user authorization
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to access this user's conversations"
        )

    try:
        conversation_service = ConversationService(db)

        # Verify conversation exists and belongs to user
        conversation = conversation_service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found or you don't have access to it"
            )

        # Update the title
        from datetime import datetime
        conversation.title = request.title
        conversation.updated_at = datetime.utcnow()
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return UpdateConversationResponse(
            id=conversation.id,
            title=conversation.title,
            updated_at=conversation.updated_at
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to update conversation {conversation_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update conversation. Please try again."
        )


@router.delete("/{user_id}/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    user_id: int,
    conversation_id: int,
    db: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """Delete a conversation and all its messages.

    Args:
        user_id: ID of the user
        conversation_id: ID of the conversation
        db: Database session
        current_user: Authenticated user from JWT token

    Returns:
        None (204 No Content)

    Raises:
        HTTPException 401: If user is not authenticated or user_id doesn't match
        HTTPException 404: If conversation not found or user doesn't have access
    """
    # Verify user authorization
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to access this user's conversations"
        )

    try:
        conversation_service = ConversationService(db)

        # Delete the conversation (service method handles authorization check)
        deleted = conversation_service.delete_conversation(conversation_id, user_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {conversation_id} not found or you don't have access to it"
            )

        # Return 204 No Content (no response body)
        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to delete conversation {conversation_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete conversation. Please try again."
        )
