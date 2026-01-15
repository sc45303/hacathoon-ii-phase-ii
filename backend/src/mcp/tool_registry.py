"""
MCP Tool Registry

Manages registration and execution of MCP tools with user context injection.
Security: user_id is injected by the backend, never trusted from LLM output.
"""

from typing import Dict, List, Any, Callable, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class ToolDefinition:
    """Definition of an MCP tool for LLM function calling."""
    name: str
    description: str
    parameters: Dict[str, Any]


@dataclass
class ToolExecutionResult:
    """Result of executing an MCP tool."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    error: Optional[str] = None


class MCPToolRegistry:
    """
    Registry for MCP tools with user context injection.

    This class manages tool registration and execution, ensuring that
    user_id is always injected by the backend for security.
    """

    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._tool_definitions: Dict[str, ToolDefinition] = {}

    def register_tool(
        self,
        name: str,
        description: str,
        parameters: Dict[str, Any],
        handler: Callable
    ) -> None:
        """
        Register an MCP tool with its handler function.

        Args:
            name: Tool name (e.g., "add_task")
            description: Tool description for LLM
            parameters: JSON schema for tool parameters
            handler: Async function that executes the tool
        """
        self._tools[name] = handler
        self._tool_definitions[name] = ToolDefinition(
            name=name,
            description=description,
            parameters=parameters
        )
        logger.info(f"Registered MCP tool: {name}")

    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """
        Get tool definitions in format suitable for LLM function calling.

        Returns:
            List of tool definitions with name, description, and parameters
        """
        return [
            {
                "name": tool_def.name,
                "description": tool_def.description,
                "parameters": tool_def.parameters
            }
            for tool_def in self._tool_definitions.values()
        ]

    async def execute_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        user_id: int
    ) -> ToolExecutionResult:
        """
        Execute an MCP tool with user context injection.

        SECURITY: user_id is injected by the backend, never from LLM output.

        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments from LLM
            user_id: User ID (injected by backend, not from LLM)

        Returns:
            ToolExecutionResult with success status and data/error
        """
        if tool_name not in self._tools:
            logger.error(f"Tool not found: {tool_name}")
            return ToolExecutionResult(
                success=False,
                error=f"Tool '{tool_name}' not found"
            )

        try:
            # Inject user_id into arguments for security
            arguments_with_context = {**arguments, "user_id": user_id}

            logger.info(f"Executing tool: {tool_name} for user: {user_id}")

            # Execute the tool handler
            handler = self._tools[tool_name]
            result = await handler(**arguments_with_context)

            logger.info(f"Tool execution successful: {tool_name}")
            return result

        except Exception as e:
            logger.error(f"Tool execution failed: {tool_name} - {str(e)}")
            return ToolExecutionResult(
                success=False,
                error=f"Tool execution failed: {str(e)}"
            )

    def list_tools(self) -> List[str]:
        """Get list of registered tool names."""
        return list(self._tools.keys())

    def has_tool(self, tool_name: str) -> bool:
        """Check if a tool is registered."""
        return tool_name in self._tools


# Global registry instance
tool_registry = MCPToolRegistry()
