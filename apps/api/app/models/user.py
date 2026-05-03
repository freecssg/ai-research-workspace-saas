from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole, enum_column
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.agent_output import AgentOutput
    from app.models.ai_analysis_agent_config import AIAnalysisAgentConfig
    from app.models.conversation import Conversation
    from app.models.knowledge_base import KnowledgeBase
    from app.models.project import Project
    from app.models.project_source_selection import ProjectSourceSelection
    from app.models.project_team_member import ProjectTeamMember
    from app.models.project_workflow import ProjectWorkflow
    from app.models.source_material import SourceMaterial
    from app.models.task import Task
    from app.models.thought_chain import ThoughtChain
    from app.models.workspace import Workspace


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        enum_column(UserRole, "user_role"),
        nullable=False,
        default=UserRole.MEMBER,
        server_default=UserRole.MEMBER.value,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    created_knowledge_bases: Mapped[list[KnowledgeBase]] = relationship(
        back_populates="created_by",
        foreign_keys="KnowledgeBase.created_by_id",
    )
    created_workspaces: Mapped[list[Workspace]] = relationship(
        back_populates="created_by",
        foreign_keys="Workspace.created_by_id",
    )
    created_source_materials: Mapped[list[SourceMaterial]] = relationship(
        back_populates="created_by",
        foreign_keys="SourceMaterial.created_by_id",
    )
    created_agent_configs: Mapped[list[AIAnalysisAgentConfig]] = relationship(
        back_populates="created_by",
        foreign_keys="AIAnalysisAgentConfig.created_by_id",
    )
    created_thought_chains: Mapped[list[ThoughtChain]] = relationship(
        back_populates="created_by",
        foreign_keys="ThoughtChain.created_by_id",
    )
    created_conversations: Mapped[list[Conversation]] = relationship(
        back_populates="created_by",
        foreign_keys="Conversation.created_by_id",
    )
    created_projects: Mapped[list[Project]] = relationship(
        back_populates="created_by",
        foreign_keys="Project.created_by_id",
    )
    project_memberships: Mapped[list[ProjectTeamMember]] = relationship(back_populates="user")
    project_source_selections: Mapped[list[ProjectSourceSelection]] = relationship(
        back_populates="created_by",
        foreign_keys="ProjectSourceSelection.created_by_id",
    )
    created_workflows: Mapped[list[ProjectWorkflow]] = relationship(
        back_populates="created_by",
        foreign_keys="ProjectWorkflow.created_by_id",
    )
    created_tasks: Mapped[list[Task]] = relationship(
        back_populates="created_by",
        foreign_keys="Task.created_by_id",
    )
    created_agent_outputs: Mapped[list[AgentOutput]] = relationship(
        back_populates="created_by",
        foreign_keys="AgentOutput.created_by_id",
    )
