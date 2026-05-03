from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin_users,
    agents,
    auth,
    conversations,
    knowledge_bases,
    outputs,
    project_sources,
    project_team,
    projects,
    source_materials,
    tasks,
    thought_chains,
    workflow_steps,
    workflows,
    workspaces,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(admin_users.router)
api_router.include_router(knowledge_bases.router)
api_router.include_router(workspaces.router)
api_router.include_router(source_materials.router)
api_router.include_router(agents.router)
api_router.include_router(thought_chains.router)
api_router.include_router(conversations.router)
api_router.include_router(projects.router)
api_router.include_router(project_team.router)
api_router.include_router(project_sources.router)
api_router.include_router(workflows.router)
api_router.include_router(workflow_steps.router)
api_router.include_router(outputs.router)
api_router.include_router(tasks.router)
