from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    KnowledgeBase,
    Project,
    ProjectSourceSelection,
    SourceMaterial,
    ThoughtChain,
    User,
    Workspace,
)
from app.schemas.project_source_selection import ProjectSourceSelectionCreate
from app.services.common import bad_request, get_or_404, not_found, paginate


class ProjectSourceService:
    @staticmethod
    def list_sources(
        db: Session,
        project_id: UUID,
        skip: int,
        limit: int,
    ) -> list[ProjectSourceSelection]:
        get_or_404(db, Project, project_id, "Project")
        statement = (
            select(ProjectSourceSelection)
            .where(ProjectSourceSelection.project_id == project_id)
            .order_by(ProjectSourceSelection.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def create_source(
        db: Session,
        project_id: UUID,
        payload: ProjectSourceSelectionCreate,
        user: User,
    ) -> ProjectSourceSelection:
        get_or_404(db, Project, project_id, "Project")
        data = payload.model_dump()
        selected_ids = [
            data.get("knowledge_base_id"),
            data.get("workspace_id"),
            data.get("source_material_id"),
            data.get("thought_chain_id"),
        ]
        if not any(selected_ids):
            raise bad_request("At least one source reference is required")

        if data.get("knowledge_base_id") is not None:
            get_or_404(db, KnowledgeBase, data["knowledge_base_id"], "Knowledge base")
        if data.get("workspace_id") is not None:
            workspace = get_or_404(db, Workspace, data["workspace_id"], "Workspace")
            if (
                data.get("knowledge_base_id")
                and workspace.knowledge_base_id != data["knowledge_base_id"]
            ):
                raise bad_request("Workspace does not belong to the selected knowledge base")
        if data.get("source_material_id") is not None:
            material = get_or_404(db, SourceMaterial, data["source_material_id"], "Source material")
            if (
                data.get("knowledge_base_id")
                and material.knowledge_base_id != data["knowledge_base_id"]
            ):
                raise bad_request("Source material does not belong to the selected knowledge base")
            if data.get("workspace_id") and material.workspace_id != data["workspace_id"]:
                raise bad_request("Source material does not belong to the selected workspace")
        if data.get("thought_chain_id") is not None:
            thought_chain = get_or_404(db, ThoughtChain, data["thought_chain_id"], "Thought chain")
            if (
                data.get("knowledge_base_id")
                and thought_chain.knowledge_base_id != data["knowledge_base_id"]
            ):
                raise bad_request("Thought chain does not belong to the selected knowledge base")
            if data.get("workspace_id") and thought_chain.workspace_id != data["workspace_id"]:
                raise bad_request("Thought chain does not belong to the selected workspace")

        source = ProjectSourceSelection(
            **data,
            project_id=project_id,
            created_by_id=user.id,
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        return source

    @staticmethod
    def delete_source(db: Session, project_id: UUID, source_selection_id: UUID) -> None:
        source = db.get(ProjectSourceSelection, source_selection_id)
        if source is None or source.project_id != project_id:
            raise not_found("Project source selection")
        db.delete(source)
        db.commit()
