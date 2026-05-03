from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.common import Message
from app.schemas.project_workflow_step import (
    ProjectWorkflowStepCreate,
    ProjectWorkflowStepRead,
    ProjectWorkflowStepUpdate,
)
from app.services.workflow_service import WorkflowStepService

router = APIRouter(tags=["workflow-steps"])


@router.get("/workflows/{workflow_id}/steps", response_model=list[ProjectWorkflowStepRead])
def list_workflow_steps(
    workflow_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[ProjectWorkflowStepRead]:
    return [
        ProjectWorkflowStepRead.model_validate(step)
        for step in WorkflowStepService.list_steps(db, workflow_id, skip, limit)
    ]


@router.post(
    "/workflows/{workflow_id}/steps",
    response_model=ProjectWorkflowStepRead,
    status_code=201,
)
def create_workflow_step(
    workflow_id: UUID,
    payload: ProjectWorkflowStepCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectWorkflowStepRead:
    step = WorkflowStepService.create_step(db, workflow_id, payload, current_user)
    return ProjectWorkflowStepRead.model_validate(step)


@router.patch("/workflow-steps/{step_id}", response_model=ProjectWorkflowStepRead)
def update_workflow_step(
    step_id: UUID,
    payload: ProjectWorkflowStepUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ProjectWorkflowStepRead:
    step = WorkflowStepService.update_step(db, step_id, payload, current_user)
    return ProjectWorkflowStepRead.model_validate(step)


@router.delete("/workflow-steps/{step_id}", response_model=Message)
def delete_workflow_step(step_id: UUID, db: SessionDep, current_user: CurrentUser) -> Message:
    WorkflowStepService.delete_step(db, step_id, current_user)
    return Message(detail="Workflow step deleted")
