from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TaskScope, TaskStatus, TaskType, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project import Project
    from app.models.user import User
    from app.models.workspace import Workspace


class Task(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("progress >= 0 AND progress <= 100", name="progress_percent_range"),
    )

    task_scope: Mapped[TaskScope] = mapped_column(
        enum_column(TaskScope, "task_scope"), nullable=False
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
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    task_type: Mapped[TaskType] = mapped_column(enum_column(TaskType, "task_type"), nullable=False)
    status: Mapped[TaskStatus] = mapped_column(
        enum_column(TaskStatus, "task_status"),
        nullable=False,
        default=TaskStatus.QUEUED,
        server_default=TaskStatus.QUEUED.value,
    )
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_ref: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    knowledge_base: Mapped[KnowledgeBase | None] = relationship(back_populates="tasks")
    workspace: Mapped[Workspace | None] = relationship(back_populates="tasks")
    project: Mapped[Project | None] = relationship(back_populates="tasks")
    created_by: Mapped[User] = relationship(
        back_populates="created_tasks",
        foreign_keys=[created_by_id],
    )
    agent_outputs: Mapped[list[AgentOutput]] = relationship(
        back_populates="source_task",
        passive_deletes=True,
    )
