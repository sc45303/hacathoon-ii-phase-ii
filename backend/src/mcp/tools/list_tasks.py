"""
List Tasks MCP Tool

MCP tool for listing tasks via natural language with filtering support.
Implements user context injection for security.
"""

import logging
from typing import Optional
from sqlmodel import Session, select

from ...models.task import Task
from ...core.database import get_session
from ..tool_registry import ToolExecutionResult

logger = logging.getLogger(__name__)


async def list_tasks(
    user_id: int,  # Injected by backend, never from LLM
    filter: Optional[str] = "all"
) -> ToolExecutionResult:
    """
    List all tasks for the authenticated user with optional filtering.

    SECURITY: user_id is injected by the backend via MCPToolRegistry.
    The LLM cannot specify or modify the user_id.

    Args:
        user_id: User ID (injected by backend for security)
        filter: Filter by completion status (all, completed, incomplete) - default: all

    Returns:
        ToolExecutionResult with success status and tasks data
    """
    try:
        # Validate filter parameter
        valid_filters = ["all", "completed", "incomplete"]
        if filter and filter.lower() not in valid_filters:
            logger.warning(f"list_tasks called with invalid filter: {filter}")
            return ToolExecutionResult(
                success=False,
                error=f"Filter must be one of: {', '.join(valid_filters)}"
            )

        filter_value = filter.lower() if filter else "all"

        # Query tasks from database
        db: Session = next(get_session())
        try:
            # Build query based on filter
            statement = select(Task).where(Task.user_id == user_id)

            if filter_value == "completed":
                statement = statement.where(Task.completed == True)
            elif filter_value == "incomplete":
                statement = statement.where(Task.completed == False)
            # "all" filter doesn't add any additional conditions

            # Order by creation date (newest first)
            statement = statement.order_by(Task.created_at.desc())

            # Execute query
            tasks = db.exec(statement).all()

            # Format tasks for response
            tasks_data = [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "priority": task.priority,
                    "completed": task.completed,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                }
                for task in tasks
            ]

            # Generate user-friendly message
            count = len(tasks_data)
            if count == 0:
                if filter_value == "completed":
                    message = "You have no completed tasks."
                elif filter_value == "incomplete":
                    message = "You have no incomplete tasks."
                else:
                    message = "You have no tasks yet. Create one to get started!"
            else:
                if filter_value == "completed":
                    message = f"You have {count} completed task{'s' if count != 1 else ''}."
                elif filter_value == "incomplete":
                    message = f"You have {count} incomplete task{'s' if count != 1 else ''}."
                else:
                    message = f"You have {count} task{'s' if count != 1 else ''} in total."

            logger.info(f"Listed {count} tasks for user_id={user_id} with filter={filter_value}")

            return ToolExecutionResult(
                success=True,
                data={
                    "tasks": tasks_data,
                    "count": count,
                    "filter": filter_value
                },
                message=message
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error listing tasks: {str(e)}")
        return ToolExecutionResult(
            success=False,
            error=f"Failed to list tasks: {str(e)}"
        )
