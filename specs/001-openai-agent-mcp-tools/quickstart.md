# Quickstart Guide: OpenAI Agent MCP Tools

**Feature**: 001-openai-agent-mcp-tools
**Date**: 2026-01-14
**Purpose**: Local development setup for testing AI agent with MCP tools

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** installed
- **Neon PostgreSQL database** accessible (connection string ready)
- **API keys** for at least one LLM provider:
  - Google Gemini API key (recommended, free tier)
  - OpenRouter API key (optional, fallback)
  - Cohere API key (optional, not recommended)
- **Git** installed
- **Node.js 18+** (for frontend, if testing end-to-end)

---

## Installation

### 1. Clone Repository (if not already done)

```bash
git clone <repository-url>
cd evolution-of-todo/phase-2-full-stack-web-app
```

### 2. Checkout Feature Branch

```bash
git checkout 001-openai-agent-mcp-tools
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Expected new dependencies** (added by this feature):
- `mcp` - Official MCP SDK
- `cohere` - Cohere SDK (if using Cohere provider)
- `openai` - OpenAI SDK (for agent compatibility, even if not using OpenAI)

### 4. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env
```

Add the following configuration to `.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here

# LLM Provider Configuration
LLM_PROVIDER=gemini                    # Options: gemini, openrouter, cohere
FALLBACK_PROVIDER=openrouter           # Optional fallback provider

# API Keys (provide at least one)
GEMINI_API_KEY=your-gemini-api-key-here
OPENROUTER_API_KEY=your-openrouter-key-here  # Optional
COHERE_API_KEY=your-cohere-key-here          # Optional

# Agent Configuration (optional, defaults provided)
AGENT_TEMPERATURE=0.7
AGENT_MAX_TOKENS=8192
CONVERSATION_MAX_MESSAGES=20
CONVERSATION_MAX_TOKENS=8000
```

**How to get API keys**:

