from uuid import UUID

from pydantic import Field

from app.models.enums import WorkspaceStatus
from app.schemas.common import APIModel, ReadModel


class WorkspaceBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    research_topic: str = Field(min_length=1, max_length=255)
    status: WorkspaceStatus = WorkspaceStatus.DRAFT


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    research_topic: str | None = Field(default=None, min_length=1, max_length=255)
    status: WorkspaceStatus | None = None


class WorkspaceRead(WorkspaceBase, ReadModel):
    knowledge_base_id: UUID
    created_by_id: UUID
