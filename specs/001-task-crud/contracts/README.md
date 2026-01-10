# API Contracts: Task CRUD Operations

**Feature**: Task CRUD Operations
**Date**: 2026-01-08
**Status**: Complete

## Overview

This directory contains the API contract specifications for the Task CRUD feature. The contracts define the REST API endpoints, request/response formats, validation rules, and error handling.

## Files

- **tasks-api.yaml**: OpenAPI 3.1.0 specification for all task endpoints

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | List all tasks for authenticated user | Yes (JWT) |
| POST | `/api/tasks` | Create a new task | Yes (JWT) |
| GET | `/api/tasks/{task_id}` | Get a specific task | Yes (JWT) |
| PUT | `/api/tasks/{task_id}` | Update a task (full replacement) | Yes (JWT) |
| PATCH | `/api/tasks/{task_id}` | Partially update a task | Yes (JWT) |
| DELETE | `/api/tasks/{task_id}` | Delete a task | Yes (JWT) |

## Authentication

All endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

**Note**: JWT token generation and validation will be implemented in Spec 2 (Authentication feature). For Spec 1 implementation, endpoints will accept a placeholder user_id parameter.

## Request/Response Formats

### TaskCreate (POST /api/tasks)

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "user_id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-08T10:00:00Z",
  "updated_at": "2026-01-08T10:00:00Z"
}
```

### TaskUpdate (PUT /api/tasks/{task_id})

**Request Body**:
```json
{
  "title": "Buy groceries and milk",
  "description": "Updated description",
  "completed": false
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "user_id": 42,
  "title": "Buy groceries and milk",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-08T10:00:00Z",
  "updated_at": "2026-01-08T10:15:00Z"
}
```

### TaskPatch (PATCH /api/tasks/{task_id})

**Request Body** (partial update):
```json
{
  "completed": true
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "user_id": 42,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-08T10:00:00Z",
  "updated_at": "2026-01-08T10:20:00Z"
}
```

### TaskListResponse (GET /api/tasks)

**Query Parameters**:
- `completed` (boolean, optional): Filter by completion status
- `sort` (string, optional): Sort order (created_at_desc, created_at_asc)
- `limit` (integer, optional): Maximum number of tasks (default: 50, max: 100)
- `offset` (integer, optional): Number of tasks to skip (default: 0)

**Response (200 OK)**:
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 42,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-08T10:00:00Z",
      "updated_at": "2026-01-08T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": 42,
      "title": "Finish project report",
      "description": null,
      "completed": true,
      "created_at": "2026-01-07T15:30:00Z",
      "updated_at": "2026-01-08T09:00:00Z"
    }
  ],
  "total": 2
}
```

## Error Responses

### 400 Bad Request (Validation Error)

```json
{
  "detail": "Validation error",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "title": [
      "Title must be between 1 and 200 characters"
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "detail": "Missing or invalid authentication token",
  "error_code": "UNAUTHORIZED"
}
```

### 404 Not Found

```json
{
  "detail": "Task not found",
  "error_code": "TASK_NOT_FOUND"
}
```

### 500 Internal Server Error

```json
{
  "detail": "An unexpected error occurred",
  "error_code": "INTERNAL_SERVER_ERROR"
}
```

## Validation Rules

### Title
- **Required**: Yes
- **Min Length**: 1 character
- **Max Length**: 200 characters
- **Type**: String

### Description
- **Required**: No
- **Max Length**: 1000 characters
- **Type**: String or null

### Completed
- **Required**: Yes (for PUT), No (for PATCH)
- **Type**: Boolean
- **Default**: false (on creation)

## Data Isolation

All endpoints enforce user data isolation:
- Tasks are filtered by authenticated user ID
- Users can only access their own tasks
- Attempting to access another user's task returns 404 (not 403, to avoid information leakage)

## Filtering and Sorting

### Filter by Completion Status

**Get active tasks**:
```
GET /api/tasks?completed=false
```

**Get completed tasks**:
```
GET /api/tasks?completed=true
```

**Get all tasks** (no filter):
```
GET /api/tasks
```

### Sort by Creation Date

**Newest first** (default):
```
GET /api/tasks?sort=created_at_desc
```

**Oldest first**:
```
GET /api/tasks?sort=created_at_asc
```

### Pagination

**First page** (50 tasks):
```
GET /api/tasks?limit=50&offset=0
```

**Second page**:
```
GET /api/tasks?limit=50&offset=50
```

## Testing the API

### Using cURL

**Create a task**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**List tasks**:
```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer <jwt_token>"
```

**Update a task**:
```bash
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"title": "Buy groceries and milk", "description": "Updated", "completed": false}'
```

**Toggle completion**:
```bash
curl -X PATCH http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"completed": true}'
```

**Delete a task**:
```bash
curl -X DELETE http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer <jwt_token>"
```

### Using Swagger UI

FastAPI automatically generates interactive API documentation:

1. Start the backend server: `uvicorn main:app --reload`
2. Open browser: `http://localhost:8000/docs`
3. Use the interactive interface to test endpoints

## Implementation Notes

### Backend (FastAPI)

The OpenAPI specification in `tasks-api.yaml` should be used to:
1. Validate implementation matches contract
2. Generate API documentation
3. Guide Pydantic schema creation
4. Define route handlers

### Frontend (Next.js)

The API contracts should be used to:
1. Create TypeScript interfaces for API responses
2. Implement API client functions in `lib/api.ts`
3. Handle error responses consistently
4. Validate request data before sending

### Testing

The contracts should be used to:
1. Write contract tests (verify API matches specification)
2. Generate test fixtures
3. Validate request/response formats
4. Test error handling

## Contract Validation

To validate the OpenAPI specification:

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate specification
swagger-cli validate tasks-api.yaml
```

## Version History

- **v1.0.0** (2026-01-08): Initial API contract for Task CRUD operations

## References

- OpenAPI Specification: https://spec.openapis.org/oas/v3.1.0
- FastAPI OpenAPI Support: https://fastapi.tiangolo.com/tutorial/metadata/
- Pydantic Validation: https://docs.pydantic.dev/latest/

## Next Steps

1. Implement backend API routes following this contract
2. Create Pydantic schemas matching request/response formats
3. Implement frontend API client using TypeScript interfaces
4. Write contract tests to validate implementation
5. Generate API documentation from OpenAPI spec
