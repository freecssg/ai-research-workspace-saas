from uuid import UUID

from pydantic import Field

from app.models.enums import KnowledgeBaseStatus
from app.schemas.common import APIModel, ReadModel


class KnowledgeBaseBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    research_domain: str = Field(min_length=1, max_length=255)
    status: KnowledgeBaseStatus = KnowledgeBaseStatus.DRAFT


class KnowledgeBaseCreate(KnowledgeBaseBase):
    pass


class KnowledgeBaseUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    research_domain: str | None = Field(default=None, min_length=1, max_length=255)
    status: KnowledgeBaseStatus | None = None


class KnowledgeBaseRead(KnowledgeBaseBase, ReadModel):
    created_by_id: UUID
