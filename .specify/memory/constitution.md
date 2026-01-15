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

---

# Phase III – Todo AI Chatbot Constitutional Extension

## Phase III Scope Declaration

### Objective

Phase III SHALL establish an AI-powered Todo chatbot that enables natural language task management through conversational interfaces. This phase extends Phase II capabilities with intelligent agent-based interactions while maintaining all Phase II constitutional requirements.

### Mandatory Development Framework

The following development framework is REQUIRED and SHALL NOT be substituted:

- **Agentic Dev Stack Workflow**: All development MUST follow the prescribed agentic workflow
- **Spec-Kit Plus**: All specifications MUST be authored using Spec-Kit Plus templates and processes
- **Claude Code**: All implementation MUST be executed via Claude Code with explicit agent invocation

### Prohibition of Manual Coding

Manual coding outside the specification-driven workflow is PROHIBITED. All code generation MUST:
- Reference approved specifications in `/specs/`
- Be executed through Claude Code with proper agent-skill alignment
- Follow the mandatory development workflow without deviation

**Rationale**: Phase III introduces conversational AI complexity that requires rigorous specification adherence to prevent architectural drift and ensure maintainable, testable implementations.

## Development Workflow Enforcement

### Mandatory Execution Order

All Phase III development MUST follow this execution order without exception:

1. **Specification Authoring** (Spec-Kit Plus)
   - Feature requirements documented in `/specs/<feature>/spec.md`
   - User stories, acceptance criteria, and API contracts defined
   - Approval obtained before proceeding

2. **Plan Generation**
   - Architectural plan created in `/specs/<feature>/plan.md`
   - Agent-skill mappings declared
   - Technology choices and trade-offs documented
   - Approval obtained before proceeding

3. **Task Decomposition**
   - Testable tasks created in `/specs/<feature>/tasks.md`
   - Dependencies and acceptance criteria defined
   - Agent-skill pairings assigned to each task
   - Approval obtained before proceeding

4. **Implementation via Claude Code**
   - Tasks executed in dependency order
   - Proper agents invoked with required skills
   - Tests run and acceptance criteria verified

5. **Review & Iteration**
   - Implementation reviewed against specifications
   - Deviations documented and approved
   - Specifications updated to reflect approved changes

### Constitutional Violations

The following actions constitute constitutional violations:

- **Deviation from Execution Order**: Skipping or reordering workflow stages
- **Implementation Without Approved Spec**: Writing code before specification approval
- **Manual Coding**: Implementing features outside Claude Code workflow
- **Agent-Skill Misalignment**: Using incorrect agents or omitting required skills
- **Undocumented Deviations**: Changing implementation without updating specifications

**Consequence**: All work produced in violation of this workflow is INVALID and MUST be discarded.

## Architectural Mandates (Phase III)

### Required Architecture

Phase III MUST implement the following architecture without substitution:

#### Backend Architecture

- **Stateless FastAPI Backend**: All API endpoints MUST be stateless; no server-side session storage
- **MCP Server Implementation**: MUST use Official MCP SDK for all tool implementations
- **OpenAI Agents SDK**: MUST be used for agent reasoning and orchestration
- **Database-Persisted State**: All state (tasks, conversations, messages) MUST persist in Neon PostgreSQL

#### Frontend Architecture

- **ChatKit UI**: ChatKit MUST be the sole frontend interface for Phase III
- **No Alternative Frontends**: Custom chat UIs or alternative interfaces are PROHIBITED

### Architectural Prohibitions

The following architectural patterns are PROHIBITED:

1. **In-Memory Server State**: Server MUST NOT store conversation state in memory
2. **Direct Database Access from Frontend**: Frontend MUST NOT query database directly
3. **Tool Logic Outside MCP Boundaries**: All tool logic MUST be encapsulated in MCP tools
4. **Stateful API Design**: APIs MUST NOT rely on server-side session state

**Rationale**: Stateless architecture ensures scalability, enables server restarts without data loss, and maintains clear separation of concerns between frontend, backend, and data layers.

## Agent & Skill Governance

### Required Agents

Phase III development MUST utilize the following agents for their designated domains:

#### Conversational AI Architect Agent

**Domain**: AI agent design, reasoning workflows, intent detection, tool selection logic, response quality optimization

**Mandatory Skill**: `agent-behavior-reasoning`

**Responsibilities**:
- Design conversation flows and state machines
- Implement intent detection strategies
- Define tool selection logic
- Optimize response clarity and consistency
- Prevent hallucinations through validation

#### Backend Systems Agent

**Domain**: Server-side architecture, MCP tool design, API implementation, database operations, infrastructure

**Mandatory Skill**: `backend-mcp-tools`

**Responsibilities**:
- Design and implement MCP tools
- Define tool contracts (inputs, outputs, validation)
- Implement stateless backend logic
- Handle database interactions
- Implement error handling and validation

### Agent Governance Rules

The following rules are MANDATORY and constitute binding law:

1. **Domain Exclusivity**: Each domain MUST be handled exclusively by its designated agent
2. **Skill Requirement**: Skills are REQUIRED, not optional; agents MUST read and follow skill files
3. **No Cross-Domain Execution**: Agents MUST NOT execute work outside their designated domain
4. **Mandatory Agent Handoff**: Multi-domain tasks MUST involve explicit agent handoffs with documented boundaries
5. **Agent-Skill Declaration**: All planning and implementation MUST explicitly declare agent-skill pairings

**Violation Consequence**: Work executed by incorrect agents or without required skills is INVALID and MUST be rejected.

## MCP Tool Constitutional Rules

