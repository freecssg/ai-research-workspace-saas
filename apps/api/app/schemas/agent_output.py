from uuid import UUID

from pydantic import Field

from app.models.enums import AgentOutputStatus, AgentOutputType
from app.schemas.common import APIModel, ReadModel


class AgentOutputBase(APIModel):
    title: str = Field(min_length=1, max_length=255)
    output_type: AgentOutputType
    status: AgentOutputStatus = AgentOutputStatus.DRAFT
    content: str | None = None
    storage_path: str | None = Field(default=None, max_length=1024)


class AgentOutputCreate(AgentOutputBase):
    workspace_id: UUID
    project_id: UUID | None = None
    source_task_id: UUID | None = None


class AgentOutputUpdate(APIModel):
    project_id: UUID | None = None
    source_task_id: UUID | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    output_type: AgentOutputType | None = None
    status: AgentOutputStatus | None = None
    content: str | None = None
    storage_path: str | None = Field(default=None, max_length=1024)


class AgentOutputRead(AgentOutputBase, ReadModel):
    workspace_id: UUID
    project_id: UUID | None = None
    source_task_id: UUID | None = None
