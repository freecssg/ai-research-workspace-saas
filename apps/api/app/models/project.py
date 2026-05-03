from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ProjectStatus, ProjectType, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.conversation import Conversation
    from app.models.project_source_selection import ProjectSourceSelection
    from app.models.project_team_member import ProjectTeamMember
    from app.models.project_workflow import ProjectWorkflow
    from app.models.task import Task
    from app.models.user import User


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "projects"

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_objective: Mapped[str] = mapped_column(Text, nullable=False)
    project_type: Mapped[ProjectType] = mapped_column(
        enum_column(ProjectType, "project_type"),
        nullable=False,
    )
    status: Mapped[ProjectStatus] = mapped_column(
        enum_column(ProjectStatus, "project_status"),
        nullable=False,
        default=ProjectStatus.DRAFT,
        server_default=ProjectStatus.DRAFT.value,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    created_by: Mapped[User] = relationship(
        back_populates="created_projects",
        foreign_keys=[created_by_id],
    )
    team_members: Mapped[list[ProjectTeamMember]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    source_selections: Mapped[list[ProjectSourceSelection]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    workflows: Mapped[list[ProjectWorkflow]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    conversations: Mapped[list[Conversation]] = relationship(back_populates="project")
    tasks: Mapped[list[Task]] = relationship(back_populates="project")
    agent_outputs: Mapped[list[AgentOutput]] = relationship(back_populates="project")
