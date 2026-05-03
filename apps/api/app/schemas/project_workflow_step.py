from typing import Any
from uuid import UUID

from pydantic import Field

from app.models.enums import AnalysisAgentType, WorkflowStepStatus
from app.schemas.common import APIModel, ReadModel


class ProjectWorkflowStepBase(APIModel):
    step_order: int = Field(ge=0)
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    agent_type: AnalysisAgentType | None = None
    status: WorkflowStepStatus = WorkflowStepStatus.PENDING
    input_refs: dict[str, Any] | None = None
    output_refs: dict[str, Any] | None = None


class ProjectWorkflowStepCreate(ProjectWorkflowStepBase):
    pass


class ProjectWorkflowStepUpdate(APIModel):
    step_order: int | None = Field(default=None, ge=0)
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    agent_type: AnalysisAgentType | None = None
    status: WorkflowStepStatus | None = None
    input_refs: dict[str, Any] | None = None
    output_refs: dict[str, Any] | None = None


class ProjectWorkflowStepRead(ProjectWorkflowStepBase, ReadModel):
    workflow_id: UUID
