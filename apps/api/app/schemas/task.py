from uuid import UUID

from pydantic import Field

from app.models.enums import TaskStatus, TaskType
from app.schemas.common import APIModel, ReadModel


class TaskBase(APIModel):
    task_type: TaskType
    status: TaskStatus = TaskStatus.QUEUED
    title: str | None = Field(default=None, max_length=255)
    progress: int = Field(default=0, ge=0, le=100)
    celery_task_id: str | None = Field(default=None, max_length=255)
    error_message: str | None = None


class TaskCreate(TaskBase):
    workspace_id: UUID
    project_id: UUID | None = None


class TaskUpdate(APIModel):
    project_id: UUID | None = None
    task_type: TaskType | None = None
    status: TaskStatus | None = None
    title: str | None = Field(default=None, max_length=255)
    progress: int | None = Field(default=None, ge=0, le=100)
    celery_task_id: str | None = Field(default=None, max_length=255)
    error_message: str | None = None


class TaskRead(TaskBase, ReadModel):
    workspace_id: UUID
    project_id: UUID | None = None
