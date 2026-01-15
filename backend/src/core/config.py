from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Database
    DATABASE_URL: str

    # Application
    APP_NAME: str = "Task CRUD API"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Authentication
    BETTER_AUTH_SECRET: str  # Required - must be set in .env
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 7

    # LLM Provider Configuration
    LLM_PROVIDER: str = "gemini"  # Primary provider: gemini, openrouter, cohere
    FALLBACK_PROVIDER: str | None = None  # Optional fallback provider
    GEMINI_API_KEY: str | None = None  # Required if using Gemini
    OPENROUTER_API_KEY: str | None = None  # Required if using OpenRouter
    COHERE_API_KEY: str | None = None  # Required if using Cohere

    # Agent Configuration
    AGENT_TEMPERATURE: float = 0.7  # Sampling temperature (0.0 to 1.0)
    AGENT_MAX_TOKENS: int = 8192  # Maximum tokens in response

    # Conversation Settings (for free-tier constraints)
    CONVERSATION_MAX_MESSAGES: int = 20  # Maximum messages to keep in history
    CONVERSATION_MAX_TOKENS: int = 8000  # Maximum tokens in conversation history

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
