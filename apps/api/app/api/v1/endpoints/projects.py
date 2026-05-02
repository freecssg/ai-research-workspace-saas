from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services import project_service

router = APIRouter(tags=["projects"])

SkipQuery = Annotated[int, Query(ge=0)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("/workspaces/{workspace_id}/projects", response_model=list[ProjectRead])
def list_projects(
    workspace_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    skip: SkipQuery = 0,
    limit: LimitQuery = 50,
) -> list[ProjectRead]:
    return project_service.list_projects(db, current_user, workspace_id, skip, limit)


@router.post(
    "/workspaces/{workspace_id}/projects",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    workspace_id: UUID,
    payload: ProjectCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectRead:
    return project_service.create_project(db, current_user, workspace_id, payload)


@router.get("/projects/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectRead:
    return project_service.get_project(db, current_user, project_id)


@router.patch("/projects/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectRead:
    return project_service.update_project(db, current_user, project_id, payload)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Response:
    project_service.delete_project(db, current_user, project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
