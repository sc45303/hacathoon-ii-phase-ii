"""
Agent Configuration

Configuration dataclass for agent behavior and LLM provider settings.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class AgentConfiguration:
    """
    Configuration for the AI agent.

    This dataclass defines all configurable parameters for agent behavior,
    including LLM provider settings, conversation limits, and system prompts.
    """

    # Provider settings
    provider: str = "gemini"  # Options: gemini, openrouter, cohere
    fallback_provider: Optional[str] = None  # Optional fallback provider
    model: Optional[str] = None  # Model name (provider-specific)

    # API keys (loaded from environment)
    gemini_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    cohere_api_key: Optional[str] = None

    # Generation parameters
    temperature: float = 0.7  # Sampling temperature (0.0 to 1.0)
    max_tokens: int = 8192  # Maximum tokens in response

    # Conversation history limits (for free-tier constraints)
    max_messages: int = 20  # Maximum messages to keep in history
    max_conversation_tokens: int = 8000  # Maximum tokens in conversation history

    # System prompt
    system_prompt: str = """You are a helpful AI assistant for managing tasks.
You can help users create, view, complete, update, and delete tasks using natural language.

Available tools:
- add_task: Create a new task
- list_tasks: View all tasks (with optional filtering)
- complete_task: Mark a task as completed
- delete_task: Remove a task
- update_task: Modify task properties

Always respond in a friendly, conversational manner and confirm actions taken."""

    # Retry settings
    max_retries: int = 3  # Maximum retries on rate limit errors
    retry_delay: float = 1.0  # Delay between retries (seconds)

    def get_provider_api_key(self, provider_name: str) -> Optional[str]:
        """
        Get API key for a specific provider.

        Args:
            provider_name: Provider name (gemini, openrouter, cohere)

        Returns:
            API key or None if not configured
        """
        if provider_name == "gemini":
            return self.gemini_api_key
        elif provider_name == "openrouter":
            return self.openrouter_api_key
        elif provider_name == "cohere":
            return self.cohere_api_key
        return None

    def get_provider_model(self, provider_name: str) -> str:
        """
        Get default model for a specific provider.

        Args:
            provider_name: Provider name

        Returns:
            Model identifier
        """
        if self.model:
            return self.model

        # Default models per provider
        defaults = {
            "gemini": "gemini-flash-latest",
            "openrouter": "google/gemini-flash-1.5",
            "cohere": "command-r-plus"
        }
        return defaults.get(provider_name, "gemini-flash-latest")

    def validate(self) -> bool:
        """
        Validate configuration.

        Returns:
            True if configuration is valid

        Raises:
            ValueError: If configuration is invalid
        """
        # Check primary provider has API key
        primary_key = self.get_provider_api_key(self.provider)
        if not primary_key:
            raise ValueError(f"API key not configured for primary provider: {self.provider}")

        # Validate temperature range
        if not 0.0 <= self.temperature <= 1.0:
            raise ValueError(f"Temperature must be between 0.0 and 1.0, got: {self.temperature}")

        # Validate max_tokens
        if self.max_tokens <= 0:
            raise ValueError(f"max_tokens must be positive, got: {self.max_tokens}")

        # Validate conversation limits
        if self.max_messages <= 0:
            raise ValueError(f"max_messages must be positive, got: {self.max_messages}")

        if self.max_conversation_tokens <= 0:
            raise ValueError(f"max_conversation_tokens must be positive, got: {self.max_conversation_tokens}")

        return True
