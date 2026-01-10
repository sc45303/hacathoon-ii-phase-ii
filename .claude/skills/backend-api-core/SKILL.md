---
name: backend-api-core
description: Build backend APIs by generating routes, handling requests and responses, and connecting to databases.
---

# Backend API Core Skill

## Instructions

1. **Project setup**

   - Initialize backend framework (FastAPI / Express / Django)
   - Configure environment variables
   - Create a modular folder structure (routes, services, models)

2. **Routing**

   - Define RESTful routes (GET, POST, PUT, DELETE)
   - Version APIs (e.g. `/api/v1`)
   - Organize routes by feature/module

3. **Request & Response Handling**

   - Parse request body, query params, and headers
   - Validate input data
   - Return structured JSON responses
   - Handle errors using appropriate HTTP status codes

4. **Database Connection**
   - Configure database connection (PostgreSQL / MySQL / MongoDB)
   - Use ORM/ODM (SQLAlchemy, Prisma, Mongoose)
   - Define models and schemas
   - Perform CRUD operations

## Best Practices

- Follow REST API standards
- Use async operations where supported
- Centralize error and exception handling
- Keep business logic separate from routing
- Secure secrets using environment variables

## Example Structure

### FastAPI Example

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    email: str

@app.post("/api/v1/users")
async def create_user(user: User):
    return {
        "status": "success",
        "data": user
    }
```
