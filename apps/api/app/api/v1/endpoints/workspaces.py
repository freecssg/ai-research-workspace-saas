from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead, WorkspaceUpdate
from app.services import workspace_service

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

SkipQuery = Annotated[int, Query(ge=0)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=list[WorkspaceRead])
def list_workspaces(
    db: SessionDep,
    current_user: CurrentUser,
    skip: SkipQuery = 0,
    limit: LimitQuery = 50,
) -> list[WorkspaceRead]:
    return workspace_service.list_workspaces(db, current_user, skip, limit)


@router.post("", response_model=WorkspaceRead, status_code=status.HTTP_201_CREATED)
def create_workspace(
    payload: WorkspaceCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> WorkspaceRead:
    return workspace_service.create_workspace(db, current_user, payload)


@router.get("/{workspace_id}", response_model=WorkspaceRead)
def get_workspace(
    workspace_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> WorkspaceRead:
    return workspace_service.get_workspace(db, current_user, workspace_id)


@router.patch("/{workspace_id}", response_model=WorkspaceRead)
def update_workspace(
    workspace_id: UUID,
    payload: WorkspaceUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> WorkspaceRead:
    return workspace_service.update_workspace(db, current_user, workspace_id, payload)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(
    workspace_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Response:
    workspace_service.delete_workspace(db, current_user, workspace_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
