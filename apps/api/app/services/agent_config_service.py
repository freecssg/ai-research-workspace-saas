from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AIAnalysisAgentConfig, KnowledgeBase, User, Workspace
from app.schemas.ai_analysis_agent_config import (
    AIAnalysisAgentConfigCreate,
    AIAnalysisAgentConfigUpdate,
)
from app.services.common import get_or_404, paginate


class AgentConfigService:
    @staticmethod
    def list_by_knowledge_base(
        db: Session,
        kb_id: UUID,
        skip: int,
        limit: int,
    ) -> list[AIAnalysisAgentConfig]:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        statement = (
            select(AIAnalysisAgentConfig)
            .where(
                AIAnalysisAgentConfig.knowledge_base_id == kb_id,
                AIAnalysisAgentConfig.workspace_id.is_(None),
            )
            .order_by(AIAnalysisAgentConfig.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def list_by_workspace(
        db: Session,
        workspace_id: UUID,
        skip: int,
        limit: int,
    ) -> list[AIAnalysisAgentConfig]:
        get_or_404(db, Workspace, workspace_id, "Workspace")
        statement = (
            select(AIAnalysisAgentConfig)
            .where(AIAnalysisAgentConfig.workspace_id == workspace_id)
            .order_by(AIAnalysisAgentConfig.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_agent(db: Session, agent_id: UUID) -> AIAnalysisAgentConfig:
        return get_or_404(db, AIAnalysisAgentConfig, agent_id, "Agent config")

    @staticmethod
    def create_for_knowledge_base(
        db: Session,
        kb_id: UUID,
        payload: AIAnalysisAgentConfigCreate,
        user: User,
    ) -> AIAnalysisAgentConfig:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        agent = AIAnalysisAgentConfig(
            **payload.model_dump(),
            knowledge_base_id=kb_id,
            workspace_id=None,
            created_by_id=user.id,
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def create_for_workspace(
        db: Session,
        workspace_id: UUID,
        payload: AIAnalysisAgentConfigCreate,
        user: User,
    ) -> AIAnalysisAgentConfig:
        workspace = get_or_404(db, Workspace, workspace_id, "Workspace")
        agent = AIAnalysisAgentConfig(
            **payload.model_dump(),
            knowledge_base_id=workspace.knowledge_base_id,
            workspace_id=workspace.id,
            created_by_id=user.id,
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def update_agent(
        db: Session,
        agent_id: UUID,
        payload: AIAnalysisAgentConfigUpdate,
    ) -> AIAnalysisAgentConfig:
        agent = AgentConfigService.get_agent(db, agent_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(agent, field, value)
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def delete_agent(db: Session, agent_id: UUID) -> None:
        agent = AgentConfigService.get_agent(db, agent_id)
        db.delete(agent)
        db.commit()
