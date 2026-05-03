from __future__ import annotations

import json
import uuid
from pathlib import Path
from typing import Any
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import (
    KnowledgeBase,
    SourceKind,
    SourceMaterial,
    SourceProcessingStatus,
    SourceVisibility,
    User,
    UserRole,
    Workspace,
)
from app.services.common import bad_request, forbidden, get_or_404, paginate


class SourceMaterialService:
    @staticmethod
    def list_by_knowledge_base(
        db: Session,
        kb_id: UUID,
        skip: int,
        limit: int,
    ) -> list[SourceMaterial]:
        get_or_404(db, KnowledgeBase, kb_id, "Knowledge base")
        statement = (
            select(SourceMaterial)
            .where(SourceMaterial.knowledge_base_id == kb_id)
            .order_by(SourceMaterial.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def list_by_workspace(
        db: Session,
        workspace_id: UUID,
        skip: int,
        limit: int,
    ) -> list[SourceMaterial]:
        get_or_404(db, Workspace, workspace_id, "Workspace")
        statement = (
            select(SourceMaterial)
            .where(SourceMaterial.workspace_id == workspace_id)
            .order_by(SourceMaterial.created_at.desc())
        )
        return list(db.scalars(paginate(statement, skip, limit)))

    @staticmethod
    def get_material(db: Session, material_id: UUID) -> SourceMaterial:
        return get_or_404(db, SourceMaterial, material_id, "Source material")

    @staticmethod
    def parse_citation_metadata(raw: str | None) -> dict[str, Any] | None:
        if raw is None or raw == "":
            return None
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            raise bad_request("citation_metadata must be valid JSON") from None
        if not isinstance(parsed, dict):
            raise bad_request("citation_metadata must be a JSON object")
        return parsed

    @staticmethod
    def _save_upload(upload: UploadFile | None) -> tuple[str | None, int | None]:
        if upload is None:
            return None, None

        content = upload.file.read()
        size = len(content)
        if size > settings.max_upload_size_bytes:
            raise bad_request("Uploaded file exceeds the configured size limit")

        suffix = Path(upload.filename or "").suffix
        stored_name = f"{uuid.uuid4()}{suffix}"
        upload_dir = settings.upload_dir / "source_materials"
        upload_dir.mkdir(parents=True, exist_ok=True)
        storage_path = upload_dir / stored_name
        storage_path.write_bytes(content)
        return str(storage_path), size

    @staticmethod
    def create_material(
        db: Session,
        user: User,
        *,
        knowledge_base_id: UUID,
        workspace_id: UUID | None,
        title: str,
        source_kind: SourceKind,
        visibility: SourceVisibility,
        original_filename: str | None,
        source_url: str | None,
        content_type: str | None,
        citation_metadata: dict[str, Any] | None,
        upload: UploadFile | None,
    ) -> SourceMaterial:
        get_or_404(db, KnowledgeBase, knowledge_base_id, "Knowledge base")
        if workspace_id is not None:
            workspace = get_or_404(db, Workspace, workspace_id, "Workspace")
            if workspace.knowledge_base_id != knowledge_base_id:
                raise bad_request("Workspace does not belong to the requested knowledge base")

        storage_path, file_size = SourceMaterialService._save_upload(upload)
        material = SourceMaterial(
            knowledge_base_id=knowledge_base_id,
            workspace_id=workspace_id,
            title=title,
            original_filename=original_filename or (upload.filename if upload else None),
            storage_path=storage_path,
            source_kind=source_kind,
            visibility=visibility,
            content_type=content_type or (upload.content_type if upload else None),
            file_size=file_size,
            source_url=source_url,
            citation_metadata=citation_metadata,
            processing_status=SourceProcessingStatus.UPLOADED,
            created_by_id=user.id,
        )
        db.add(material)
        db.commit()
        db.refresh(material)
        return material

    @staticmethod
    def delete_material(db: Session, material_id: UUID, user: User) -> None:
        material = SourceMaterialService.get_material(db, material_id)
        if user.role != UserRole.ADMIN and material.created_by_id != user.id:
            raise forbidden("Only admins or the material creator can delete source materials")

        if material.storage_path:
            path = Path(material.storage_path)
            if path.exists() and path.is_file():
                path.unlink()

        db.delete(material)
        db.commit()
