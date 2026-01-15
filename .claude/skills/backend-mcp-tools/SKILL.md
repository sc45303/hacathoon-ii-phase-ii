---
name: "backend-mcp-tools"
description: "Design and manage backend systems, MCP tools, APIs, and data flow that support AI agents. Use this skill to define how tools work, how data is stored, and how agents interact with backend services."
version: "1.0.0"
---

# System / Backend MCP & Tools Skill

## When to Use This Skill

- Building MCP tools for AI agents (CRUD, search, automation)
- Designing APIs that agents can safely and reliably call
- Defining database models and data flow
- Handling stateless conversations and context retrieval
- Implementing error handling and validation for tools

## Process Steps

1. **Identify required capabilities**  
   Determine what actions the agent needs (e.g., create task, fetch data).

2. **Define tool contracts**  
   Specify tool names, inputs, outputs, and validation rules.

3. **Implement backend logic**  
   Write the actual logic for APIs, database access, or external services.

4. **Ensure stateless operation**  
   Design tools to work independently using explicit inputs.

5. **Handle errors gracefully**  
   Return clear error messages and fallback responses.

6. **Expose tools to the agent**  
   Register MCP tools so the agent can discover and use them.

7. **Test tool reliability**  
   Verify correct behavior, edge cases, and performance.

## Output Format

Each tool interaction should return:

- **Status**: success or error
- **Data Payload**: requested or modified data
- **Message**: human-readable confirmation or error explanation

## Example

**Input (Tool Call)**:

```json
{
  "tool": "create_task",
  "arguments": {
    "title": "Finish UI redesign",
    "due_date": "2026-01-14",
    "reminder": "18:00"
  }
}
```
