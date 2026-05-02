from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.agent_output import AgentOutputCreate, AgentOutputRead, AgentOutputUpdate
from app.services import output_service

router = APIRouter(tags=["outputs"])

SkipQuery = Annotated[int, Query(ge=0)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("/projects/{project_id}/outputs", response_model=list[AgentOutputRead])
def list_outputs(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    skip: SkipQuery = 0,
    limit: LimitQuery = 50,
) -> list[AgentOutputRead]:
    return output_service.list_outputs(db, current_user, project_id, skip, limit)


@router.post(
    "/projects/{project_id}/outputs",
    response_model=AgentOutputRead,
    status_code=status.HTTP_201_CREATED,
)
def create_output(
    project_id: UUID,
    payload: AgentOutputCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> AgentOutputRead:
    return output_service.create_output(db, current_user, project_id, payload)


@router.get("/outputs/{output_id}", response_model=AgentOutputRead)
def get_output(
    output_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> AgentOutputRead:
    return output_service.get_output(db, current_user, output_id)


@router.patch("/outputs/{output_id}", response_model=AgentOutputRead)
def update_output(
    output_id: UUID,
    payload: AgentOutputUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> AgentOutputRead:
    return output_service.update_output(db, current_user, output_id, payload)


@router.delete("/outputs/{output_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_output(
    output_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Response:
    output_service.delete_output(db, current_user, output_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
