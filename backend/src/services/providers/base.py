"""Abstract base class for LLM providers."""
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class LLMProvider(ABC):
    """Abstract base class for AI language model providers.

    All provider implementations (Gemini, OpenRouter, Cohere) must inherit from this class
    and implement the generate_response method.
    """

    def __init__(self, api_key: str, model_name: str):
        """Initialize the LLM provider.

        Args:
            api_key: API key for the provider
            model_name: Name of the model to use
        """
        self.api_key = api_key
        self.model_name = model_name

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate a response from the AI model.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            system_prompt: Optional system prompt to guide the AI's behavior
            max_tokens: Maximum tokens to generate in the response
            temperature: Sampling temperature (0.0 to 1.0)

        Returns:
            Dict containing:
                - content: The generated response text
                - token_count: Number of tokens used (if available)
                - model: Model name used

        Raises:
            Exception: If the API call fails
        """
        pass

    @abstractmethod
    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string.

        Args:
            text: The text to count tokens for

        Returns:
            Number of tokens in the text
        """
        pass
