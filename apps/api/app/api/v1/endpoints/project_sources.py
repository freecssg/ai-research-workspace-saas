from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, ProjectEditor, SessionDep
from app.schemas.common import Message
from app.schemas.project_source_selection import (
    ProjectSourceSelectionCreate,
    ProjectSourceSelectionRead,
)
from app.services.project_source_service import ProjectSourceService

router = APIRouter(prefix="/projects/{project_id}/sources", tags=["project-sources"])


@router.get("", response_model=list[ProjectSourceSelectionRead])
def list_project_sources(
    project_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[ProjectSourceSelectionRead]:
    return [
        ProjectSourceSelectionRead.model_validate(source)
        for source in ProjectSourceService.list_sources(db, project_id, skip, limit)
    ]


@router.post("", response_model=ProjectSourceSelectionRead, status_code=201)
def add_project_source(
    project_id: UUID,
    payload: ProjectSourceSelectionCreate,
    db: SessionDep,
    current_user: CurrentUser,
    _: ProjectEditor,
) -> ProjectSourceSelectionRead:
    source = ProjectSourceService.create_source(db, project_id, payload, current_user)
    return ProjectSourceSelectionRead.model_validate(source)


@router.delete("/{source_selection_id}", response_model=Message)
def delete_project_source(
    project_id: UUID,
    source_selection_id: UUID,
    db: SessionDep,
    _: ProjectEditor,
) -> Message:
    ProjectSourceService.delete_source(db, project_id, source_selection_id)
    return Message(detail="Project source selection deleted")
