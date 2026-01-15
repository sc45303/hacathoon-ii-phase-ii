from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from .core.config import settings
from .api.routes import tasks, auth, chat, conversations
from .mcp import register_all_tools
from .core.exceptions import AIProviderException
from .schemas.error import ErrorResponse

# Configure logging
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)


# Global exception handler for AIProviderException
@app.exception_handler(AIProviderException)
async def ai_provider_exception_handler(request: Request, exc: AIProviderException):
    """Convert AIProviderException to structured ErrorResponse."""
    error_response = ErrorResponse(
        error_code=exc.error_code,
        detail=exc.detail,
        source=exc.source,
        provider=exc.provider
    )
    logger.error(
        f"AI Provider Error: {exc.error_code} - {exc.detail} "
        f"(Provider: {exc.provider}, Status: {exc.status_code})"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


# Global exception handler for generic HTTPException
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler for unexpected errors."""
    # Log the full exception for debugging
    logger.exception(f"Unhandled exception: {str(exc)}")

    # Return structured error response
    error_response = ErrorResponse(
        error_code="INTERNAL_ERROR",
        detail="An unexpected error occurred. Please try again later.",
        source="INTERNAL"
    )
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    logger.info("Starting application initialization...")

    # Register all MCP tools with the tool registry
    try:
        register_all_tools()
        logger.info("MCP tools registered successfully")
    except Exception as e:
        logger.error(f"Failed to register MCP tools: {str(e)}")
        raise

    logger.info("Application initialization complete")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(chat.router)
app.include_router(conversations.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Task CRUD API", "status": "running"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
