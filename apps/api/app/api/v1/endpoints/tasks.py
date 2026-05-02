from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import task_service

router = APIRouter(tags=["tasks"])

SkipQuery = Annotated[int, Query(ge=0)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("/projects/{project_id}/tasks", response_model=list[TaskRead])
def list_tasks(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    skip: SkipQuery = 0,
    limit: LimitQuery = 50,
) -> list[TaskRead]:
    return task_service.list_tasks(db, current_user, project_id, skip, limit)


@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    project_id: UUID,
    payload: TaskCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> TaskRead:
    return task_service.create_task(db, current_user, project_id, payload)


@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(
    task_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> TaskRead:
    return task_service.get_task(db, current_user, task_id)


@router.patch("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> TaskRead:
    return task_service.update_task(db, current_user, task_id, payload)
