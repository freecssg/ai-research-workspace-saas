from __future__ import annotations

# ruff: noqa: E402,I001

import argparse
import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import User
from app.models.enums import UserRole


def _require_setting(value: str | None, env_name: str) -> str:
    if value is None or not value.strip():
        raise SystemExit(
            f"{env_name} is required. Set it in .env or export it before running this script."
        )
    return value.strip()


def create_default_admin(reset_password: bool = False) -> str:
    email = _require_setting(settings.default_admin_email, "DEFAULT_ADMIN_EMAIL").lower()
    name = _require_setting(settings.default_admin_name, "DEFAULT_ADMIN_NAME")
    password = _require_setting(settings.default_admin_password, "DEFAULT_ADMIN_PASSWORD")
    should_reset_password = reset_password or settings.default_admin_reset_password

    with SessionLocal() as db:
        try:
            user = db.scalar(select(User).where(User.email == email))

            if user is None:
                db.add(
                    User(
                        email=email,
                        name=name,
                        hashed_password=hash_password(password),
                        role=UserRole.ADMIN,
                        is_active=True,
                    )
                )
                db.commit()
                return f"Default admin user created: {email} (role=admin, active=true)."

            changes: list[str] = []
            if user.role != UserRole.ADMIN:
                user.role = UserRole.ADMIN
                changes.append("role=admin")
            if not user.is_active:
                user.is_active = True
                changes.append("active=true")
            if should_reset_password:
                user.hashed_password = hash_password(password)
                changes.append("password reset")

            if changes:
                db.add(user)
                db.commit()
                return f"Default admin user updated: {email} ({', '.join(changes)})."

            db.rollback()
            return f"Default admin user already exists: {email} (password unchanged)."
        except SQLAlchemyError:
            db.rollback()
            raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create or update the local development default admin user."
    )
    parser.add_argument(
        "--reset-password",
        action="store_true",
        help="Reset the default admin password from DEFAULT_ADMIN_PASSWORD.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        message = create_default_admin(reset_password=args.reset_password)
    except SQLAlchemyError:
        print(
            "Could not create default admin user. Ensure PostgreSQL is running, "
            "DATABASE_URL is correct, and migrations have been applied.",
            file=sys.stderr,
        )
        return 1

    print(message)
    return 0


if __name__ == "__main__":
    sys.exit(main())
