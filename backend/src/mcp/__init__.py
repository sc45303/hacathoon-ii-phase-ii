"""
MCP Tools Registration

Registers all MCP tools with the global tool registry.
Each tool is registered with its contract definition (name, description, parameters).
"""

import json
import logging
from pathlib import Path

from .tool_registry import tool_registry
from .tools.add_task import add_task
from .tools.list_tasks import list_tasks
from .tools.complete_task import complete_task
from .tools.delete_task import delete_task
from .tools.update_task import update_task

logger = logging.getLogger(__name__)


def load_tool_contract(tool_name: str) -> dict:
    """
    Load tool contract definition from JSON file.

    Args:
        tool_name: Name of the tool (e.g., "add_task")

    Returns:
        Tool contract dictionary

    Raises:
        FileNotFoundError: If contract file not found
    """
    # Get the project root directory
    current_file = Path(__file__)
    project_root = current_file.parent.parent.parent  # backend/src/mcp -> backend
    contract_path = project_root.parent / "specs" / "001-openai-agent-mcp-tools" / "contracts" / f"{tool_name}.json"

    if not contract_path.exists():
        raise FileNotFoundError(f"Contract file not found: {contract_path}")

    with open(contract_path, "r") as f:
        return json.load(f)


def register_all_tools():
    """
    Register all MCP tools with the global tool registry.

    This function should be called during application startup to ensure
    all tools are available to the agent.
    """
    logger.info("Registering MCP tools...")

    # Register add_task tool
    try:
        add_task_contract = load_tool_contract("add_task")
        tool_registry.register_tool(
            name=add_task_contract["name"],
            description=add_task_contract["description"],
            parameters=add_task_contract["parameters"],
            handler=add_task
        )
        logger.info("Registered tool: add_task")
    except Exception as e:
        logger.error(f"Failed to register add_task tool: {str(e)}")
        raise

    # Register list_tasks tool
    try:
        list_tasks_contract = load_tool_contract("list_tasks")
        tool_registry.register_tool(
            name=list_tasks_contract["name"],
            description=list_tasks_contract["description"],
            parameters=list_tasks_contract["parameters"],
            handler=list_tasks
        )
        logger.info("Registered tool: list_tasks")
    except Exception as e:
        logger.error(f"Failed to register list_tasks tool: {str(e)}")
        raise

    # Register complete_task tool
    try:
        complete_task_contract = load_tool_contract("complete_task")
        tool_registry.register_tool(
            name=complete_task_contract["name"],
            description=complete_task_contract["description"],
            parameters=complete_task_contract["parameters"],
            handler=complete_task
        )
        logger.info("Registered tool: complete_task")
    except Exception as e:
        logger.error(f"Failed to register complete_task tool: {str(e)}")
        raise

    # Register delete_task tool
    try:
        delete_task_contract = load_tool_contract("delete_task")
        tool_registry.register_tool(
            name=delete_task_contract["name"],
            description=delete_task_contract["description"],
            parameters=delete_task_contract["parameters"],
            handler=delete_task
        )
        logger.info("Registered tool: delete_task")
    except Exception as e:
        logger.error(f"Failed to register delete_task tool: {str(e)}")
        raise

    # Register update_task tool
    try:
        update_task_contract = load_tool_contract("update_task")
        tool_registry.register_tool(
            name=update_task_contract["name"],
            description=update_task_contract["description"],
            parameters=update_task_contract["parameters"],
            handler=update_task
        )
        logger.info("Registered tool: update_task")
    except Exception as e:
        logger.error(f"Failed to register update_task tool: {str(e)}")
        raise

    logger.info(f"Successfully registered {len(tool_registry.list_tools())} MCP tools")


# Export the global registry instance for use in other modules
__all__ = ["tool_registry", "register_all_tools"]
