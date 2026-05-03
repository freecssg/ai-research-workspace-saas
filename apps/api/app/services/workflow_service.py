from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Project, ProjectWorkflow, ProjectWorkflowStep, User
from app.schemas.project_workflow import ProjectWorkflowCreate, ProjectWorkflowUpdate
from app.schemas.project_workflow_step import ProjectWorkflowStepCreate, ProjectWorkflowStepUpdate
from app.services.common import get_or_404, not_found, paginate, require_project_editor


class WorkflowService:
    @staticmethod
    def list_workflows(
        db: Session,
        project_id: UUID,
        skip: int,
        limit: int,
    ) -> list[ProjectWorkflow]:
        get_or_404(db, Project, project_id, "Project")
        statement = (
            select(ProjectWorkflow)
            .where(ProjectWorkflow.project_id == project_id)
            .order_by(ProjectWorkflow.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_workflow(db: Session, workflow_id: UUID) -> ProjectWorkflow:
        return get_or_404(db, ProjectWorkflow, workflow_id, "Project workflow")

    @staticmethod
    def create_workflow(
        db: Session,
        project_id: UUID,
        payload: ProjectWorkflowCreate,
        user: User,
    ) -> ProjectWorkflow:
        require_project_editor(db, project_id, user)
        workflow = ProjectWorkflow(
            **payload.model_dump(),
            project_id=project_id,
            created_by_id=user.id,
        )
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return workflow

    @staticmethod
    def update_workflow(
        db: Session,
        workflow_id: UUID,
        payload: ProjectWorkflowUpdate,
        user: User,
    ) -> ProjectWorkflow:
        workflow = WorkflowService.get_workflow(db, workflow_id)
        require_project_editor(db, workflow.project_id, user)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(workflow, field, value)
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return workflow


class WorkflowStepService:
    @staticmethod
    def list_steps(
        db: Session,
        workflow_id: UUID,
        skip: int,
        limit: int,
    ) -> list[ProjectWorkflowStep]:
        get_or_404(db, ProjectWorkflow, workflow_id, "Project workflow")
        statement = (
            select(ProjectWorkflowStep)
            .where(ProjectWorkflowStep.workflow_id == workflow_id)
            .order_by(ProjectWorkflowStep.step_order.asc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def create_step(
        db: Session,
        workflow_id: UUID,
        payload: ProjectWorkflowStepCreate,
        user: User,
    ) -> ProjectWorkflowStep:
        workflow = WorkflowService.get_workflow(db, workflow_id)
        require_project_editor(db, workflow.project_id, user)
        step = ProjectWorkflowStep(**payload.model_dump(), workflow_id=workflow_id)
        db.add(step)
        db.commit()
        db.refresh(step)
        return step

    @staticmethod
    def update_step(
        db: Session,
        step_id: UUID,
        payload: ProjectWorkflowStepUpdate,
        user: User,
    ) -> ProjectWorkflowStep:
        step = get_or_404(db, ProjectWorkflowStep, step_id, "Project workflow step")
        workflow = WorkflowService.get_workflow(db, step.workflow_id)
        require_project_editor(db, workflow.project_id, user)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(step, field, value)
        db.add(step)
        db.commit()
        db.refresh(step)
        return step

    @staticmethod
    def delete_step(db: Session, step_id: UUID, user: User) -> None:
        step = get_or_404(db, ProjectWorkflowStep, step_id, "Project workflow step")
        workflow = db.get(ProjectWorkflow, step.workflow_id)
        if workflow is None:
            raise not_found("Project workflow")
        require_project_editor(db, workflow.project_id, user)
        db.delete(step)
        db.commit()
