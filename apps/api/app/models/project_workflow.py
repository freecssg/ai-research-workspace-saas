from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import WorkflowStatus, WorkflowType, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.project import Project
    from app.models.project_workflow_step import ProjectWorkflowStep
    from app.models.user import User


class ProjectWorkflow(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_workflows"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    workflow_type: Mapped[WorkflowType] = mapped_column(
        enum_column(WorkflowType, "workflow_type"),
        nullable=False,
    )
    status: Mapped[WorkflowStatus] = mapped_column(
        enum_column(WorkflowStatus, "workflow_status"),
        nullable=False,
        default=WorkflowStatus.DRAFT,
        server_default=WorkflowStatus.DRAFT.value,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    project: Mapped[Project] = relationship(back_populates="workflows")
    created_by: Mapped[User] = relationship(
        back_populates="created_workflows",
        foreign_keys=[created_by_id],
    )
    steps: Mapped[list[ProjectWorkflowStep]] = relationship(
        back_populates="workflow",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    agent_outputs: Mapped[list[AgentOutput]] = relationship(back_populates="workflow")
