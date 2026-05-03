from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import KnowledgeBase, ThoughtChain, User, Workspace
from app.schemas.thought_chain import ThoughtChainCreate, ThoughtChainUpdate
from app.services.common import get_or_404, paginate, require_creator_or_admin


class ThoughtChainService:
    @staticmethod
    def list_by_knowledge_base(
        db: Session,
        kb_id: UUID,
        skip: int,
        limit: int,
    ) -> list[ThoughtChain]:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        statement = (
            select(ThoughtChain)
            .where(ThoughtChain.knowledge_base_id == kb_id)
            .order_by(ThoughtChain.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def list_by_workspace(
        db: Session,
        workspace_id: UUID,
        skip: int,
        limit: int,
    ) -> list[ThoughtChain]:
        get_or_404(db, Workspace, workspace_id, "Workspace")
        statement = (
            select(ThoughtChain)
            .where(ThoughtChain.workspace_id == workspace_id)
            .order_by(ThoughtChain.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_thought_chain(db: Session, thought_chain_id: UUID) -> ThoughtChain:
        return get_or_404(db, ThoughtChain, thought_chain_id, "Thought chain")

    @staticmethod
    def create_for_knowledge_base(
        db: Session,
        kb_id: UUID,
        payload: ThoughtChainCreate,
        user: User,
    ) -> ThoughtChain:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        thought_chain = ThoughtChain(
            **payload.model_dump(),
            knowledge_base_id=kb_id,
            workspace_id=None,
            created_by_id=user.id,
        )
        db.add(thought_chain)
        db.commit()
        db.refresh(thought_chain)
        return thought_chain

    @staticmethod
    def create_for_workspace(
        db: Session,
        workspace_id: UUID,
        payload: ThoughtChainCreate,
        user: User,
    ) -> ThoughtChain:
        workspace = get_or_404(db, Workspace, workspace_id, "Workspace")
        thought_chain = ThoughtChain(
            **payload.model_dump(),
            knowledge_base_id=workspace.knowledge_base_id,
            workspace_id=workspace.id,
            created_by_id=user.id,
        )
        db.add(thought_chain)
        db.commit()
        db.refresh(thought_chain)
        return thought_chain

    @staticmethod
    def update_thought_chain(
        db: Session,
        thought_chain_id: UUID,
        payload: ThoughtChainUpdate,
        user: User,
    ) -> ThoughtChain:
        thought_chain = ThoughtChainService.get_thought_chain(db, thought_chain_id)
        require_creator_or_admin(thought_chain, user)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(thought_chain, field, value)
        db.add(thought_chain)
        db.commit()
        db.refresh(thought_chain)
        return thought_chain

    @staticmethod
    def delete_thought_chain(db: Session, thought_chain_id: UUID, user: User) -> None:
        thought_chain = ThoughtChainService.get_thought_chain(db, thought_chain_id)
        require_creator_or_admin(thought_chain, user)
        db.delete(thought_chain)
        db.commit()
