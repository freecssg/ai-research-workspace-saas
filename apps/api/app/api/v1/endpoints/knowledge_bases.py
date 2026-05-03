from uuid import UUID

from fastapi import APIRouter

from app.api.deps import AdminUser, CurrentUser, SessionDep
from app.schemas.common import Message
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseRead, KnowledgeBaseUpdate
from app.services.knowledge_base_service import KnowledgeBaseService

router = APIRouter(prefix="/knowledge-bases", tags=["knowledge-bases"])


@router.get("", response_model=list[KnowledgeBaseRead])
def list_knowledge_bases(
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[KnowledgeBaseRead]:
    return [
        KnowledgeBaseRead.model_validate(kb)
        for kb in KnowledgeBaseService.list_knowledge_bases(db, skip, limit)
    ]


@router.post("", response_model=KnowledgeBaseRead, status_code=201)
def create_knowledge_base(
    payload: KnowledgeBaseCreate,
    db: SessionDep,
    current_admin: AdminUser,
) -> KnowledgeBaseRead:
    kb = KnowledgeBaseService.create_knowledge_base(db, payload, current_admin)
    return KnowledgeBaseRead.model_validate(kb)


@router.get("/{kb_id}", response_model=KnowledgeBaseRead)
def get_knowledge_base(kb_id: UUID, db: SessionDep, _: CurrentUser) -> KnowledgeBaseRead:
    return KnowledgeBaseRead.model_validate(KnowledgeBaseService.get_knowledge_base(db, kb_id))


@router.patch("/{kb_id}", response_model=KnowledgeBaseRead)
def update_knowledge_base(
    kb_id: UUID,
    payload: KnowledgeBaseUpdate,
    db: SessionDep,
    _: AdminUser,
) -> KnowledgeBaseRead:
    kb = KnowledgeBaseService.update_knowledge_base(db, kb_id, payload)
    return KnowledgeBaseRead.model_validate(kb)


@router.delete("/{kb_id}", response_model=Message)
def delete_knowledge_base(kb_id: UUID, db: SessionDep, _: AdminUser) -> Message:
    KnowledgeBaseService.delete_knowledge_base(db, kb_id)
    return Message(detail="Knowledge base deleted")
