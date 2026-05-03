from uuid import UUID

from app.schemas.common import APIModel, ReadModel


class ProjectSourceSelectionBase(APIModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    source_material_id: UUID | None = None
    thought_chain_id: UUID | None = None
    selection_reason: str | None = None


class ProjectSourceSelectionCreate(ProjectSourceSelectionBase):
    pass


class ProjectSourceSelectionUpdate(APIModel):
    knowledge_base_id: UUID | None = None
    workspace_id: UUID | None = None
    source_material_id: UUID | None = None
    thought_chain_id: UUID | None = None
    selection_reason: str | None = None


class ProjectSourceSelectionRead(ProjectSourceSelectionBase, ReadModel):
    project_id: UUID
    created_by_id: UUID
