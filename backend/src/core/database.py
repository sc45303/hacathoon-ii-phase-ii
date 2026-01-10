from sqlmodel import create_engine, Session
from .config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)


def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session
