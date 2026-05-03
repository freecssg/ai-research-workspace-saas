from uuid import UUID

from fastapi import APIRouter

from app.api.deps import AdminUser, CurrentUser, SessionDep
from app.schemas.ai_analysis_agent_config import (
    AIAnalysisAgentConfigCreate,
    AIAnalysisAgentConfigRead,
    AIAnalysisAgentConfigUpdate,
)
from app.schemas.common import Message
from app.services.agent_config_service import AgentConfigService

router = APIRouter(tags=["agent-configs"])


@router.get("/knowledge-bases/{kb_id}/agents", response_model=list[AIAnalysisAgentConfigRead])
def list_kb_agents(
    kb_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[AIAnalysisAgentConfigRead]:
    return [
        AIAnalysisAgentConfigRead.model_validate(agent)
        for agent in AgentConfigService.list_by_knowledge_base(db, kb_id, skip, limit)
    ]


@router.post(
    "/knowledge-bases/{kb_id}/agents",
    response_model=AIAnalysisAgentConfigRead,
    status_code=201,
)
def create_kb_agent(
    kb_id: UUID,
    payload: AIAnalysisAgentConfigCreate,
    db: SessionDep,
    current_admin: AdminUser,
) -> AIAnalysisAgentConfigRead:
    agent = AgentConfigService.create_for_knowledge_base(db, kb_id, payload, current_admin)
    return AIAnalysisAgentConfigRead.model_validate(agent)


@router.get("/workspaces/{workspace_id}/agents", response_model=list[AIAnalysisAgentConfigRead])
def list_workspace_agents(
    workspace_id: UUID,
    db: SessionDep,
    _: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[AIAnalysisAgentConfigRead]:
    return [
        AIAnalysisAgentConfigRead.model_validate(agent)
        for agent in AgentConfigService.list_by_workspace(db, workspace_id, skip, limit)
    ]


@router.post(
    "/workspaces/{workspace_id}/agents",
    response_model=AIAnalysisAgentConfigRead,
    status_code=201,
)
def create_workspace_agent(
    workspace_id: UUID,
    payload: AIAnalysisAgentConfigCreate,
    db: SessionDep,
    current_admin: AdminUser,
) -> AIAnalysisAgentConfigRead:
    agent = AgentConfigService.create_for_workspace(db, workspace_id, payload, current_admin)
    return AIAnalysisAgentConfigRead.model_validate(agent)


@router.get("/agents/{agent_id}", response_model=AIAnalysisAgentConfigRead)
def get_agent(agent_id: UUID, db: SessionDep, _: CurrentUser) -> AIAnalysisAgentConfigRead:
    return AIAnalysisAgentConfigRead.model_validate(AgentConfigService.get_agent(db, agent_id))


@router.patch("/agents/{agent_id}", response_model=AIAnalysisAgentConfigRead)
def update_agent(
    agent_id: UUID,
    payload: AIAnalysisAgentConfigUpdate,
    db: SessionDep,
    _: AdminUser,
) -> AIAnalysisAgentConfigRead:
    return AIAnalysisAgentConfigRead.model_validate(
        AgentConfigService.update_agent(db, agent_id, payload)
    )


@router.delete("/agents/{agent_id}", response_model=Message)
def delete_agent(agent_id: UUID, db: SessionDep, _: AdminUser) -> Message:
    AgentConfigService.delete_agent(db, agent_id)
    return Message(detail="Agent config deleted")
