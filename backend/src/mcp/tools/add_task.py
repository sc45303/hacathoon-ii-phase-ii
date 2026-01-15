"""
Add Task MCP Tool

MCP tool for creating new tasks via natural language.
Implements user context injection for security.
"""

import logging
from typing import Optional
from datetime import datetime
from sqlmodel import Session

from ...models.task import Task
from ...core.database import get_session
from ..tool_registry import ToolExecutionResult

logger = logging.getLogger(__name__)


async def add_task(
    title: str,
    user_id: int,  # Injected by backend, never from LLM
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = "medium"
) -> ToolExecutionResult:
    """
    Create a new task for the user.

    SECURITY: user_id is injected by the backend via MCPToolRegistry.
    The LLM cannot specify or modify the user_id.

    Args:
        title: Task title (max 200 characters)
        user_id: User ID (injected by backend for security)
        description: Optional task description (max 1000 characters)
        due_date: Optional due date in ISO 8601 format (YYYY-MM-DD)
        priority: Task priority (low, medium, high) - default: medium

    Returns:
        ToolExecutionResult with success status and task data
    """
    try:
        # Validate title
        if not title or not title.strip():
            logger.warning("add_task called with empty title")
            return ToolExecutionResult(
                success=False,
                error="Task title cannot be empty"
            )

        if len(title) > 200:
            logger.warning(f"add_task called with title exceeding 200 characters: {len(title)}")
            return ToolExecutionResult(
                success=False,
                error="Task title cannot exceed 200 characters"
            )

        # Validate description length
        if description and len(description) > 1000:
            logger.warning(f"add_task called with description exceeding 1000 characters: {len(description)}")
            return ToolExecutionResult(
                success=False,
                error="Task description cannot exceed 1000 characters"
            )

        # Validate priority
        valid_priorities = ["low", "medium", "high"]
        if priority and priority.lower() not in valid_priorities:
            logger.warning(f"add_task called with invalid priority: {priority}")
            return ToolExecutionResult(
                success=False,
                error=f"Priority must be one of: {', '.join(valid_priorities)}"
            )

        # Validate and parse due_date if provided
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date).date()
            except ValueError:
                logger.warning(f"add_task called with invalid due_date format: {due_date}")
                return ToolExecutionResult(
                    success=False,
                    error="Due date must be in ISO 8601 format (YYYY-MM-DD)"
                )

        # Create task in database
        db: Session = next(get_session())
        try:
            task = Task(
                user_id=user_id,
                title=title.strip(),
                description=description.strip() if description else None,
                due_date=parsed_due_date,
                priority=priority.lower() if priority else "medium",
                completed=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            db.add(task)
            db.commit()
            db.refresh(task)

            logger.info(f"Task created successfully: id={task.id}, user_id={user_id}, title={title}")

            return ToolExecutionResult(
                success=True,
                data={
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "priority": task.priority,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                },
                message=f"Task '{title}' created successfully"
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return ToolExecutionResult(
            success=False,
            error=f"Failed to create task: {str(e)}"
        )
