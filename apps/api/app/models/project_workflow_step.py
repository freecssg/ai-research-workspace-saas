from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AnalysisAgentType, WorkflowStepStatus, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.project_workflow import ProjectWorkflow


class ProjectWorkflowStep(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_workflow_steps"
    __table_args__ = (
        UniqueConstraint("workflow_id", "step_order", name="uq_project_workflow_steps_order"),
    )

    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("project_workflows.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    step_order: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    agent_type: Mapped[AnalysisAgentType | None] = mapped_column(
        enum_column(AnalysisAgentType, "workflow_step_agent_type"),
        nullable=True,
    )
    status: Mapped[WorkflowStepStatus] = mapped_column(
        enum_column(WorkflowStepStatus, "workflow_step_status"),
        nullable=False,
        default=WorkflowStepStatus.PENDING,
        server_default=WorkflowStepStatus.PENDING.value,
    )
    input_refs: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    output_refs: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    workflow: Mapped[ProjectWorkflow] = relationship(back_populates="steps")
    agent_outputs: Mapped[list[AgentOutput]] = relationship(back_populates="workflow_step")
