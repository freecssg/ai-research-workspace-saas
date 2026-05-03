from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ThoughtChainType, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project_source_selection import ProjectSourceSelection
    from app.models.user import User
    from app.models.workspace import Workspace


class ThoughtChain(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "thought_chains"

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
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    chain_type: Mapped[ThoughtChainType] = mapped_column(
        enum_column(ThoughtChainType, "thought_chain_type"),
        nullable=False,
    )
    content: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    knowledge_base: Mapped[KnowledgeBase] = relationship(back_populates="thought_chains")
    workspace: Mapped[Workspace | None] = relationship(back_populates="thought_chains")
    created_by: Mapped[User] = relationship(
        back_populates="created_thought_chains",
        foreign_keys=[created_by_id],
    )
    project_source_selections: Mapped[list[ProjectSourceSelection]] = relationship(
        back_populates="thought_chain"
    )
