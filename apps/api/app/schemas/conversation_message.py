from datetime import datetime
from typing import Any
from uuid import UUID

from app.models.enums import ConversationSenderType
from app.schemas.common import APIModel


class ConversationMessageBase(APIModel):
    sender_type: ConversationSenderType = ConversationSenderType.USER
    content: str
    source_refs: dict[str, Any] | None = None
    thought_chain_refs: dict[str, Any] | None = None


class ConversationMessageCreate(ConversationMessageBase):
    pass


class ConversationMessageUpdate(APIModel):
    content: str | None = None
    source_refs: dict[str, Any] | None = None
    thought_chain_refs: dict[str, Any] | None = None


class ConversationMessageRead(ConversationMessageBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime
