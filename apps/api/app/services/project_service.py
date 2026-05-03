from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, ProjectMemberRole, ProjectTeamMember, User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.common import get_or_404, paginate, require_project_editor


class ProjectService:
    @staticmethod
    def list_projects(db: Session, skip: int, limit: int) -> list[Project]:
        statement = select(Project).order_by(Project.created_at.desc())
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_project(db: Session, project_id: UUID) -> Project:
        return get_or_404(db, Project, project_id, "Project")

    @staticmethod
    def create_project(db: Session, payload: ProjectCreate, user: User) -> Project:
        project = Project(**payload.model_dump(), created_by_id=user.id)
        db.add(project)
        db.flush()
        db.add(
            ProjectTeamMember(
                project_id=project.id,
                user_id=user.id,
                member_role=ProjectMemberRole.LEADER,
            )
        )
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def update_project(
        db: Session,
        project_id: UUID,
        payload: ProjectUpdate,
        user: User,
    ) -> Project:
        project = require_project_editor(db, project_id, user)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(project, field, value)
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: UUID, user: User) -> None:
        project = require_project_editor(db, project_id, user)
        db.delete(project)
        db.commit()
