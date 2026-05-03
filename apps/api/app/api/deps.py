from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Project, User
from app.services.common import require_admin, require_project_editor, require_project_leader

bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[Session, Depends(get_db)]
BearerCredentials = Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]


def get_current_user(
    db: SessionDep,
    credentials: BearerCredentials,
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject = payload.get("sub")
    try:
        user_id = UUID(str(subject))
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is not active",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_admin_user(current_user: CurrentUser) -> User:
    return require_admin(current_user)


AdminUser = Annotated[User, Depends(get_current_admin_user)]


def get_editable_project(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Project:
    return require_project_editor(db, project_id, current_user)


ProjectEditor = Annotated[Project, Depends(get_editable_project)]


def get_manageable_project_team(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Project:
    return require_project_leader(db, project_id, current_user)


ProjectLeader = Annotated[Project, Depends(get_manageable_project_team)]
