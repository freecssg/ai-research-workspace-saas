from uuid import UUID

from pydantic import Field

from app.models.enums import ProjectStatus, ProjectType
from app.schemas.common import APIModel, ReadModel


class ProjectBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    output_objective: str = Field(min_length=1)
    project_type: ProjectType
    status: ProjectStatus = ProjectStatus.DRAFT


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    output_objective: str | None = Field(default=None, min_length=1)
    project_type: ProjectType | None = None
    status: ProjectStatus | None = None


class ProjectRead(ProjectBase, ReadModel):
    created_by_id: UUID
