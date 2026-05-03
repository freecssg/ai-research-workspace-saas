from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import WorkspaceStatus, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.ai_analysis_agent_config import AIAnalysisAgentConfig
    from app.models.conversation import Conversation
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project_source_selection import ProjectSourceSelection
    from app.models.source_material import SourceMaterial
    from app.models.task import Task
    from app.models.thought_chain import ThoughtChain
    from app.models.user import User


class Workspace(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "workspaces"
    __table_args__ = (
        UniqueConstraint("knowledge_base_id", "name", name="uq_workspaces_knowledge_base_id_name"),
    )

    knowledge_base_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("knowledge_bases.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    research_topic: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[WorkspaceStatus] = mapped_column(
        enum_column(WorkspaceStatus, "workspace_status"),
        nullable=False,
        default=WorkspaceStatus.DRAFT,
        server_default=WorkspaceStatus.DRAFT.value,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    knowledge_base: Mapped[KnowledgeBase] = relationship(back_populates="workspaces")
    created_by: Mapped[User] = relationship(
        back_populates="created_workspaces",
        foreign_keys=[created_by_id],
    )
    source_materials: Mapped[list[SourceMaterial]] = relationship(back_populates="workspace")
    agent_configs: Mapped[list[AIAnalysisAgentConfig]] = relationship(back_populates="workspace")
    thought_chains: Mapped[list[ThoughtChain]] = relationship(back_populates="workspace")
    conversations: Mapped[list[Conversation]] = relationship(back_populates="workspace")
    project_source_selections: Mapped[list[ProjectSourceSelection]] = relationship(
        back_populates="workspace"
    )
    tasks: Mapped[list[Task]] = relationship(back_populates="workspace")
    agent_outputs: Mapped[list[AgentOutput]] = relationship(back_populates="workspace")
