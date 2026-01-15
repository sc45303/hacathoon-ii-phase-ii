---
title: TaskFlow API
emoji: ✅
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
---

# TaskFlow Backend API

FastAPI backend for TaskFlow task management application with AI chatbot integration.

## Features

- User authentication with JWT and Better Auth
- Task CRUD operations
- **AI Chatbot Assistant** - Conversational AI for task management
- PostgreSQL database with SQLModel ORM
- RESTful API design
- Multi-turn conversation support with context management
- Intent recognition for todo-related requests

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **ORM**: SQLModel 0.0.14
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: Better Auth + JWT
- **AI Provider**: Google Gemini (gemini-pro)
- **Migrations**: Alembic 1.13.0

## Environment Variables

Configure these in your `.env` file:

### Database
- `DATABASE_URL`: PostgreSQL connection string (Neon or local)

### Application
- `APP_NAME`: Application name (default: "Task CRUD API")
- `DEBUG`: Debug mode (default: True)
- `CORS_ORIGINS`: Allowed CORS origins (default: "http://localhost:3000")

### Authentication
- `BETTER_AUTH_SECRET`: Secret key for Better Auth (required)
- `JWT_ALGORITHM`: JWT algorithm (default: "HS256")
- `JWT_EXPIRATION_DAYS`: Token expiration in days (default: 7)

### AI Provider Configuration
- `AI_PROVIDER`: AI provider to use (default: "gemini")
- `GEMINI_API_KEY`: Google Gemini API key (required if using Gemini)
- `OPENROUTER_API_KEY`: OpenRouter API key (optional)
- `COHERE_API_KEY`: Cohere API key (optional)

### Conversation Settings
- `MAX_CONVERSATION_MESSAGES`: Maximum messages to keep in history (default: 20)
- `MAX_CONVERSATION_TOKENS`: Maximum tokens to keep in history (default: 8000)

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db

# Application
APP_NAME=Task CRUD API
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# AI Provider
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Conversation Settings
MAX_CONVERSATION_MESSAGES=20
MAX_CONVERSATION_TOKENS=8000
```

### 3. Run Database Migrations

```bash
alembic upgrade head
```

### 4. Start the Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/{user_id}/tasks` - Get all tasks for user
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{task_id}` - Get specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

### AI Chat (New in Phase 1)
- `POST /api/{user_id}/chat` - Send message to AI assistant

#### Chat Request Body
```json
{
  "message": "Can you help me organize my tasks?",
  "conversation_id": 123,  // Optional: null for new conversation
  "temperature": 0.7       // Optional: 0.0 to 1.0
}
```

#### Chat Response
```json
{
  "conversation_id": 123,
  "message": "I'd be happy to help you organize your tasks!",
  "role": "assistant",
  "timestamp": "2026-01-14T10:30:00Z",
  "token_count": 25,
  "model": "gemini-pro"
}
```

## AI Chatbot Features

### Phase 1 (Current)
- ✅ Natural conversation with AI assistant
- ✅ Multi-turn conversations with context retention
- ✅ Intent recognition for todo-related requests
- ✅ Conversation history persistence
- ✅ Automatic history trimming (20 messages / 8000 tokens)
- ✅ Free-tier AI provider support (Gemini)

### Phase 2 (Coming Soon)
- 🔄 MCP tools for task CRUD operations
- 🔄 AI can directly create, update, and delete tasks
- 🔄 Natural language task management

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `name`: User's name
- `password`: Hashed password
- `created_at`, `updated_at`: Timestamps

### Tasks Table
- `id`: Primary key
- `user_id`: Foreign key to users
- `title`: Task title
- `description`: Task description
- `completed`: Boolean status
- `created_at`, `updated_at`: Timestamps

### Conversation Table (New)
- `id`: Primary key
- `user_id`: Foreign key to users
- `title`: Conversation title
- `created_at`, `updated_at`: Timestamps

### Message Table (New)
- `id`: Primary key
- `conversation_id`: Foreign key to conversation
- `role`: "user" or "assistant"
- `content`: Message text
- `timestamp`: Message timestamp
- `token_count`: Token count for the message

## Development

### Running Tests
```bash
pytest
```

### Database Migrations

Create a new migration:
```bash
alembic revision -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback migration:
```bash
alembic downgrade -1
```

## License

MIT License
