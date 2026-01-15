"""Gemini AI provider implementation."""
import google.generativeai as genai
from typing import List, Dict, Any
from .base import LLMProvider


class GeminiProvider(LLMProvider):
    """Google Gemini AI provider implementation.

    Uses the google-generativeai library to interact with Gemini models.
    Supports gemini-pro and other Gemini model variants.
    """

    def __init__(self, api_key: str, model_name: str = "google/gemini-2.0-flash-exp:free"):
        """Initialize the Gemini provider.

        Args:
            api_key: Google AI API key
            model_name: Gemini model name (default: gemini-pro)
        """
        super().__init__(api_key, model_name)
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate a response from Gemini.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            system_prompt: Optional system prompt to guide the AI's behavior
            max_tokens: Maximum tokens to generate in the response
            temperature: Sampling temperature (0.0 to 1.0)

        Returns:
            Dict containing:
                - content: The generated response text
                - token_count: Number of tokens used (estimated)
                - model: Model name used

        Raises:
            Exception: If the Gemini API call fails
        """
        try:
            # Build the conversation history for Gemini
            # Gemini expects a list of content parts
            chat_history = []

            # Add system prompt if provided
            if system_prompt:
                chat_history.append({
                    "role": "user",
                    "parts": [system_prompt]
                })
                chat_history.append({
                    "role": "model",
                    "parts": ["Understood. I will follow these instructions."]
                })

            # Convert messages to Gemini format
            for msg in messages:
                role = "model" if msg["role"] == "assistant" else "user"
                chat_history.append({
                    "role": role,
                    "parts": [msg["content"]]
                })

            # Start chat with history
            chat = self.model.start_chat(history=chat_history[:-1])  # Exclude last message

            # Generate response
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )

            response = chat.send_message(
                chat_history[-1]["parts"][0],
                generation_config=generation_config
            )

            # Extract response content
            content = response.text

            # Estimate token count (Gemini doesn't provide exact counts in free tier)
            token_count = self.count_tokens(content)

            return {
                "content": content,
                "token_count": token_count,
                "model": self.model_name
            }

        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string.

        Uses a simple estimation: ~4 characters per token (rough approximation).
        For more accurate counting, consider using tiktoken library.

        Args:
            text: The text to count tokens for

        Returns:
            Estimated number of tokens in the text
        """
        # Simple estimation: ~4 characters per token
        # This is a rough approximation for English text
        return len(text) // 4