### Tool Implementation Requirements

All task operations MUST be exposed via MCP tools. The following tools are constitutionally REQUIRED:

1. **add_task**: Create new tasks with title, description, due date, priority
2. **list_tasks**: Retrieve tasks with filtering and sorting capabilities
3. **update_task**: Modify existing task properties
4. **complete_task**: Mark tasks as completed
5. **delete_task**: Remove tasks from the system

### Tool Design Mandates

All MCP tools MUST adhere to the following design mandates:

#### Statelessness

- Tools MUST operate statelessly with explicit inputs
- Tools MUST NOT rely on server-side session state
- Tools MUST NOT cache data in memory across requests

#### State Persistence

- All state modifications MUST persist to Neon PostgreSQL database
- Tools MUST NOT maintain in-memory state
- Database transactions MUST be used for atomic operations

#### Agent Access Control

- AI agents MAY ONLY modify tasks through MCP tools
- Direct database manipulation by agents is PROHIBITED
- All task operations MUST flow through the MCP tool layer

#### Tool Contracts

- Each tool MUST define clear contracts: name, inputs, outputs, validation rules
- Tools MUST return structured responses: status, data payload, message
- Tools MUST handle errors gracefully with actionable error messages

**Rationale**: MCP tools provide a controlled, testable, and auditable interface between AI agents and the task management system, ensuring data integrity and security.

## Chat & Conversation Rules

### Stateless Request Cycle

Each conversational request MUST follow this stateless cycle:

1. **Load Conversation History**: Retrieve conversation history from database
2. **Execute Agent Reasoning**: Process user input with OpenAI Agents SDK
3. **Invoke MCP Tools**: Execute task operations through MCP tool layer
4. **Store Messages and Tool Calls**: Persist conversation state to database
5. **Return Response**: Deliver user-facing response

### Server Restart Resilience

- Server restarts MUST NOT affect conversation continuity
- All conversation state MUST be recoverable from database
- No conversation data MAY be lost due to server failures

### Conversation Continuity Mandate

Conversation continuity is MANDATORY. The system MUST:
- Maintain conversation context across multiple turns
- Preserve conversation history indefinitely (or per retention policy)
- Enable users to resume conversations after arbitrary time periods
- Ensure conversation IDs remain stable and persistent

**Rationale**: Stateless design with database-persisted state ensures reliability, scalability, and user trust in the conversational interface.

## Error Handling & Confirmation Law

### User-Facing Confirmations

All agent actions MUST return user-friendly confirmations that:
- Clearly state what action was performed
- Include relevant details (task title, status, etc.)
- Use natural language appropriate for conversational interfaces
- Provide actionable next steps when applicable

### Graceful Error Handling

The following error scenarios MUST be handled gracefully:

#### Task Not Found

- MUST return clear message indicating task does not exist
- MUST suggest alternative actions (list tasks, create new task)
- MUST NOT expose internal error details

#### Invalid Requests

- MUST validate all inputs before processing
- MUST return specific validation error messages
- MUST guide users toward correct input format

#### System Errors

- MUST log errors comprehensively for debugging
- MUST return user-friendly error messages
- MUST NOT expose stack traces or internal implementation details

### Silent Failure Prohibition

Silent failures are PROHIBITED. All errors MUST:
- Be logged with sufficient context for debugging
- Result in user-facing error messages
- Trigger appropriate error recovery mechanisms

**Rationale**: Conversational interfaces require exceptional error handling to maintain user trust and provide clear feedback for corrective actions.

## Deployment & Security Mandates

### ChatKit Domain Allowlist Requirement

Production deployment MUST implement ChatKit domain allowlist:
- Only approved ChatKit domains MAY access the MCP server
- Unauthorized domains MUST be rejected at the network layer
- Allowlist configuration MUST be environment-specific

### Environment Variable Enforcement

All configuration MUST be managed via environment variables:

**Required Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Shared secret for JWT verification
- `OPENAI_API_KEY`: OpenAI API key for agent reasoning
- `MCP_SERVER_PORT`: MCP server listening port
- `CHATKIT_ALLOWED_DOMAINS`: Comma-separated list of allowed ChatKit domains

**Prohibitions**:
- Hardcoded secrets in source code
- Configuration values committed to version control
- Production secrets in development environments

### Production Deployment Restrictions

Production deployment is PROHIBITED without:
1. Approved ChatKit domain allowlist configuration
2. All required environment variables properly configured
3. Database migrations successfully applied
4. Security audit of MCP tool implementations
5. Load testing of conversational request cycle

**Rationale**: Phase III introduces external AI services and conversational interfaces that require strict security controls to prevent unauthorized access and data breaches.

## Phase III Governance

### Constitutional Hierarchy

Phase III constitutional rules extend and supplement Phase II rules. In case of conflict:
1. Phase III rules take precedence for Phase III-specific features
2. Phase II rules remain authoritative for shared infrastructure
3. Conflicts MUST be resolved through constitutional amendment process

### Compliance Enforcement

All Phase III development MUST comply with:
- Phase III constitutional rules (this document)
- Phase II constitutional rules (preceding sections)
- CLAUDE.md agent-skill enforcement rules
- Spec-Kit Plus workflow requirements

### Violation Remediation

Constitutional violations MUST be remediated immediately:
1. STOP all work immediately upon violation detection
2. Assess violation category and scope
3. Notify stakeholders of violation and consequences
4. Execute remediation per CLAUDE.md violation procedures
5. Validate compliance before resuming work

**Version**: 1.1.0 | **Phase III Ratified**: 2026-01-13 | **Last Amended**: 2026-01-13
