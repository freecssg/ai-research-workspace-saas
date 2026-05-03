from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models import Project, ProjectMemberRole, ProjectTeamMember, User, UserRole


def bad_request(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def unauthorized(detail: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def forbidden(detail: str = "Not enough permissions") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def not_found(resource: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


def conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def validate_pagination(skip: int, limit: int) -> tuple[int, int]:
    if skip < 0:
        raise bad_request("skip must be greater than or equal to 0")
    if limit < 1 or limit > 200:
        raise bad_request("limit must be between 1 and 200")
    return skip, limit


def paginate(statement: Select[tuple[Any]], skip: int, limit: int) -> Select[tuple[Any]]:
    skip, limit = validate_pagination(skip, limit)
    return statement.offset(skip).limit(limit)


def get_or_404(db: Session, model: type[Any], entity_id: UUID, resource: str) -> Any:
    entity = db.get(model, entity_id)
    if entity is None:
        raise not_found(resource)
    return entity


def require_admin(user: User) -> User:
    if user.role != UserRole.ADMIN:
        raise forbidden("Admin privileges required")
    return user


def get_project_member(
    db: Session,
    project_id: UUID,
    user_id: UUID,
) -> ProjectTeamMember | None:
    return db.scalar(
        select(ProjectTeamMember).where(
            ProjectTeamMember.project_id == project_id,
            ProjectTeamMember.user_id == user_id,
        )
    )


def can_edit_project(db: Session, project_id: UUID, user: User) -> bool:
    if user.role == UserRole.ADMIN:
        return True
    membership = get_project_member(db, project_id, user.id)
    return membership is not None and membership.member_role in {
        ProjectMemberRole.LEADER,
        ProjectMemberRole.EDITOR,
    }


def require_project_editor(db: Session, project_id: UUID, user: User) -> Project:
    project = get_or_404(db, Project, project_id, "Project")
    if not can_edit_project(db, project_id, user):
        raise forbidden("Project leader or editor access required")
    return project


def require_project_leader(db: Session, project_id: UUID, user: User) -> Project:
    project = get_or_404(db, Project, project_id, "Project")
    if user.role == UserRole.ADMIN:
        return project
    membership = get_project_member(db, project_id, user.id)
    if membership is None or membership.member_role != ProjectMemberRole.LEADER:
        raise forbidden("Project leader access required")
    return project


def require_creator_or_admin(entity: Any, user: User) -> None:
    if user.role == UserRole.ADMIN:
        return
    if getattr(entity, "created_by_id", None) != user.id:
        raise forbidden("Creator or admin access required")
