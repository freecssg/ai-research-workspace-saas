from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AgentOutputStatus, AgentOutputType, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.task import Task
    from app.models.workspace import Workspace


class AgentOutput(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "agent_outputs"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    source_task_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    output_type: Mapped[AgentOutputType] = mapped_column(
        enum_column(AgentOutputType, "agent_output_type"),
        nullable=False,
    )
    status: Mapped[AgentOutputStatus] = mapped_column(
        enum_column(AgentOutputStatus, "agent_output_status"),
        nullable=False,
        default=AgentOutputStatus.DRAFT,
        server_default=AgentOutputStatus.DRAFT.value,
    )
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    storage_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    workspace: Mapped[Workspace] = relationship(back_populates="agent_outputs")
    project: Mapped[Project | None] = relationship(back_populates="agent_outputs")
    source_task: Mapped[Task | None] = relationship(back_populates="agent_outputs")
