from sqlalchemy import Engine

from app.db.base import Base
from app.db.session import engine


def init_db(bind: Engine | None = None) -> None:
    """Create database tables for local smoke tests.

    Production and shared environments should use Alembic migrations instead.
    """
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=bind or engine)
