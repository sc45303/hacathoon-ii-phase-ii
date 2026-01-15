---
id: 001
title: Phase III Constitutional Extension
stage: constitution
date: 2026-01-13
surface: agent
model: claude-opus-4-5-20251101
feature: phase-iii-chatbot
branch: main
user: system
command: constitution-extension
labels: ["constitution", "phase-iii", "governance", "agent-enforcement", "mcp-tools", "conversational-ai"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

SYSTEM TASK: CONSTITUTION EXTENSION

You are updating the project's constitution.md.

Rules:
- Do NOT remove or modify any existing content
- ONLY append new sections
- Treat this as a binding system constitution

Objective:
Extend the constitution to govern Phase III: Todo AI Chatbot, based on the following Phase III specification.

Extend the existing constitution.md to formally govern Phase III: Todo AI Chatbot.

Instructions:

Update the existing constitution file to include Phase III–specific rules, architecture, and enforcement clauses based on the provided Phase III project details.

⚠️ Critical Constraints (Must Be Followed)
- DO NOT modify, rewrite, reorder, or remove any sections related to Phase III
- Treat the constitution as a binding system contract, not documentation
- Use normative language: must, shall, required, prohibited

Phase III Constitutional Additions (What to Add):

1. Phase III Scope Declaration
   - Phase III objective: AI-powered Todo chatbot via natural language
   - Mandatory use of: Agentic Dev Stack workflow, Spec-Kit Plus, Claude Code
   - Explicit prohibition of manual coding

2. Development Workflow Enforcement
   - Codify the mandatory execution order: Specification authoring → Plan generation → Task decomposition → Implementation via Claude Code → Review & iteration
   - State clearly: Any deviation from this order is a constitutional violation
   - Implementation without an approved spec is invalid

3. Architectural Mandates (Phase III)
   - Formally enforce: Stateless FastAPI backend, MCP Server using Official MCP SDK, OpenAI Agents SDK for reasoning and orchestration, ChatKit UI as the only permitted frontend, Database-persisted state (tasks, conversations, messages)
   - Explicitly prohibit: In-memory server state, Direct database access from frontend, Tool logic outside MCP boundaries

4. Agent & Skill Governance
   - Add a section that mandates: Required Agents (Conversational AI Architect, Backend Systems Agent), Required Skills (AI / Agent Behavior & Reasoning, Backend MCP & Tools)
   - Rules: Each domain must be handled by its designated agent, Skills are mandatory, not optional, Cross-domain execution without agent handoff is forbidden

5. MCP Tool Constitutional Rules
   - Declare that: All task operations must be exposed via MCP tools, MCP tools must be stateless, All state persistence must occur in the database, AI agents may only modify tasks through MCP tools
   - List constitutionally required tools: add_task, list_tasks, update_task, complete_task, delete_task

6. Chat & Conversation Rules
   - Codify the stateless request cycle: Each request loads conversation history from DB, executes agent reasoning, stores messages and tool calls
   - Server restarts must not affect conversations, Conversation continuity is mandatory

7. Error Handling & Confirmation Law
   - Add enforcement that: All agent actions must return user-friendly confirmations, Task-not-found and invalid requests must be handled gracefully, Silent failures are constitutionally forbidden

8. Deployment & Security Mandates
   - Include: ChatKit domain allowlist requirement, Environment variable enforcement, Prohibition of production deployment without allowlist approval

Output Requirements:
- Append clearly titled Phase III sections only
- Preserve all existing constitutional content verbatim
- Ensure the new sections read as binding law
- Do not include explanations, commentary, or examples
- Output the entire updated constitution.md

## Response snapshot

Successfully extended constitution.md with Phase III governance rules. Added 320 lines of binding constitutional law while preserving all Phase II content verbatim.

**Constitutional Extension Summary:**

1. **Phase III Scope Declaration** (Lines 267-290)
   - Established Phase III objective: AI-powered Todo chatbot via natural language
   - Mandated Agentic Dev Stack, Spec-Kit Plus, and Claude Code
   - Prohibited manual coding outside specification-driven workflow

2. **Development Workflow Enforcement** (Lines 292-335)
   - Codified mandatory 5-stage execution order
   - Defined constitutional violations (deviation from order, implementation without spec, manual coding, agent-skill misalignment, undocumented deviations)
   - Established consequence: All violating work is INVALID and MUST be discarded

3. **Architectural Mandates (Phase III)** (Lines 337-364)
   - Required: Stateless FastAPI backend, MCP Server (Official SDK), OpenAI Agents SDK, ChatKit UI, Database-persisted state
   - Prohibited: In-memory server state, direct database access from frontend, tool logic outside MCP boundaries, stateful API design

4. **Agent & Skill Governance** (Lines 366-408)
   - Mandated Conversational AI Architect Agent (agent-behavior-reasoning skill)
   - Mandated Backend Systems Agent (backend-mcp-tools skill)
   - Established 5 binding governance rules: domain exclusivity, skill requirement, no cross-domain execution, mandatory agent handoff, agent-skill declaration

5. **MCP Tool Constitutional Rules** (Lines 410-450)
   - Required 5 constitutionally mandated tools: add_task, list_tasks, update_task, complete_task, delete_task
   - Established tool design mandates: statelessness, state persistence, agent access control, tool contracts

6. **Chat & Conversation Rules** (Lines 452-478)
   - Codified stateless request cycle (5 steps)
   - Mandated server restart resilience
   - Required conversation continuity

7. **Error Handling & Confirmation Law** (Lines 480-519)
   - Required user-facing confirmations for all agent actions
   - Mandated graceful error handling (task not found, invalid requests, system errors)
   - Prohibited silent failures

8. **Deployment & Security Mandates** (Lines 521-555)
   - Required ChatKit domain allowlist
   - Enforced environment variable management (5 required variables)
   - Prohibited production deployment without security compliance

9. **Phase III Governance** (Lines 557-583)
   - Established constitutional hierarchy (Phase III extends Phase II)
   - Required compliance with all constitutional layers
   - Defined violation remediation process (5 steps)

**Version Update:** Constitution.md updated from v1.0.0 to v1.1.0 (MINOR version increment per semantic versioning - new principles added without breaking existing rules)

**Ratification:** Phase III constitutional extension ratified 2026-01-13

## Outcome

- ✅ Impact: Constitution.md successfully extended with Phase III binding governance rules. All Phase II content preserved verbatim. Document now governs both Phase II (full-stack web app) and Phase III (AI chatbot) with clear architectural mandates, agent governance, and enforcement mechanisms.
- 🧪 Tests: No automated tests applicable (constitutional document)
- 📁 Files: 1 file modified (.specify/memory/constitution.md: +320 lines, v1.0.0 → v1.1.0)
- 🔁 Next prompts: Phase III specification authoring using Spec-Kit Plus; Phase III architectural planning with agent-skill mappings
- 🧠 Reflection: The constitutional extension successfully establishes binding law for Phase III while maintaining Phase II integrity. The normative language (MUST, SHALL, PROHIBITED) creates enforceable rules. The agent governance section directly ties to the CLAUDE.md enforcement matrix, creating a cohesive governance framework across both documents.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review - PASS (all requirements met, no existing content modified, normative language used throughout, binding law established)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor Phase III development for constitutional compliance; identify any ambiguities in governance rules that require clarification amendments
