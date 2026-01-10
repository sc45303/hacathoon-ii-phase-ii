"""Tests for Task API endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from src.models.user import User
from src.models.task import Task


class TestTaskEndpoints:
    """Test suite for task CRUD operations."""

    def test_create_task(self, client: TestClient, test_user: User):
        """Test creating a new task."""
        response = client.post(
            "/api/tasks",
            json={"title": "New Task", "description": "New Description"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "New Task"
        assert data["description"] == "New Description"
        assert data["completed"] is False
        assert data["user_id"] == test_user.id
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_without_description(self, client: TestClient, test_user: User):
        """Test creating a task without description."""
        response = client.post(
            "/api/tasks",
            json={"title": "Task Without Description"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Task Without Description"
        assert data["description"] is None

    def test_create_task_invalid_data(self, client: TestClient):
        """Test creating a task with invalid data."""
        response = client.post(
            "/api/tasks",
            json={"description": "Missing title"}
        )
        assert response.status_code == 422

    def test_get_tasks(self, client: TestClient, test_task: Task):
        """Test getting all tasks."""
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["tasks"]) >= 1

    def test_get_tasks_empty(self, client: TestClient, test_user: User):
        """Test getting tasks when none exist."""
        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert data["tasks"] == []
        assert data["total"] == 0

    def test_get_tasks_filter_completed(self, client: TestClient, session: Session, test_user: User):
        """Test filtering tasks by completion status."""
        # Create completed and active tasks
        completed_task = Task(
            user_id=test_user.id,
            title="Completed Task",
            completed=True
        )
        active_task = Task(
            user_id=test_user.id,
            title="Active Task",
            completed=False
        )
        session.add(completed_task)
        session.add(active_task)
        session.commit()

        # Test filter for completed tasks
        response = client.get("/api/tasks?completed=true")
        assert response.status_code == 200
        data = response.json()
        assert all(task["completed"] for task in data["tasks"])

        # Test filter for active tasks
        response = client.get("/api/tasks?completed=false")
        assert response.status_code == 200
        data = response.json()
        assert all(not task["completed"] for task in data["tasks"])

    def test_get_tasks_sort_order(self, client: TestClient, session: Session, test_user: User):
        """Test sorting tasks."""
        # Create multiple tasks
        for i in range(3):
            task = Task(
                user_id=test_user.id,
                title=f"Task {i}",
                completed=False
            )
            session.add(task)
        session.commit()

        # Test descending order (newest first)
        response = client.get("/api/tasks?sort=created_at&order=desc")
        assert response.status_code == 200
        data = response.json()
        tasks = data["tasks"]
        assert len(tasks) >= 3
        # Verify descending order
        for i in range(len(tasks) - 1):
            assert tasks[i]["created_at"] >= tasks[i + 1]["created_at"]

        # Test ascending order (oldest first)
        response = client.get("/api/tasks?sort=created_at&order=asc")
        assert response.status_code == 200
        data = response.json()
        tasks = data["tasks"]
        # Verify ascending order
        for i in range(len(tasks) - 1):
            assert tasks[i]["created_at"] <= tasks[i + 1]["created_at"]

    def test_get_single_task(self, client: TestClient, test_task: Task):
        """Test getting a single task by ID."""
        response = client.get(f"/api/tasks/{test_task.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_task.id
        assert data["title"] == test_task.title

    def test_get_nonexistent_task(self, client: TestClient):
        """Test getting a task that doesn't exist."""
        response = client.get("/api/tasks/99999")
        assert response.status_code == 404

    def test_update_task(self, client: TestClient, test_task: Task):
        """Test updating a task with PUT."""
        response = client.put(
            f"/api/tasks/{test_task.id}",
            json={
                "title": "Updated Title",
                "description": "Updated Description",
                "completed": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["description"] == "Updated Description"
        assert data["completed"] is True

    def test_update_nonexistent_task(self, client: TestClient):
        """Test updating a task that doesn't exist."""
        response = client.put(
            "/api/tasks/99999",
            json={
                "title": "Updated",
                "description": "Updated",
                "completed": True
            }
        )
        assert response.status_code == 404

    def test_patch_task_title(self, client: TestClient, test_task: Task):
        """Test partially updating task title."""
        original_description = test_task.description
        response = client.patch(
            f"/api/tasks/{test_task.id}",
            json={"title": "Patched Title"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Patched Title"
        assert data["description"] == original_description
        assert data["completed"] == test_task.completed

    def test_patch_task_completion(self, client: TestClient, test_task: Task):
        """Test toggling task completion status."""
        response = client.patch(
            f"/api/tasks/{test_task.id}",
            json={"completed": True}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] is True
        assert data["title"] == test_task.title

    def test_patch_nonexistent_task(self, client: TestClient):
        """Test patching a task that doesn't exist."""
        response = client.patch(
            "/api/tasks/99999",
            json={"completed": True}
        )
        assert response.status_code == 404

    def test_delete_task(self, client: TestClient, test_task: Task):
        """Test deleting a task."""
        task_id = test_task.id
        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 204

        # Verify task is deleted
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 404

    def test_delete_nonexistent_task(self, client: TestClient):
        """Test deleting a task that doesn't exist."""
        response = client.delete("/api/tasks/99999")
        assert response.status_code == 404

    def test_pagination(self, client: TestClient, session: Session, test_user: User):
        """Test pagination with limit and offset."""
        # Create 10 tasks
        for i in range(10):
            task = Task(
                user_id=test_user.id,
                title=f"Task {i}",
                completed=False
            )
            session.add(task)
        session.commit()

        # Test limit
        response = client.get("/api/tasks?limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 5

        # Test offset
        response = client.get("/api/tasks?limit=5&offset=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 5

    def test_task_timestamps(self, client: TestClient, test_task: Task):
        """Test that timestamps are properly set and updated."""
        # Get initial timestamps
        response = client.get(f"/api/tasks/{test_task.id}")
        initial_data = response.json()
        initial_updated_at = initial_data["updated_at"]

        # Update task
        response = client.patch(
            f"/api/tasks/{test_task.id}",
            json={"title": "Updated Title"}
        )
        assert response.status_code == 200
        updated_data = response.json()

        # Verify updated_at changed
        assert updated_data["updated_at"] >= initial_updated_at
        assert updated_data["created_at"] == initial_data["created_at"]
