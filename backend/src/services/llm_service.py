"""LLM Service with provider factory pattern."""
from typing import Dict, Any, List
from src.core.config import settings
from src.services.providers.base import LLMProvider
from src.services.providers.gemini import GeminiProvider


class LLMService:
    """Service for managing LLM provider interactions.

    Implements a factory pattern to instantiate the correct provider
    based on configuration. Handles provider selection and response generation.
    """

    _providers: Dict[str, type[LLMProvider]] = {
        "gemini": GeminiProvider,
        # Future providers can be added here:
        # "openrouter": OpenRouterProvider,
        # "cohere": CohereProvider,
    }

    def __init__(self):
        """Initialize the LLM service with configured provider."""
        self.provider = self._create_provider()

    def _create_provider(self) -> LLMProvider:
        """Factory method to create the appropriate LLM provider.

        Returns:
            Configured LLM provider instance

        Raises:
            ValueError: If provider is not supported or API key is missing
        """
        provider_name = settings.AI_PROVIDER.lower()

        if provider_name not in self._providers:
            raise ValueError(
                f"Unsupported AI provider: {provider_name}. "
                f"Supported providers: {', '.join(self._providers.keys())}"
            )

        # Get API key based on provider
        api_key = None
        if provider_name == "gemini":
            api_key = settings.GEMINI_API_KEY
        elif provider_name == "openrouter":
            api_key = settings.OPENROUTER_API_KEY
        elif provider_name == "cohere":
            api_key = settings.COHERE_API_KEY

        if not api_key:
            raise ValueError(
                f"API key not configured for provider: {provider_name}. "
                f"Please set the appropriate API key in .env file."
            )

        # Instantiate provider
        provider_class = self._providers[provider_name]
        return provider_class(api_key=api_key)

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate a response from the configured LLM provider.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            system_prompt: Optional system prompt to guide the AI's behavior
            max_tokens: Maximum tokens to generate in the response
            temperature: Sampling temperature (0.0 to 1.0)

        Returns:
            Dict containing:
                - content: The generated response text
                - token_count: Number of tokens used
                - model: Model name used

        Raises:
            Exception: If the provider API call fails
        """
        return await self.provider.generate_response(
            messages=messages,
            system_prompt=system_prompt,
            max_tokens=max_tokens,
            temperature=temperature
        )

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string.

        Args:
            text: The text to count tokens for

        Returns:
            Number of tokens in the text
        """
        return self.provider.count_tokens(text)

    @staticmethod
    def get_default_system_prompt() -> str:
        """Get the default system prompt for the chatbot with intent recognition.

        Returns:
            Default system prompt string with intent detection guidance
        """
        return """You are a helpful AI assistant for a todo list application.
You can help users manage their tasks, answer questions, and provide assistance.

## Intent Recognition
You should recognize and acknowledge the following todo-related intents:
- **Add Task**: User wants to create a new task (e.g., "add a task", "create a todo", "remind me to...")
- **Update Task**: User wants to modify an existing task (e.g., "update task", "change the title", "mark as complete")
- **Delete Task**: User wants to remove a task (e.g., "delete task", "remove todo", "cancel that")
- **List Tasks**: User wants to see their tasks (e.g., "show my tasks", "what do I need to do", "list todos")
- **General Help**: User needs assistance or has questions

## Current Capabilities (Phase 1)
In Phase 1, you can engage in natural conversation but cannot yet perform task operations.
When users express todo-related intents, you should:
1. **Acknowledge** their intent clearly (e.g., "I understand you want to add a task...")
2. **Explain** that task management features will be available in Phase 2
3. **Ask clarifying questions** if the request is ambiguous (e.g., "What would you like the task to be about?")
4. **Be encouraging** and let them know you're here to help once the feature is ready

## Response Guidelines
- Be friendly, concise, and helpful
- Use natural, conversational language
- Ask clarifying questions when needed
- Show empathy and understanding
- Maintain context across the conversation"""

    @staticmethod
    def get_intent_acknowledgment_template(intent: str) -> str:
        """Get acknowledgment template for a specific intent.

        Args:
            intent: The detected intent (add_task, update_task, delete_task, list_tasks)

        Returns:
            Acknowledgment template string
        """
        templates = {
            "add_task": """I understand you want to add a new task! 📝

While I can't create tasks yet (this feature is coming in Phase 2), I'd be happy to help you plan it out. What would you like the task to be about?""",

            "update_task": """I see you want to update a task! ✏️

Task editing capabilities will be available in Phase 2. In the meantime, I can help you think through what changes you'd like to make.""",

            "delete_task": """I understand you want to remove a task! 🗑️

Task deletion will be available in Phase 2. For now, I can help you organize your thoughts about which tasks to keep or remove.""",

            "list_tasks": """I see you want to view your tasks! 📋

Task listing functionality will be available in Phase 2. Once it's ready, you'll be able to see all your tasks, filter them, and manage them easily.""",

            "general_help": """I'm here to help! 🤝

Right now, I can chat with you about your tasks and help you plan. Full task management features (add, update, delete, list) will be available in Phase 2.

What would you like to know or discuss?"""
        }

        return templates.get(intent, templates["general_help"])
