"""
Delete Task MCP Tool

MCP tool for deleting tasks via natural language.
Supports task identification by ID or title.
Implements user context injection for security.
"""

import logging
from typing import Union
from sqlmodel import Session, select

from ...models.task import Task
from ...core.database import get_session
from ..tool_registry import ToolExecutionResult

logger = logging.getLogger(__name__)


async def delete_task(
    task_identifier: Union[int, str],
    user_id: int  # Injected by backend, never from LLM
) -> ToolExecutionResult:
    """
    Delete a task permanently.

    SECURITY: user_id is injected by the backend via MCPToolRegistry.
    The LLM cannot specify or modify the user_id.

    Args:
        task_identifier: Task ID (integer) or task title (string)
        user_id: User ID (injected by backend for security)

    Returns:
        ToolExecutionResult with success status and confirmation message
    """
    try:
        # Query task from database
        db: Session = next(get_session())
        try:
            # Build query based on identifier type
            if isinstance(task_identifier, int):
                # Search by ID
                statement = select(Task).where(
                    Task.id == task_identifier,
                    Task.user_id == user_id
                )
                identifier_type = "ID"
            else:
                # Search by title (exact match)
                statement = select(Task).where(
                    Task.title == task_identifier,
                    Task.user_id == user_id
                )
                identifier_type = "title"

            task = db.exec(statement).first()

            # Check if task exists
            if not task:
                logger.warning(f"Task not found for deletion: {identifier_type}={task_identifier}, user_id={user_id}")
                return ToolExecutionResult(
                    success=False,
                    error=f"Task not found with {identifier_type}: {task_identifier}"
                )

            # Store task title for confirmation message
            task_title = task.title

            # Delete task
            db.delete(task)
            db.commit()

            logger.info(f"Task deleted successfully: id={task.id}, user_id={user_id}, title={task_title}")

            return ToolExecutionResult(
                success=True,
                message=f"Task '{task_title}' has been deleted successfully."
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        return ToolExecutionResult(
            success=False,
            error=f"Failed to delete task: {str(e)}"
        )
