# Task CRUD API - Backend

FastAPI backend for the Task Manager application with full CRUD operations, filtering, and sorting.

## Tech Stack

- **Python**: 3.11+
- **FastAPI**: 0.104+ (Web framework)
- **SQLModel**: 0.0.14+ (ORM)
- **Alembic**: 1.13.0 (Database migrations)
- **PostgreSQL**: Neon Serverless or local PostgreSQL
- **Pydantic**: 2.x (Data validation)

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── deps.py           # Dependency injection (DB session, auth stub)
│   │   └── routes/
│   │       └── tasks.py      # Task CRUD endpoints
│   ├── core/
│   │   ├── config.py         # Application settings
│   │   └── database.py       # Database connection
│   ├── models/
│   │   ├── user.py           # User model (stub)
│   │   └── task.py           # Task model
│   ├── schemas/
│   │   └── task.py           # Pydantic schemas
│   ├── services/
│   │   └── task_service.py   # Business logic
│   └── main.py               # FastAPI application
├── alembic/
│   ├── versions/
│   │   └── 001_initial.py    # Initial migration
│   └── env.py                # Alembic configuration
├── tests/                     # Test directory (to be implemented)
├── .env                       # Environment variables
├── .env.example               # Environment template
├── alembic.ini                # Alembic configuration
└── requirements.txt           # Python dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# For Neon PostgreSQL (recommended)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# OR for local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_db

APP_NAME=Task CRUD API
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# Authentication (REQUIRED)
BETTER_AUTH_SECRET=<generate-32-char-random-string>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
```

**Generate BETTER_AUTH_SECRET:**
```bash
# Use Python to generate a secure random secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# IMPORTANT: Use the SAME secret in both backend/.env and frontend/.env.local
```

### 3. Run Database Migrations

```bash
# Apply migrations to create tables
python -m alembic upgrade head
```

### 4. Start Development Server

```bash
# Start with auto-reload
uvicorn src.main:app --reload

# Server runs at http://localhost:8000
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user account | No |
| POST | `/api/auth/signin` | Authenticate and receive JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | List tasks with filtering and sorting | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| GET | `/api/tasks/{id}` | Get a single task | Yes |
| PUT | `/api/tasks/{id}` | Update task (replace all fields) | Yes |
| PATCH | `/api/tasks/{id}` | Partially update task | Yes |
| DELETE | `/api/tasks/{id}` | Delete a task | Yes |

### Query Parameters (GET /api/tasks)

- `completed`: Filter by status (true/false/null for all)
- `sort`: Sort field (created_at or updated_at)
- `order`: Sort order (asc or desc)
- `limit`: Maximum number of results
- `offset`: Number of results to skip

### Example Requests

**Sign Up:**
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

**Sign In:**
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Get Current User (requires JWT token):**
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Create Task (requires JWT token):**
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**List Active Tasks:**
```bash
curl "http://localhost:8000/api/tasks?completed=false&sort=created_at&order=desc" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Toggle Completion:**
```bash
curl -X PATCH http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"completed": true}'
```

## API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Schema

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| user_id | INTEGER | Foreign key to users |
| title | VARCHAR(200) | Task title (required) |
| description | VARCHAR(1000) | Task description (optional) |
| completed | BOOLEAN | Completion status |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

**Indexes:**
- `ix_tasks_user_id` - User lookup
- `ix_tasks_completed` - Status filtering
- `ix_tasks_user_id_completed` - Combined user + status
- `ix_tasks_created_at` - Date sorting

## Authentication

**Status**: JWT-based authentication with Better Auth integration

### Authentication Flow

1. **User Registration** (`POST /api/auth/signup`):
   - Validates email format (RFC 5322)
   - Validates password strength (min 8 chars, uppercase, lowercase, number)
   - Hashes password with bcrypt (cost factor 12)
   - Creates user account in database
   - Returns user profile (no token issued)

2. **User Sign In** (`POST /api/auth/signin`):
   - Verifies email and password
   - Creates JWT token with 7-day expiration
   - Token includes: user_id (sub), email, issued_at (iat), expiration (exp)
   - Returns token and user profile

3. **Protected Endpoints**:
   - All `/api/tasks/*` endpoints require JWT authentication
   - Client must include `Authorization: Bearer <token>` header
   - Backend verifies token signature using `BETTER_AUTH_SECRET`
   - Extracts user_id from token and filters all queries by authenticated user
   - Returns 401 Unauthorized for missing, invalid, or expired tokens

### Security Features

- **Stateless Authentication**: No server-side session storage
- **User Data Isolation**: All task queries automatically filtered by authenticated user_id
- **Password Security**: Bcrypt hashing with cost factor 12
- **Token Expiration**: 7-day JWT expiration (configurable via JWT_EXPIRATION_DAYS)
- **Shared Secret**: BETTER_AUTH_SECRET must match between frontend and backend
- **Error Handling**: Generic error messages for invalid credentials (prevents user enumeration)

### Token Structure

```json
{
  "sub": "123",           // User ID
  "email": "user@example.com",
  "iat": 1704067200,      // Issued at timestamp
  "exp": 1704672000,      // Expiration timestamp (7 days)
  "iss": "better-auth"    // Issuer
}
```

### Error Responses

- **401 TOKEN_EXPIRED**: JWT token has expired
- **401 TOKEN_INVALID**: Invalid signature or malformed token
- **401 TOKEN_MISSING**: No Authorization header provided
- **401 INVALID_CREDENTIALS**: Email or password incorrect (generic message)
- **409 EMAIL_EXISTS**: Email already registered during signup

## Development

### Create New Migration

```bash
python -m alembic revision --autogenerate -m "description"
```

### Rollback Migration

```bash
python -m alembic downgrade -1
```

### Run Tests (when implemented)

```bash
pytest
```

## Troubleshooting

### Database Connection Issues

1. **Neon**: Ensure connection string includes `?sslmode=require`
2. **Local PostgreSQL**: Verify PostgreSQL is running and database exists
3. Check `.env` file has correct `DATABASE_URL`

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
python -m alembic downgrade base
python -m alembic upgrade head
```

## Next Steps

1. Implement JWT authentication (Spec 2)
2. Add comprehensive test suite
3. Add API rate limiting
4. Implement pagination metadata
5. Add task categories/tags
6. Deploy to production (Vercel/Railway)
