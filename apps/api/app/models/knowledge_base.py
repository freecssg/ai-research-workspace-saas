from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import KnowledgeBaseStatus, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.ai_analysis_agent_config import AIAnalysisAgentConfig
    from app.models.conversation import Conversation
    from app.models.project_source_selection import ProjectSourceSelection
    from app.models.source_material import SourceMaterial
    from app.models.task import Task
    from app.models.thought_chain import ThoughtChain
    from app.models.user import User
    from app.models.workspace import Workspace


class KnowledgeBase(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "knowledge_bases"

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    research_domain: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[KnowledgeBaseStatus] = mapped_column(
        enum_column(KnowledgeBaseStatus, "knowledge_base_status"),
        nullable=False,
        default=KnowledgeBaseStatus.DRAFT,
        server_default=KnowledgeBaseStatus.DRAFT.value,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    created_by: Mapped[User] = relationship(
        back_populates="created_knowledge_bases",
        foreign_keys=[created_by_id],
    )
    workspaces: Mapped[list[Workspace]] = relationship(
        back_populates="knowledge_base",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    source_materials: Mapped[list[SourceMaterial]] = relationship(
        back_populates="knowledge_base",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    agent_configs: Mapped[list[AIAnalysisAgentConfig]] = relationship(
        back_populates="knowledge_base"
    )
    thought_chains: Mapped[list[ThoughtChain]] = relationship(
        back_populates="knowledge_base",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    conversations: Mapped[list[Conversation]] = relationship(back_populates="knowledge_base")
    project_source_selections: Mapped[list[ProjectSourceSelection]] = relationship(
        back_populates="knowledge_base"
    )
    tasks: Mapped[list[Task]] = relationship(back_populates="knowledge_base")
    agent_outputs: Mapped[list[AgentOutput]] = relationship(back_populates="knowledge_base")
