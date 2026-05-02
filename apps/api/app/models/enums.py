from enum import StrEnum
from typing import TypeVar

from sqlalchemy import Enum as SQLAlchemyEnum

EnumT = TypeVar("EnumT", bound=StrEnum)


def enum_values(enum_cls: type[EnumT]) -> list[str]:
    return [item.value for item in enum_cls]


def enum_column(enum_cls: type[EnumT], name: str) -> SQLAlchemyEnum:
    return SQLAlchemyEnum(
        enum_cls,
        values_callable=enum_values,
        name=name,
        native_enum=False,
        create_constraint=True,
        validate_strings=True,
    )


class UserStatus(StrEnum):
    ACTIVE = "active"
    DISABLED = "disabled"


class ProjectStatus(StrEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class FileStatus(StrEnum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class FileSourceType(StrEnum):
    UPLOAD = "upload"


class KnowledgeBaseStatus(StrEnum):
    PENDING = "pending"
    BUILDING = "building"
    READY = "ready"
    FAILED = "failed"


class TaskType(StrEnum):
    FILE_INGESTION = "file_ingestion"
    KNOWLEDGE_BASE_BUILD = "knowledge_base_build"
    OUTPUT_GENERATION = "output_generation"


class TaskStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELED = "canceled"


class AgentOutputType(StrEnum):
    SUMMARY = "summary"
    REPORT = "report"
    WIKI_PLACEHOLDER = "wiki_placeholder"
    GRAPH_PLACEHOLDER = "graph_placeholder"
    AGENT_WORKFLOW_PLACEHOLDER = "agent_workflow_placeholder"


class AgentOutputStatus(StrEnum):
    DRAFT = "draft"
    READY = "ready"
    FAILED = "failed"
