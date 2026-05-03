from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AgentOutput, Project, ProjectWorkflow, ProjectWorkflowStep, Task, User
from app.schemas.agent_output import AgentOutputCreate, AgentOutputUpdate
from app.services.common import bad_request, get_or_404, paginate, require_project_editor


class OutputService:
    @staticmethod
    def list_outputs(
        db: Session,
        project_id: UUID,
        skip: int,
        limit: int,
    ) -> list[AgentOutput]:
        get_or_404(db, Project, project_id, "Project")
        statement = (
            select(AgentOutput)
            .where(AgentOutput.project_id == project_id)
            .order_by(AgentOutput.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_output(db: Session, output_id: UUID) -> AgentOutput:
        return get_or_404(db, AgentOutput, output_id, "Agent output")

    @staticmethod
    def _validate_project_refs(db: Session, project_id: UUID, data: dict) -> None:
        if data.get("workflow_id") is not None:
            workflow = get_or_404(db, ProjectWorkflow, data["workflow_id"], "Project workflow")
            if workflow.project_id != project_id:
                raise bad_request("Workflow does not belong to the requested project")
        if data.get("workflow_step_id") is not None:
            step = get_or_404(db, ProjectWorkflowStep, data["workflow_step_id"], "Workflow step")
            workflow = get_or_404(db, ProjectWorkflow, step.workflow_id, "Project workflow")
            if workflow.project_id != project_id:
                raise bad_request("Workflow step does not belong to the requested project")
        if data.get("source_task_id") is not None:
            task = get_or_404(db, Task, data["source_task_id"], "Task")
            if task.project_id is not None and task.project_id != project_id:
                raise bad_request("Source task does not belong to the requested project")

    @staticmethod
    def create_output(
        db: Session,
        project_id: UUID,
        payload: AgentOutputCreate,
        user: User,
    ) -> AgentOutput:
        require_project_editor(db, project_id, user)
        data = payload.model_dump()
        OutputService._validate_project_refs(db, project_id, data)
        output = AgentOutput(
            **data,
            project_id=project_id,
            created_by_id=user.id,
        )
        db.add(output)
        db.commit()
        db.refresh(output)
        return output

    @staticmethod
    def update_output(
        db: Session,
        output_id: UUID,
        payload: AgentOutputUpdate,
        user: User,
    ) -> AgentOutput:
        output = OutputService.get_output(db, output_id)
        if output.project_id is None:
            raise bad_request("Only project outputs can be edited through this endpoint")
        require_project_editor(db, output.project_id, user)
        data = payload.model_dump(exclude_unset=True)
        OutputService._validate_project_refs(db, output.project_id, data)
        for field, value in data.items():
            setattr(output, field, value)
        db.add(output)
        db.commit()
        db.refresh(output)
        return output

    @staticmethod
    def delete_output(db: Session, output_id: UUID, user: User) -> None:
        output = OutputService.get_output(db, output_id)
        if output.project_id is None:
            raise bad_request("Only project outputs can be deleted through this endpoint")
        require_project_editor(db, output.project_id, user)
        db.delete(output)
        db.commit()
