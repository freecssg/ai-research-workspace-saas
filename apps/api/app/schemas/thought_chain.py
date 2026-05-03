from typing import Any
from uuid import UUID

from pydantic import Field

from app.models.enums import ThoughtChainType
from app.schemas.common import APIModel, ReadModel


class ThoughtChainBase(APIModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    chain_type: ThoughtChainType
    content: dict[str, Any]


class ThoughtChainCreate(ThoughtChainBase):
    pass


class ThoughtChainUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    chain_type: ThoughtChainType | None = None
    content: dict[str, Any] | None = None


class ThoughtChainRead(ThoughtChainBase, ReadModel):
    knowledge_base_id: UUID
    workspace_id: UUID | None = None
    created_by_id: UUID
