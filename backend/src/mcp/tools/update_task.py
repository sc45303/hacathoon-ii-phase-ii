"""
Update Task MCP Tool

MCP tool for updating task properties via natural language.
Supports task identification by ID or title and updating multiple fields.
Implements user context injection for security.
"""

import logging
from typing import Union, Optional, Dict, Any
from datetime import datetime
from sqlmodel import Session, select

from ...models.task import Task
from ...core.database import get_session
from ..tool_registry import ToolExecutionResult

logger = logging.getLogger(__name__)


async def update_task(
    task_identifier: Union[int, str],
    updates: Dict[str, Any],
    user_id: int  # Injected by backend, never from LLM
) -> ToolExecutionResult:
    """
    Update an existing task's properties.

    SECURITY: user_id is injected by the backend via MCPToolRegistry.
    The LLM cannot specify or modify the user_id.

    Args:
        task_identifier: Task ID (integer) or task title (string)
        updates: Dictionary of fields to update (title, description, due_date, priority, completed)
        user_id: User ID (injected by backend for security)

    Returns:
        ToolExecutionResult with success status and updated task data
    """
    try:
        # Validate updates dictionary
        if not updates or len(updates) == 0:
            logger.warning("update_task called with empty updates dictionary")
            return ToolExecutionResult(
                success=False,
                error="No updates provided. Please specify at least one field to update."
            )

        # Validate allowed fields
        allowed_fields = ["title", "description", "due_date", "priority", "completed"]
        invalid_fields = [field for field in updates.keys() if field not in allowed_fields]
        if invalid_fields:
            logger.warning(f"update_task called with invalid fields: {invalid_fields}")
            return ToolExecutionResult(
                success=False,
                error=f"Invalid fields: {', '.join(invalid_fields)}. Allowed fields: {', '.join(allowed_fields)}"
            )

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
                logger.warning(f"Task not found for update: {identifier_type}={task_identifier}, user_id={user_id}")
                return ToolExecutionResult(
                    success=False,
                    error=f"Task not found with {identifier_type}: {task_identifier}"
                )

            # Apply updates with validation
            updated_fields = []

            # Update title
            if "title" in updates:
                new_title = updates["title"]
                if not new_title or not new_title.strip():
                    return ToolExecutionResult(
                        success=False,
                        error="Task title cannot be empty"
                    )
                if len(new_title) > 200:
                    return ToolExecutionResult(
                        success=False,
                        error="Task title cannot exceed 200 characters"
                    )
                task.title = new_title.strip()
                updated_fields.append("title")

            # Update description
            if "description" in updates:
                new_description = updates["description"]
                if new_description and len(new_description) > 1000:
                    return ToolExecutionResult(
                        success=False,
                        error="Task description cannot exceed 1000 characters"
                    )
                task.description = new_description.strip() if new_description else None
                updated_fields.append("description")

            # Update due_date
            if "due_date" in updates:
                new_due_date = updates["due_date"]
                if new_due_date:
                    try:
                        task.due_date = datetime.fromisoformat(new_due_date).date()
                    except ValueError:
                        return ToolExecutionResult(
                            success=False,
                            error="Due date must be in ISO 8601 format (YYYY-MM-DD)"
                        )
                else:
                    task.due_date = None
                updated_fields.append("due_date")

            # Update priority
            if "priority" in updates:
                new_priority = updates["priority"]
                valid_priorities = ["low", "medium", "high"]
                if new_priority and new_priority.lower() not in valid_priorities:
                    return ToolExecutionResult(
                        success=False,
                        error=f"Priority must be one of: {', '.join(valid_priorities)}"
                    )
                task.priority = new_priority.lower() if new_priority else "medium"
                updated_fields.append("priority")

            # Update completed status
            if "completed" in updates:
                task.completed = bool(updates["completed"])
                updated_fields.append("completed")

            # Update timestamp
            task.updated_at = datetime.utcnow()

            # Save changes
            db.add(task)
            db.commit()
            db.refresh(task)

            logger.info(f"Task updated successfully: id={task.id}, user_id={user_id}, fields={updated_fields}")

            return ToolExecutionResult(
                success=True,
                data={
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "priority": task.priority,
                    "completed": task.completed,
                    "updated_at": task.updated_at.isoformat()
                },
                message=f"Task '{task.title}' updated successfully. Updated fields: {', '.join(updated_fields)}"
            )

        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        return ToolExecutionResult(
            success=False,
            error=f"Failed to update task: {str(e)}"
        )
