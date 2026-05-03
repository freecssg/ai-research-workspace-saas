from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models import User
from app.schemas.auth import ChangePasswordRequest, LoginRequest, LoginResponse
from app.schemas.user import UserRead
from app.services.common import unauthorized


class AuthService:
    @staticmethod
    def authenticate(db: Session, credentials: LoginRequest) -> LoginResponse:
        user = db.scalar(select(User).where(User.email == credentials.email))
        password = credentials.password.get_secret_value()
        if (
            user is None
            or not user.is_active
            or not verify_password(password, user.hashed_password)
        ):
            raise unauthorized("Invalid email or password")

        return LoginResponse(
            access_token=create_access_token(str(user.id)),
            user=UserRead.model_validate(user),
        )

    @staticmethod
    def change_password(
        db: Session,
        user: User,
        payload: ChangePasswordRequest,
    ) -> User:
        if not verify_password(
            payload.current_password.get_secret_value(),
            user.hashed_password,
        ):
            raise unauthorized("Current password is incorrect")

        user.hashed_password = hash_password(payload.new_password.get_secret_value())
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
