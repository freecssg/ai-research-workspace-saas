from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.common import conflict, get_or_404, paginate


class UserService:
    @staticmethod
    def list_users(db: Session, skip: int, limit: int) -> list[User]:
        statement = select(User).order_by(User.created_at.desc())
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_user(db: Session, user_id: UUID) -> User:
        return get_or_404(db, User, user_id, "User")

    @staticmethod
    def create_user(db: Session, payload: UserCreate) -> User:
        existing = db.scalar(select(User).where(User.email == payload.email))
        if existing is not None:
            raise conflict("A user with this email already exists")

        user = User(
            email=payload.email,
            name=payload.name,
            hashed_password=hash_password(payload.password.get_secret_value()),
            role=payload.role,
            is_active=payload.is_active,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(db: Session, user_id: UUID, payload: UserUpdate) -> User:
        user = UserService.get_user(db, user_id)
        data = payload.model_dump(exclude_unset=True)

        if "email" in data and data["email"] != user.email:
            existing = db.scalar(select(User).where(User.email == data["email"]))
            if existing is not None and existing.id != user.id:
                raise conflict("A user with this email already exists")
            user.email = data["email"]

        if "name" in data:
            user.name = data["name"]
        if "role" in data:
            user.role = data["role"]
        if "is_active" in data:
            user.is_active = data["is_active"]
        if "password" in data:
            user.hashed_password = hash_password(data["password"].get_secret_value())

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def deactivate_user(db: Session, user_id: UUID, current_user: User) -> None:
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admins cannot deactivate their own account",
            )
        user = UserService.get_user(db, user_id)
        user.is_active = False
        db.add(user)
        db.commit()
