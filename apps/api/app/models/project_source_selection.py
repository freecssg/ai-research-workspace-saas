from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project import Project
    from app.models.source_material import SourceMaterial
    from app.models.thought_chain import ThoughtChain
    from app.models.user import User
    from app.models.workspace import Workspace


class ProjectSourceSelection(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "project_source_selections"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
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
    source_material_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("source_materials.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    thought_chain_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("thought_chains.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    selection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )

    project: Mapped[Project] = relationship(back_populates="source_selections")
    knowledge_base: Mapped[KnowledgeBase | None] = relationship(
        back_populates="project_source_selections"
    )
    workspace: Mapped[Workspace | None] = relationship(back_populates="project_source_selections")
    source_material: Mapped[SourceMaterial | None] = relationship(
        back_populates="project_source_selections"
    )
    thought_chain: Mapped[ThoughtChain | None] = relationship(
        back_populates="project_source_selections"
    )
    created_by: Mapped[User] = relationship(
        back_populates="project_source_selections",
        foreign_keys=[created_by_id],
    )
