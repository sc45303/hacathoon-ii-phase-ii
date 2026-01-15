"""
Gemini Provider Implementation

Google Gemini API provider with function calling support.
Primary provider for free-tier operation (15 RPM, 1M token context).
"""

import logging
from typing import List, Dict, Any
import google.generativeai as genai
from google.generativeai.types import FunctionDeclaration, Tool

from .base import LLMProvider, LLMResponse

logger = logging.getLogger(__name__)


class GeminiProvider(LLMProvider):
    """
    Google Gemini API provider implementation.

    Features:
    - Native function calling support
    - 1M token context window
    - Free tier: 15 requests/minute
    - Model: gemini-1.5-flash (recommended for free tier)
    """

    def __init__(self, api_key: str, model: str = "gemini-flash-latest", temperature: float = 0.7, max_tokens: int = 8192):
        super().__init__(api_key, model, temperature, max_tokens)
        genai.configure(api_key=api_key)
        self.client = genai.GenerativeModel(model)
        logger.info(f"Initialized GeminiProvider with model: {model}")

    def _sanitize_schema_for_gemini(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize JSON Schema to be Gemini-compatible.

        Gemini only supports a subset of JSON Schema keywords:
        - Supported: type, description, enum, required, properties, items
        - NOT supported: maxLength, minLength, pattern, format, minimum, maximum, default, etc.

        Args:
            schema: Original JSON Schema

        Returns:
            Gemini-compatible schema with unsupported fields removed
        """
        # Fields that Gemini supports
        ALLOWED_FIELDS = {
            "type", "description", "enum", "required",
            "properties", "items"
        }

        # Create a sanitized copy
        sanitized = {}

        for key, value in schema.items():
            if key in ALLOWED_FIELDS:
                # Recursively sanitize nested objects
                if key == "properties" and isinstance(value, dict):
                    sanitized[key] = {
                        prop_name: self._sanitize_schema_for_gemini(prop_schema)
                        for prop_name, prop_schema in value.items()
                    }
                elif key == "items" and isinstance(value, dict):
                    sanitized[key] = self._sanitize_schema_for_gemini(value)
                else:
                    sanitized[key] = value

        return sanitized

    def _convert_tools_to_gemini_format(self, tools: List[Dict[str, Any]]) -> List[Tool]:
        """
        Convert MCP tool definitions to Gemini function declarations.

        Sanitizes schemas to remove unsupported JSON Schema keywords.

        Args:
            tools: MCP tool definitions

        Returns:
            List of Gemini Tool objects
        """
        function_declarations = []
        for tool in tools:
            # Sanitize parameters to remove unsupported fields
            sanitized_parameters = self._sanitize_schema_for_gemini(tool["parameters"])

            function_declarations.append(
                FunctionDeclaration(
                    name=tool["name"],
                    description=tool["description"],
                    parameters=sanitized_parameters
                )
            )

            logger.debug(f"Sanitized tool schema for Gemini: {tool['name']}")

        return [Tool(function_declarations=function_declarations)]

    def _convert_messages_to_gemini_format(self, messages: List[Dict[str, str]], system_prompt: str) -> List[Dict[str, str]]:
        """
        Convert standard message format to Gemini format.

        Args:
            messages: Standard message format [{"role": "user", "content": "..."}]
            system_prompt: System instructions

        Returns:
            Gemini-formatted messages
        """
        gemini_messages = []

        # Add system prompt as first user message if provided
        if system_prompt:
            gemini_messages.append({
                "role": "user",
                "parts": [{"text": system_prompt}]
            })
            gemini_messages.append({
                "role": "model",
                "parts": [{"text": "Understood. I'll follow these instructions."}]
            })

        # Convert messages
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            gemini_messages.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })

        return gemini_messages

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
            # Convert tools to Gemini format
            gemini_tools = self._convert_tools_to_gemini_format(tools)

            # Convert messages to Gemini format
            gemini_messages = self._convert_messages_to_gemini_format(messages, system_prompt)

            # Generate response with function calling
            response = self.client.generate_content(
                gemini_messages,
                tools=gemini_tools,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens
                }
            )

            # Check if function calls were made
            if response.candidates[0].content.parts:
                first_part = response.candidates[0].content.parts[0]

                # Check for function call
                if hasattr(first_part, 'function_call') and first_part.function_call:
                    function_call = first_part.function_call
                    tool_calls = [{
                        "name": function_call.name,
                        "arguments": dict(function_call.args)
                    }]
                    logger.info(f"Gemini requested function call: {function_call.name}")
                    return LLMResponse(
                        content=None,
                        tool_calls=tool_calls,
                        finish_reason="function_call"
                    )

            # Regular text response
            content = response.text if hasattr(response, 'text') else None
            logger.info("Gemini generated text response")
            return LLMResponse(
                content=content,
                finish_reason="stop"
            )

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
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
            # Format tool results as a message
            tool_results_text = "\n\n".join([
                f"Tool: {call['name']}\nResult: {result}"
                for call, result in zip(tool_calls, tool_results)
            ])

            # Add tool results to messages
            messages_with_results = messages + [
                {"role": "assistant", "content": f"I called the following tools:\n{tool_results_text}"},
                {"role": "user", "content": "Based on these tool results, provide a natural language response to the user."}
            ]

            # Generate final response
            gemini_messages = self._convert_messages_to_gemini_format(messages_with_results, "")
            response = self.client.generate_content(
                gemini_messages,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens
                }
            )

            content = response.text if hasattr(response, 'text') else None
            logger.info("Gemini generated final response after tool execution")
            return LLMResponse(
                content=content,
                finish_reason="stop"
            )

        except Exception as e:
            logger.error(f"Gemini API error in tool results: {str(e)}")
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
            gemini_messages = self._convert_messages_to_gemini_format(messages, system_prompt)
            response = self.client.generate_content(
                gemini_messages,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens
                }
            )

            content = response.text if hasattr(response, 'text') else None
            logger.info("Gemini generated simple response")
            return LLMResponse(
                content=content,
                finish_reason="stop"
            )

        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            raise
