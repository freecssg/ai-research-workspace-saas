from uuid import UUID

from fastapi import APIRouter

from app.api.deps import AdminUser, SessionDep
from app.schemas.common import Message
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserRead])
def list_users(
    db: SessionDep,
    _: AdminUser,
    skip: int = 0,
    limit: int = 50,
) -> list[UserRead]:
    return [UserRead.model_validate(user) for user in UserService.list_users(db, skip, limit)]


@router.post("", response_model=UserRead, status_code=201)
def create_user(payload: UserCreate, db: SessionDep, _: AdminUser) -> UserRead:
    return UserRead.model_validate(UserService.create_user(db, payload))


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: UUID, db: SessionDep, _: AdminUser) -> UserRead:
    return UserRead.model_validate(UserService.get_user(db, user_id))


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: UUID,
    payload: UserUpdate,
    db: SessionDep,
    _: AdminUser,
) -> UserRead:
    return UserRead.model_validate(UserService.update_user(db, user_id, payload))


@router.delete("/{user_id}", response_model=Message)
def delete_user(user_id: UUID, db: SessionDep, current_admin: AdminUser) -> Message:
    UserService.deactivate_user(db, user_id, current_admin)
    return Message(detail="User deactivated")
