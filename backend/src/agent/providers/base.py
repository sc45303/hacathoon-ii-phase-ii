"""
LLM Provider Base Class

Abstract base class for LLM provider implementations.
Defines the interface for generating responses with function calling support.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class LLMResponse:
    """Response from an LLM provider."""
    content: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    finish_reason: Optional[str] = None
    usage: Optional[Dict[str, int]] = None


class LLMProvider(ABC):
    """
    Abstract base class for LLM providers.

    All provider implementations (Gemini, OpenRouter, Cohere) must
    implement these methods to support function calling and tool execution.
    """

    def __init__(self, api_key: str, model: str, temperature: float = 0.7, max_tokens: int = 8192):
        """
        Initialize the LLM provider.

        Args:
            api_key: API key for the provider
            model: Model identifier (e.g., "gemini-1.5-flash")
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens in response
        """
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

    @abstractmethod
    async def generate_response_with_tools(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        tools: List[Dict[str, Any]]
    ) -> LLMResponse:
        """
        Generate a response with function calling support.

        Args:
            messages: Conversation history [{"role": "user", "content": "..."}]
            system_prompt: System instructions for the agent
            tools: Tool definitions for function calling

        Returns:
            LLMResponse with content and/or tool_calls
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
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
        pass

    def get_provider_name(self) -> str:
        """Get the provider name (e.g., 'gemini', 'openrouter', 'cohere')."""
        return self.__class__.__name__.replace("Provider", "").lower()
