from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, ProjectTeamMember, User
from app.schemas.project_team_member import ProjectTeamMemberCreate, ProjectTeamMemberUpdate
from app.services.common import conflict, get_or_404, not_found


class ProjectTeamService:
    @staticmethod
    def list_team(db: Session, project_id: UUID) -> list[ProjectTeamMember]:
        get_or_404(db, Project, project_id, "Project")
        return list(
            db.scalars(
                select(ProjectTeamMember)
                .where(ProjectTeamMember.project_id == project_id)
                .order_by(ProjectTeamMember.created_at.asc())
            )
        )

    @staticmethod
    def add_member(
        db: Session,
        project_id: UUID,
        payload: ProjectTeamMemberCreate,
    ) -> ProjectTeamMember:
        get_or_404(db, Project, project_id, "Project")
        get_or_404(db, User, payload.user_id, "User")
        existing = db.scalar(
            select(ProjectTeamMember).where(
                ProjectTeamMember.project_id == project_id,
                ProjectTeamMember.user_id == payload.user_id,
            )
        )
        if existing is not None:
            raise conflict("User is already a project team member")

        membership = ProjectTeamMember(
            project_id=project_id,
            user_id=payload.user_id,
            member_role=payload.member_role,
        )
        db.add(membership)
        db.commit()
        db.refresh(membership)
        return membership

    @staticmethod
    def update_member(
        db: Session,
        project_id: UUID,
        user_id: UUID,
        payload: ProjectTeamMemberUpdate,
    ) -> ProjectTeamMember:
        membership = db.scalar(
            select(ProjectTeamMember).where(
                ProjectTeamMember.project_id == project_id,
                ProjectTeamMember.user_id == user_id,
            )
        )
        if membership is None:
            raise not_found("Project team member")
        if payload.member_role is not None:
            membership.member_role = payload.member_role
        db.add(membership)
        db.commit()
        db.refresh(membership)
        return membership

    @staticmethod
    def remove_member(db: Session, project_id: UUID, user_id: UUID) -> None:
        membership = db.scalar(
            select(ProjectTeamMember).where(
                ProjectTeamMember.project_id == project_id,
                ProjectTeamMember.user_id == user_id,
            )
        )
        if membership is None:
            raise not_found("Project team member")
        db.delete(membership)
        db.commit()
