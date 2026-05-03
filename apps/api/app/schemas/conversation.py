from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, ReadModel


class ConversationBase(APIModel):
    title: str = Field(min_length=1, max_length=255)


class ConversationCreate(ConversationBase):
    pass


class ConversationUpdate(APIModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)


class ConversationRead(ConversationBase, ReadModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    project_id: UUID | None = None
    created_by_id: UUID
