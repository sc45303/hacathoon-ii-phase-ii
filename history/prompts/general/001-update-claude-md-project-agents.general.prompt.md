---
id: "001"
title: "Update CLAUDE.md with project agents"
stage: "general"
date: "2026-01-08"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "master"
user: "user"
command: "Update CLAUDE.md with project-specific agent usage guidelines"
labels: ["configuration","documentation","project-setup"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "CLAUDE.md"
tests:
  - "null"
---

## Prompt

Update the "claude.md" file based on:

- Use Auth Agent for authentication
- Use Frontend Agent for frontend development (e.g., Next.js)
- Use DB Agent for database design and operations
- Use Backend Agent for FastAPI development

Below are my project requirements:

Phase II: Todo Full-Stack Web Application
Basic Level Functionality
Objective: Using Claude Code and Spec-Kit Plus transform the console app into a modern multi-user web application with persistent storage.

Technology Stack:
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth

Better Auth can be configured to issue JWT (JSON Web Token) tokens when users log in. These tokens are self-contained credentials that include user information and can be verified by any service that knows the secret key.

## Response snapshot

Updated CLAUDE.md with:
- New "Project-Specific Agent Usage Guidelines" section
- Table mapping task types to specialized agents (Auth, Frontend, DB, Backend)
- Technology Stack reference table
- Authentication flow documentation (JWT token flow from frontend to backend)

## Outcome

- ✅ Impact: Project configuration updated to guide agent selection for different task types
- 🧪 Tests: null
- 📁 Files: CLAUDE.md (modified)
- 🔁 Next prompts: null
- 🧠 Reflection: null

## Evaluation notes (flywheel)

- Failure modes observed: null
- Graders run and results (PASS/FAIL): null
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
