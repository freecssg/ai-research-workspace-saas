from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.common import get_owned_project, get_owned_workspace


def list_projects(
    db: Session,
    current_user: User,
    workspace_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[Project]:
    get_owned_workspace(db, current_user, workspace_id)
    return list(
        db.scalars(
            select(Project)
            .where(Project.workspace_id == workspace_id)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    )


def create_project(
    db: Session,
    current_user: User,
    workspace_id: UUID,
    payload: ProjectCreate,
) -> Project:
    get_owned_workspace(db, current_user, workspace_id)
    existing = db.scalar(
        select(Project).where(
            Project.workspace_id == workspace_id,
            Project.name == payload.name,
        )
    )
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Project name already exists in this workspace",
        )

    project = Project(
        workspace_id=workspace_id,
        **payload.model_dump(),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_project(db: Session, current_user: User, project_id: UUID) -> Project:
    return get_owned_project(db, current_user, project_id)


def update_project(
    db: Session,
    current_user: User,
    project_id: UUID,
    payload: ProjectUpdate,
) -> Project:
    project = get_owned_project(db, current_user, project_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != project.name:
        existing = db.scalar(
            select(Project).where(
                Project.workspace_id == project.workspace_id,
                Project.name == update_data["name"],
                Project.id != project.id,
            )
        )
        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Project name already exists in this workspace",
            )

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, current_user: User, project_id: UUID) -> None:
    project = get_owned_project(db, current_user, project_id)
    db.delete(project)
    db.commit()
