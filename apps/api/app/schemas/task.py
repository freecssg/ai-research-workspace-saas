from uuid import UUID

from pydantic import Field

from app.models.enums import TaskScope, TaskStatus, TaskType
from app.schemas.common import APIModel, ReadModel


class TaskBase(APIModel):
    task_scope: TaskScope
    task_type: TaskType
    status: TaskStatus = TaskStatus.QUEUED
    progress: int = Field(default=0, ge=0, le=100)
    error_message: str | None = None
    result_ref: str | None = Field(default=None, max_length=1024)


class TaskCreate(TaskBase):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    project_id: UUID | None = None


class TaskUpdate(APIModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    project_id: UUID | None = None
    task_scope: TaskScope | None = None
    task_type: TaskType | None = None
    status: TaskStatus | None = None
    progress: int | None = Field(default=None, ge=0, le=100)
    error_message: str | None = None
    result_ref: str | None = Field(default=None, max_length=1024)


class TaskRead(TaskBase, ReadModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    project_id: UUID | None = None
    created_by_id: UUID
