from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AgentOutputType, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project import Project
    from app.models.project_workflow import ProjectWorkflow
    from app.models.project_workflow_step import ProjectWorkflowStep
    from app.models.task import Task
    from app.models.user import User
    from app.models.workspace import Workspace


class AgentOutput(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "agent_outputs"

    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    knowledge_base_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_bases.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    workflow_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("project_workflows.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    workflow_step_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("project_workflow_steps.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    output_type: Mapped[AgentOutputType] = mapped_column(
        enum_column(AgentOutputType, "agent_output_type"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_refs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    source_task_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    project: Mapped[Project | None] = relationship(back_populates="agent_outputs")
    knowledge_base: Mapped[KnowledgeBase | None] = relationship(back_populates="agent_outputs")
    workspace: Mapped[Workspace | None] = relationship(back_populates="agent_outputs")
    workflow: Mapped[ProjectWorkflow | None] = relationship(back_populates="agent_outputs")
    workflow_step: Mapped[ProjectWorkflowStep | None] = relationship(back_populates="agent_outputs")
    source_task: Mapped[Task | None] = relationship(back_populates="agent_outputs")
    created_by: Mapped[User] = relationship(
        back_populates="created_agent_outputs",
        foreign_keys=[created_by_id],
    )
