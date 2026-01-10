# Quickstart Guide: Task CRUD Operations

**Feature**: Task CRUD Operations
**Date**: 2026-01-08
**Status**: Complete

## Overview

This guide provides step-by-step instructions for setting up and running the Task CRUD feature locally. Follow these instructions to get the backend API and frontend UI running on your development machine.

## Prerequisites

### Required Software

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **PostgreSQL**: Neon Serverless PostgreSQL account (or local PostgreSQL 14+)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Accounts Needed

- **Neon Account**: Sign up at https://neon.tech for serverless PostgreSQL
- **GitHub Account**: For version control (optional)

## Project Structure

```
phase-2-full-stack-web-app/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
└── specs/            # Feature specifications
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Python Virtual Environment

**Windows**:
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt** should contain:
```
fastapi==0.104.1
sqlmodel==0.0.14
pydantic==2.5.0
uvicorn[standard]==0.24.0
alembic==1.13.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pytest==7.4.3
httpx==0.25.2
```

### 4. Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host/database

# Neon PostgreSQL Example:
# DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Application Settings
APP_NAME=Task CRUD API
DEBUG=True
CORS_ORIGINS=http://localhost:3000

# Authentication (Placeholder for Spec 2)
# JWT_SECRET=your-secret-key-here
# JWT_ALGORITHM=HS256
# JWT_EXPIRATION_MINUTES=1440
```

### 5. Set Up Database

**Initialize Alembic** (if not already done):
```bash
alembic init alembic
```

**Create initial migration**:
```bash
alembic revision --autogenerate -m "Create tasks table"
```

**Apply migrations**:
```bash
alembic upgrade head
```

### 6. Run Backend Server

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend is running**:
- Open browser: http://localhost:8000/docs
- You should see the FastAPI Swagger UI with task endpoints

### 7. Test Backend API

**Create a test user** (temporary, until Spec 2):
```bash
# Using Python shell
python
>>> from src.core.database import engine
>>> from src.models.user import User
>>> from sqlmodel import Session
>>> with Session(engine) as session:
...     user = User(email="test@example.com", name="Test User")
...     session.add(user)
...     session.commit()
...     print(f"Created user with ID: {user.id}")
```

**Test task creation**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "Testing API"}'
```

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

**package.json** should contain:
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.10.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### 3. Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (Placeholder for Spec 2)
# NEXT_PUBLIC_AUTH_URL=http://localhost:8000/auth
```

### 4. Configure Tailwind CSS

**tailwind.config.ts**:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
```

### 5. Run Frontend Development Server

```bash
npm run dev
```

**Verify frontend is running**:
- Open browser: http://localhost:3000
- You should see the task list page

### 6. Test Frontend

1. **View Tasks**: Navigate to http://localhost:3000
2. **Create Task**: Click "Add Task" button, fill form, submit
3. **Edit Task**: Click edit icon on a task, modify, save
4. **Complete Task**: Click checkbox to toggle completion
5. **Delete Task**: Click delete icon, confirm deletion
6. **Filter Tasks**: Use filter buttons (All/Active/Completed)

## Development Workflow

### Running Both Servers Concurrently

**Terminal 1 (Backend)**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Making Changes

1. **Backend Changes**:
   - Edit files in `backend/src/`
   - FastAPI auto-reloads on file changes
   - Check http://localhost:8000/docs for updated API

2. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Next.js auto-reloads on file changes
   - Check browser for updates (hot reload)

3. **Database Changes**:
   - Modify SQLModel models in `backend/src/models/`
   - Generate migration: `alembic revision --autogenerate -m "description"`
   - Apply migration: `alembic upgrade head`

## Testing

### Backend Tests

```bash
cd backend
pytest
```

**Run specific test file**:
```bash
pytest tests/test_task_api.py
```

**Run with coverage**:
```bash
pytest --cov=src tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

**Run specific test**:
```bash
npm test -- TaskList.test.tsx
```

## Troubleshooting

### Backend Issues

**Database connection error**:
- Verify `DATABASE_URL` in `.env` is correct
- Check Neon dashboard for connection string
- Ensure database exists and is accessible

**Import errors**:
- Verify virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

**Port already in use**:
- Change port: `uvicorn src.main:app --reload --port 8001`
- Or kill process using port 8000

### Frontend Issues

**Module not found**:
- Delete `node_modules/` and `.next/`
- Reinstall: `npm install`

**API connection error**:
- Verify backend is running on http://localhost:8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

**Port already in use**:
- Next.js will automatically try port 3001, 3002, etc.
- Or specify port: `npm run dev -- -p 3001`

### Database Issues

**Migration conflicts**:
- Check `alembic/versions/` for conflicting migrations
- Downgrade: `alembic downgrade -1`
- Delete conflicting migration file
- Regenerate: `alembic revision --autogenerate -m "description"`

**Data not persisting**:
- Check database connection
- Verify migrations applied: `alembic current`
- Check for transaction rollbacks in logs

## API Documentation

### Swagger UI (Interactive)

http://localhost:8000/docs

### ReDoc (Alternative)

http://localhost:8000/redoc

### OpenAPI JSON

http://localhost:8000/openapi.json

## Database Management

### View Database Contents

**Using psql** (if local PostgreSQL):
```bash
psql -d your_database
\dt  # List tables
SELECT * FROM tasks;
```

**Using Neon Console**:
1. Log in to https://console.neon.tech
2. Select your project
3. Go to "SQL Editor"
4. Run queries

### Reset Database

**Drop all tables and recreate**:
```bash
alembic downgrade base
alembic upgrade head
```

**Or manually**:
```sql
DROP TABLE tasks CASCADE;
DROP TABLE users CASCADE;
```

Then run migrations again.

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host/db |
| APP_NAME | Application name | Task CRUD API |
| DEBUG | Enable debug mode | True |
| CORS_ORIGINS | Allowed CORS origins | http://localhost:3000 |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:8000 |

## Next Steps

1. **Implement Authentication** (Spec 2):
   - Add Better Auth integration
   - Implement JWT token generation/validation
   - Add user registration and login

2. **Add Tests**:
   - Write backend API tests
   - Write frontend component tests
   - Add E2E tests with Playwright

3. **Deploy to Production**:
   - Set up CI/CD pipeline
   - Deploy backend to cloud provider
   - Deploy frontend to Vercel/Netlify
   - Configure production database

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **Next.js Documentation**: https://nextjs.org/docs
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Neon Documentation**: https://neon.tech/docs

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the specification: `specs/001-task-crud/spec.md`
3. Check API contracts: `specs/001-task-crud/contracts/`
4. Review data model: `specs/001-task-crud/data-model.md`

## Summary

You should now have:
- ✅ Backend API running on http://localhost:8000
- ✅ Frontend UI running on http://localhost:3000
- ✅ Database configured and migrated
- ✅ Ability to create, view, update, delete, and complete tasks

**Ready for**: Implementation phase (`/sp.tasks` to generate task list, then `/sp.implement` to execute)
