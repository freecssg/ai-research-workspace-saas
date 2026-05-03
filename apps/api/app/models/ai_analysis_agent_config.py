from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AnalysisAgentType, SourceKind, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.knowledge_base import KnowledgeBase
    from app.models.user import User
    from app.models.workspace import Workspace


class AIAnalysisAgentConfig(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_analysis_agent_configs"

    knowledge_base_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_bases.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    workspace_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    agent_type: Mapped[AnalysisAgentType] = mapped_column(
        enum_column(AnalysisAgentType, "analysis_agent_type"),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_source_kind: Mapped[SourceKind | None] = mapped_column(
        enum_column(SourceKind, "agent_target_source_kind"),
        nullable=True,
    )
    analysis_goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    extraction_schema: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    output_format: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    knowledge_base: Mapped[KnowledgeBase | None] = relationship(back_populates="agent_configs")
    workspace: Mapped[Workspace | None] = relationship(back_populates="agent_configs")
    created_by: Mapped[User] = relationship(
        back_populates="created_agent_configs",
        foreign_keys=[created_by_id],
    )