- **Gemini**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) (free, no credit card required)
- **OpenRouter**: Visit [OpenRouter](https://openrouter.ai/) (free models available)
- **Cohere**: Visit [Cohere](https://cohere.com/) (trial only, not recommended)

### 5. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

**Expected output**:
```
INFO  [alembic.runtime.migration] Running upgrade -> 20260114_1044, add conversation and message tables
INFO  [alembic.runtime.migration] Running upgrade 20260114_1044 -> 20260114_1115, add metadata to message
```

---

## Running the Server

### Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify server is running**:
```bash
curl http://localhost:8000/health
```

Expected response: `{"status": "healthy"}`

---

## Testing the Agent

### 1. Create a Test User

First, create a test user via the auth endpoint:

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Expected response**:
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** - you'll need it for authenticated requests.

### 2. Test Chat Endpoint (Without Agent)

Test basic chat functionality:

```bash
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Hello, can you help me manage my tasks?"
  }'
```

**Expected response**:
```json
{
  "message": "Hello! I'm your AI task assistant. I can help you create, view, complete, and manage your tasks. What would you like to do?",
  "conversation_id": 1
}
```

### 3. Test Task Creation via Natural Language

```bash
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Add a task to buy groceries",
    "conversation_id": 1
  }'
```

**Expected response**:
```json
{
  "message": "I've created a new task: 'Buy groceries'. Your task has been added to your list!",
  "conversation_id": 1
}
```

### 4. Test Task Listing

```bash
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Show me my tasks",
    "conversation_id": 1
  }'
```

**Expected response**:
```json
{
  "message": "You have 1 task:\n\n1. Buy groceries (incomplete)\n\nWould you like to complete any of these tasks?",
  "conversation_id": 1
}
```

### 5. Test Task Completion

```bash
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Mark the groceries task as complete",
    "conversation_id": 1
  }'
```

**Expected response**:
```json
{
  "message": "Great! I've marked 'Buy groceries' as completed. Well done!",
  "conversation_id": 1
}
```

---

## Testing MCP Tools Directly

### Test add_task Tool

```bash
# This requires accessing the MCP server directly (advanced)
# For now, test via the agent as shown above
```

### Test list_tasks Tool

```bash
# Access via agent chat interface
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "List all my incomplete tasks"
  }'
```

### Test complete_task Tool

```bash
# Access via agent chat interface
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Complete task 1"
  }'
```

### Test delete_task Tool

```bash
# Access via agent chat interface
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Delete the groceries task"
  }'
```

### Test update_task Tool

```bash
# Access via agent chat interface
curl -X POST http://localhost:8000/api/1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "Change the groceries task to buy groceries and milk"
  }'
```

---

## Troubleshooting

### Issue: "Rate limit exceeded"

**Cause**: Gemini free tier has 15 requests/minute limit

**Solution**:
1. Wait 1 minute before retrying
2. Configure fallback provider in `.env`:
   ```env
   FALLBACK_PROVIDER=openrouter
   OPENROUTER_API_KEY=your-key-here
   ```

### Issue: "Tool not found"

**Cause**: MCP tools not registered properly

**Solution**:
1. Check MCP server logs for errors
2. Verify tool registration in `backend/src/mcp/server.py`
3. Restart server: `uvicorn src.main:app --reload`

### Issue: "Unauthorized" (401 error)

**Cause**: Invalid or expired JWT token

**Solution**:
1. Get a new token via `/api/auth/signin`
2. Ensure token is included in `Authorization: Bearer <token>` header
3. Check `BETTER_AUTH_SECRET` matches between frontend and backend

### Issue: "Task not found"

**Cause**: Task doesn't exist or belongs to different user

**Solution**:
1. List tasks first: "Show me my tasks"
2. Use exact task ID or title
3. Verify user_id in request matches authenticated user

### Issue: "Database connection failed"

**Cause**: Invalid `DATABASE_URL` or database not accessible

**Solution**:
1. Verify `DATABASE_URL` in `.env`
2. Test connection: `psql $DATABASE_URL`
3. Check Neon dashboard for database status
4. Ensure IP is whitelisted in Neon settings

### Issue: "Agent returns generic response, doesn't use tools"

**Cause**: LLM provider doesn't support function calling or tools not registered

**Solution**:
1. Verify provider supports function calling (Gemini does)
2. Check tool definitions in agent logs
3. Test with explicit tool request: "Use the add_task tool to create a task"

---

## Viewing Logs

### Backend Logs

```bash
# View real-time logs
tail -f backend/logs/app.log

# View last 100 lines
tail -n 100 backend/logs/app.log

# Search for errors
grep ERROR backend/logs/app.log
```

### Database Queries

```bash
# Connect to database
psql $DATABASE_URL

# View conversations
SELECT * FROM conversation WHERE user_id = 1;

# View messages
SELECT * FROM message WHERE conversation_id = 1 ORDER BY created_at;

# View tasks
SELECT * FROM tasks WHERE user_id = 1;
```

---

## Testing with Frontend (Optional)

If you want to test the full stack with the frontend UI:

### 1. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 2. Access UI

Open browser to `http://localhost:3000`

### 3. Sign In

Use the test user credentials:
- Email: `test@example.com`
- Password: `testpassword123`

### 4. Navigate to Chat

Click "Chat" in the navigation menu

### 5. Test Natural Language Commands

Try these commands:
- "Add a task to buy groceries"
- "Show me my tasks"
- "Mark task 1 as complete"
- "Delete the groceries task"

---

## Next Steps

After verifying the agent works locally:

1. **Run Tests**: `pytest backend/tests/`
2. **Check Coverage**: `pytest --cov=src backend/tests/`
3. **Review Logs**: Check for any errors or warnings
4. **Test Edge Cases**: Try ambiguous requests, invalid inputs
5. **Performance Testing**: Test with multiple concurrent requests

---

## Development Workflow

### Making Changes

1. **Modify Code**: Edit files in `backend/src/`
2. **Server Auto-Reloads**: Uvicorn detects changes and reloads
3. **Test Changes**: Use curl or frontend to test
4. **Check Logs**: Monitor logs for errors
5. **Commit Changes**: `git add . && git commit -m "description"`

### Adding New MCP Tools

1. Create tool file: `backend/src/mcp/tools/new_tool.py`
2. Define tool function with decorator: `@mcp_server.tool()`
3. Register tool in `backend/src/mcp/tool_registry.py`
4. Test tool via agent chat interface
5. Add tests: `backend/tests/mcp/test_new_tool.py`

### Debugging Agent Behavior

1. **Enable Debug Logging**: Set `LOG_LEVEL=DEBUG` in `.env`
2. **View Tool Calls**: Check message metadata in database
3. **Test Tool Directly**: Call tool function in Python shell
4. **Check Provider Logs**: Review Gemini API logs
5. **Validate Tool Schemas**: Ensure JSON schemas are correct

---

## Useful Commands

```bash
# Start backend with debug logging
LOG_LEVEL=DEBUG uvicorn src.main:app --reload

# Run specific test
pytest backend/tests/mcp/test_add_task.py -v

# Check database schema
psql $DATABASE_URL -c "\d tasks"

# View recent messages
psql $DATABASE_URL -c "SELECT role, content FROM message ORDER BY created_at DESC LIMIT 10;"

# Clear conversation history (for testing)
psql $DATABASE_URL -c "DELETE FROM message WHERE conversation_id = 1;"

# Reset database (CAUTION: deletes all data)
alembic downgrade base
alembic upgrade head
```

---

## Support

If you encounter issues not covered in this guide:

1. Check the [research.md](./research.md) for implementation details
2. Review the [data-model.md](./data-model.md) for architecture
3. Inspect the [plan.md](./plan.md) for design decisions
4. Check backend logs for error messages
5. Verify environment variables are set correctly

---

## Summary

You should now have:
- ✅ Backend server running on `http://localhost:8000`
- ✅ Database migrations applied
- ✅ Test user created with JWT token
- ✅ Agent responding to natural language commands
- ✅ MCP tools executing task operations
- ✅ Conversation history persisting in database

**Ready for implementation!** Proceed to `/sp.tasks` to generate implementation tasks.
