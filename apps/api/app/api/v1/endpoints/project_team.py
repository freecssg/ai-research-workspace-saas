from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, ProjectLeader, SessionDep
from app.schemas.common import Message
from app.schemas.project_team_member import (
    ProjectTeamMemberCreate,
    ProjectTeamMemberRead,
    ProjectTeamMemberUpdate,
)
from app.services.project_team_service import ProjectTeamService

router = APIRouter(prefix="/projects/{project_id}/team", tags=["project-team"])


@router.get("", response_model=list[ProjectTeamMemberRead])
def list_project_team(
    project_id: UUID,
    db: SessionDep,
    _: CurrentUser,
) -> list[ProjectTeamMemberRead]:
    return [
        ProjectTeamMemberRead.model_validate(member)
        for member in ProjectTeamService.list_team(db, project_id)
    ]


@router.post("", response_model=ProjectTeamMemberRead, status_code=201)
def add_project_team_member(
    project_id: UUID,
    payload: ProjectTeamMemberCreate,
    db: SessionDep,
    _: ProjectLeader,
) -> ProjectTeamMemberRead:
    member = ProjectTeamService.add_member(db, project_id, payload)
    return ProjectTeamMemberRead.model_validate(member)


@router.patch("/{user_id}", response_model=ProjectTeamMemberRead)
def update_project_team_member(
    project_id: UUID,
    user_id: UUID,
    payload: ProjectTeamMemberUpdate,
    db: SessionDep,
    _: ProjectLeader,
) -> ProjectTeamMemberRead:
    member = ProjectTeamService.update_member(db, project_id, user_id, payload)
    return ProjectTeamMemberRead.model_validate(member)


@router.delete("/{user_id}", response_model=Message)
def remove_project_team_member(
    project_id: UUID,
    user_id: UUID,
    db: SessionDep,
    _: ProjectLeader,
) -> Message:
    ProjectTeamService.remove_member(db, project_id, user_id)
    return Message(detail="Project team member removed")
