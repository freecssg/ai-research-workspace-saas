from uuid import UUID

from pydantic import Field

from app.models.enums import ProjectStatus
from app.schemas.common import APIModel, ReadModel


class ProjectBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    status: ProjectStatus = ProjectStatus.ACTIVE


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    status: ProjectStatus | None = None


class ProjectRead(ProjectBase, ReadModel):
    workspace_id: UUID
