from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate
from app.services.common import get_owned_workspace


def list_workspaces(
    db: Session,
    current_user: User,
    skip: int = 0,
    limit: int = 50,
) -> list[Workspace]:
    return list(
        db.scalars(
            select(Workspace)
            .where(Workspace.owner_id == current_user.id)
            .order_by(Workspace.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    )


def create_workspace(db: Session, current_user: User, payload: WorkspaceCreate) -> Workspace:
    existing = db.scalar(
        select(Workspace).where(
            Workspace.owner_id == current_user.id,
            Workspace.name == payload.name,
        )
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Workspace name already exists",
        )

    workspace = Workspace(
        owner_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace


def get_workspace(db: Session, current_user: User, workspace_id: UUID) -> Workspace:
    return get_owned_workspace(db, current_user, workspace_id)


def update_workspace(
    db: Session,
    current_user: User,
    workspace_id: UUID,
    payload: WorkspaceUpdate,
) -> Workspace:
    workspace = get_owned_workspace(db, current_user, workspace_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != workspace.name:
        existing = db.scalar(
            select(Workspace).where(
                Workspace.owner_id == current_user.id,
                Workspace.name == update_data["name"],
                Workspace.id != workspace.id,
            )
        )
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Workspace name already exists",
            )

    for field, value in update_data.items():
        setattr(workspace, field, value)

    db.commit()
    db.refresh(workspace)
    return workspace


def delete_workspace(db: Session, current_user: User, workspace_id: UUID) -> None:
    workspace = get_owned_workspace(db, current_user, workspace_id)
    db.delete(workspace)
    db.commit()
