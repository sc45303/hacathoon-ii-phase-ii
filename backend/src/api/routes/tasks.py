"""Task API routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from src.api.deps import get_db, get_current_user
from src.schemas.task import TaskCreate, TaskUpdate, TaskPatch, TaskResponse, TaskListResponse
from src.services.task_service import TaskService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
def get_tasks(
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    sort: str = Query("created_at", description="Sort field (created_at or updated_at)"),
    order: str = Query("desc", description="Sort order (asc or desc)"),
    limit: Optional[int] = Query(None, description="Maximum number of tasks to return"),
    offset: int = Query(0, description="Number of tasks to skip"),
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Get tasks for the current user with filtering and sorting.

    Query Parameters:
        - completed: Filter by completion status (true/false/null for all)
        - sort: Sort field (created_at or updated_at)
        - order: Sort order (asc or desc)
        - limit: Maximum number of tasks to return
        - offset: Number of tasks to skip

    Returns:
        TaskListResponse: List of tasks with total count
    """
    service = TaskService(db)
    tasks = service.get_tasks(
        user_id=current_user_id,
        completed=completed,
        sort=sort,
        order=order,
        limit=limit,
        offset=offset
    )
    return TaskListResponse(tasks=tasks, total=len(tasks))


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Create a new task for the current user.

    Args:
        task_data: Task creation data

    Returns:
        TaskResponse: Created task
    """
    service = TaskService(db)
    task = service.create_task(user_id=current_user_id, task_data=task_data)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Get a single task by ID.

    Args:
        task_id: ID of the task

    Returns:
        TaskResponse: Task details

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    service = TaskService(db)
    task = service.get_task(task_id=task_id, user_id=current_user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Update a task (PUT - replaces all fields).

    Args:
        task_id: ID of the task
        task_data: Task update data

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    service = TaskService(db)
    task = service.update_task(task_id=task_id, user_id=current_user_id, task_data=task_data)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def patch_task(
    task_id: int,
    task_data: TaskPatch,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Partially update a task (PATCH - updates only provided fields).

    Args:
        task_id: ID of the task
        task_data: Task patch data

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    service = TaskService(db)
    task = service.patch_task(task_id=task_id, user_id=current_user_id, task_data=task_data)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    """
    Delete a task.

    Args:
        task_id: ID of the task

    Returns:
        No content (204)

    Raises:
        HTTPException: 404 if task not found or doesn't belong to user
    """
    service = TaskService(db)
    deleted = service.delete_task(task_id=task_id, user_id=current_user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
