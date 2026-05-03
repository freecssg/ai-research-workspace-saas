from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, ProjectEditor, SessionDep
from app.schemas.agent_output import AgentOutputCreate, AgentOutputRead, AgentOutputUpdate
from app.schemas.common import Message
from app.services.output_service import OutputService

router = APIRouter(tags=["outputs"])


@router.get("/projects/{project_id}/outputs", response_model=list[AgentOutputRead])
def list_project_outputs(
    project_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[AgentOutputRead]:
    return [
        AgentOutputRead.model_validate(output)
        for output in OutputService.list_outputs(db, project_id, skip, limit)
    ]


@router.post("/projects/{project_id}/outputs", response_model=AgentOutputRead, status_code=201)
def create_project_output(
    project_id: UUID,
    payload: AgentOutputCreate,
    db: SessionDep,
    current_user: CurrentUser,
    _: ProjectEditor,
) -> AgentOutputRead:
    output = OutputService.create_output(db, project_id, payload, current_user)
    return AgentOutputRead.model_validate(output)


@router.get("/outputs/{output_id}", response_model=AgentOutputRead)
def get_output(output_id: UUID, db: SessionDep, _: CurrentUser) -> AgentOutputRead:
    return AgentOutputRead.model_validate(OutputService.get_output(db, output_id))


@router.patch("/outputs/{output_id}", response_model=AgentOutputRead)
def update_output(
    output_id: UUID,
    payload: AgentOutputUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> AgentOutputRead:
    output = OutputService.update_output(db, output_id, payload, current_user)
    return AgentOutputRead.model_validate(output)


@router.delete("/outputs/{output_id}", response_model=Message)
def delete_output(output_id: UUID, db: SessionDep, current_user: CurrentUser) -> Message:
    OutputService.delete_output(db, output_id, current_user)
    return Message(detail="Output deleted")
