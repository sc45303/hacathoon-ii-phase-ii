<!--
Sync Impact Report:
- Version: Initial → 1.0.0
- Rationale: Initial constitution creation for Phase II Todo Full-Stack Web Application
- Modified Principles: N/A (initial creation)
- Added Sections: Core Principles (5), Key Standards, Constraints, Success Criteria, Governance
- Removed Sections: N/A
- Templates Status:
  ✅ spec-template.md - Reviewed, aligns with Spec Adherence principle
  ✅ plan-template.md - Reviewed, Constitution Check section will reference these principles
  ✅ tasks-template.md - Reviewed, aligns with task organization and testing standards
- Follow-up TODOs: None
-->

# Phase II – Todo Full-Stack Web Application Constitution

## Core Principles

### I. User-Centric Functionality

All features MUST serve end-users with clear UX and secure task management. Every implementation decision MUST prioritize user experience, data security, and task management clarity. Features that do not directly benefit end-users or compromise security MUST be rejected.

**Rationale**: The application's value is measured by user satisfaction and trust. Security breaches or poor UX directly undermine the product's core purpose.

### II. Spec-Driven Development

Every implementation MUST follow the Spec-Kit Plus specifications. No manual coding is permitted outside the specification framework. All code generation MUST reference specs in the `/specs/` directory.

**Rationale**: Spec-driven development ensures consistency, traceability, and prevents ad-hoc implementations that deviate from architectural decisions. This principle guarantees that all code is intentional and documented.

### III. Security & Data Privacy

JWT authentication MUST ensure each user only accesses their own data. Secrets MUST be handled safely via environment variables. All API endpoints handling user data MUST require authentication and authorization checks.

**Non-negotiable rules**:
- No hardcoded secrets or tokens in source code
- All task endpoints MUST validate JWT tokens
- User data MUST be filtered by authenticated user ID
- Unauthorized requests MUST return 401 status codes

**Rationale**: Data privacy is a legal and ethical requirement. Multi-user applications MUST guarantee data isolation to maintain user trust and comply with security standards.

### IV. Scalable Architecture

Backend APIs, database schema, and frontend components MUST be designed for multi-user operations. Architecture decisions MUST consider horizontal scaling, stateless design, and efficient resource utilization.

**Requirements**:
- Stateless API design (JWT-based, no server-side sessions)
- Database queries MUST use proper indexing
- Frontend components MUST be reusable and composable
- Clear separation between client and server responsibilities

**Rationale**: Scalability cannot be retrofitted easily. Designing for scale from the start prevents costly rewrites and ensures the application can grow with user demand.

### V. Maintainable & Consistent Code

Standardized patterns MUST be followed for frontend (Next.js + Tailwind CSS) and backend (FastAPI + SQLModel). Code MUST be readable, well-structured, and follow established conventions.

**Standards**:
- Consistent naming conventions across all layers
- Modular architecture with clear boundaries
- Reusable components and utilities
- Documentation for non-obvious logic

**Rationale**: Maintainability directly impacts development velocity and bug resolution time. Consistent patterns reduce cognitive load and enable team collaboration.

## Key Standards

### API Compliance

REST endpoints MUST follow the specification, return JSON responses, validate all inputs, and handle errors consistently.

**Requirements**:
- All endpoints documented in `/specs/<feature>/contracts/`
- Request validation using Pydantic models
- Standardized error responses with appropriate HTTP status codes
- Consistent response structure across all endpoints

### Database Integrity

All data MUST be persisted in Neon PostgreSQL. Relational consistency MUST be enforced through foreign keys, constraints, and proper schema design.

**Requirements**:
- Database migrations tracked and versioned
- Foreign key relationships properly defined
- Constraints enforced at database level
- No orphaned records or data inconsistencies

### Frontend Quality

Responsive layouts, reusable components, proper client/server separation, and Tailwind CSS utility usage are mandatory.

**Requirements**:
- Next.js App Router patterns (server components by default)
- Client components only when interactivity required
- Responsive design for mobile, tablet, and desktop
- Tailwind CSS for all styling (no inline styles or CSS files)

### Authentication

Better Auth MUST be used for signup/signin. JWTs MUST be used for stateless API access.

**Requirements**:
- Better Auth handles session creation and JWT issuance
- Frontend includes JWT in `Authorization: Bearer <token>` header
- Backend verifies JWT using shared `BETTER_AUTH_SECRET`
- Token expiry and refresh handled appropriately

