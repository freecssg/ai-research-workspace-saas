from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import CurrentUser, SessionDep
from app.schemas.knowledge_base import (
    KnowledgeBaseCreate,
    KnowledgeBaseRead,
    KnowledgeBaseUpdate,
)
from app.services import knowledge_base_service

router = APIRouter(tags=["knowledge-bases"])

SkipQuery = Annotated[int, Query(ge=0)]
LimitQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("/projects/{project_id}/knowledge-bases", response_model=list[KnowledgeBaseRead])
def list_knowledge_bases(
    project_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
    skip: SkipQuery = 0,
    limit: LimitQuery = 50,
) -> list[KnowledgeBaseRead]:
    return knowledge_base_service.list_knowledge_bases(
        db,
        current_user,
        project_id,
        skip,
        limit,
    )


@router.post(
    "/projects/{project_id}/knowledge-bases",
    response_model=KnowledgeBaseRead,
    status_code=status.HTTP_201_CREATED,
)
def create_knowledge_base(
    project_id: UUID,
    payload: KnowledgeBaseCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> KnowledgeBaseRead:
    return knowledge_base_service.create_knowledge_base(db, current_user, project_id, payload)


@router.get("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
def get_knowledge_base(
    kb_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> KnowledgeBaseRead:
    return knowledge_base_service.get_knowledge_base(db, current_user, kb_id)


@router.patch("/knowledge-bases/{kb_id}", response_model=KnowledgeBaseRead)
def update_knowledge_base(
    kb_id: UUID,
    payload: KnowledgeBaseUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> KnowledgeBaseRead:
    return knowledge_base_service.update_knowledge_base(db, current_user, kb_id, payload)


@router.delete("/knowledge-bases/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_base(
    kb_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Response:
    knowledge_base_service.delete_knowledge_base(db, current_user, kb_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
