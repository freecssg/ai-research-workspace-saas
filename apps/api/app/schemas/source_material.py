from typing import Any
from uuid import UUID

from pydantic import Field

from app.models.enums import SourceKind, SourceProcessingStatus, SourceVisibility
from app.schemas.common import APIModel, ReadModel


class SourceMaterialBase(APIModel):
    title: str = Field(min_length=1, max_length=255)
    original_filename: str | None = Field(default=None, max_length=255)
    storage_path: str | None = Field(default=None, max_length=1024)
    source_kind: SourceKind
    visibility: SourceVisibility = SourceVisibility.LAB_INTERNAL
    content_type: str | None = Field(default=None, max_length=255)
    file_size: int | None = Field(default=None, ge=0)
    source_url: str | None = Field(default=None, max_length=2048)
    citation_metadata: dict[str, Any] | None = None
    processing_status: SourceProcessingStatus = SourceProcessingStatus.UPLOADED


class SourceMaterialCreate(SourceMaterialBase):
    workspace_id: UUID | None = None


class SourceMaterialUpdate(APIModel):
    workspace_id: UUID | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    original_filename: str | None = Field(default=None, max_length=255)
    storage_path: str | None = Field(default=None, max_length=1024)
    source_kind: SourceKind | None = None
    visibility: SourceVisibility | None = None
    content_type: str | None = Field(default=None, max_length=255)
    file_size: int | None = Field(default=None, ge=0)
    source_url: str | None = Field(default=None, max_length=2048)
    citation_metadata: dict[str, Any] | None = None
    processing_status: SourceProcessingStatus | None = None


class SourceMaterialRead(SourceMaterialBase, ReadModel):
    knowledge_base_id: UUID
    workspace_id: UUID | None = None
    created_by_id: UUID
