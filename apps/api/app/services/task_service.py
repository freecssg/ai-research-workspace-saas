from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import KnowledgeBase, Project, Task, TaskScope, User, Workspace
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.common import (
    bad_request,
    get_or_404,
    paginate,
    require_admin,
    require_project_editor,
)


class TaskService:
    @staticmethod
    def list_tasks(db: Session, skip: int, limit: int) -> list[Task]:
        statement = select(Task).order_by(Task.created_at.desc())
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_task(db: Session, task_id: UUID) -> Task:
        return get_or_404(db, Task, task_id, "Task")

    @staticmethod
    def _validate_scope_and_permission(db: Session, data: dict, user: User) -> None:
        scope = data.get("task_scope")
        if scope == TaskScope.KNOWLEDGE_BASE:
            if data.get("knowledge_base_id") is None:
                raise bad_request("knowledge_base_id is required for knowledge-base tasks")
            get_or_404(db, KnowledgeBase, data["knowledge_base_id"], "Knowledge base")
            require_admin(user)
        elif scope == TaskScope.WORKSPACE:
            if data.get("workspace_id") is None:
                raise bad_request("workspace_id is required for workspace tasks")
            get_or_404(db, Workspace, data["workspace_id"], "Workspace")
            require_admin(user)
        elif scope == TaskScope.PROJECT:
            if data.get("project_id") is None:
                raise bad_request("project_id is required for project tasks")
            get_or_404(db, Project, data["project_id"], "Project")
            require_project_editor(db, data["project_id"], user)
        elif scope == TaskScope.SYSTEM:
            require_admin(user)
        else:
            raise bad_request("Unsupported task scope")

    @staticmethod
    def create_task(db: Session, payload: TaskCreate, user: User) -> Task:
        data = payload.model_dump()
        TaskService._validate_scope_and_permission(db, data, user)
        task = Task(**data, created_by_id=user.id)
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(db: Session, task_id: UUID, payload: TaskUpdate, user: User) -> Task:
        task = TaskService.get_task(db, task_id)
        scope_data = {
            "task_scope": task.task_scope,
            "knowledge_base_id": task.knowledge_base_id,
            "workspace_id": task.workspace_id,
            "project_id": task.project_id,
        }
        incoming = payload.model_dump(exclude_unset=True)
        scope_data.update({key: incoming[key] for key in scope_data.keys() & incoming.keys()})
        TaskService._validate_scope_and_permission(db, scope_data, user)
        for field, value in incoming.items():
            setattr(task, field, value)
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
