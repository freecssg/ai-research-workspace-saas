from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import (
    SourceKind,
    SourceProcessingStatus,
    SourceVisibility,
    enum_column,
)
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project_source_selection import ProjectSourceSelection
    from app.models.user import User
    from app.models.workspace import Workspace


class SourceMaterial(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "source_materials"

    knowledge_base_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_bases.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    storage_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    source_kind: Mapped[SourceKind] = mapped_column(
        enum_column(SourceKind, "source_kind"),
        nullable=False,
    )
    visibility: Mapped[SourceVisibility] = mapped_column(
        enum_column(SourceVisibility, "source_visibility"),
        nullable=False,
        default=SourceVisibility.LAB_INTERNAL,
        server_default=SourceVisibility.LAB_INTERNAL.value,
    )
    content_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    citation_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    processing_status: Mapped[SourceProcessingStatus] = mapped_column(
        enum_column(SourceProcessingStatus, "source_processing_status"),
        nullable=False,
        default=SourceProcessingStatus.UPLOADED,
        server_default=SourceProcessingStatus.UPLOADED.value,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    knowledge_base: Mapped[KnowledgeBase] = relationship(back_populates="source_materials")
    workspace: Mapped[Workspace | None] = relationship(back_populates="source_materials")
    created_by: Mapped[User] = relationship(
        back_populates="created_source_materials",
        foreign_keys=[created_by_id],
    )
    project_source_selections: Mapped[list[ProjectSourceSelection]] = relationship(
        back_populates="source_material"
    )
