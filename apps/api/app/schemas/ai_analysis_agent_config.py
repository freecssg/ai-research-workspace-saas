from typing import Any
from uuid import UUID

from pydantic import Field

from app.models.enums import AnalysisAgentType, SourceKind
from app.schemas.common import APIModel, ReadModel


class AIAnalysisAgentConfigBase(APIModel):
    name: str = Field(min_length=1, max_length=160)
    agent_type: AnalysisAgentType
    description: str | None = None
    target_source_kind: SourceKind | None = None
    analysis_goal: str | None = None
    extraction_schema: dict[str, Any] | None = None
    output_format: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class AIAnalysisAgentConfigCreate(AIAnalysisAgentConfigBase):
    pass


class AIAnalysisAgentConfigUpdate(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    agent_type: AnalysisAgentType | None = None
    description: str | None = None
    target_source_kind: SourceKind | None = None
    analysis_goal: str | None = None
    extraction_schema: dict[str, Any] | None = None
    output_format: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None


class AIAnalysisAgentConfigRead(AIAnalysisAgentConfigBase, ReadModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    created_by_id: UUID
