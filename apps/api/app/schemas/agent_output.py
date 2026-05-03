from typing import Any
from uuid import UUID

from pydantic import Field

from app.models.enums import AgentOutputType
from app.schemas.common import APIModel, ReadModel


class AgentOutputBase(APIModel):
    output_type: AgentOutputType
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    source_refs: dict[str, Any] | None = None


class AgentOutputCreate(AgentOutputBase):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    workflow_id: UUID | None = None
    workflow_step_id: UUID | None = None
    source_task_id: UUID | None = None


class AgentOutputUpdate(APIModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    workflow_id: UUID | None = None
    workflow_step_id: UUID | None = None
    source_task_id: UUID | None = None
    output_type: AgentOutputType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    source_refs: dict[str, Any] | None = None


class AgentOutputRead(AgentOutputBase, ReadModel):
    project_id: UUID | None = None
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    workflow_id: UUID | None = None
    workflow_step_id: UUID | None = None
    source_task_id: UUID | None = None
    created_by_id: UUID
