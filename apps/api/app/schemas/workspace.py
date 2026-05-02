from uuid import UUID

from pydantic import Field

from app.schemas.common import APIModel, ReadModel


class WorkspaceBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None


class WorkspaceRead(WorkspaceBase, ReadModel):
    owner_id: UUID
