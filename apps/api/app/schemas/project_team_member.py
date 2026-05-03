from uuid import UUID

from app.models.enums import ProjectMemberRole
from app.schemas.common import APIModel, ReadModel


class ProjectTeamMemberBase(APIModel):
    user_id: UUID
    member_role: ProjectMemberRole = ProjectMemberRole.VIEWER


class ProjectTeamMemberCreate(ProjectTeamMemberBase):
    pass


class ProjectTeamMemberUpdate(APIModel):
    member_role: ProjectMemberRole | None = None


class ProjectTeamMemberRead(ProjectTeamMemberBase, ReadModel):
    project_id: UUID
