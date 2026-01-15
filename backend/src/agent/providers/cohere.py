"""
Cohere Provider Implementation

Cohere API provider with function calling support.
Optional provider (trial only, not recommended for production).
"""

import logging
from typing import List, Dict, Any
import cohere

from .base import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)


class CohereProvider(LLMProvider):
    """
    Cohere API provider implementation.

    Features:
    - Native function calling support
    - Trial tier only (not recommended for production)
    - Model: command-r-plus (best for function calling)

    Note: Cohere requires a paid plan after trial expires.
    Use Gemini or OpenRouter for free-tier operation.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "command-r-plus",
        temperature: float = 0.7,
        max_tokens: int = 8192
    ):
        super().__init__(api_key, model, temperature, max_tokens)
        self.client = cohere.Client(api_key)
        logger.info(f"Initialized CohereProvider with model: {model}")

    def _convert_tools_to_cohere_format(self, tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Convert MCP tool definitions to Cohere tool format.

        Args:
            tools: MCP tool definitions

        Returns:
            List of Cohere-formatted tool definitions
        """
        return [
            {
                "name": tool["name"],
                "description": tool["description"],
                "parameter_definitions": tool["parameters"].get("properties", {})
            }
            for tool in tools
        ]

    async def generate_response_with_tools(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict[str, Any]]
    ) -> LLMResponse:
        """
        Generate a response with function calling support.

        Args:
            messages: Conversation history
            system_prompt: System instructions
            tools: Tool definitions

        Returns:
            LLMResponse with content and/or tool_calls
        """
        try:
            # Convert tools to Cohere format
            cohere_tools = self._convert_tools_to_cohere_format(tools)

            # Format chat history for Cohere
            chat_history = []
            for msg in messages[:-1]:  # All except last message
                chat_history.append({
                    "role": "USER" if msg["role"] == "user" else "CHATBOT",
                    "message": msg["content"]
                })

            # Last message is the current user message
            current_message = messages[-1]["content"] if messages else ""

            # Generate response with function calling
            response = self.client.chat(
                message=current_message,
                chat_history=chat_history,
                preamble=system_prompt,
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                tools=cohere_tools
            )

            # Check for tool calls
            if response.tool_calls:
                tool_calls = [
                    {
                        "name": tc.name,
                        "arguments": tc.parameters
                    }
                    for tc in response.tool_calls
                ]
                logger.info(f"Cohere requested function calls: {[tc['name'] for tc in tool_calls]}")
                return LLMResponse(
                    content=None,
                    tool_calls=tool_calls,
                    finish_reason="tool_calls"
                )

            # Regular text response
            content = response.text
            logger.info("Cohere generated text response")
            return LLMResponse(
                content=content,
                finish_reason="COMPLETE"
            )

        except Exception as e:
            logger.error(f"Cohere API error: {str(e)}")
            raise

    async def generate_response_with_tool_results(
        self,
        messages: List[Dict[str, str]],
        tool_calls: List[Dict[str, Any]],
        tool_results: List[Dict[str, Any]]
    ) -> LLMResponse:
        """
        Generate a final response after tool execution.

        Args:
            messages: Original conversation history
            tool_calls: Tool calls that were made
            tool_results: Results from tool execution

        Returns:
            LLMResponse with final content
        """
        try:
            # Format chat history
            chat_history = []
            for msg in messages:
                chat_history.append({
                    "role": "USER" if msg["role"] == "user" else "CHATBOT",
                    "message": msg["content"]
                })

            # Format tool results for Cohere
            tool_results_formatted = [
                {
                    "call": {"name": call["name"], "parameters": call["arguments"]},
                    "outputs": [{"result": str(result)}]
                }
                for call, result in zip(tool_calls, tool_results)
            ]

            # Generate final response
            response = self.client.chat(
                message="Based on the tool results, provide a natural language response.",
                chat_history=chat_history,
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                tool_results=tool_results_formatted
            )

            content = response.text
            logger.info("Cohere generated final response after tool execution")
            return LLMResponse(
                content=content,
                finish_reason="COMPLETE"
            )

        except Exception as e:
            logger.error(f"Cohere API error in tool results: {str(e)}")
            raise

    async def generate_simple_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str
    ) -> LLMResponse:
        """
        Generate a simple response without function calling.

        Args:
            messages: Conversation history
            system_prompt: System instructions

        Returns:
            LLMResponse with content
        """
        try:
            # Format chat history
            chat_history = []
            for msg in messages[:-1]:
                chat_history.append({
                    "role": "USER" if msg["role"] == "user" else "CHATBOT",
                    "message": msg["content"]
                })

            current_message = messages[-1]["content"] if messages else ""

            # Generate response
            response = self.client.chat(
                message=current_message,
                chat_history=chat_history,
                preamble=system_prompt,
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )

            content = response.text
            logger.info("Cohere generated simple response")
            return LLMResponse(
                content=content,
                finish_reason="COMPLETE"
            )

        except Exception as e:
            logger.error(f"Cohere API error: {str(e)}")
            raise
