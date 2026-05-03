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


class KnowledgeBaseStatus(StrEnum):
    DRAFT = "draft"
    BUILDING = "building"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"


class UserRole(StrEnum):
    ADMIN = "admin"
    MEMBER = "member"


class WorkspaceStatus(StrEnum):
    DRAFT = "draft"
    ANALYZING = "analyzing"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"


class SourceKind(StrEnum):
    PAPER = "paper"
    DATASET = "dataset"
    NOTE = "note"
    TRANSCRIPT = "transcript"
    REPORT = "report"
    WEBPAGE = "webpage"
    EXPERIMENT_RESULT = "experiment_result"
    OTHER = "other"


class SourceVisibility(StrEnum):
    PUBLIC = "public"
    PRIVATE = "private"
    LAB_INTERNAL = "lab_internal"


class SourceProcessingStatus(StrEnum):
    UPLOADED = "uploaded"
    QUEUED = "queued"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    INDEXED = "indexed"
    FAILED = "failed"


class AnalysisAgentType(StrEnum):
    PAPER_ANALYSIS = "paper_analysis"
    DATASET_ANALYSIS = "dataset_analysis"
    METHOD_EXTRACTION = "method_extraction"
    THEORY_MAPPING = "theory_mapping"
    CITATION_ANALYSIS = "citation_analysis"
    TREND_ANALYSIS = "trend_analysis"
    RAG_INDEXING = "rag_indexing"
    GRAPH_BUILDING = "graph_building"
    CUSTOM = "custom"


class ThoughtChainType(StrEnum):
    THEORY_PATH = "theory_path"
    METHOD_RELATION = "method_relation"
    CONCEPT_RELATION = "concept_relation"
    RESEARCH_GAP = "research_gap"
    RESEARCH_QUESTION = "research_question"
    ARGUMENT_STRUCTURE = "argument_structure"
    DATA_THEORY_MAPPING = "data_theory_mapping"
    CUSTOM = "custom"


class ConversationSenderType(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    AGENT = "agent"


class ProjectType(StrEnum):
    LITERATURE_REVIEW = "literature_review"
    REB_APPLICATION = "reb_application"
    DATA_ANALYSIS = "data_analysis"
    PRESENTATION = "presentation"
    MANUSCRIPT = "manuscript"
    RESEARCH_PROPOSAL = "research_proposal"
    CUSTOM = "custom"


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectMemberRole(StrEnum):
    LEADER = "leader"
    EDITOR = "editor"
    VIEWER = "viewer"


class WorkflowType(StrEnum):
    LITERATURE_REVIEW = "literature_review"
    REB_APPLICATION = "reb_application"
    DATA_ANALYSIS = "data_analysis"
    PRESENTATION = "presentation"
    MANUSCRIPT = "manuscript"
    CUSTOM = "custom"


class WorkflowStatus(StrEnum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class WorkflowStepStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class TaskScope(StrEnum):
    KNOWLEDGE_BASE = "knowledge_base"
    WORKSPACE = "workspace"
    PROJECT = "project"
    SYSTEM = "system"


class TaskType(StrEnum):
    SOURCE_ANALYSIS = "source_analysis"
    WIKI_BUILD = "wiki_build"
    RAG_INDEX = "rag_index"
    GRAPH_BUILD = "graph_build"
    AGENT_RUN = "agent_run"
    WORKFLOW_RUN = "workflow_run"
    CITATION_CHECK = "citation_check"
    CONSISTENCY_CHECK = "consistency_check"


class TaskStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentOutputType(StrEnum):
    WIKI_PAGE = "wiki_page"
    PAPER_SUMMARY = "paper_summary"
    DATASET_SUMMARY = "dataset_summary"
    METHOD_SUMMARY = "method_summary"
    TREND_SUMMARY = "trend_summary"
    LITERATURE_REVIEW = "literature_review"
    REB_APPLICATION = "reb_application"
    DATA_REPORT = "data_report"
    PRESENTATION_OUTLINE = "presentation_outline"
    MANUSCRIPT_SECTION = "manuscript_section"
    NOTES = "notes"
    CUSTOM = "custom"
