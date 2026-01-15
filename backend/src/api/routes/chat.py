"""Chat API endpoint for AI chatbot."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import Dict, Any
import logging
from datetime import datetime

from src.core.database import get_session
from src.core.security import get_current_user
from src.core.config import settings
from src.schemas.chat_request import ChatRequest
from src.schemas.chat_response import ChatResponse
from src.services.conversation_service import ConversationService
from src.agent.agent_config import AgentConfiguration
from src.agent.agent_runner import AgentRunner
from src.mcp import tool_registry
from src.core.exceptions import (
    classify_ai_error,
    APIKeyMissingException,
    APIKeyInvalidException
)


# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])


def generate_conversation_title(first_user_message: str) -> str:
    """Generate a conversation title from the first user message.

    Args:
        first_user_message: The first message from the user

    Returns:
        A title string (max 50 characters)
    """
    # Remove leading/trailing whitespace
    message = first_user_message.strip()

    # Try to extract the first sentence or first 50 characters
    # Split by common sentence endings
    for delimiter in ['. ', '! ', '? ', '\n']:
        if delimiter in message:
            title = message.split(delimiter)[0]
            break
    else:
        # No sentence delimiter found, use first 50 chars
        title = message[:50]

    # If title is too short (less than 10 chars), use timestamp-based default
    if len(title) < 10:
        return f"Chat {datetime.now().strftime('%b %d, %I:%M %p')}"

    # Truncate to 50 characters and add ellipsis if needed
    if len(title) > 50:
        title = title[:47] + "..."

    return title


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: int,
    request: ChatRequest,
    db: Session = Depends(get_session),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ChatResponse:
    """Handle chat messages from users.

    Args:
        user_id: ID of the user sending the message
        request: ChatRequest containing the user's message
        db: Database session
        current_user: Authenticated user from JWT token

    Returns:
        ChatResponse containing the AI's response

    Raises:
        HTTPException 401: If user is not authenticated or user_id doesn't match
        HTTPException 404: If conversation_id is provided but not found
        HTTPException 500: If AI provider fails to generate response
    """
    # Verify user authorization
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized to access this user's chat"
        )

    try:
        # Validate request message length
        if not request.message or len(request.message.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )

        if len(request.message) > 10000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message exceeds maximum length of 10,000 characters"
            )

        # Initialize services
        conversation_service = ConversationService(db)

        # Initialize agent configuration from settings
        try:
            agent_config = AgentConfiguration(
                provider=settings.LLM_PROVIDER,
                fallback_provider=settings.FALLBACK_PROVIDER,
                gemini_api_key=settings.GEMINI_API_KEY,
                openrouter_api_key=settings.OPENROUTER_API_KEY,
                cohere_api_key=settings.COHERE_API_KEY,
                temperature=settings.AGENT_TEMPERATURE,
                max_tokens=settings.AGENT_MAX_TOKENS,
                max_messages=settings.CONVERSATION_MAX_MESSAGES,
                max_conversation_tokens=settings.CONVERSATION_MAX_TOKENS
            )
            agent_config.validate()

            # Create agent runner with tool registry
            agent_runner = AgentRunner(agent_config, tool_registry)
        except ValueError as e:
            logger.error(f"Agent initialization failed: {str(e)}")
            # Check if it's an API key issue
            error_msg = str(e).lower()
            if "api key" in error_msg:
                if "not found" in error_msg or "missing" in error_msg:
                    raise APIKeyMissingException(provider=settings.LLM_PROVIDER)
                elif "invalid" in error_msg:
                    raise APIKeyInvalidException(provider=settings.LLM_PROVIDER)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service is not properly configured. Please contact support."
            )

        # Get or create conversation
        is_new_conversation = False
        if request.conversation_id:
            conversation = conversation_service.get_conversation(
                request.conversation_id,
                user_id
            )
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Conversation {request.conversation_id} not found or you don't have access to it"
                )
        else:
            # Create new conversation with auto-generated title
            try:
                # Generate title from first user message
                title = generate_conversation_title(request.message)
                conversation = conversation_service.create_conversation(
                    user_id=user_id,
                    title=title
                )
                is_new_conversation = True
                logger.info(f"Created new conversation {conversation.id} with title: {title}")
            except Exception as e:
                logger.error(f"Failed to create conversation: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create conversation. Please try again."
                )

        # Add user message to conversation
        try:
            user_message = conversation_service.add_message(
                conversation_id=conversation.id,
                role="user",
                content=request.message,
                token_count=len(request.message) // 4  # Rough token estimate
            )
        except Exception as e:
            logger.error(f"Failed to save user message: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save your message. Please try again."
            )

        # Get conversation history and format for agent
        history_messages = conversation_service.get_conversation_messages(
            conversation_id=conversation.id
        )

        # Format messages for agent with trimming
        formatted_messages = conversation_service.format_messages_for_agent(
            messages=history_messages,
            max_messages=agent_config.max_messages,
            max_tokens=agent_config.max_conversation_tokens
        )

        # Generate AI response with tool calling support
        system_prompt = request.system_prompt or agent_config.system_prompt

        try:
            agent_result = await agent_runner.execute(
                messages=formatted_messages,
                user_id=user_id,  # Inject user context for security
                system_prompt=system_prompt
            )
        except Exception as e:
            # Use classify_ai_error to determine the appropriate exception
            logger.error(f"AI service error for user {user_id}: {str(e)}")
            provider = agent_result.get("provider") if 'agent_result' in locals() else settings.LLM_PROVIDER
            raise classify_ai_error(e, provider=provider)

        # Add AI response to conversation with tool call metadata
        try:
            # Prepare metadata if tools were used
            tool_metadata = None
            if agent_result.get("tool_calls"):
                # Convert ToolExecutionResult objects to dicts for JSON serialization
                tool_results = agent_result.get("tool_results", [])
                serializable_results = []
                for result in tool_results:
                    if hasattr(result, '__dict__'):
                        # Convert dataclass/object to dict
                        serializable_results.append({
                            "success": result.success,
                            "data": result.data,
                            "message": result.message,
                            "error": result.error
                        })
                    else:
                        # Already a dict
                        serializable_results.append(result)

                tool_metadata = {
                    "tool_calls": agent_result["tool_calls"],
                    "tool_results": serializable_results,
                    "provider": agent_result.get("provider")
                }

            assistant_message = conversation_service.add_message(
                conversation_id=conversation.id,
                role="assistant",
                content=agent_result["content"],
                token_count=len(agent_result["content"]) // 4  # Rough token estimate
            )

            # Update tool_metadata if tools were used
            if tool_metadata:
                assistant_message.tool_metadata = tool_metadata
                db.add(assistant_message)
                db.commit()
        except Exception as e:
            logger.error(f"Failed to save AI response: {str(e)}")
            # Still return the response even if saving fails
            # User gets the response but it won't be in history
            logger.warning(f"Returning response without saving to database for conversation {conversation.id}")

        # Log tool usage if any
        if agent_result.get("tool_calls"):
            logger.info(f"Agent used {len(agent_result['tool_calls'])} tools for user {user_id}")

        # Return response
        return ChatResponse(
            conversation_id=conversation.id,
            message=agent_result["content"],
            role="assistant",
            timestamp=assistant_message.timestamp if 'assistant_message' in locals() else user_message.timestamp,
            token_count=len(agent_result["content"]) // 4,
            model=agent_result.get("provider")
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch-all for unexpected errors
        logger.exception(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )
