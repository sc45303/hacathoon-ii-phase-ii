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

FastAPI backend for TaskFlow task management application.

## Features

- User authentication with JWT
- Task CRUD operations
- PostgreSQL database with SQLModel ORM
- RESTful API design

## Environment Variables

Configure these in your Space settings:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (generate a secure random string)
- `ALGORITHM`: JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)

## API Documentation

Once deployed, visit `/docs` for interactive API documentation.
