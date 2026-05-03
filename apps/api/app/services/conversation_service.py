from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session, selectinload

from app.models import (
    Conversation,
    ConversationMessage,
    KnowledgeBase,
    Project,
    User,
    Workspace,
)
from app.schemas.conversation import ConversationCreate
from app.schemas.conversation_message import ConversationMessageCreate
from app.services.common import get_or_404, not_found


class ConversationService:
    @staticmethod
    def get_conversation(db: Session, conversation_id: UUID) -> Conversation:
        conversation = db.get(
            Conversation,
            conversation_id,
            options=[selectinload(Conversation.messages)],
        )
        if conversation is None:
            raise not_found("Conversation")
        return conversation

    @staticmethod
    def create_for_knowledge_base(
        db: Session,
        kb_id: UUID,
        payload: ConversationCreate,
        user: User,
    ) -> Conversation:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        conversation = Conversation(
            **payload.model_dump(),
            knowledge_base_id=kb_id,
            created_by_id=user.id,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def create_for_workspace(
        db: Session,
        workspace_id: UUID,
        payload: ConversationCreate,
        user: User,
    ) -> Conversation:
        workspace = get_or_404(db, Workspace, workspace_id, "Workspace")
        conversation = Conversation(
            **payload.model_dump(),
            knowledge_base_id=workspace.knowledge_base_id,
            workspace_id=workspace.id,
            created_by_id=user.id,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def create_for_project(
        db: Session,
        project_id: UUID,
        payload: ConversationCreate,
        user: User,
    ) -> Conversation:
        get_or_404(db, Project, project_id, "Project")
        conversation = Conversation(
            **payload.model_dump(),
            project_id=project_id,
            created_by_id=user.id,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    def add_message(
        db: Session,
        conversation_id: UUID,
        payload: ConversationMessageCreate,
    ) -> ConversationMessage:
        get_or_404(db, Conversation, conversation_id, "Conversation")
        message = ConversationMessage(
            **payload.model_dump(),
            conversation_id=conversation_id,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
