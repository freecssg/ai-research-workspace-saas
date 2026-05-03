from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, ProjectEditor, SessionDep
from app.schemas.project_workflow import (
    ProjectWorkflowCreate,
    ProjectWorkflowRead,
    ProjectWorkflowUpdate,
)
from app.services.workflow_service import WorkflowService

router = APIRouter(tags=["project-workflows"])


@router.get("/projects/{project_id}/workflows", response_model=list[ProjectWorkflowRead])
def list_project_workflows(
    project_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[ProjectWorkflowRead]:
    return [
        ProjectWorkflowRead.model_validate(workflow)
        for workflow in WorkflowService.list_workflows(db, project_id, skip, limit)
    ]


@router.post(
    "/projects/{project_id}/workflows",
    response_model=ProjectWorkflowRead,
    status_code=201,
)
def create_project_workflow(
    project_id: UUID,
    payload: ProjectWorkflowCreate,
    db: SessionDep,
    current_user: CurrentUser,
    _: ProjectEditor,
) -> ProjectWorkflowRead:
    workflow = WorkflowService.create_workflow(db, project_id, payload, current_user)
    return ProjectWorkflowRead.model_validate(workflow)


@router.get("/workflows/{workflow_id}", response_model=ProjectWorkflowRead)
def get_workflow(workflow_id: UUID, db: SessionDep, _: CurrentUser) -> ProjectWorkflowRead:
    return ProjectWorkflowRead.model_validate(WorkflowService.get_workflow(db, workflow_id))


@router.patch("/workflows/{workflow_id}", response_model=ProjectWorkflowRead)
def update_workflow(
    workflow_id: UUID,
    payload: ProjectWorkflowUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectWorkflowRead:
    workflow = WorkflowService.update_workflow(db, workflow_id, payload, current_user)
    return ProjectWorkflowRead.model_validate(workflow)
