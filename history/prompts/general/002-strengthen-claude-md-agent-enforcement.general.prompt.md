---
id: 002
title: Strengthen CLAUDE.md Agent Enforcement
stage: general
date: 2026-01-13
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: system
command: direct-request
labels: ["documentation", "agent-enforcement", "spec-driven-development", "backend-systems", "conversational-ai"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - CLAUDE.md
tests:
 - none
---

## Prompt

Task: Update and strengthen the existing CLAUDE.md file.

Instructions:

Update the existing claude.md to explicitly incorporate and enforce the use of the following newly introduced agents and skills:

Agents
- backend-systems.md
- conversational-ai-architect.md

Skills
- behavior-reasoning
- backend-mcp-tools

Apply the following constraints strictly:

Do not remove, weaken, or rewrite any existing rules
All current principles, constraints, and enforcement rules must remain intact.

Only extend and strengthen the specification
Add new sections or clauses that:
- Mandate usage of the new agents when their domains apply
- Require the associated skills to be used explicitly and consistently
- Clarify responsibility boundaries between agents and skills

Enforce agent-to-skill alignment
- conversational-ai-architect.md must explicitly rely on the behavior-reasoning skill for:
  - Intent detection
  - Tool selection logic
  - Multi-step reasoning
  - Response validation

- backend-systems.md must explicitly rely on the backend-mcp-tools skill for:
  - MCP tool design and contracts
  - Stateless backend logic
  - Database interactions
  - Error handling and validation

Reinforce Spec-Driven Development
All work must follow:
Specification → Plan → Tasks → Implementation

No implementation may occur without an approved spec
No manual coding unless explicitly authorized by the spec

Clarify enforcement rules
State that failure to use the correct agent or skill is considered a spec violation
Require explicit referencing of the agent and skill in reasoning and outputs where applicable

Tone and structure
Maintain an authoritative, formal, and system-level tone
Use clear headings and enforceable language ("must", "shall", "required")
Ensure the document reads as a governing contract, not guidance

Output Requirements:
- Produce the fully updated claude.md
- Preserve all existing content
- Add clearly marked new sections for:
  - Agent Responsibilities
  - Skill Enforcement
  - Agent–Skill Mapping
  - Spec-Driven Workflow Reinforcement

## Response snapshot

Successfully updated CLAUDE.md with comprehensive enforcement rules for the new agents and skills. The update added 555 lines of authoritative specification content while preserving all existing rules.

Key additions:

1. **Backend Systems Agent (Mandatory)** - Lines 424-520
   - Defined as exclusive handler for server-side architecture, MCP tools, API design, database operations
   - Mandatory skill: `backend-mcp-tools`
   - 5 enforcement rules including skill execution requirements, agent-skill references, no responsibility mixing, MCP tool design authority, and proactive invocation

2. **Conversational AI Architect Agent (Mandatory)** - Lines 523-621
   - Defined as exclusive handler for AI agent design, reasoning workflows, intent detection, tool selection
   - Mandatory skill: `agent-behavior-reasoning`
   - 5 enforcement rules mirroring backend agent structure

3. **Agent-Skill Enforcement Matrix (Mandatory)** - Lines 624-690
   - Authoritative mapping table for all 11 agents and their required skills
   - Explicit violation consequences: "Spec violation; implementation rejected"
   - 4 enforcement rules: mandatory skill reading, explicit agent-skill declaration, skill file authority hierarchy, cross-agent coordination

4. **Spec-Driven Development Workflow Reinforcement (Mandatory)** - Lines 693-820
   - Formalized 4-stage SDD workflow: Specification → Planning → Tasks → Implementation
   - Each stage marked as "critical violation" if bypassed
   - 4 enforcement rules: no manual coding without spec, agent-skill alignment in all stages, mandatory PHR creation, ADR suggestions for significant decisions

5. **Violation Consequences and Remediation (Mandatory)** - Lines 823-934
   - 3 violation categories: Critical, Documentation, Responsibility
   - Detailed remediation process with 5 steps
   - Prevention strategies with pre/during/post implementation checklists

6. **Summary of Mandatory Requirements** - Lines 937-974
   - Consolidated all MUST requirements across 5 categories
   - Agent Usage, SDD, Documentation, Quality, Enforcement
   - Final statement: "These requirements are non-negotiable and apply to all work performed by Claude."

The updated CLAUDE.md now totals 974 lines (up from 419 lines), establishing a comprehensive governing contract for all agent work with strict enforcement mechanisms.

## Outcome

- ✅ Impact: CLAUDE.md successfully strengthened with mandatory agent-skill enforcement rules, SDD workflow reinforcement, and violation remediation procedures. All existing rules preserved. Document now serves as authoritative governing contract.
- 🧪 Tests: No automated tests applicable (documentation update)
- 📁 Files: 1 file modified (CLAUDE.md: +555 lines)
- 🔁 Next prompts: None required; CLAUDE.md update complete and ready for use
- 🧠 Reflection: The update successfully transformed CLAUDE.md from guidance into an enforceable specification with clear violation consequences, remediation procedures, and mandatory requirements. The authoritative tone and structured enforcement rules ensure agents follow proper workflows.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review - PASS (all requirements met, existing content preserved, new sections clearly marked)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor agent compliance with new enforcement rules in practice; adjust violation remediation procedures if needed based on real-world usage patterns
