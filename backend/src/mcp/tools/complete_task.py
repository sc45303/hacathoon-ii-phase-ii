"""
Complete Task MCP Tool

MCP tool for marking tasks as completed via natural language.
Supports task identification by ID or title.
Implements user context injection for security.
"""

import logging
from typing import Union
from datetime import datetime
from sqlmodel import Session, select

from ...models.task import Task
from ...core.database import get_session
from ..tool_registry import ToolExecutionResult

logger = logging.getLogger(__name__)


async def complete_task(
    task_identifier: Union[int, str],
    user_id: int  # Injected by backend, never from LLM
) -> ToolExecutionResult:
    """
    Mark a task as completed.

    SECURITY: user_id is injected by the backend via MCPToolRegistry.
    The LLM cannot specify or modify the user_id.

    Args:
        task_identifier: Task ID (integer) or task title (string)
        user_id: User ID (injected by backend for security)

    Returns:
        ToolExecutionResult with success status and updated task data
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
                logger.warning(f"Task not found: {identifier_type}={task_identifier}, user_id={user_id}")
                return ToolExecutionResult(
                    success=False,
                    error=f"Task not found with {identifier_type}: {task_identifier}"
                )

            # Check if already completed
            if task.completed:
                logger.info(f"Task already completed: id={task.id}, user_id={user_id}")
                return ToolExecutionResult(
                    success=True,
                    data={
                        "id": task.id,
                        "title": task.title,
                        "description": task.description,
                        "completed": task.completed,
                        "updated_at": task.updated_at.isoformat()
                    },
                    message=f"Task '{task.title}' was already marked as completed."
                )

            # Mark task as completed
            task.completed = True
            task.updated_at = datetime.utcnow()

            db.add(task)
            db.commit()
            db.refresh(task)

            logger.info(f"Task completed successfully: id={task.id}, user_id={user_id}, title={task.title}")

            return ToolExecutionResult(
                success=True,
                data={
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "updated_at": task.updated_at.isoformat()
                },
                message=f"Task '{task.title}' marked as completed!"
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error completing task: {str(e)}")
        return ToolExecutionResult(
            success=False,
            error=f"Failed to complete task: {str(e)}"
        )
