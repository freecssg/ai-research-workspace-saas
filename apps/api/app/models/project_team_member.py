from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ProjectMemberRole, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.user import User


class ProjectTeamMember(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_team_members"
    __table_args__ = (
        UniqueConstraint(
            "project_id", "user_id", name="uq_project_team_members_project_id_user_id"
        ),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    member_role: Mapped[ProjectMemberRole] = mapped_column(
        enum_column(ProjectMemberRole, "project_member_role"),
        nullable=False,
        default=ProjectMemberRole.VIEWER,
        server_default=ProjectMemberRole.VIEWER.value,
    )

    project: Mapped[Project] = relationship(back_populates="team_members")
    user: Mapped[User] = relationship(back_populates="project_memberships")
