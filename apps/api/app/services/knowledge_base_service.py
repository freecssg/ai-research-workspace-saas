from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import KnowledgeBase, User
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseUpdate
from app.services.common import get_or_404, paginate


class KnowledgeBaseService:
    @staticmethod
    def list_knowledge_bases(db: Session, skip: int, limit: int) -> list[KnowledgeBase]:
        statement = select(KnowledgeBase).order_by(KnowledgeBase.created_at.desc())
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_knowledge_base(db: Session, kb_id: UUID) -> KnowledgeBase:
        return get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")

    @staticmethod
    def create_knowledge_base(
        db: Session,
        payload: KnowledgeBaseCreate,
        user: User,
    ) -> KnowledgeBase:
        kb = KnowledgeBase(**payload.model_dump(), created_by_id=user.id)
        db.add(kb)
        db.commit()
        db.refresh(kb)
        return kb

    @staticmethod
    def update_knowledge_base(
        db: Session,
        kb_id: UUID,
        payload: KnowledgeBaseUpdate,
    ) -> KnowledgeBase:
        kb = KnowledgeBaseService.get_knowledge_base(db, kb_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(kb, field, value)
        db.add(kb)
        db.commit()
        db.refresh(kb)
        return kb

    @staticmethod
    def delete_knowledge_base(db: Session, kb_id: UUID) -> None:
        kb = KnowledgeBaseService.get_knowledge_base(db, kb_id)
        db.delete(kb)
        db.commit()
