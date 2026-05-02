from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Task, User
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.common import get_owned_project, get_owned_workspace, not_found


def list_tasks(
    db: Session,
    current_user: User,
    project_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[Task]:
    project = get_owned_project(db, current_user, project_id)
    return list(
        db.scalars(
            select(Task)
            .where(
                Task.workspace_id == project.workspace_id,
                Task.project_id == project.id,
            )
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    )


def create_task(
    db: Session,
    current_user: User,
    project_id: UUID,
    payload: TaskCreate,
) -> Task:
    project = get_owned_project(db, current_user, project_id)
    task = Task(
        workspace_id=project.workspace_id,
        project_id=project.id,
        **payload.model_dump(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, current_user: User, task_id: UUID) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise not_found("Task")

    get_owned_workspace(db, current_user, task.workspace_id)
    return task


def update_task(
    db: Session,
    current_user: User,
    task_id: UUID,
    payload: TaskUpdate,
) -> Task:
    task = get_task(db, current_user, task_id)
    update_data = payload.model_dump(exclude_unset=True)

    if update_data.get("project_id") is not None:
        project = get_owned_project(db, current_user, update_data["project_id"])
        task.workspace_id = project.workspace_id

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task
