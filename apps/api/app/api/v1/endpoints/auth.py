from fastapi import APIRouter, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserRead
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: SessionDep) -> UserRead:
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: SessionDep) -> Token:
    user = auth_service.authenticate_user(db, payload)
    return auth_service.create_user_token(user)


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser) -> UserRead:
    return current_user
