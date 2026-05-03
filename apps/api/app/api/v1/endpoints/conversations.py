from uuid import UUID

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.conversation import ConversationCreate, ConversationRead
from app.schemas.conversation_message import ConversationMessageCreate, ConversationMessageRead
from app.services.conversation_service import ConversationService

router = APIRouter(tags=["conversations"])


@router.get("/conversations/{conversation_id}", response_model=ConversationRead)
def get_conversation(
    conversation_id: UUID,
    db: SessionDep,
    _: CurrentUser,
) -> ConversationRead:
    return ConversationRead.model_validate(
        ConversationService.get_conversation(db, conversation_id)
    )


@router.post(
    "/knowledge-bases/{kb_id}/conversations",
    response_model=ConversationRead,
    status_code=201,
)
def create_kb_conversation(
    kb_id: UUID,
    payload: ConversationCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ConversationRead:
    conversation = ConversationService.create_for_knowledge_base(db, kb_id, payload, current_user)
    return ConversationRead.model_validate(conversation)


@router.post(
    "/workspaces/{workspace_id}/conversations",
    response_model=ConversationRead,
    status_code=201,
)
def create_workspace_conversation(
    workspace_id: UUID,
    payload: ConversationCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ConversationRead:
    conversation = ConversationService.create_for_workspace(db, workspace_id, payload, current_user)
    return ConversationRead.model_validate(conversation)


@router.post(
    "/projects/{project_id}/conversations",
    response_model=ConversationRead,
    status_code=201,
)
def create_project_conversation(
    project_id: UUID,
    payload: ConversationCreate,
    db: SessionDep,
    current_user: CurrentUser,
) -> ConversationRead:
    conversation = ConversationService.create_for_project(db, project_id, payload, current_user)
    return ConversationRead.model_validate(conversation)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=ConversationMessageRead,
    status_code=201,
)
def add_conversation_message(
    conversation_id: UUID,
    payload: ConversationMessageCreate,
    db: SessionDep,
    _: CurrentUser,
) -> ConversationMessageRead:
    message = ConversationService.add_message(db, conversation_id, payload)
    return ConversationMessageRead.model_validate(message)
