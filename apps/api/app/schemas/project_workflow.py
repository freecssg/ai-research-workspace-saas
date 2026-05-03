from uuid import UUID

from pydantic import Field

from app.models.enums import WorkflowStatus, WorkflowType
from app.schemas.common import APIModel, ReadModel


class ProjectWorkflowBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    workflow_type: WorkflowType
    status: WorkflowStatus = WorkflowStatus.DRAFT


class ProjectWorkflowCreate(ProjectWorkflowBase):
    pass


class ProjectWorkflowUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    workflow_type: WorkflowType | None = None
    status: WorkflowStatus | None = None


class ProjectWorkflowRead(ProjectWorkflowBase, ReadModel):
    project_id: UUID
    created_by_id: UUID
