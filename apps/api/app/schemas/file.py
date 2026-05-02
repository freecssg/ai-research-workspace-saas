from uuid import UUID

from pydantic import Field

from app.models.enums import FileSourceType, FileStatus
from app.schemas.common import APIModel, ReadModel


class FileBase(APIModel):
    name: str = Field(min_length=1, max_length=255)
    original_filename: str = Field(min_length=1, max_length=255)
    content_type: str | None = Field(default=None, max_length=255)
    storage_path: str = Field(min_length=1, max_length=1024)
    size_bytes: int = Field(ge=0)
    checksum_sha256: str | None = Field(default=None, min_length=64, max_length=64)
    source_type: FileSourceType = FileSourceType.UPLOAD
    status: FileStatus = FileStatus.UPLOADED


class FileCreate(FileBase):
    workspace_id: UUID
    project_id: UUID | None = None


class FileUpdate(APIModel):
    project_id: UUID | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    original_filename: str | None = Field(default=None, min_length=1, max_length=255)
    content_type: str | None = Field(default=None, max_length=255)
    storage_path: str | None = Field(default=None, min_length=1, max_length=1024)
    size_bytes: int | None = Field(default=None, ge=0)
    checksum_sha256: str | None = Field(default=None, min_length=64, max_length=64)
    status: FileStatus | None = None


class FileRead(FileBase, ReadModel):
    workspace_id: UUID
    project_id: UUID | None = None
    file_size: int
    processing_status: FileStatus
