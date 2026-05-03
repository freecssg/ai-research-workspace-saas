from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.auth import ChangePasswordRequest, LoginRequest, LoginResponse
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: SessionDep) -> LoginResponse:
    return AuthService.authenticate(db, payload)


@router.get("/me", response_model=UserRead)
def get_me(current_user: CurrentUser) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/change-password", response_model=UserRead)
def change_password(
    payload: ChangePasswordRequest,
    db: SessionDep,
    current_user: CurrentUser,
) -> UserRead:
    user = AuthService.change_password(db, current_user, payload)
    return UserRead.model_validate(user)
