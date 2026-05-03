from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.common import Message
from app.schemas.thought_chain import ThoughtChainCreate, ThoughtChainRead, ThoughtChainUpdate
from app.services.thought_chain_service import ThoughtChainService

router = APIRouter(tags=["thought-chains"])


@router.get("/knowledge-bases/{kb_id}/thought-chains", response_model=list[ThoughtChainRead])
def list_kb_thought_chains(
    kb_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[ThoughtChainRead]:
    return [
        ThoughtChainRead.model_validate(chain)
        for chain in ThoughtChainService.list_by_knowledge_base(db, kb_id, skip, limit)
    ]


@router.post(
    "/knowledge-bases/{kb_id}/thought-chains",
    response_model=ThoughtChainRead,
    status_code=201,
)
def create_kb_thought_chain(
    kb_id: UUID,
    payload: ThoughtChainCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ThoughtChainRead:
    chain = ThoughtChainService.create_for_knowledge_base(db, kb_id, payload, current_user)
    return ThoughtChainRead.model_validate(chain)


@router.get("/workspaces/{workspace_id}/thought-chains", response_model=list[ThoughtChainRead])
def list_workspace_thought_chains(
    workspace_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[ThoughtChainRead]:
    return [
        ThoughtChainRead.model_validate(chain)
        for chain in ThoughtChainService.list_by_workspace(db, workspace_id, skip, limit)
    ]


@router.post(
    "/workspaces/{workspace_id}/thought-chains",
    response_model=ThoughtChainRead,
    status_code=201,
)
def create_workspace_thought_chain(
    workspace_id: UUID,
    payload: ThoughtChainCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ThoughtChainRead:
    chain = ThoughtChainService.create_for_workspace(db, workspace_id, payload, current_user)
    return ThoughtChainRead.model_validate(chain)


@router.get("/thought-chains/{thought_chain_id}", response_model=ThoughtChainRead)
def get_thought_chain(
    thought_chain_id: UUID,
    db: SessionDep,
    _: CurrentUser,
) -> ThoughtChainRead:
    chain = ThoughtChainService.get_thought_chain(db, thought_chain_id)
    return ThoughtChainRead.model_validate(chain)


@router.patch("/thought-chains/{thought_chain_id}", response_model=ThoughtChainRead)
def update_thought_chain(
    thought_chain_id: UUID,
    payload: ThoughtChainUpdate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ThoughtChainRead:
    chain = ThoughtChainService.update_thought_chain(db, thought_chain_id, payload, current_user)
    return ThoughtChainRead.model_validate(chain)


@router.delete("/thought-chains/{thought_chain_id}", response_model=Message)
def delete_thought_chain(
    thought_chain_id: UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Message:
    ThoughtChainService.delete_thought_chain(db, thought_chain_id, current_user)
    return Message(detail="Thought chain deleted")
