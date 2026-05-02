from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import Project, User, Workspace


def not_found(resource: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} not found",
    )


def forbidden(resource: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"You do not have access to this {resource}",
    )


def get_workspace_or_404(db: Session, workspace_id: UUID) -> Workspace:
    workspace = db.get(Workspace, workspace_id)
    if workspace is None:
        raise not_found("Workspace")
    return workspace


def get_owned_workspace(db: Session, current_user: User, workspace_id: UUID) -> Workspace:
    workspace = get_workspace_or_404(db, workspace_id)
    if workspace.owner_id != current_user.id:
        raise forbidden("workspace")
    return workspace


def get_project_or_404(db: Session, project_id: UUID) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise not_found("Project")
    return project


def get_owned_project(db: Session, current_user: User, project_id: UUID) -> Project:
    project = get_project_or_404(db, project_id)
    get_owned_workspace(db, current_user, project.workspace_id)
    return project


def require_project_in_workspace(project: Project, workspace_id: UUID) -> None:
    if project.workspace_id != workspace_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project does not belong to the requested workspace",
        )
