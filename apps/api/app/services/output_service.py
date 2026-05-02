from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AgentOutput, Task, User
from app.schemas.agent_output import AgentOutputCreate, AgentOutputUpdate
from app.services.common import get_owned_project, get_owned_workspace, not_found


def list_outputs(
    db: Session,
    current_user: User,
    project_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[AgentOutput]:
    project = get_owned_project(db, current_user, project_id)
    return list(
        db.scalars(
            select(AgentOutput)
            .where(
                AgentOutput.workspace_id == project.workspace_id,
                AgentOutput.project_id == project.id,
            )
            .order_by(AgentOutput.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    )


def _validate_source_task(
    db: Session,
    source_task_id: UUID | None,
    workspace_id: UUID,
    project_id: UUID,
) -> None:
    if source_task_id is None:
        return

    task = db.get(Task, source_task_id)
    if task is None:
        raise not_found("Task")

    if task.workspace_id != workspace_id or task.project_id != project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="source_task_id must belong to the same project",
        )


def create_output(
    db: Session,
    current_user: User,
    project_id: UUID,
    payload: AgentOutputCreate,
) -> AgentOutput:
    project = get_owned_project(db, current_user, project_id)
    _validate_source_task(db, payload.source_task_id, project.workspace_id, project.id)

    output = AgentOutput(
        workspace_id=project.workspace_id,
        project_id=project.id,
        **payload.model_dump(),
    )
    db.add(output)
    db.commit()
    db.refresh(output)
    return output


def get_output(db: Session, current_user: User, output_id: UUID) -> AgentOutput:
    output = db.get(AgentOutput, output_id)
    if output is None:
        raise not_found("Output")

    get_owned_workspace(db, current_user, output.workspace_id)
    return output


def update_output(
    db: Session,
    current_user: User,
    output_id: UUID,
    payload: AgentOutputUpdate,
) -> AgentOutput:
    output = get_output(db, current_user, output_id)
    update_data = payload.model_dump(exclude_unset=True)

    if update_data.get("project_id") is not None:
        project = get_owned_project(db, current_user, update_data["project_id"])
        output.workspace_id = project.workspace_id
        project_id = project.id
        workspace_id = project.workspace_id
    else:
        project_id = output.project_id
        workspace_id = output.workspace_id

    if project_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Output must belong to a project",
        )

    source_task_id = update_data.get("source_task_id", output.source_task_id)
    _validate_source_task(db, source_task_id, workspace_id, project_id)

    for field, value in update_data.items():
        setattr(output, field, value)

    db.commit()
    db.refresh(output)
    return output


def delete_output(db: Session, current_user: User, output_id: UUID) -> None:
    output = get_output(db, current_user, output_id)
    db.delete(output)
    db.commit()
