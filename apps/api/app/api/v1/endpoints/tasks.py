from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskRead])
def list_tasks(
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[TaskRead]:
    return [TaskRead.model_validate(task) for task in TaskService.list_tasks(db, skip, limit)]


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: UUID, db: SessionDep, _: CurrentUser) -> TaskRead:
    return TaskRead.model_validate(TaskService.get_task(db, task_id))


@router.post("", response_model=TaskRead, status_code=201)
def create_task(payload: TaskCreate, db: SessionDep, current_user: CurrentUser) -> TaskRead:
    return TaskRead.model_validate(TaskService.create_task(db, payload, current_user))


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> TaskRead:
    return TaskRead.model_validate(TaskService.update_task(db, task_id, payload, current_user))
