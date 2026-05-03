from uuid import UUID

from fastapi import APIRouter

from app.api.deps import AdminUser, CurrentUser, SessionDep
from app.schemas.common import Message
from app.schemas.workspace import WorkspaceCreate, WorkspaceRead, WorkspaceUpdate
from app.services.workspace_service import WorkspaceService

router = APIRouter(tags=["workspaces"])


@router.get("/knowledge-bases/{kb_id}/workspaces", response_model=list[WorkspaceRead])
def list_workspaces(
    kb_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[WorkspaceRead]:
    return [
        WorkspaceRead.model_validate(workspace)
        for workspace in WorkspaceService.list_workspaces(db, kb_id, skip, limit)
    ]


@router.post("/knowledge-bases/{kb_id}/workspaces", response_model=WorkspaceRead, status_code=201)
def create_workspace(
    kb_id: UUID,
    payload: WorkspaceCreate,
    db: SessionDep,
    current_admin: AdminUser,
) -> WorkspaceRead:
    workspace = WorkspaceService.create_workspace(db, kb_id, payload, current_admin)
    return WorkspaceRead.model_validate(workspace)


@router.get("/workspaces/{workspace_id}", response_model=WorkspaceRead)
def get_workspace(workspace_id: UUID, db: SessionDep, _: CurrentUser) -> WorkspaceRead:
    return WorkspaceRead.model_validate(WorkspaceService.get_workspace(db, workspace_id))


@router.patch("/workspaces/{workspace_id}", response_model=WorkspaceRead)
def update_workspace(
    workspace_id: UUID,
    payload: WorkspaceUpdate,
    db: SessionDep,
    _: AdminUser,
) -> WorkspaceRead:
    workspace = WorkspaceService.update_workspace(db, workspace_id, payload)
    return WorkspaceRead.model_validate(workspace)


@router.delete("/workspaces/{workspace_id}", response_model=Message)
def delete_workspace(workspace_id: UUID, db: SessionDep, _: AdminUser) -> Message:
    WorkspaceService.delete_workspace(db, workspace_id)
    return Message(detail="Workspace deleted")
