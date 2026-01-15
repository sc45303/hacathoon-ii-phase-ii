"""
OpenRouter Provider Implementation

OpenRouter API provider with function calling support.
Fallback provider for when Gemini rate limits are exceeded.
Uses OpenAI-compatible API format.
"""

import logging
from typing import List, Dict, Any
import httpx

from .base import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)


class OpenRouterProvider(LLMProvider):
    """
    OpenRouter API provider implementation.

    Features:
    - OpenAI-compatible API
    - Access to multiple free models
    - Function calling support
    - Recommended free model: google/gemini-flash-1.5
    """

    def __init__(
        self,
        api_key: str,
        model: str = "google/gemini-flash-1.5",
        temperature: float = 0.7,
        max_tokens: int = 8192
    ):
        super().__init__(api_key, model, temperature, max_tokens)
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        logger.info(f"Initialized OpenRouterProvider with model: {model}")

    def _convert_tools_to_openai_format(self, tools: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Convert MCP tool definitions to OpenAI function format.

        Args:
            tools: MCP tool definitions

        Returns:
            List of OpenAI-formatted function definitions
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool["parameters"]
                }
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
            # Prepare messages with system prompt
            formatted_messages = [{"role": "system", "content": system_prompt}] + messages

            # Convert tools to OpenAI format
            openai_tools = self._convert_tools_to_openai_format(tools)

            # Make API request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": formatted_messages,
                        "tools": openai_tools,
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens
                    }
                )
                response.raise_for_status()
                data = response.json()

            # Parse response
            choice = data["choices"][0]
            message = choice["message"]

            # Check for function calls
            if "tool_calls" in message and message["tool_calls"]:
                tool_calls = [
                    {
                        "name": tc["function"]["name"],
                        "arguments": tc["function"]["arguments"]
                    }
                    for tc in message["tool_calls"]
                ]
                logger.info(f"OpenRouter requested function calls: {[tc['name'] for tc in tool_calls]}")
                return LLMResponse(
                    content=None,
                    tool_calls=tool_calls,
                    finish_reason=choice.get("finish_reason", "function_call")
                )

            # Regular text response
            content = message.get("content")
            logger.info("OpenRouter generated text response")
            return LLMResponse(
                content=content,
                finish_reason=choice.get("finish_reason", "stop")
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter API HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"OpenRouter API error: {str(e)}")
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
            # Format tool results as messages
            messages_with_results = messages.copy()

            # Add assistant message with tool calls
            messages_with_results.append({
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": f"call_{i}",
                        "type": "function",
                        "function": {
                            "name": call["name"],
                            "arguments": str(call["arguments"])
                        }
                    }
                    for i, call in enumerate(tool_calls)
                ]
            })

            # Add tool result messages
            for i, (call, result) in enumerate(zip(tool_calls, tool_results)):
                messages_with_results.append({
                    "role": "tool",
                    "tool_call_id": f"call_{i}",
                    "content": str(result)
                })

            # Generate final response
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": messages_with_results,
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens
                    }
                )
                response.raise_for_status()
                data = response.json()

            choice = data["choices"][0]
            content = choice["message"].get("content")
            logger.info("OpenRouter generated final response after tool execution")
            return LLMResponse(
                content=content,
                finish_reason=choice.get("finish_reason", "stop")
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter API HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"OpenRouter API error in tool results: {str(e)}")
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
            # Prepare messages with system prompt
            formatted_messages = [{"role": "system", "content": system_prompt}] + messages

            # Make API request
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "messages": formatted_messages,
                        "temperature": self.temperature,
                        "max_tokens": self.max_tokens
                    }
                )
                response.raise_for_status()
                data = response.json()

            choice = data["choices"][0]
            content = choice["message"].get("content")
            logger.info("OpenRouter generated simple response")
            return LLMResponse(
                content=content,
                finish_reason=choice.get("finish_reason", "stop")
            )

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenRouter API HTTP error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"OpenRouter API error: {str(e)}")
            raise
