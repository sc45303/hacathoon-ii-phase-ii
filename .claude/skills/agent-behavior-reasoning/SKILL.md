---
name: "agent-behavior-reasoning"
description: "Define, control, and optimize AI agent behavior, reasoning flow, and decision-making logic. Use this skill to design how an AI agent interprets user input, plans actions, uses tools, and produces reliable responses."
version: "1.0.0"
---

# AI / Agent Behavior & Reasoning Skill

## When to Use This Skill

- Designing or refining an AI agent’s personality, role, or responsibilities
- Defining how an agent reasons through multi-step problems
- Controlling when and how an agent should call tools
- Improving response clarity, consistency, and reliability
- Preventing hallucinations or unwanted agent behavior

## Process Steps

1. **Define agent role and scope**  
   Clearly specify what the agent is responsible for and what is out of scope.

2. **Interpret user intent**  
   Analyze the user input to determine intent, context, and required action.

3. **Plan reasoning steps**  
   Break the task into logical steps before responding or calling tools.

4. **Decide on tool usage**  
   Determine whether the task requires internal reasoning only or external tools.

5. **Execute reasoning or tool calls**  
   Perform reasoning, call tools if needed, and collect results.

6. **Generate final response**  
   Produce a concise, structured, and user-facing response based on results.

7. **Validate output**  
   Check for correctness, relevance, and alignment with agent rules.

## Output Format

The output should include:

- **Intent Summary**: Brief description of what the user wants
- **Reasoning Outcome**: Decision or conclusion reached by the agent
- **Action Taken**: Tool usage or internal reasoning (if applicable)
- **Final Response**: Clear, user-ready answer

## Example

**Input**:  
"Add a task for tomorrow to finish the UI redesign and remind me in the evening."

**Output**:

- **Intent Summary**: Create a new task with a due date and reminder
- **Reasoning Outcome**: Task creation required with scheduling details
- **Action Taken**: Called `create_task` tool with date and reminder time
- **Final Response**:  
  "✅ Your task _‘Finish UI redesign’_ has been added for tomorrow, and I’ll remind you in the evening."
