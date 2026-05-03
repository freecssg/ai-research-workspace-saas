from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.common import Message
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
def list_projects(
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[ProjectRead]:
    return [
        ProjectRead.model_validate(project)
        for project in ProjectService.list_projects(db, skip, limit)
    ]


@router.post("", response_model=ProjectRead, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectRead:
    return ProjectRead.model_validate(ProjectService.create_project(db, payload, current_user))


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: UUID, db: SessionDep, _: CurrentUser) -> ProjectRead:
    return ProjectRead.model_validate(ProjectService.get_project(db, project_id))


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectRead:
    project = ProjectService.update_project(db, project_id, payload, current_user)
    return ProjectRead.model_validate(project)


@router.delete("/{project_id}", response_model=Message)
def delete_project(project_id: UUID, db: SessionDep, current_user: CurrentUser) -> Message:
    ProjectService.delete_project(db, project_id, current_user)
    return Message(detail="Project deleted")