### Spec Adherence

Every task, feature, and endpoint MUST reference files in the `@specs/` directory for implementation guidance.

**Requirements**:
- No implementation without corresponding spec
- Specs MUST be updated before implementation changes
- All code references spec file and section
- Deviations from spec MUST be documented and approved

## Constraints

### Tech Stack

The following technology stack is mandatory and MUST NOT be substituted:

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, SQLModel ORM
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth (JWT tokens)

**Rationale**: Stack consistency ensures predictable behavior, reduces integration issues, and leverages team expertise.

### Endpoint Authorization

All task-related endpoints MUST require JWT authorization. Unauthorized requests MUST be rejected with 401 status.

**Implementation**:
- JWT verification middleware on all protected routes
- User ID extracted from validated token
- Data queries filtered by authenticated user ID

### Monorepo Structure

The repository MUST maintain the following structure:

```
/
├── CLAUDE.md (root project instructions)
├── frontend/
│   ├── CLAUDE.md (frontend-specific instructions)
│   └── src/
├── backend/
│   ├── CLAUDE.md (backend-specific instructions)
│   └── src/
└── specs/
    └── <feature>/
        ├── spec.md
        ├── plan.md
        ├── tasks.md
        └── contracts/
```

### No Manual Coding

All implementation MUST be generated via Claude Code referencing the specifications. Manual code edits outside the spec-driven workflow are prohibited.

**Exceptions**: Emergency hotfixes may bypass this constraint but MUST be documented in specs retroactively within 24 hours.

### Security

JWT token expiry and verification MUST be implemented. `BETTER_AUTH_SECRET` MUST be shared across frontend and backend via environment variables.

**Requirements**:
- Tokens MUST have reasonable expiry (e.g., 24 hours)
- Refresh token mechanism MUST be implemented
- Secrets MUST be stored in `.env` files (never committed)
- Production secrets MUST use secure secret management

## Success Criteria

### Functional

All CRUD operations (Create, Read, Update, Delete) and user authentication MUST work correctly.

**Validation**:
- Users can sign up and sign in
- Users can create, view, update, and delete their own tasks
- Users cannot access other users' tasks
- All operations persist correctly to database

### Secure

Unauthorized requests MUST return 401 status codes. Users MUST NOT be able to access other users' tasks under any circumstance.

**Validation**:
- Requests without JWT return 401
- Requests with invalid JWT return 401
- Requests with valid JWT only return user's own data
- No data leakage through error messages or API responses

### Spec-Compliant

Backend, frontend, database, and UI implementations MUST strictly follow specifications in `/specs/`.

**Validation**:
- All implemented features have corresponding specs
- Implementation matches spec requirements
- No undocumented features or deviations
- Specs are up-to-date with current implementation

### Testable & Deployable

Local development commands and Docker deployment MUST run without errors.

**Validation**:
- `npm run dev` starts frontend successfully
- `uvicorn` starts backend successfully
- Database migrations run without errors
- Docker compose brings up full stack
- All services communicate correctly

### Review-Ready

Clean code, consistent styling, maintainable architecture, fully aligned with project CLAUDE.md instructions.

**Validation**:
- Code passes linting and formatting checks
- No console errors or warnings
- Architecture follows established patterns
- CLAUDE.md instructions are followed
- Code is ready for peer review

## Governance

This constitution supersedes all other development practices and guidelines. All implementation work, code reviews, and architectural decisions MUST comply with the principles, standards, and constraints defined herein.

### Amendment Process

1. Proposed amendments MUST be documented with rationale
2. Amendments MUST be reviewed for impact on existing specs and code
3. Amendments require explicit approval before adoption
4. Approved amendments MUST include migration plan for existing code
5. Version MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward-incompatible principle removals or redefinitions
   - **MINOR**: New principles or materially expanded guidance
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

All pull requests and code reviews MUST verify compliance with this constitution. Violations MUST be rejected unless explicitly justified and approved as constitutional amendments.

### Complexity Justification

Any complexity introduced beyond the minimum required MUST be explicitly justified against constitutional principles. Unjustified complexity MUST be rejected.

### Runtime Guidance

For day-to-day development guidance, refer to:
- Root `CLAUDE.md` for overall project instructions
- `frontend/CLAUDE.md` for frontend-specific guidance
- `backend/CLAUDE.md` for backend-specific guidance
- `/specs/<feature>/` for feature-specific requirements

**Version**: 1.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08
