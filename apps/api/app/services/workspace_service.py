from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import KnowledgeBase, User, Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate
from app.services.common import get_or_404, paginate


class WorkspaceService:
    @staticmethod
    def list_workspaces(db: Session, kb_id: UUID, skip: int, limit: int) -> list[Workspace]:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        statement = (
            select(Workspace)
            .where(Workspace.knowledge_base_id == kb_id)
            .order_by(Workspace.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_workspace(db: Session, workspace_id: UUID) -> Workspace:
        return get_or_404(db, Workspace, workspace_id, "Workspace")

    @staticmethod
    def create_workspace(
        db: Session,
        kb_id: UUID,
        payload: WorkspaceCreate,
        user: User,
    ) -> Workspace:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        workspace = Workspace(
            **payload.model_dump(),
            knowledge_base_id=kb_id,
            created_by_id=user.id,
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        return workspace

    @staticmethod
    def update_workspace(
        db: Session,
        workspace_id: UUID,
        payload: WorkspaceUpdate,
    ) -> Workspace:
        workspace = WorkspaceService.get_workspace(db, workspace_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(workspace, field, value)
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        return workspace

    @staticmethod
    def delete_workspace(db: Session, workspace_id: UUID) -> None:
        workspace = WorkspaceService.get_workspace(db, workspace_id)
        db.delete(workspace)
        db.commit()
