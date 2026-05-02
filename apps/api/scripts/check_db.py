from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.db.session import engine


def main() -> None:
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar_one()
    except SQLAlchemyError as exc:
        raise SystemExit(f"Database connection failed for {settings.database_url}: {exc}") from exc

    if result != 1:
        raise SystemExit(f"Database check returned unexpected result: {result!r}")

    print("Database connection ok: SELECT 1 returned 1")


if __name__ == "__main__":
    main()
