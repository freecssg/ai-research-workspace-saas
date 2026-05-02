from uuid import UUID

from pydantic import Field

from app.models.enums import KnowledgeBaseStatus
from app.schemas.common import APIModel, ReadModel


class KnowledgeBaseBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    status: KnowledgeBaseStatus = KnowledgeBaseStatus.PENDING


class KnowledgeBaseCreate(KnowledgeBaseBase):
    workspace_id: UUID
    project_id: UUID | None = None


class KnowledgeBaseUpdate(APIModel):
    project_id: UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    status: KnowledgeBaseStatus | None = None


class KnowledgeBaseRead(KnowledgeBaseBase, ReadModel):
    workspace_id: UUID
    project_id: UUID | None = None
