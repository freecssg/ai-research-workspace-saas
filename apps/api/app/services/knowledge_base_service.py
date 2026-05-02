from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import KnowledgeBase, User
from app.schemas.knowledge_base import KnowledgeBaseCreate, KnowledgeBaseUpdate
from app.services.common import get_owned_project, get_owned_workspace, not_found


def list_knowledge_bases(
    db: Session,
    current_user: User,
    project_id: UUID,
    skip: int = 0,
    limit: int = 50,
) -> list[KnowledgeBase]:
    project = get_owned_project(db, current_user, project_id)
    return list(
        db.scalars(
            select(KnowledgeBase)
            .where(
                KnowledgeBase.workspace_id == project.workspace_id,
                KnowledgeBase.project_id == project.id,
            )
            .order_by(KnowledgeBase.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
    )


def create_knowledge_base(
    db: Session,
    current_user: User,
    project_id: UUID,
    payload: KnowledgeBaseCreate,
) -> KnowledgeBase:
    project = get_owned_project(db, current_user, project_id)
    knowledge_base = KnowledgeBase(
        workspace_id=project.workspace_id,
        project_id=project.id,
        **payload.model_dump(),
    )
    db.add(knowledge_base)
    db.commit()
    db.refresh(knowledge_base)
    return knowledge_base


def get_knowledge_base(db: Session, current_user: User, kb_id: UUID) -> KnowledgeBase:
    knowledge_base = db.get(KnowledgeBase, kb_id)
    if knowledge_base is None:
        raise not_found("Knowledge base")

    get_owned_workspace(db, current_user, knowledge_base.workspace_id)
    return knowledge_base


def update_knowledge_base(
    db: Session,
    current_user: User,
    kb_id: UUID,
    payload: KnowledgeBaseUpdate,
) -> KnowledgeBase:
    knowledge_base = get_knowledge_base(db, current_user, kb_id)
    update_data = payload.model_dump(exclude_unset=True)

    if update_data.get("project_id") is not None:
        project = get_owned_project(db, current_user, update_data["project_id"])
        knowledge_base.workspace_id = project.workspace_id

    for field, value in update_data.items():
        setattr(knowledge_base, field, value)

    db.commit()
    db.refresh(knowledge_base)
    return knowledge_base


def delete_knowledge_base(db: Session, current_user: User, kb_id: UUID) -> None:
    knowledge_base = get_knowledge_base(db, current_user, kb_id)
    db.delete(knowledge_base)
    db.commit()
