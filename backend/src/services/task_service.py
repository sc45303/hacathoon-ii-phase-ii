"""Task service for business logic."""
from datetime import datetime
from typing import Optional
from sqlmodel import Session, select
from src.models.task import Task
from src.schemas.task import TaskCreate, TaskUpdate, TaskPatch


class TaskService:
    """Service for task operations."""

    def __init__(self, db: Session):
        """Initialize task service with database session."""
        self.db = db

    def get_tasks(
        self,
        user_id: int,
        completed: Optional[bool] = None,
        sort: str = "created_at",
        order: str = "desc",
        limit: Optional[int] = None,
        offset: int = 0
    ) -> list[Task]:
        """
        Get tasks for a user with filtering and sorting.

        Args:
            user_id: ID of the user
            completed: Filter by completion status (None = all, True = completed, False = active)
            sort: Sort field ("created_at" or "updated_at")
            order: Sort order ("asc" or "desc")
            limit: Maximum number of tasks to return
            offset: Number of tasks to skip

        Returns:
            List of tasks matching the criteria
        """
        statement = select(Task).where(Task.user_id == user_id)

        # Apply completion filter
        if completed is not None:
            statement = statement.where(Task.completed == completed)

        # Apply sorting
        sort_column = Task.created_at if sort == "created_at" else Task.updated_at
        if order == "asc":
            statement = statement.order_by(sort_column.asc())
        else:
            statement = statement.order_by(sort_column.desc())

        # Apply pagination
        if offset > 0:
            statement = statement.offset(offset)
        if limit is not None:
            statement = statement.limit(limit)

        tasks = self.db.exec(statement).all()
        return list(tasks)

    def create_task(self, user_id: int, task_data: TaskCreate) -> Task:
        """
        Create a new task for a user.

        Args:
            user_id: ID of the user
            task_data: Task creation data

        Returns:
            Created task
        """
        now = datetime.utcnow()
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            completed=False,
            created_at=now,
            updated_at=now
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def get_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """
        Get a single task by ID for a specific user.

        Args:
            task_id: ID of the task
            user_id: ID of the user

        Returns:
            Task if found and belongs to user, None otherwise
        """
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        task = self.db.exec(statement).first()
        return task

    def update_task(self, task_id: int, user_id: int, task_data: TaskUpdate) -> Optional[Task]:
        """
        Update a task (PUT - replaces all fields).

        Args:
            task_id: ID of the task
            user_id: ID of the user
            task_data: Task update data

        Returns:
            Updated task if found and belongs to user, None otherwise
        """
        task = self.get_task(task_id, user_id)
        if not task:
            return None

        task.title = task_data.title
        task.description = task_data.description
        task.completed = task_data.completed
        task.updated_at = datetime.utcnow()

        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def patch_task(self, task_id: int, user_id: int, task_data: TaskPatch) -> Optional[Task]:
        """
        Partially update a task (PATCH - updates only provided fields).

        Args:
            task_id: ID of the task
            user_id: ID of the user
            task_data: Task patch data

        Returns:
            Updated task if found and belongs to user, None otherwise
        """
        task = self.get_task(task_id, user_id)
        if not task:
            return None

        # Update only provided fields
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        if task_data.completed is not None:
            task.completed = task_data.completed

        task.updated_at = datetime.utcnow()

        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, task_id: int, user_id: int) -> bool:
        """
        Delete a task.

        Args:
            task_id: ID of the task
            user_id: ID of the user

        Returns:
            True if task was deleted, False if not found or doesn't belong to user
        """
        task = self.get_task(task_id, user_id)
        if not task:
            return False

        self.db.delete(task)
        self.db.commit()
        return True
