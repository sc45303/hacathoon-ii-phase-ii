"""
Agent Runner

Core orchestrator for AI agent execution with tool calling support.
Manages the full request cycle: LLM generation → tool execution → final response.
"""

import logging
from typing import List, Dict, Any, Optional
import asyncio

from .agent_config import AgentConfiguration
from .providers.base import LLMProvider
from .providers.gemini import GeminiProvider
from .providers.openrouter import OpenRouterProvider
from .providers.cohere import CohereProvider
from ..mcp.tool_registry import MCPToolRegistry, ToolExecutionResult

logger = logging.getLogger(__name__)


class AgentRunner:
    """
    Agent execution orchestrator with tool calling support.

    This class manages the full agent request cycle:
    1. Generate LLM response with tool definitions
    2. If tool calls requested, execute tools with user context injection
    3. Generate final response with tool results
    4. Handle rate limiting with fallback providers
    """

    def __init__(self, config: AgentConfiguration, tool_registry: MCPToolRegistry):
        """
        Initialize the agent runner.

        Args:
            config: Agent configuration
            tool_registry: MCP tool registry
        """
        self.config = config
        self.tool_registry = tool_registry
        self.primary_provider = self._create_provider(config.provider)
        self.fallback_provider = None

        if config.fallback_provider:
            self.fallback_provider = self._create_provider(config.fallback_provider)

        logger.info(f"Initialized AgentRunner with provider: {config.provider}")

    def _create_provider(self, provider_name: str) -> LLMProvider:
        """
        Create an LLM provider instance.

        Args:
            provider_name: Provider name (gemini, openrouter, cohere)

        Returns:
            LLMProvider instance

        Raises:
            ValueError: If provider is not supported or API key is missing
        """
        api_key = self.config.get_provider_api_key(provider_name)
        if not api_key:
            raise ValueError(f"API key not configured for provider: {provider_name}")

        model = self.config.get_provider_model(provider_name)

        if provider_name == "gemini":
            return GeminiProvider(
                api_key=api_key,
                model=model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
        elif provider_name == "openrouter":
            return OpenRouterProvider(
                api_key=api_key,
                model=model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
        elif provider_name == "cohere":
            return CohereProvider(
                api_key=api_key,
                model=model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
        else:
            raise ValueError(f"Unsupported provider: {provider_name}")

    async def execute(
        self,
        messages: List[Dict[str, str]],
        user_id: int,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute agent request with tool calling support.

        SECURITY: user_id is injected by backend, never from LLM output.

        Args:
            messages: Conversation history [{"role": "user", "content": "..."}]
            user_id: User ID (injected by backend for security)
            system_prompt: Optional system prompt (uses config default if not provided)

        Returns:
            Dict with response content and metadata
        """
        prompt = system_prompt or self.config.system_prompt
        provider = self.primary_provider

        try:
            # Get tool definitions
            tool_definitions = self.tool_registry.get_tool_definitions()

            logger.info(f"Executing agent for user {user_id} with {len(tool_definitions)} tools")

            # Generate initial response with tool definitions
            response = await provider.generate_response_with_tools(
                messages=messages,
                system_prompt=prompt,
                tools=tool_definitions
            )

            # Check if tool calls were requested
            if response.tool_calls:
                logger.info(f"Agent requested {len(response.tool_calls)} tool calls")

                # Execute all tool calls
                tool_results = []
                for tool_call in response.tool_calls:
                    result = await self.tool_registry.execute_tool(
                        tool_name=tool_call["name"],
                        arguments=tool_call["arguments"],
                        user_id=user_id  # Inject user context for security
                    )
                    tool_results.append(result)

                # Generate final response with tool results
                final_response = await provider.generate_response_with_tool_results(
                    messages=messages,
                    tool_calls=response.tool_calls,
                    tool_results=tool_results
                )

                return {
                    "content": final_response.content,
                    "tool_calls": response.tool_calls,
                    "tool_results": tool_results,
                    "provider": provider.get_provider_name()
                }

            # No tool calls, return direct response
            logger.info("Agent generated direct response (no tool calls)")
            return {
                "content": response.content,
                "tool_calls": None,
                "tool_results": None,
                "provider": provider.get_provider_name()
            }

        except Exception as e:
            logger.error(f"Agent execution failed with primary provider: {str(e)}")

            # Try fallback provider if configured
            if self.fallback_provider:
                logger.info("Attempting fallback provider")
                try:
                    return await self._execute_with_provider(
                        provider=self.fallback_provider,
                        messages=messages,
                        user_id=user_id,
                        system_prompt=prompt
                    )
                except Exception as fallback_error:
                    logger.error(f"Fallback provider also failed: {str(fallback_error)}")
                    raise

            raise

    async def _execute_with_provider(
        self,
        provider: LLMProvider,
        messages: List[Dict[str, str]],
        user_id: int,
        system_prompt: str
    ) -> Dict[str, Any]:
        """
        Execute agent request with a specific provider.

        Args:
            provider: LLM provider to use
            messages: Conversation history
            user_id: User ID
            system_prompt: System prompt

        Returns:
            Dict with response content and metadata
        """
        tool_definitions = self.tool_registry.get_tool_definitions()

        # Generate initial response
        response = await provider.generate_response_with_tools(
            messages=messages,
            system_prompt=system_prompt,
            tools=tool_definitions
        )

        # Handle tool calls
        if response.tool_calls:
            tool_results = []
            for tool_call in response.tool_calls:
                result = await self.tool_registry.execute_tool(
                    tool_name=tool_call["name"],
                    arguments=tool_call["arguments"],
                    user_id=user_id
                )
                tool_results.append(result)

            final_response = await provider.generate_response_with_tool_results(
                messages=messages,
                tool_calls=response.tool_calls,
                tool_results=tool_results
            )

            return {
                "content": final_response.content,
                "tool_calls": response.tool_calls,
                "tool_results": tool_results,
                "provider": provider.get_provider_name()
            }

        return {
            "content": response.content,
            "tool_calls": None,
            "tool_results": None,
            "provider": provider.get_provider_name()
        }

    async def execute_simple(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Execute a simple agent request without tool calling.

        Args:
            messages: Conversation history
            system_prompt: Optional system prompt

        Returns:
            Response content as string
        """
        prompt = system_prompt or self.config.system_prompt
        provider = self.primary_provider

        try:
            response = await provider.generate_simple_response(
                messages=messages,
                system_prompt=prompt
            )
            return response.content or ""

        except Exception as e:
            logger.error(f"Simple execution failed: {str(e)}")

            # Try fallback provider
            if self.fallback_provider:
                logger.info("Attempting fallback provider for simple execution")
                response = await self.fallback_provider.generate_simple_response(
                    messages=messages,
                    system_prompt=prompt
                )
                return response.content or ""

            raise
